# Integration Test Report — Route + API Layer (Phase 2)

Tester: independent agent run. Servers started/stopped by tester, then verified stopped.

| Area | Test | Expected | Actual | Status |
|------|------|----------|--------|--------|
| Routes | 5 pages + api/routes JS over local HTTP | 200 | 200 all | PASS |
| Routes | Unknown route | 404, no redirect; `go()` false | exact | PASS |
| Refresh | Re-GET every page | stays, 200 | stays | PASS |
| Guards | documents, no session → login | redirect to login | redirected | PASS |
| Guards | documents with session → stays | stays | stays | PASS |
| Guards | dashboard/home/login/register, no session | stays (public) | stays | PASS |
| Router | `go/loginUrl/current` | correct targets | correct | PASS |
| API layer | `node --check` 16 api + 3 routes files | pass | 19/19 pass | PASS |
| API layer | Script order dashboard/documents | exact order | matches | PASS |
| API layer | `AgentApi`/`AgentApiClient`/`ApiError` wiring | attached | attached | PASS |
| Static | `fetch(` in dashboard.js | 0 | 0 (11× `AgentApi.*`) | PASS |
| Static | `agentos.token` | client hook only | hook only | PASS |
| Static | `alert(` in api/routes/documents | 0 | 0 | PASS |
| Backend | skeleton `/health`, `/api/v1/health` | 200 | 200 | PASS |
| Backend | dashboard endpoints vs skeleton | 404 expected | 404 | PASS |
| Backend | real 12-route backend location | origin/test only | confirmed, untouched | PASS |
| CRUD | documents.js `fetch(` | 0 (mock by design) | 0 | PASS |

Totals: 17 PASS, 0 FAIL, 0 BLOCKED (backend-live tests replaced by skeleton
demonstration + read-only contract check; full live-backend run awaits a
running real server).
