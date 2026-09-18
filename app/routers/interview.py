from fastapi import APIRouter, HTTPException

from app.agents.interview_prep_agent import run_evaluate_answer, run_generate_questions
from app.schemas.interview_prep import (
    InterviewEvaluateRequest,
    InterviewEvaluateResponse,
    InterviewQuestionsRequest,
    InterviewQuestionsResponse,
    InterviewQuestionsResult,
)

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/questions", response_model=InterviewQuestionsResponse)
def generate_questions(request: InterviewQuestionsRequest) -> InterviewQuestionsResponse:
    try:
        questions = run_generate_questions(
            request.target_role, request.resume_text, request.num_questions
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent failed: {exc}") from exc
    return InterviewQuestionsResponse(result=InterviewQuestionsResult(questions=questions))


@router.post("/evaluate", response_model=InterviewEvaluateResponse)
def evaluate_answer(request: InterviewEvaluateRequest) -> InterviewEvaluateResponse:
    try:
        result = run_evaluate_answer(request.question, request.answer)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent failed: {exc}") from exc
    return InterviewEvaluateResponse(result=result)
