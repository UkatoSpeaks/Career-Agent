from fastapi import APIRouter, HTTPException

from app.agents.roadmap_agent import run_roadmap_agent
from app.schemas.roadmap import RoadmapRequest, RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    try:
        result = run_roadmap_agent(
            request.current_role, request.target_role, request.current_skills
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent failed: {exc}") from exc
    return RoadmapResponse(result=result)
