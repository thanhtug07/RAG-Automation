# Route Plan — AgentOS (multi-page HTML, no SPA router)

> Architecture kept: one HTML file per page, native browser navigation
> (back/forward/refresh). `routes/` only adds table + guard + helper.

## Route table

| Page | Route file | HTML | JS | Auth required | API dependencies | Current status |
|---|---|---|---|---|---|---|
| Home | `home/index.html` | `home/index.html` | `home.js` | No (public) | — (mock-local) | OK |
| Login | `auth/login/index.html` | same | `login.js` | No (public) | — (mock session flag; `auth.api` CONTRACT-READY) | OK, mock |
| Register | `auth/register/index.html` | same | `register.js` | No (public) | — (mock; `auth.api` CONTRACT-READY) | OK, mock |
| Dashboard | `dashboard/index.html` | same | `dashboard.js` | No (public, user decision) | `system`, `agents` (BACKEND-AVAILABLE) | Integrated phase 2 |
| Documents | `documents/index.html` | same | `documents.js` | **Yes** → login | — (BACKEND-NOT-AVAILABLE, mock-local) | Guarded, mock |

No pages exist for agents/workflows/knowledge/tools/runs/settings/conversations/
experiments — no routes created for them (per scope).

## Files

- `routes.js` — `window.AgentRoutes` table + `current()` (suffix match, works on
  `http(s)`, `file://`, Pages subpath).
- `router.js` — `window.AgentRouter.go(id)` (derives `/pages/` root from URL),
  `loginUrl()`, `current()`.
- `guards.js` — auto-runs on DOMContentLoaded; redirects to login only when
  `route.auth && !agentos.session` (existing mock-session mechanism, no tokens).
  Included by: documents (protected). Dashboard/home/auth include nothing extra
  (public).

## Auth states

- Guest: home/login/register/dashboard/documents→login redirect.
- Logged in (`agentos.session` in session/localStorage): all pages open;
  home shows avatar + Dashboard button.
- No `agentos.token` exists anywhere; Bearer hook stays idle (Phase 17).
