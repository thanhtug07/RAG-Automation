"""FastAskCrew: single analyst task (fast path for simple questions)."""

from pathlib import Path

import yaml
from crewai import Agent, Crew, Process, Task

from ...llm import default_model

_HERE = Path(__file__).resolve().parent


def _cfg(name: str) -> dict:
    return yaml.safe_load((_HERE / "config" / name).read_text(encoding="utf-8"))


def build(model: str | None = None) -> Crew:
    """Construct the fast-ask crew (no kickoff)."""
    llm = model or default_model()
    agents_cfg, tasks_cfg = _cfg("agents.yaml"), _cfg("tasks.yaml")
    cfg = agents_cfg["analyst"]
    agent = Agent(role=cfg["role"], goal=cfg["goal"],
                  backstory=cfg.get("backstory", ""), llm=llm,
                  verbose=False, max_iter=10)
    task = Task(description=tasks_cfg["ask"]["description"],
                expected_output=tasks_cfg["ask"]["expected_output"], agent=agent)
    return Crew(agents=[agent], tasks=[task], process=Process.sequential, verbose=False)
