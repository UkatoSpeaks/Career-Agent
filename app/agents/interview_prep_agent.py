from typing import TypedDict

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from app.agents.llm import get_llm
from app.schemas.interview_prep import InterviewEvaluationResult


def _with_retries(structured_llm, prompt: str, retries: int = 2):
    last_error: Exception | None = None
    for _ in range(retries + 1):
        try:
            return structured_llm.invoke(prompt)
        except Exception as exc:
            last_error = exc
    raise last_error


# --- Question generation graph ---

class _FocusAreas(BaseModel):
    focus_areas: list[str] = Field(default_factory=list)


class _Questions(BaseModel):
    questions: list[str] = Field(default_factory=list)


class QuestionGenState(TypedDict):
    target_role: str
    resume_text: str | None
    num_questions: int
    focus_areas: list[str]
    questions: list[str]


def _identify_focus_areas_node(state: QuestionGenState) -> dict:
    structured_llm = get_llm().with_structured_output(_FocusAreas, method="json_schema")
    resume_context = f"\nCandidate resume:\n{state['resume_text']}" if state["resume_text"] else ""
    prompt = (
        f"For a '{state['target_role']}' interview, list the key competencies/topics an "
        f"interviewer would want to test.{resume_context}"
    )
    result: _FocusAreas = _with_retries(structured_llm, prompt)
    return {"focus_areas": result.focus_areas}


def _generate_questions_node(state: QuestionGenState) -> dict:
    structured_llm = get_llm().with_structured_output(_Questions, method="json_schema")
    prompt = (
        f"Write {state['num_questions']} interview questions for a '{state['target_role']}' "
        f"role, covering these focus areas: {state['focus_areas']}. "
        "Mix behavioral and technical/role-specific questions."
    )
    result: _Questions = _with_retries(structured_llm, prompt)
    return {"questions": result.questions[: state["num_questions"]]}


def _build_question_graph():
    graph = StateGraph(QuestionGenState)
    graph.add_node("identify_focus_areas", _identify_focus_areas_node)
    graph.add_node("generate_questions", _generate_questions_node)

    graph.set_entry_point("identify_focus_areas")
    graph.add_edge("identify_focus_areas", "generate_questions")
    graph.add_edge("generate_questions", END)

    return graph.compile()


_question_graph = _build_question_graph()


def run_generate_questions(target_role: str, resume_text: str | None, num_questions: int) -> list[str]:
    final_state = _question_graph.invoke(
        {
            "target_role": target_role,
            "resume_text": resume_text,
            "num_questions": num_questions,
        }
    )
    return final_state["questions"]


# --- Answer evaluation graph ---

class _Evaluation(BaseModel):
    score: int = Field(..., ge=0, le=10)
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    model_answer: str


class EvaluateState(TypedDict):
    question: str
    answer: str
    evaluation: _Evaluation


def _evaluate_answer_node(state: EvaluateState) -> dict:
    structured_llm = get_llm().with_structured_output(_Evaluation, method="json_schema")
    prompt = (
        f"Interview question: {state['question']}\n"
        f"Candidate's answer: {state['answer']}\n\n"
        "Evaluate the answer. Give a score from 0-10, list strengths, list concrete "
        "improvements, and provide a strong model_answer for comparison."
    )
    evaluation: _Evaluation = _with_retries(structured_llm, prompt)
    return {"evaluation": evaluation}


def _build_evaluate_graph():
    graph = StateGraph(EvaluateState)
    graph.add_node("evaluate_answer", _evaluate_answer_node)

    graph.set_entry_point("evaluate_answer")
    graph.add_edge("evaluate_answer", END)

    return graph.compile()


_evaluate_graph = _build_evaluate_graph()


def run_evaluate_answer(question: str, answer: str) -> InterviewEvaluationResult:
    final_state = _evaluate_graph.invoke({"question": question, "answer": answer})
    evaluation = final_state["evaluation"]
    return InterviewEvaluationResult(
        score=evaluation.score,
        strengths=evaluation.strengths,
        improvements=evaluation.improvements,
        model_answer=evaluation.model_answer,
    )
