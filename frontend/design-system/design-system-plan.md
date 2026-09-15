# Design System — Implementation Plan

> Kind: `frontend` | Domain: `design-system` | Ưu tiên: Foundation>Auth>Agent>Planner>Workflow>CrewAI>Execution>RAG>Memory>Tools>LLM>Context>Policy>Events>Observability>Evaluation>Frontend. Chỉ skeleton/config, không full implementation.

## 1. Objective
Đưa `frontend/design-system` (tokens, shadcn-style components — theming, a11y) lên Modular Monolith chạy được tối thiểu (healthcheck + contract test xanh), giữ chỗ cho implementation đầy đủ sau.

## 2. Scope
- Tạo cấu trúc thư mục, README, interface stub, config, 1 test skeleton.
- Tái dùng: `agents.py` (4 agents: lookup/analysis/policy/manager), `crew.py` (hierarchical crew), `tools/` (4 tools), `data/*.json` (seed).

## 3. Non-Goals
- Không viết full backend/frontend logic; không microservices; không thay CrewAI trực tiếp ngoài adapter; không phá JSON data cũ (chỉ chuẩn hoá/migrate có script).

## 4. Context
- Hiện trạng: CLI `main.py` + hierarchical Crew (`manager` delegate), tools đọc JSON local, không API/DB/queue/auth. Cần nâng lên enterprise platform theo `D:\Downloads\files\docs\architecture\` (00-system-overview-detailed, 05-crewai, 06-planner, 08-rag, 10-tool, 11-llm, 12-memory, 14-db, 15-run, 16-realtime, 29-dsl, 30-context).
- Ràng buộc: Modular Monolith + Workers + Redis + Postgres + pgvector; CrewAI sau Execution Manager/Planner via Adapter.

## 5. Dependencies
- Upstream: Backend API. Hạ tầng: Postgres/Redis sẵn qua `infrastructure/`.
- Blocked-by: Foundation + Auth trước; Agent/Planner trước CrewAI/Execution (xem roadmap 23).

## 6. Input
- DTO versioned; `organization_id` từ auth context server-side; ví dụ query RAG đa sàn (orders/products/policies).

## 7. Flow
1. Caller gọi interface của `design-system` (REST/SSE/import).
2. Validate input + auth + policy check.
3. Thực thi tối thiểu (stub trả fixture từ `data/*.json` hoặc ack job).
4. Persist (nếu có) vào Postgres + publish event Redis.
5. Trả DTO + `trace_id/run_id`; Frontend cập nhật qua SSE.

## 8. Rules
- Mọi tương tác CrewAI qua `AgentRuntime` interface; Blueprint là JSON có schema (Pydantic), không code tuỳ ý.
- Không bypass Policy; Dynamic Agent chỉ khi được cấp phép + qua Validation Pipeline.
- Dependency direction một chiều; cấm import ngược (xem `system-architecture.md`).

## 9. Output
- DTO chuẩn + event; stub response mẫu trong `tests/fixtures/`.

## 10. Errors
- Mã lỗi chuẩn: `400 validation`, `401/403 auth`, `404 not found`, `409 conflict`, `422 policy denied`, `429 rate-limited`, `500 + trace_id`. Retry queue với backoff + DLQ skeleton.

## 11. Security
- JWT + RBAC + RLS; RAG filter `tenant_id` tại query-time (không filter ở app sau khi lấy); secret chỉ qua env; kiểm tra `.gitignore` cấm `.env`.

## 12. DB
- Bảng liên quan: xem `docs/architecture/database.md` (runs, run_steps, run_events, blueprints, tools, documents, chunks, memory). Migration skeleton `0001_init.sql` + RLS policy mẫu. JSON data cũ -> seed script, không sửa tay.

## 13. API
- Backend: `POST /api/v1/design-system` (nếu áp dụng), `GET /api/v1/design-system`, SSE cho run events. Frontend: typed client trong `frontend/design-system/` hoặc `frontend/api/`. Version `/v1`, pagination cursor/limit.

## 14. Event
- Publish: `design-system.completed|failed` với `{run_id, tenant_id, ts, payload_ref}`; persist Postgres trước khi pub Redis (không mất event khi đổi broker).

## 15. Files Create
- `frontend/design-system/README.md` (13 mục), `frontend/design-system/design-system-plan.md` (21 mục này), `__init__.py`/`index.ts` stub, `interface.*` stub, `config.*` nếu cần, `tests/test_design-system_contract.*` skeleton.

## 16. Files Modify
- Không sửa `agents.py`/`crew.py`/`tools/*.py`/`data/*.json` gốc ở phase scaffold (chỉ đọc/tái dùng). Root `README.md`, `.env.example` được cập nhật ở Phase 4.

## 17. Tests
- Contract test: import/interface tồn tại, stub trả đúng shape, event có `run_id/tenant_id`. Lệnh: `pytest backend/design-system -q` / `npm run test -- frontend/design-system` (skeleton xanh với fixture).

## 18. Edge
- Thiếu DB/Redis -> trả `503 + retry-after`, không crash. Input rỗng/sai schema -> `400` chi tiết field. Tenant lạ -> `403`, không lộ tồn tại resource. Queue đầy -> backpressure + DLQ.

## 19. Observability
- Log JSON có `tenant_id/run_id`; counter `design-system_requests_total`, histogram latency; trace span per Flow step; dashboard skeleton ở `infrastructure/monitoring/`.

## 20. Acceptance
- [ ] `tree` đúng cấu trúc; README 13 mục + plan 21 mục đầy đủ.
- [ ] Stub import được, contract test xanh, healthcheck pass.
- [ ] Caller/callee ghi rõ, không architecture ngược (code không tự đẻ table/event/API mới).
- [ ] Secret không commit; `.env.example` đầy đủ key.

## 21. Status
- `scaffold-pending` — coding agent nhận plan này implement không cần đoán thêm.
