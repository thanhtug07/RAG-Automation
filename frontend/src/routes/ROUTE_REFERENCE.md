# Route Reference — AgentOS

> Multi-page app. Browser back/forward/refresh are native. `routes/` adds
> table + guard + navigation helper only.

| Route | File | Auth | API via `AgentApi` |
|---|---|---|---|
| Home `/` | `pages/home/index.html` | Public | — (mock-local) |
| Login | `pages/auth/login/index.html` | Public | — (mock session; `auth.api` CONTRACT-READY) |
| Register | `pages/auth/register/index.html` | Public | — (mock; `auth.api` CONTRACT-READY) |
| Dashboard | `pages/dashboard/index.html` | Public (user decision) | `system` (health, keys, models, telemetry, test-agent, logs), `agents` (CRUD) |
| Documents | `pages/documents/index.html` | **Protected → login** | — (BACKEND-NOT-AVAILABLE, mock-local) |

No routes for agents/workflows/knowledge/tools/runs/settings/conversations/
experiments — those pages do not exist.

## Files

- `routes/routes.js` → `window.AgentRoutes` (`all`, `byId(id)`, `current()`).
  Matches by path suffix; works on `http(s)`, `file://`, Pages subpath.
- `routes/router.js` → `window.AgentRouter` (`go(id)`, `loginUrl()`, `current()`).
  `go()` derives the `/pages/` root from the current URL. Unknown id → `false`.
- `routes/guards.js` → auto-redirects to login when `route.auth && !session`.
  Session = existing `agentos.session` flag (session/localStorage). No tokens.
- `routes/ROUTE_PLAN.md` → audit + table.

## Auth states

- Guest: home/login/register/dashboard open; documents → login.
- Logged in: everything opens; home shows avatar + Dashboard button.
- `agentos.token` does not exist; Bearer hook idle until backend auth lands.
