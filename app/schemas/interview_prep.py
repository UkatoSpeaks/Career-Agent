from pydantic import BaseModel, Field


class InterviewQuestionsRequest(BaseModel):
    target_role: str
    resume_text: str | None = None
    num_questions: int = Field(default=5, ge=1, le=15)


class InterviewQuestionsResult(BaseModel):
    questions: list[str] = Field(default_factory=list)


class InterviewQuestionsResponse(BaseModel):
    result: InterviewQuestionsResult


class InterviewEvaluateRequest(BaseModel):
    question: str
    answer: str


class InterviewEvaluationResult(BaseModel):
    score: int = Field(..., ge=0, le=10)
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    model_answer: str


class InterviewEvaluateResponse(BaseModel):
    result: InterviewEvaluationResult
