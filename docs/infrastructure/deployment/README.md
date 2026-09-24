# Deployment — README

> Domain: `infrastructure/deployment`. compose for dev, K8s manifests skeleton — env promotion. Architecture-first, Modular Monolith + Workers + Redis + Postgres + pgvector. Cấm microservices sớm.

## 1. Purpose
Deployment tồn tại để compose for dev, k8s manifests skeleton — env promotion. Giữ boundary rõ để tách service sau này không rewrite logic.

## 2. Responsibilities
- Thực thi đúng phạm vi deployment; expose interface ổn định cho caller.
- Validate input, trả lỗi chuẩn, ghi audit/event.
- Tái dùng code cũ: `agents.py`, `crew.py`, `tools/*_tools.py`, `data/*.json` (chuẩn hoá thành seed + migration).

## 3. Non-Responsibilities
- Không gọi trực tiếp CrewAI (trừ `backend/crewai` adapter); không vượt boundary sang domain khác.
- Không chứa logic UI (backend) / logic execution (frontend); không tự đẻ schema DB/event mới.

## 4. Architecture Position
- Vị trí: CI/CD -> Docker -> Postgres/Redis/Vector.
- Diagram tổng: `User > API > Planner > Blueprint > ExecutionPlan > CrewAI Adapter > Agents > Tools/RAG/Memory/LLM > EventBus > Frontend (SSE)`.
- Chi tiết: `docs/architecture/system-architecture.md`.

## 5. Dependencies
- Upstream: theo Flow trong `*-plan.md`. Downstream: chỉ qua interface đã khai báo.
- Hạ tầng: Postgres (system of record + pgvector MVP), Redis (queue/cache/pubsub). Tham chiếu `docs/architecture/00-system-overview-detailed.md` (D:\Downloads\files).

## 6. Inputs
- DTO/schema versioned; `organization_id` luôn lấy từ server auth context, không tin client.

## 7. Outputs
- DTO chuẩn + event tương ứng; idempotent khi retry qua queue.

## 8. Interfaces
- Backend: REST `/api/v1/...` + SSE `/api/v1/runs/{id}/events`; Frontend: typed client; Infra: compose service + healthcheck.
- CrewAI chỉ qua `AgentRuntime` interface (`backend/crewai`), cho phép FakeRuntime trong test.

## 9. Data
- Postgres là system of record; JSONB cho Blueprint/DAG; `document_chunks` giữ text gốc để re-index khi migrate pgvector->Qdrant.

## 10. Events
- Publish `RunEvent`/domain event vào Postgres + Redis pubsub; Frontend subscribe qua SSE.

## 11. Security
- Auth JWT, RBAC, RLS theo `organization_id`; RAG filter tại query-time; secret qua env, cấm commit `.env`.

## 12. Observability
- Log có `run_id/tenant_id`; metric RED; trace OpenTelemetry; xem `docs/architecture/observability.md`.

## 13. Testing
- Unit + contract + 1 e2e skeleton; threshold ở `*-plan.md#acceptance`. Không để code tự đẻ architecture ngược.

## Related
- Plan: `./deployment-plan.md`. Kiến trúc chi tiết: `docs/architecture/`.
- Nguồn tái dùng: `D:\Downloads\files\docs\architecture\` (00-24,26,28,29,30,33, REVIEW).

## Status
- `scaffold` — skeleton/config only, chưa implementation lớn. Coding agent implement theo `*-plan.md`.
