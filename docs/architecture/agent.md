# Agent — Enterprise Agent Platform

> Nguồn chi tiết: `D:\Downloads\files\docs\architecture\04-agent-architecture.md` + `00-system-overview-detailed.md`. File này là bản scaffold định hướng, không copy mù; coding agent đọc file nguồn để implement.

## Bối cảnh
Static/Configurable/Dynamic, Blueprint JSON schema (ADR-008/009).

## Quyết định kiến trúc liên quan
- ADR-001 Modular Monolith; ADR-002 CrewAI sau Adapter; ADR-003 Postgres system of record; ADR-004 pgvector MVP>Qdrant; ADR-005 Redis queue; ADR-006 SSE; ADR-007 row-level isolation; ADR-008 Blueprint JSON; xem `24-architecture-decisions.md` nguồn.

## Sơ đồ
`User > API > Planner > Blueprint > ExecutionPlan > CrewAI Adapter > Agents > Tools/RAG/Memory/LLM > EventBus > Frontend (SSE)`

## Liên kết domain
- Backend: `backend/` (api/auth/agents/planner/crewai/...). Frontend: `frontend/`. Infra: `infrastructure/`.
- Plan chi tiết: từng `*/README.md` + `*-plan.md` trong repo này.

## Trạng thái
`scaffold` — chờ coding agent implement theo plan, cross-check caller/callee + DB/event/API/test/acceptance.
