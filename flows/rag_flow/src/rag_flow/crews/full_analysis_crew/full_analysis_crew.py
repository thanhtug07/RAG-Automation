"""FullAnalysisCrew: 5-task chain researcher->rag->data->analyst->executor.

Review happens in the Flow final step (review_and_format), shared by all paths.
"""

from pathlib import Path

import yaml
from crewai import Agent, Crew, Process, Task

from ...llm import default_model
from ...tools import CsvQueryTool, DocumentSearchTool

_HERE = Path(__file__).resolve().parent
_ORDER = ["collect_facts", "retrieve_context", "tabulate", "synthesize", "act"]


def _cfg(name: str) -> dict:
    return yaml.safe_load((_HERE / "config" / name).read_text(encoding="utf-8"))


def build(model: str | None = None) -> Crew:
    """Construct the full analysis crew (no kickoff)."""
    llm = model or default_model()
    agents_cfg, tasks_cfg = _cfg("agents.yaml"), _cfg("tasks.yaml")
    tools = {"researcher": [DocumentSearchTool()],
             "rag_retriever": [DocumentSearchTool()],
             "data_analyst": [CsvQueryTool()],
             "analyst": [], "executor": [CsvQueryTool(), DocumentSearchTool()]}
    agents = {key: Agent(role=cfg["role"], goal=cfg["goal"],
                         backstory=cfg.get("backstory", ""), llm=llm,
                         tools=tools.get(key, []), verbose=False, max_iter=10)
              for key, cfg in agents_cfg.items()}
    built = {}
    for key in _ORDER:
        cfg = tasks_cfg[key]
        built[key] = Task(description=cfg["description"],
                          expected_output=cfg["expected_output"],
                          agent=agents[cfg["agent"]],
                          context=[built[c] for c in (cfg.get("context") or [])] or None)
    return Crew(agents=list(agents.values()), tasks=[built[k] for k in _ORDER],
                process=Process.sequential, verbose=False)
