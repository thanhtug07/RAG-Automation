"""Plan -> CrewSpec builder.

Converts a PlannerService Plan ({plan_id, query, steps[]}) into a CrewSpec dict
conforming to contract v1.0.0-draft (docs/backend/crewai/specs/). The built spec
is validated with backend.crewai.validation BEFORE return: FAIL -> BuilderError,
never a half-built spec. No execution here.

Step-type mapping (PlannerService emits lookup|analysis|report; unknown -> executor):
  lookup   -> researcher   (collect facts, document_search)
  analysis -> data_analyst  (exact figures, database_query)
  report   -> analyst      (synthesize report, reasoning-only)
  *        -> executor     (generic operator)

Example:
    from backend.planner.service import PlannerService
    from backend.builder.builder import build, to_flow_inputs
    plan = PlannerService().build_plan("phan tich doanh thu Q3")
    spec = build(plan)                      # raises BuilderError if invalid
    inputs = to_flow_inputs(spec)           # {"query","context_text","channel"}
    from rag_flow.main import kickoff
    print(kickoff(**inputs))
"""

from __future__ import annotations

import os
from typing import Any, Dict, List

from backend.crewai.validation.validator import validate


class BuilderError(Exception):
    """Raised when the built spec fails validation (carries rule list)."""

    def __init__(self, message: str, rules: List[str] | None = None) -> None:
        super().__init__(message)
        self.rules = list(rules or [])


# step type -> (agent_id, role, goal, backstory, tool_refs, task verb)
_STEP_AGENTS: Dict[str, Dict[str, Any]] = {
    "lookup": {
        "id": "researcher", "role": "Researcher",
        "goal": "Find, collect, and verify external information for the task.",
        "backstory": ("A careful fact-finder. Prefers primary sources, cites every "
                      "claim, marks unverified items as unverified. Never invents data."),
        "tool_refs": ["document_search"], "verb": "Collect data for",
    },
    "analysis": {
        "id": "data_analyst", "role": "Data Analyst",
        "goal": "Turn task data into accurate figures and tables.",
        "backstory": ("A rigorous number-cruncher. Shows workings, names data sources, "
                      "never extrapolates beyond the data."),
        "tool_refs": ["database_query"], "verb": "Analyze into figures",
    },
    "report": {
        "id": "analyst", "role": "Analyst",
        "goal": "Synthesize data and research into insights.",
        "backstory": ("A sober synthesizer. Separates fact from interpretation, "
                      "attributes every number to its source task."),
        "tool_refs": [], "verb": "Synthesize the report for",
    },
}

_EXECUTOR_FALLBACK: Dict[str, Any] = {
    "id": "executor", "role": "Executor",
    "goal": "Carry out the assigned plan step using given context and tools.",
    "backstory": ("A disciplined operator. Follows the task description literally, "
                  "reports factually. Acts; does not replan."),
    "tool_refs": ["document_search", "database_query"], "verb": "Execute the step",
}

_TOOLS = [
    {"id": "document_search", "name": "Document Search",
     "purpose": "Search approved sales reports.", "config_ref": "sales_reports_readonly"},
    {"id": "database_query", "name": "Database Query",
     "purpose": "Query sales figures from approved reports.", "config_ref": "sales_db_readonly"},
    {"id": "kb_retrieve", "name": "KB Retrieve",
     "purpose": "Retrieve passages from the internal knowledge base."},
]


def _default_model() -> str:
    return os.getenv("OPENAI_MODEL_NAME") or os.getenv("LLM_DEFAULT_MODEL") or "approved-model-a"


def build(plan: Dict[str, Any], model: str | None = None) -> Dict[str, Any]:
    """Build a validated CrewSpec from a Plan. Raises BuilderError on any failure."""
    if not isinstance(plan, dict):
        raise BuilderError("plan must be a dict")
    plan_id = plan.get("plan_id")
    query = plan.get("query", "")
    steps = plan.get("steps")
    if not isinstance(plan_id, str) or not plan_id:
        raise BuilderError("plan missing plan_id")
    if not isinstance(query, str) or not query.strip():
        raise BuilderError("plan missing query")
    if not isinstance(steps, list) or not steps:
        raise BuilderError("plan must contain a non-empty steps list")
    model_name = model or _default_model()
    used_agents: Dict[str, Dict[str, Any]] = {}
    tasks: List[Dict[str, Any]] = []
    for n, step in enumerate(steps):
        if not isinstance(step, dict):
            raise BuilderError(f"steps[{n}] must be an object")
        sid = step.get("id")
        stype = step.get("type", "")
        deps = step.get("depends_on", [])
        if not isinstance(sid, str) or not sid:
            raise BuilderError(f"steps[{n}] missing id")
        if not isinstance(deps, list) or any(not isinstance(d, str) for d in deps):
            raise BuilderError(f"steps[{n}].depends_on must be a list of strings")
        agent = _STEP_AGENTS.get(stype, _EXECUTOR_FALLBACK)
        used_agents[agent["id"]] = agent
        tasks.append({
            "id": sid,
            "name": sid.replace("_", " "),
            "description": f"{agent['verb']}: {query.strip()}",
            "agent_ref": agent["id"],
            "expected_output": f"Result of {sid} with cited sources.",
            "depends_on": list(deps),
            "context": [f"{d}.output" for d in deps],
        })
    agents = [{
        "id": a["id"], "role": a["role"], "goal": a["goal"],
        "backstory": a["backstory"], "model": model_name,
        "tool_refs": list(a["tool_refs"]),
    } for a in used_agents.values()]
    name = (query.strip()[:100] or plan_id)[:120]
    spec = {
        "metadata": {"crew_id": plan_id, "name": name, "version": "1.0.0-draft"},
        "objective": {"objective": query.strip(),
                      "goal": f"Address the request: {query.strip()}",
                      "expected_outcome": "Answer with cited figures, in Vietnamese."},
        "agents": agents,
        "tasks": tasks,
        "tools": [dict(t) for t in _TOOLS],
        "process": {"type": "sequential"},
    }
    result = validate(spec)
    if not result.valid:
        details = "; ".join(str(e) for e in result.errors[:8])
        raise BuilderError(f"built spec failed validation: {details}",
                           rules=[e.rule for e in result.errors])
    return spec


def to_flow_inputs(spec: Dict[str, Any], context_text: str = "") -> Dict[str, Any]:
    """Map a (validated) CrewSpec to flows/rag_flow kickoff() inputs.

    The Flow routes on the query text itself, so the objective carries over;
    declared task context stays inside the spec (the Flow resolves its own).
    """
    if not isinstance(spec, dict):
        raise BuilderError("spec must be a dict")
    try:
        query = spec["objective"]["objective"]
    except (KeyError, TypeError) as exc:
        raise BuilderError(f"spec has no objective.objective: {exc}") from exc
    if not isinstance(query, str) or not query:
        raise BuilderError("spec objective.objective must be a non-empty string")
    return {"query": query, "context_text": context_text, "channel": None}


__all__ = ["BuilderError", "build", "to_flow_inputs"]
