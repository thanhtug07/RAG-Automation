# PROJECT — AgentOS / RAG-Automaition (single-file system design)

> Only system-design document in the repo. Rewritten 2026-09-24 from direct
> file reads — every statement below was verified against the working tree;
> anything unverified is marked UNVERIFIED. Owner direction: CrewAI Cloud
> (crewai.com) for execution; this repo keeps planning, specs, flows, data, CLIs.

## 1. What this repo is

Vietnamese multi-channel e-commerce RAG assistant (Shopee / TikTok Shop / P2P).
Local runtime is `flows/rag_flow/` (intent-routed CrewAI Flow). There is NO local
`backend/crewai/` package anymore (directory itself deleted by owner 2026-09-24).

## 2. Repo layout (verified by directory listing 2026-09-24)

```text
backend/
  __init__.py               # makes backend a regular package
  planner/service.py        # PlannerService: keyword query -> Plan {plan_id, steps[]}
  execution/service.py      # in-memory run lifecycle (queued/running/succeeded/failed)
  api/main.py               # FastAPI stubs: /health, /runs, /plans (61 lines)
  tests/                    # test_planner_execution_runtime.py, test_shared_contracts.py
  auth|core|context|database|events|llm|memory|observability|policy|tools|workflows|evaluation
                            # scaffold/stub packages (auth has jwt/rbac + tests)
  crewai/
    __init__.py               # package marker only (validator lives here, no runtime code)
    validation/               # validator.py (21 rules, pure stdlib, read-only) +
                              # test_validator.py (12 tests: 10 rules + determinism/read-only)
                              # REWRITTEN 2026-09-24 from specs/*.md after owner cleanup
flows/rag_flow/             # PRODUCTION Flow: router + 4 crews + 2 tools
  pyproject.toml · README.md · .env.example
  knowledge/README.md       # pointer to data/ (no duplication)
  src/rag_flow/
    state.py                # RagFlowState: query, context_text, channel, intent,
                            # retrieved_docs, analysis_result, final_answer,
                            # confidence, error, metadata (Pydantic, 10 fields)
    llm.py                  # default_model(): env id + openai/ prefix on custom base
    main.py                 # RagFlow: @start prepare_input → @router classify_intent →
                            # @listen branches (run_data/run_policy/run_complex/run_simple) →
                            # @listen(or_(4)) review_and_format; kickoff(query, context_text, channel)
    crews/data_crew/        # rag_retriever + data_analyst + analyst (3 tasks)
    crews/policy_crew/      # researcher + rag_retriever (2 tasks)
    crews/full_analysis_crew/ # researcher+rag+data_analyst+analyst+executor (5 tasks)
    crews/fast_ask_crew/    # analyst (1 task)
                            # each: agents.yaml + tasks.yaml + *_crew.py build() (no kickoff inside)
    tools/                  # csv_query_tool.py (sum/count/filter/group_sum, stdlib csv),
                            # document_search_tool.py (keyword search, file:line refs)
scripts/
  chat_crew.py              # ONLY script left (159 lines). BROKEN: imports deleted
                            # backend.crewai.adapter/agent_configs — needs repoint or removal.
data/                       # demo_q3_2024.csv + demo_customers.csv + demo_orders.csv +
                            # demo_products.json + demo_policies.md + demo_reviews.txt +
                            # legacy orders.json/products.json/policies.json
docs/backend/crewai/
  specs/                    # 7 normative spec files, INTACT (see §4)
  agents/                   # EMPTY directory (role docs deleted by owner)
frontend/ | infrastructure/ | tools/ (repo-root legacy JSON tools) | test-reference/
  # not audited in this rewrite — UNVERIFIED beyond existence
requirements.txt            # crewai, crewai[tools], litellm, python-dotenv, fastapi,
                            # uvicorn, pydantic>=2, celery[redis], psycopg[binary],
                            # pgvector, python-jose, pytest (13 lines, verified)
pytest.ini                  # registers `live` mark (3 lines, verified)
.env / .env.example         # .env gitignored; .example has no OPENAI_API_BASE entry
```

## 3. Actual flow (as built)

