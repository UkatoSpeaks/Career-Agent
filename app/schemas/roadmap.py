from pydantic import BaseModel, Field


class RoadmapRequest(BaseModel):
    current_role: str
    target_role: str
    current_skills: list[str] = Field(default_factory=list)


class RoadmapMilestone(BaseModel):
    title: str
    skills_to_learn: list[str] = Field(default_factory=list)
    resources: list[str] = Field(default_factory=list)
    estimated_time: str


class RoadmapResult(BaseModel):
    summary: str
    milestones: list[RoadmapMilestone] = Field(default_factory=list)


class RoadmapResponse(BaseModel):
    result: RoadmapResult
