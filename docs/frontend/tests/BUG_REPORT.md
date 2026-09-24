# Bug Report — Route + API Layer (Phase 2)

NO KNOWN BUGS FOUND.

The independent tester run (see `INTEGRATION_TEST_REPORT.md`) covered routes,
guards, router, API layer wiring, static checks, skeleton backend, and the
documents mock boundary — 17/17 PASS, 0 FAIL, 0 P0/P1/P2/P3.

Known non-bug limitations (by design, not defects):

1. Dashboard data endpoints 404 unless the real backend (currently only on
   `origin/test`) is running same-origin or `API_BASE_URL` points at it.
   UI degrades to Offline/empty states.
2. `agents.getAgent(id)` (single-get) has no backend route; callers must
   list + filter until the backend adds it (flagged UNKNOWN in code + reference).
3. Login/register/documents remain mock-local until their backend contracts land.
4. No `agentos.token` exists; Bearer hook is idle until Phase-17 auth.
