"""Q3 analysis crew: 6 agents, sequential 6-task chain (official @CrewBase style)."""

import os
from pathlib import Path

from crewai import Agent, Crew, Process, Task

_HERE = Path(__file__).resolve().parent
_CONFIG = _HERE / "config"


def default_model() -> str:
    """Model id from env; bare id + custom base gets litellm `openai/` prefix."""
    name = os.getenv("OPENAI_MODEL_NAME") or "gpt-4o-mini"
    if "/" not in name and os.getenv("OPENAI_API_BASE"):
        return f"openai/{name}"
    return name


def _load_yaml(name: str):
    import yaml
    return yaml.safe_load((_CONFIG / name).read_text(encoding="utf-8"))


def build_ask_crew(topic: str, context_text: str, model: str | None = None):
    """Single analyst task for interactive asks (fast path; full chain via build_crew)."""
    analyst = Agent(
        role="Analyst",
        goal="Answer the question from the provided data, in Vietnamese.",
        backstory="A concise analyst. Answers literally from given data, never invents.",
        llm=model or default_model(), verbose=False, max_iter=10,
    )
    task = Task(
        description=f"Cau hoi: {topic}\n\nDu lieu kem theo:\n{context_text or '(khong co)'}",
        expected_output="Cau tra loi ngan gon, dung tieng Viet.",
        agent=analyst,
    )
    return Crew(agents=[analyst], tasks=[task], process=Process.sequential, verbose=False)


def build_crew(model: str | None = None):
    """Construct the crew. Model override or env OPENAI_MODEL_NAME (via default_model)."""
    agents_cfg = _load_yaml("agents.yaml")
    tasks_cfg = _load_yaml("tasks.yaml")
    agents = {}
    for key, cfg in agents_cfg.items():
        llm = model or cfg.get("llm")
        agents[key] = Agent(
            role=cfg["role"], goal=cfg["goal"], backstory=cfg.get("backstory", ""),
            llm=llm, verbose=False, max_iter=10,
        )
    built = {}
    ordered = ["collect_facts", "retrieve_context", "tabulate",
               "synthesize", "act", "verify"]
    for key in ordered:
        cfg = tasks_cfg[key]
        ctx = [built[c] for c in (cfg.get("context") or [])]
        # find agent key whose `agent:` name matches the yaml value
        agent_key = next(k for k, a in agents_cfg.items() if k == cfg["agent"])
        built[key] = Task(description=cfg["description"],
                          expected_output=cfg["expected_output"],
                          agent=agents[agent_key],
                          context=ctx or None)
    return Crew(agents=list(agents.values()), tasks=[built[k] for k in ordered],
                process=Process.sequential, verbose=False)
