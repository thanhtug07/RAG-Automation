# Frontend Structure Audit — AgentOS

> Audit-only. No code, API, route, backend, or visual changes were made.
> Evidence sources: working tree, `README.md`, `docs/architecture/frontend.md`,
> `frontend/FRONTEND_REPORT.md`, backend `*-plan.md`, code references.

## 1. Current structure

`frontend/src/` holds: `api/` (21 files), `routes/` (5), `styles/` (3),
`pages/` (dashboard, documents, policies, data-storage, home, auth/*),
`tests/` (sibling of `src/`). Empty dirs (0 files): `assets/`,
`components/` (+`button modal sidebar table topbar`), `config/`,
`layouts/` (+`application auth marketing`), `realtime/`, `services/`,
`state/`, `utils/`. (`pages/auth/assets/` separately holds 2 mp4.)

## 2. Active folders

| Folder | Evidence |
|---|---|
| `api/` | 16 JS + 3 docs; loaded by dashboard via classic scripts |
| `routes/` | `routes.js/router.js/guards.js` loaded by dashboard/documents/policies/data-storage |
| `styles/` | `reset/tokens/shell.css` linked by home/auth |
| `pages/*` | All page HTML/CSS/JS loaded by their pages |

## 3. Empty folders

`assets/`, `components/`+5 subs, `config/`, `layouts/`+3 subs, `realtime/`,
`services/`, `state/`, `utils/` — 0 files each, 0 code references
(no `fetch`/import/script/link points at them).

## 4. Planned folders

Only `realtime/`: `README.md` references SSE realtime (`frontend/realtime/`).
No file exists yet. Status: EMPTY / RESERVED.

## 5. Unjustified folders

`assets/` (root; real assets live in `pages/auth/assets/`), `components/`+subs,
`config/`, `layouts/`+subs, `services/`, `state/`, `utils/` — no code reference,
no PLAN reference, no spec requirement found. See §8, decision required;
nothing deleted by this audit.

## 6. Duplicate logic (report only, no refactor)

- Sidebar markup (~90 lines) duplicated in dashboard/documents/policies/data-storage.
- Theme+lang bootstrap inline script duplicated in 7 page heads.
- Toast system duplicated in dashboard/documents/policies/data-storage JS.
- Right-panel markup/CSS duplicated dashboard ↔ policies ↔ data-storage.
- `.LangSwitch` styles + `[hidden]` guard rule triplicated across page CSS.
- `fetchModels`-era dead helpers remain in dashboard.js (e.g. backend list renderer).

## 7. Large files (report only, no refactor)

| File | Lines | Logic type | Split later? |
|---|---|---|---|
| `dashboard.css` | 2941 | shell + 6 views + modals + dark + responsive | yes, per-view files |
| `dashboard.js` | 2520 | 6 views + i18n + search + tabs + avatar + catalogs | yes, per-view modules |
| `home.js` | 1743 | landing sections + i18n dict | maybe, per-section |
| `home.css` | 945 | landing + responsive | maybe |
| `data-storage.js` | 849 | table + folders + drawer + i18n | if it grows |
| `policies.js` | 726 | cards + drawer + i18n | if it grows |
| `documents.js` | 754 | table + drawer + i18n | if it grows |

## 8. Cleanup candidates (PROPOSE ONLY — human review required)

| Candidate | Reason | Risk if removed |
|---|---|---|
| `assets/` | empty; real assets under `pages/auth/assets/` | none found — REMOVE CANDIDATE |
| `components/`+5 subs | empty; no references | none found — REMOVE CANDIDATE |
| `config/` | empty; config lives in `api/config.js` | none found — REMOVE CANDIDATE |
| `layouts/`+3 subs | empty; pages are self-laid-out | none found — REMOVE CANDIDATE |
| `services/` | empty; backend calls live in `api/` | none found — REMOVE CANDIDATE |
| `state/` | empty; state is per-page + localStorage keys | none found — REMOVE CANDIDATE |
| `utils/` | empty; helpers are per-page | none found — REMOVE CANDIDATE |
| `realtime/` | KEEP EMPTY — `README.md` reserves it for SSE realtime | n/a |

Nothing was deleted. Deletion needs explicit approval per candidate.

## 9. Do-not-touch areas

`api/`, `routes/`, `styles/`, all of `pages/` (HTML/CSS/JS/visual/routes/API),
backend, database, `.github/workflows`, `CNAME`. This audit changed none of them.

## 10. Recommended next action (review only)

1. Approve/reject each §8 candidate (or keep all as reserved skeleton).
2. If sidebar drift hurts: approve a shared-sidebar task (separate task, not this audit).
3. If `dashboard.*` size hurts: approve per-view split task (separate task).

## Cleanup Result (structure cleanup task)

REMOVED (verified zero references in code, docs, plans, routes, API):
- `frontend/src/state/`
- `frontend/src/utils/`

KEPT:
- `realtime/` — README.md reserves it for SSE realtime.
- `assets/`, `components/`+subs, `config/`, `layouts/`+subs, `services/` —
  NOT deleted: documentation references exist
  (`docs/architecture/FRONTEND_ARCHITECTURE.md` convention rules;
  stale pointers in page PLAN.md files). Moved to REVIEW REQUIRED in
  `STRUCTURE_CLEANUP_REPORT.md` instead of deletion.

NOT TOUCHED:
- `api/`, `routes/`, `styles/`, `pages/` — zero lines changed.
4. No action required for `realtime/` (reserved) or `tests/` docs.
