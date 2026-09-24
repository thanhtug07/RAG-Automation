# crews/crewai — Q3 analysis crew (official crewai structure)

Package `q3crew` (not `crewai`, to avoid shadowing the installed distribution).

- `src/q3crew/config/agents.yaml` — 6 roles
- `src/q3crew/config/tasks.yaml` — 6-task chain, `{topic}` + `{context_text}` inputs
- `src/q3crew/crew.py` — `build_crew(model=None)`
- `src/q3crew/main.py` — `run(topic, context_text, model=None)` → kickoff result dict

Config (repo `.env`): OPENAI_API_KEY / OPENAI_API_BASE / OPENAI_MODEL_NAME.
Run: `python src/q3crew/main.py "<cau hoi>"` from this dir.
