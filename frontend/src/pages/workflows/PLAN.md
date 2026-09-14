# Workflows — PLAN

> Files: `index.html` + `workflows.js` + `workflows.css` + `PLAN.md`.
> Status: `scaffold-pending`. Feature: `src/features/workflow/PLAN.md` (when created).

## 1. Purpose

Show execution blueprints as plan-step rows (pending → running → done) with
per-workflow active counts. Covers the Planner surface until a dedicated
planner view is scoped.

## 2. Content

Reads `src/services` workflow data; steps editable before approval, locked
during execution except Cancel. Failed steps highlight with retry (see Runs).

## 3. Non-goals

No visual DAG editor in this phase.
