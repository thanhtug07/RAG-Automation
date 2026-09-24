# AgentOS Database Architecture (review draft)

Analysis-phase artifacts. Nothing here creates or migrates a database.

| File | Purpose | How to open |
|---|---|---|
| `AGENTOS_DATABASE_ARCHITECTURE.drawio` | Logical ERD (01) + Data Flow (02) + Execution Trace (03) + Open Questions (04) | https://app.diagrams.net/ → Open Existing Diagram → select this file |
| `DATABASE_ARCHITECTURE_REVIEW.md` | Evidence, decisions, gaps, next-phase recommendation | Any markdown viewer |

Status badges on every table: `[CONFIRMED]` named in plans/SQL ·
`[CONTRACT]` frontend API contract only · `[UNCONFIRMED]` needed but undefined.
Dashed boxes are external systems, not tables.
