# Tools — PLAN

> Files: `index.html` + `tools.js` + `tools.css` + `PLAN.md`.
> Status: `scaffold-pending`. Feature: `src/features/tools/PLAN.md` (when created).

## 1. Purpose

Inspect and run business tools: tool cards (name, params in monospace,
active/off) + run action with monospace output block.

## 2. Content

Reads `src/services` tool registry; run executes via `src/api/tools` with
loading → result/error states inline. Destructive tools require Modal
confirmation per design-system patterns.

## 3. Non-goals

No tool registration/configuration UI in this phase.
