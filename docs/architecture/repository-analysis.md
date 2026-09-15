# Repository Analysis — RAG-Automation

## 1. Objective
Nâng CLI RAG đa sàn (CrewAI hierarchical) lên Enterprise Agent Platform (Modular Monolith + Workers + Redis + Postgres + pgvector), giữ nguyên giá trị nghiệp vụ cũ.

## 2. Scope
- Phân tích: tree 3 level, README, requirements, .env.example, entry points, API, RAG, CrewAI, DB, dependencies.
- Không code tính năng hàng loạt ở phase này; chỉ scaffold blueprint + skeleton/config chạy được.

## 3. Current Stack
- Python CLI (`main.py` 70 dòng: banner + REPL + run_query), `crewai` + `crewai[tools]` + `python-dotenv` (requirements.txt 3 dòng, unpinned — debt).
- `agents.py` 63 dòng: 4 Agent (lookup/analysis/policy/manager, manager allow_delegation=True).
- `crew.py` 42 dòng: 1 Task + Crew hierarchical (manager_agent=manager).
- `tools/`: `lookup_tools.py` 224d (Order/Product JSON search, fuzzy, VNĐ format), `analysis_tools.py` 238d (by_platform/by_date/by_product/by_status/overall), `policy_tools.py` 215d (fuzzy platform + topic aliases fees/return/shipping/violations/promotions), `__init__.py` 10d.
- `data/`: orders.json 197d, products.json 272d, policies.json 121d (tiếng Việt, encoding lỗi chỗ dấu — cần chuẩn hoá UTF-8).
- `.env.example`: OPENAI_API_KEY + OPENAI_MODEL_NAME=gpt-4o-mini. `.gitignore` đã cấm `.env` tốt. README chỉ 1 dòng.

## 4. Entry Points
- `main.py:main()` -> `check_api_key()` -> REPL -> `crew.run_query(q)` -> `create_crew(q)` -> `kickoff()`. Không API server, không worker, không DB.

## 5. API
- Chưa có HTTP API. Mục tiêu: FastAPI `/api/v1/*` + SSE `/api/v1/runs/{id}/events` (theo 22-api-spec, 16-realtime). SSE thay WebSocket (ADR-006).

## 6. RAG
- Hiện tại là JSON keyword search, chưa có embedding/chunk/retrieve/rerank. Migrate theo 08-rag + 09-security: ingest->chunk->embed->pgvector->retrieve (filter tenant_id query-time)->rerank->generate; giữ text gốc ở Postgres để re-index khi lên Qdrant.

## 7. CrewAI
- Đang gọi trực tiếp (`from crewai import Agent/Crew/Task`). Nợ: lock-in. Plan: bọc sau `AgentRuntime` Interface + `CrewAI Adapter` (05-crewai, ADR-002); FakeRuntime cho test.

## 8. DB
- Chưa có DB (JSON file). Plan: Postgres system of record + pgvector MVP (ADR-003/004), Redis queue/cache/pubsub (ADR-005), RLS row-level isolation (ADR-007).

## 9. Reuse (giữ lại)
- 4 roles agent + routing manager (lookup/analysis/policy) -> Blueprint registry seed.
- 4 tools logic (fuzzy match, currency VNĐ, alias topic) -> Tool Registry impl tham chiếu.
- 3 JSON data -> seed script + fixtures test.
- .gitignore/.env.example pattern.

## 10. Debt (technical debt)
- requirements unpinned; không version API; không test; encoding JSON lỗi font; tool đọc file sync mỗi call (không cache); analysis quét full orders mỗi lần; không auth/tenant/audit/log structured; API key check chỉ ở CLI.

## 11. Thứ không được phá
- Ngữ cảnh tiếng Việt + format VNĐ; routing 3 loại câu hỏi (tra cứu/phân tích/chính sách); fuzzy không phân biệt hoa-thường; JSON data gốc (migrate bằng script, không sửa tay).

## 12. Migration Requirements
- Modular Monolith + Workers (Celery/Arq) + Redis + Postgres + pgvector; cấm microservices sớm (ADR-001).
- Thứ tự: Foundation>Auth>Agent>Planner>Workflow>CrewAI>Execution>RAG>Memory>Tools>LLM>Context>Policy>Events>Observability>Evaluation>Frontend.
- Mỗi domain README 13 mục + *-plan 21 mục; caller/callee + DB/event/API/test/acceptance rõ; root README + diagram User>API>Planner>Blueprint>ExecutionPlan>CrewAI Adapter>Agents>Tools/RAG/Memory/LLM>EventBus>Frontend.

## Status
- `approved-for-scaffold` — đủ đầu vào để sinh blueprint, không đoán.