```text
User query
  -> flows/rag_flow kickoff(query, context_text, channel)
  -> prepare_input: channel detect (shopee/tiktok/p2p substrings)
  -> classify_intent (deterministic keyword router, Vietnamese ± diacritics):
       policy_*   -> PolicyCrew (2 tasks)      | complex_* -> FullAnalysisCrew (5 tasks)
       data_*     -> DataCrew (3 tasks)        | else       -> FastAskCrew (1 task)
  -> review_and_format (Reviewer agent): verify branch output, format Vietnamese,
     confidence 0.85 on success / 0.0 + state.error on failure
  <- final_answer string ("" on failure; metadata.duration_s recorded)
```

Verified 2026-09-24: router 4/4 correct offline; all 4 crews construct
(data 3/3, policy 2/2, full 5/5, fast 1/1 agents/tasks); live ground-truth
"Tổng doanh thu Q3 2024?" → data path → answer contains 28.035.000, exit 0.
Planner→Builder→Flow wiring EXISTS since 2026-09-24: `backend/builder/`
(Plan → validated CrewSpec, BuilderError on FAIL) + `to_flow_inputs()` →
`kickoff(**inputs)`; proven offline end-to-end (validated specs only).

## 4. CrewSpec contract (documented in docs/backend/crewai/specs/*.md, 7 files intact)

v1.0.0-draft. Top-level: `metadata*{crew_id,name,version[,description]}`,
`objective*{objective,goal,expected_outcome}`, `agents[1..]*{id,role,goal[,backstory],
model,tool_refs[,constraints]}`, `tasks[1..]*{id,name,description,agent_ref,
expected_output[,context,depends_on]}`, `tools*` (key required, may be `[]`),
`[dependencies[]]` (redundant checked view), `process*{sequential|hierarchical[...]}`
`[execution{timeout 30-3600, max_iter 1-50, failure halt|skip|retry_once,
output last_task|collect_all}]`, `[constraints{task_limit 1-100, agent_limit 1-50,
allowed_resources[]}]`. Normative names: `agent_ref`/`tool_refs`/`depends_on`.
Secrets anywhere → reject (V-SEC-01). Enforced by
`backend/crewai/validation/validator.py` (rewritten 2026-09-24 from specs).

## 5. Validation rules (21, enforced — 12 tests green 2026-09-24)

Per `specs/validation-spec.md` (re-read in full before rewrite):
V-TOP-01/02 · V-AG-01/02/03 · V-TASK-01/02/03 · V-TOOL-01/02 · V-DEP-01..05
(V-DEP-04 FAIL overrides the "collapse" sentence in dependency-spec.md) ·
V-PROC-01/02/03 · V-EXE-01 · V-CON-01 · V-SEC-01 (8 secret patterns, label-only
messages). Known gaps (still open): 9 rules lack invalid-path tests; V-SEC-01 has
no escape hatch.

## 6. Six roles (values verified from AGENT.md + agent_configs.py before deletion)

| id | role | spec tool_refs (proposed, never built) |
|---|---|---|
| researcher | Researcher | document_search |
| rag_retriever | Knowledge Retriever | kb_retrieve |
| data_analyst | Data Analyst | database_query |
| analyst | Analyst | — |
| executor | Executor | document_search, database_query |
| reviewer | Reviewer | — |

Roles differ in text only (no subclasses ever existed). Flow crews reuse the same
6 roles; flow tools are DIFFERENT objects (`csv_query`, `document_search` tool —
verified in `tools/*.py`) because real `kb_retrieve`/`database_query` backends were
never built. Memory/skills/MCP/apps/access-control: TBD everywhere, OFF everywhere.
Model catalog contents: UNVERIFIED.

## 7. Runtime facts (measured, not assumed)

- Stack: Python 3.13.7, NO venv (system interpreter), crewai 1.15.22
  (`crewai` CLI 1.15.20 present), litellm 1.102.1 (REQUIRED for `openai/<id>`
  routing on custom bases — proven by the "LiteLLM fallback not installed" error).
- `Agent(llm="<plain string>")` auto-resolves; `LLM(model, temperature=0)` works;
  `Task.context` is `list[Task]`; `kickoff()` argless or `kickoff(inputs)`;
  `Flow` supports `@start/@router/@listen/or_`; result object exposes `.raw`.
- Free-tier provider reality (TokenHarbour, measured): 60–150s/call with huge
  variance; 6-task native-context chains exceed practical watchdogs (sequential
  per-task path passed 6/6 in 1238s); post-timeout crewai event-bus tracebacks
  (`cannot schedule new futures after shutdown`) are crewai-internal noise.
