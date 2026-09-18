from typing import TypedDict

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field

from app.agents.llm import get_llm
from app.schemas.roadmap import RoadmapMilestone, RoadmapResult


class _SkillGap(BaseModel):
    skills_to_learn: list[str] = Field(default_factory=list)


class _RoadmapPlan(BaseModel):
    summary: str
    milestones: list[RoadmapMilestone] = Field(default_factory=list)


def _with_retries(structured_llm, prompt: str, retries: int = 2):
    last_error: Exception | None = None
    for _ in range(retries + 1):
        try:
            return structured_llm.invoke(prompt)
        except Exception as exc:
            last_error = exc
    raise last_error


class RoadmapState(TypedDict):
    current_role: str
    target_role: str
    current_skills: list[str]
    skills_to_learn: list[str]
    summary: str
    milestones: list[RoadmapMilestone]


def _assess_gap_node(state: RoadmapState) -> dict:
    structured_llm = get_llm().with_structured_output(_SkillGap, method="json_schema")
    prompt = (
        f"A person is currently a '{state['current_role']}' and wants to become a "
        f"'{state['target_role']}'. Their current skills: {state['current_skills']}.\n\n"
        "List the key skills/technologies/experience they are missing to make this transition."
    )
    gap: _SkillGap = _with_retries(structured_llm, prompt)
    return {"skills_to_learn": gap.skills_to_learn}


def _build_roadmap_node(state: RoadmapState) -> dict:
    structured_llm = get_llm().with_structured_output(_RoadmapPlan, method="json_schema")
    prompt = (
        f"Create a learning roadmap for someone moving from '{state['current_role']}' to "
        f"'{state['target_role']}'.\n"
        f"Skills they already have: {state['current_skills']}\n"
        f"Skills they need to learn: {state['skills_to_learn']}\n\n"
        "Write a short summary (2-3 sentences) and break the roadmap into 3-6 sequential "
        "milestones. Each milestone needs: title, skills_to_learn, resources (course/book/"
        "project names), and estimated_time (e.g. '2-3 weeks')."
    )
    plan: _RoadmapPlan = _with_retries(structured_llm, prompt)
    return {"summary": plan.summary, "milestones": plan.milestones}


def _build_graph():
    graph = StateGraph(RoadmapState)
    graph.add_node("assess_gap", _assess_gap_node)
    graph.add_node("build_roadmap", _build_roadmap_node)

    graph.set_entry_point("assess_gap")
    graph.add_edge("assess_gap", "build_roadmap")
    graph.add_edge("build_roadmap", END)

    return graph.compile()


_roadmap_graph = _build_graph()


def run_roadmap_agent(current_role: str, target_role: str, current_skills: list[str]) -> RoadmapResult:
    final_state = _roadmap_graph.invoke(
        {
            "current_role": current_role,
            "target_role": target_role,
            "current_skills": current_skills,
        }
    )
    return RoadmapResult(summary=final_state["summary"], milestones=final_state["milestones"])
