"""DataCrew: retrieve -> exact compute (csv_query) -> answer."""

from pathlib import Path

import yaml
from crewai import Agent, Crew, Process, Task

from ...llm import default_model
from ...tools import CsvQueryTool, DocumentSearchTool

_HERE = Path(__file__).resolve().parent


def _cfg(name: str) -> dict:
    return yaml.safe_load((_HERE / "config" / name).read_text(encoding="utf-8"))


def build(model: str | None = None) -> Crew:
    """Construct the data crew (no kickoff)."""
    llm = model or default_model()
    agents_cfg, tasks_cfg = _cfg("agents.yaml"), _cfg("tasks.yaml")
    tools = {"rag_retriever": [DocumentSearchTool()],
             "data_analyst": [CsvQueryTool()], "analyst": []}
    agents = {key: Agent(role=cfg["role"], goal=cfg["goal"],
                         backstory=cfg.get("backstory", ""), llm=llm,
                         tools=tools.get(key, []), verbose=False, max_iter=10)
              for key, cfg in agents_cfg.items()
              if key in ("rag_retriever", "data_analyst", "analyst")}
    order = ["retrieve", "tabulate", "answer"]
    built = {}
    for key in order:
        cfg = tasks_cfg[key]
        built[key] = Task(description=cfg["description"],
                          expected_output=cfg["expected_output"],
                          agent=agents[cfg["agent"]],
                          context=[built[c] for c in (cfg.get("context") or [])] or None)
    return Crew(agents=list(agents.values()), tasks=[built[k] for k in order],
                process=Process.sequential, verbose=False)
