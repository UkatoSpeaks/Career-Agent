from fastapi import APIRouter, HTTPException

from app.agents.resume_gap_agent import run_resume_gap_agent
from app.schemas.resume_analysis import ResumeAnalysisRequest, ResumeAnalysisResponse

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume(request: ResumeAnalysisRequest) -> ResumeAnalysisResponse:
    try:
        result = run_resume_gap_agent(request.resume_text, request.job_description)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent failed: {exc}") from exc
    return ResumeAnalysisResponse(result=result)