- Windows console is cp1252: Vietnamese/emoji output crashes printing unless
  streams are reconfigured to UTF-8 (chat CLI does this; flow probes needed it too).

## 8. Config (names only — values in gitignored .env, never committed)

`OPENAI_API_KEY` (live `thk_` key, length verified masked) ·
`OPENAI_API_BASE=https://tokenharbor.ai/v1` (WITHOUT `/chat/completions` suffix —
litellm appends the path; verified by failed/successful calls) ·
`OPENAI_MODEL_NAME` (exact provider id; `GET /v1/models` returned ~60 ids including
`deepseek-v4.1-flash:free`; code prefixes `openai/` when a custom base is set).
`.env.example` (17 lines) lacks `OPENAI_API_BASE` — update it when touching env.

## 9. CLIs & tests (current truth 2026-09-24)

- `scripts/chat_crew.py` (159 lines, read in full): full chat loop (`/upload /files
  /ask /agents /model /timeout /history /save /clear /quit`), no size caps (owner
  decision), crash-safe input. BROKEN NOW: imports deleted `backend.crewai.*`.
- `backend/tests/`: `test_planner_execution_runtime.py` (planner+execution only,
  crewai imports removed), `test_shared_contracts.py`, `backend/auth` tests.
  Suite just run: **28 passed**.
- Deleted with their modules (do not reference): validator tests, slice/sequential/
  failure/six-agent tests, `run_minimal_crew.py`, `verify_agents.py`, 6×
  `test_agent_*.py`, `agent_live_specs.py`, legacy `cli.py`.
- `pytest.ini` intact.

## 10. Data & ground truth (verified by direct computation 2026-09-24)

- `demo_q3_2024.csv` (45 rows, 4511 bytes): total **28,035,000** VND —
  TikTok 11,680,000 highest; Jul 10,590,000 best month (10590000 vs 8975000 vs 8470000).
- `demo_customers.csv` (500 rows, C0001–C0500 unique), `demo_orders.csv` (800 rows,
  total **440,390,000** VND; every customer_id resolves to the customer file),
  `demo_products.json` (10 products), `demo_policies.md` (returns/exchange/shipping/
  membership), `demo_reviews.txt` (100 reviews). Generator seed 20240924
  (script lives in temp, NOT in repo — ask before regenerating).
- Legacy `orders.json`/`products.json`/`policies.json`: present, contents UNVERIFIED.

## 11. Boundaries

Execution: local Flow now, CrewAI Cloud later. `backend/crewai/` holds ONLY the
validator (rewritten per Prompt 3); no runtime/builder code there. Planner reasoning,
API/auth/transport, DB/persistence, frontend: out of scope for flow code.

## 12. Next (not started)

1. `scripts/chat_crew.py`: DONE repointed to `flows/rag_flow kickoff()` (offline
   11/11 commands pass; live /ask pending quota).
2. `backend/builder/` (Plan → CrewSpec → validate): needs validator restored
   or rewritten from `specs/*.md`.
3. CrewAI Cloud exporter (spec → Studio artifact): needs platform API format.
4. Consider a venv; legacy seeds/frontend/infra remain UNVERIFIED.

## 13. Deletion log (owner-executed 2026-09-24 unless noted; agent deleted only #4)

1. Analysis reports (7 PHASE_*.md) — agent-distilled into project.md first, then deleted.
2. Test reports (PART_1/2) — same handling as #1.
3. `backend/crewai/*` + containing dir (validation, builders, runtime, configs, legacy).
4. Broken execution CLIs + dead tests — agent-deleted after they lost their imports
   (9 scripts, 4 test files; listed in git history).
5. `docs/.../agents/**`, model docs (`CREW/AI_SYSTEM/MODEL`, `*_MODEL.md`, plans).
6. Cache dirs (`__pycache__`, `.pytest_cache`).
7. `crews/crewai/` superseded scaffold + empty `docs/.../agents/` dir (agent-executed
   this turn; zero external references verified by repo-wide grep).
Surviving by owner intent: `specs/*.md`, `scripts/chat_crew.py`, `crews/`, `flows/`,
`data/`, `project.md`, Planner/API/tests, `.env`, `pytest.ini`.
