# AgentOS Database Architecture Review

> Analysis phase only. No backend, database, migration, ORM, or API was
> created or modified. Companion file:
> `AGENTOS_DATABASE_ARCHITECTURE.drawio` (open in https://app.diagrams.net/).

## 1. Source audited

- `docs/architecture/*.md` (21 files): scaffolds only — ADRs, flow string,
  no entities/fields. Cited where relevant, never as entity evidence.
- `backend/*/[domain]-plan.md` §12 table-name list (18 files, identical):
  `runs, run_steps, run_events, blueprints, tools, documents, chunks, memory`.
- `infrastructure/postgres/0001_init.sql`: `orgs, blueprints, runs, run_steps,
  run_events, documents, chunks, memory` + `vector`/`pgcrypto` extensions +
  RLS per `organization_id`.
- `backend/database/README.md` §9 (JSONB Blueprint/DAG, raw-text chunk retention),
  `backend/auth/*`, `backend/rag/*`, `backend/memory/*`, `backend/execution/*`,
  `backend/policy/*`, `backend/evaluation/*`, `backend/observability/*`
  (objectives + cross-cutting rules, no columns).
- `frontend/src/api/API_REFERENCE.md` + `API_INTEGRATION_PLAN.md` (endpoint
  shapes; statuses BACKEND-AVAILABLE / CONTRACT-READY / UNKNOWN).
- `data/*.json` (orders/products/policies seeds — future seed scripts, not tables).
- `.env.example`, `infrastructure/docker-compose.yml`, `infrastructure/redis/*`.

## 2. Confirmed entities (evidence in plans/SQL)

| Entity | Evidence |
|---|---|
| `organizations` | `0001_init.sql:1` only (name `orgs` there) |
| `blueprints` | §12 lists + JSONB rule (`database/README.md:37`) |
| `runs`, `run_steps`, `run_events` | §12 lists + `run_id` + envelope `{run_id, tenant_id, ts, payload_ref}` |
| `documents`, `chunks` | §12 lists + raw-text retention rule |
| `memory` | §12 lists + consent/TTL + Redis-short/Postgres-long rule |
| `tools` | §12 lists + 4 seeded tools + RBAC/audit rule |

## 3. Proposed entities (needed, not fully defined)

`users`, `workspaces`, `workspace_members`, `agents`, `agent_tools` (junction),
`conversations`, `messages`, `tasks`, `task_steps`, `knowledge_bases`,
`kb_documents` (junction), `stored_files`, `folders`, `tool_calls`,
`policies` (rules as JSON, per current Policies page model),
`provider_configs` (`credential_ref` only), `audit_events`, `experiments`,
`experiment_runs`, `run_metrics`, `system_config`. All marked UNCONFIRMED or
CONTRACT (frontend contract) on the diagram.

## 4. Relationship audit

| Source | Relationship | Target | Evidence | Status |
|---|---|---|---|---|
| users | N:1 | organizations | auth JWT + org context (no columns) | UNCONFIRMED |
| workspaces | N:1 | organizations | same as above | UNCONFIRMED |
| workspace_members | N:1 | workspaces, users | junction required for N:N | UNCONFIRMED |
| agents | N:1 | workspaces | frontend `workspace_id` convention | CONTRACT |
| agent_tools | N:1 | agents, tools | N:N needs junction | UNCONFIRMED |
| conversations | N:1 | workspaces, agents | frontend contract | CONTRACT |
| messages | 1:N (parent) | conversations | frontend contract | CONTRACT |
| tasks | N:1 | workspaces, conversations | frontend contract | CONTRACT |
| task_steps | 1:N (parent) | tasks | implied by name only | UNCONFIRMED |
| blueprints | N:1 | workspaces | JSONB rule, no FK stated | UNCONFIRMED |
| runs | N:1 | workspaces, tasks | names + `run_id` only | UNCONFIRMED |
| run_steps / run_events | 1:N (parent) | runs | names only | UNCONFIRMED |
| knowledge_bases | N:1 | workspaces | frontend contract | CONTRACT |
| kb_documents | N:1 | knowledge_bases, documents | N:N needs junction | UNCONFIRMED |
| documents | N:1 | workspaces | §12 + RLS rule | UNCONFIRMED |
| chunks | 1:N (parent) | documents | raw-text rule | UNCONFIRMED |
| stored_files | N:1 | workspaces, folders | frontend contract | CONTRACT |
| folders | N:1 | workspaces | frontend contract | CONTRACT |
| tool_calls | N:1 | runs, tools | trace requirement, no source | UNCONFIRMED |
| policies | N:1 | workspaces | frontend field list | CONTRACT |
| provider_configs | N:1 | workspaces | env vars only | UNCONFIRMED |
| audit_events | N:1 | workspaces | "ghi audit/event" one-liner | UNCONFIRMED |
| experiments | N:1 | workspaces | frontend contract | CONTRACT |
| experiment_runs | 1:N (parent) | experiments | implied by `getExperimentRuns` | UNCONFIRMED |
| run_metrics | N:1 | experiment_runs | endpoint shape UNKNOWN | UNCONFIRMED |

## 5. Multi-tenancy audit

- Rule (all plans §6/§11, SQL:4): `organization_id` from server auth context,
  never client; RLS per table; `tenant_id` in events/logs; unknown tenant → 403.
- Therefore every workspace-scoped table carries `organization_id` on the
  diagram. `organizations` itself is SQL-only evidence; `users`/`workspaces`/
  `workspace_members` are CONTRACT/UNCONFIRMED. Global tables: none (even
  `tools` is workspace-scoped per RBAC rule).

## 6. Execution trace audit

Chain `User → Conversation → Message → Task → Task Step → Run → Agent →
Tool / RAG → Result` is representable with the entities above, but every link
between `tasks` and `runs` is UNCONFIRMED or CONTRACT-only. **TRACEABILITY GAP**:
no defined FK from runs to tasks/agents, no step→run linkage, no tool-call or
retrieval records. Page 03 draws the desired trace, not the confirmed schema.

## 7. RAG audit

`Document → Chunk` confirmed by name; raw-text retention confirmed; tenant
query-time filter confirmed. Missing: embedding column, chunking params,
`knowledge_base ↔ document` join, retrieval-event records.
**VECTOR STORAGE DECISION REQUIRED**: pgvector MVP → Qdrant path assumed
(ADR-004, `VECTOR_BACKEND=pgvector`, empty `QDRANT_URL`); no dimensions/index/
distance config anywhere.

## 8. Storage audit

- Relational (Postgres, system of record): metadata tables above.
- Object Storage: binaries for `documents`/`stored_files` (no bucket/path/
  versioning design exists).
- Vector Store: chunk embeddings (decision required, §7).
- Cache/Queue: Redis (queue+cache+pub/sub, persist-before-publish rule; no key
  schemas or TTL values).
- Secrets: env only today; diagram uses `credential_ref` + external Secret
  Storage box. Never plaintext API keys in columns.

## 9. Security audit

JWT + RBAC asserted, roles/permissions undefined; RLS asserted, policies
undefined; secrets via env, no rotation/KMS; `.env` never committed.
`provider_configs.credential_ref` is a reference, not a secret column.

## 10. Scientific research audit

Only "golden sets, pass thresholds" (`evaluation-plan.md:6`). Experiments
module is a frontend contract; metrics/run-detail shapes UNKNOWN. Domain
RESEARCH on the diagram is CONTRACT/UNCONFIRMED throughout. Recommendation:
**Future Research Extension** — define metric names, datasets, thresholds
before modeling.

## 11. Gaps

No PK/FK/types/nullability/indexes/cardinality defined for any table in any
source. No conversation/message/task backend model. No chunk/embedding model.
No tool-registry/policy-rule/provider-config/log-table columns. No workflow
instance/node/approval tables. No document/agent versioning. No retention or
partitioning rules. No analytics tables (derived only).

## 12. Open Questions

See diagram page 04 (12 items requiring human decision: engine, vector store,
object storage, secrets, tenant-key naming, auth tables, workflow persistence,
versioning, experiment schema, retention, analytics, conversation ownership).

## 13. Recommended next phase

1. Logical schema review (this diagram) → 2. Database selection →
3. Physical schema (types, constraints, indexes, RLS policies) → 4. ORM models
→ 5. Migrations. None of these are started.
