# Dashboard — PLAN

> Files: `index.html` + `dashboard.js` + `dashboard.css` + `PLAN.md`, colocated.
> Status: `scaffold-pending`. Shell: `src/layouts/application/PLAN.md`.

## 1. Purpose

Workspace overview: stat cards (active runs, agents, sources, tools) + recent
runs table linking to Runs. First screen after login.

## 2. Content

Stats from `src/services` aggregates; runs table (run, task, status pill,
progress %) via shared `src/components/table`. Empty state when no runs;
skeleton rows while loading.

## 3. Non-goals

No run control here (→ Runs), no chat (→ Command Center).
