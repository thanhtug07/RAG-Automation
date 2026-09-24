# API Integration Plan — AgentOS Frontend API Layer

> Scope: `frontend/src/api/` only. Design phase. No page refactor, no backend
> changes, no mock API. Source of truth for endpoint mapping.

## 1. Architecture

```
HTML Page
  ↓  classic <script> tags, load order: config → client → *.api.js → index.js
Page JavaScript (phase 2)
  ↓  window.AgentApi.<domain>.<fn>()
frontend/src/api/*.api.js  (domain functions, no fetch, no DOM)
  ↓  window.AgentApiClient.{get,post,put,patch,delete}
frontend/src/api/client.js  (single fetch wrapper)
  ↓
Backend REST API
```

- Vanilla JS, no `import`/`export`, no bundler, no axios. One namespace:
  `window.AgentApi` (+ `window.AgentApiClient`, `window.ApiError` for the client).
- Works from `http://` and `file://` (no crash without backend; calls fail
  with real network errors, never mock fallback).

## 2. Audit findings (verified 2026)

### 2.1 Existing `fetch()` — all in `dashboard.js` (11 calls, 8 endpoints)

| # | Method | Endpoint | Used by |
|---|--------|----------|---------|
| 1 | GET | `/api/health?provider=` | health pill |
| 2 | POST | `/api/keys/validate` | settings validate |
| 3 | POST | `/api/models` | models view |
| 4 | GET | `/api/agents` | agents view |
| 5 | POST | `/api/agents` | create agent |
| 6 | PUT | `/api/agents/{id}` | edit agent |
| 7 | DELETE | `/api/agents/{id}` | delete agent |
| 8 | GET | `/api/telemetry` | analytics view |
| 9 | POST | `/api/test-agent` | chat run |
| 10 | POST | `/api/logs/clear` | logs clear |
| 11 | GET | `/api/logs?level=&limit=&search=` | logs view |

No `XMLHttpRequest`, no axios, no API utilities anywhere else. Auth pages,
home, documents use zero `fetch()`.

### 2.2 Storage keys in use

- Prefs/UI: `agentos.lang`, `agentos.theme`, `agentos.avatar`, `agentos.bg`(legacy),
  `agentos.heroBg`, `agentos.events`, `agentos.home.section`, `agentos.dash.view`,
  `agentos.dash.tabs`.
- Mock session: `agentos.session="1"` (+ `agentos.email`) in session/localStorage.
  No JWT, no token anywhere. `agentos.token` is RESERVED for the future Bearer hook.
- Provider keys (LLM, not user auth): `aurelia_api_key`, `aurelia_provider`,
  `aurelia_base_url`.

### 2.3 Mock data (stays in pages this phase)

- `documents.js` seedDocs (12 records, in-memory CRUD).
- `dashboard.js` caches (`agentsCache`, `modelsCache`, `logsCache`) + placeholders.
- Login/register submit locally, then redirect to dashboard.

### 2.4 Backend contract

- Local `backend/api/main.py`: skeleton only (`GET /health`, `GET /api/v1/health`).
- De-facto contract: `origin/test` → `src/rag_automation_main/server.py`
  (12 routes, NO auth, API keys are LLM provider keys, not user tokens).

## 3. Endpoint mapping

### A. BACKEND-AVAILABLE (verified, keep exact paths)

Bound in `agents.api.js` + `system.api.js`:

- `GET /api/health`, `POST /api/keys/validate`, `POST /api/models`,
  `GET|POST /api/agents`, `PUT|DELETE /api/agents/{id}`,
  `GET /api/telemetry`, `POST /api/telemetry/record`,
  `POST /api/test-agent`,
  `GET /api/logs`, `POST /api/logs/clear`.

### B. CONTRACT-READY (`/api/v1/...`, backend does not exist yet)

`auth`, `users`, `workspaces`, `conversations`, `messages`, `documents`,
`knowledge`, `tools`, `tasks`, `runs`, `experiments` modules. Functions have
full signatures; calls surface real HTTP errors until a backend lands.

### C. UNKNOWN (needs backend confirmation)

Agent↔tool attach, task steps, experiment metrics/run detail shapes. Functions
exist with documented assumptions and `UNKNOWN` status.

## 4. Strategies

- **Auth:** `getToken()` reads `localStorage agentos.token`; if present,
  `Authorization: Bearer <token>` is attached automatically. No login/refresh
  flow here. Current mock session flags are untouched.
- **Errors:** unified `ApiError { status, code, message, details?, requestId? }`.
  HTTP 401/403/404/409/422/429/500 mapped by status; network failure → status 0
  `NETWORK_ERROR`; timeout → `TIMEOUT`. No `alert()`, no DOM, minimal console.
- **Upload:** `FormData` (file + metadata fields), long timeout, no base64.
- **Pagination:** list functions accept `{ page, page_size, search, sort, order,
  status, workspace_id, ... }`; client drops `undefined`/`null`/`""` and builds
  the query string. No manual URL concatenation in modules.
- **Timeouts:** default 15000ms; uploads/AI runs accept per-call override.
  `AbortController` per request.
- **Naming:** files `<domain>.api.js`; functions `getX/getX(id)/createX/
  updateX(id,data)/deleteX(id)`; operations named by verb (`cancelTask`,
  `reindexDocument`, `searchKnowledgeBase`).
- **Script loading:** `config.js → client.js → *.api.js → index.js`.
  Each file guards with `window.AgentApi = window.AgentApi || {}` so order
  mistakes and `file://` cannot crash the page.

## 5. Existing fetch() outside the layer — TO BE REFACTORED IN PHASE 2

All 11 calls in `frontend/src/pages/dashboard/dashboard.js` (table §2.1).
Pages intentionally NOT touched in this phase.
