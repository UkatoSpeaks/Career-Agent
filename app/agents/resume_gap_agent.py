from typing import TypedDict

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from app.agents.llm import get_llm
from app.schemas.resume_analysis import ResumeAnalysisResult


class _ExtractedSkills(BaseModel):
    resume_skills: list[str] = Field(default_factory=list)
    jd_skills: list[str] = Field(default_factory=list)


class _GapAnalysis(BaseModel):
    gap_summary: str
    suggestions: list[str] = Field(default_factory=list)


def _with_retries(structured_llm, prompt: str, retries: int = 2):
    last_error: Exception | None = None
    for _ in range(retries + 1):
        try:
            return structured_llm.invoke(prompt)
        except Exception as exc:  # Mistral structured-output calls occasionally fail to parse
            last_error = exc
    raise last_error


class ResumeGapState(TypedDict):
    resume_text: str
    job_description: str
    resume_skills: list[str]
    jd_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    gap_summary: str
    suggestions: list[str]


def _extract_skills_node(state: ResumeGapState) -> dict:
    structured_llm = get_llm().with_structured_output(_ExtractedSkills, method="json_schema")
    prompt = (
        "Extract the professional skills, tools, and technologies mentioned in each text below.\n\n"
        f"RESUME:\n{state['resume_text']}\n\n"
        f"JOB DESCRIPTION:\n{state['job_description']}\n\n"
        "List distinct skills/technologies for each, normalized to common names."
    )
    extracted: _ExtractedSkills = _with_retries(structured_llm, prompt)
    return {"resume_skills": extracted.resume_skills, "jd_skills": extracted.jd_skills}


def _compare_skills_node(state: ResumeGapState) -> dict:
    resume_set = {s.strip().lower() for s in state["resume_skills"]}
    jd_set = {s.strip().lower() for s in state["jd_skills"]}

    matched = [s for s in state["jd_skills"] if s.strip().lower() in resume_set]
    missing = [s for s in state["jd_skills"] if s.strip().lower() not in resume_set]

    return {"matched_skills": matched, "missing_skills": missing}


def _generate_gap_summary_node(state: ResumeGapState) -> dict:
    structured_llm = get_llm().with_structured_output(_GapAnalysis, method="json_schema")
    prompt = (
        "A candidate's resume was compared against a job description.\n"
        f"Matched skills: {state['matched_skills']}\n"
        f"Missing skills: {state['missing_skills']}\n\n"
        "Write a concise gap_summary (2-4 sentences) assessing overall fit, and a list of "
        "concrete, actionable suggestions to close the gaps (e.g. skills to learn, resume "
        "wording changes, certifications)."
    )
    analysis: _GapAnalysis = _with_retries(structured_llm, prompt)
    return {"gap_summary": analysis.gap_summary, "suggestions": analysis.suggestions}


def _build_graph():
    graph = StateGraph(ResumeGapState)
    graph.add_node("extract_skills", _extract_skills_node)
    graph.add_node("compare_skills", _compare_skills_node)
    graph.add_node("generate_gap_summary", _generate_gap_summary_node)

    graph.set_entry_point("extract_skills")
    graph.add_edge("extract_skills", "compare_skills")
    graph.add_edge("compare_skills", "generate_gap_summary")
    graph.add_edge("generate_gap_summary", END)

    return graph.compile()


_resume_gap_graph = _build_graph()


def run_resume_gap_agent(resume_text: str, job_description: str) -> ResumeAnalysisResult:
    final_state = _resume_gap_graph.invoke(
        {"resume_text": resume_text, "job_description": job_description}
    )
    return ResumeAnalysisResult(
        matched_skills=final_state["matched_skills"],
        missing_skills=final_state["missing_skills"],
        gap_summary=final_state["gap_summary"],
        suggestions=final_state["suggestions"],
    )
