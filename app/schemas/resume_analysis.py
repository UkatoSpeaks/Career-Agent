from pydantic import BaseModel, Field


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    job_description: str = Field(..., min_length=20)


class ResumeAnalysisResult(BaseModel):
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    gap_summary: str
    suggestions: list[str] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    result: ResumeAnalysisResult
