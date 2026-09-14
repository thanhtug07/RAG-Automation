# Runs — PLAN

> Files: `index.html` + `runs.js` + `runs.css` + `PLAN.md`.
> Status: `scaffold-pending`. Feature: `src/features/execution/PLAN.md` (when created).

## 1. Purpose

Monitor and control execution: live runs table (run, task, status, progress)
with Cancel (running) / Retry (failed) actions wired to `src/realtime` +
`src/state`.

## 2. Content

Subscribes to run events; progress animates (600ms, reduced-motion off);
Cancel is terminal and explicit; Retry creates a new run id with attempt
counter. Partial results are first-class (badge + resume), never silent.

## 3. Non-goals

No log-streaming detail view in this phase (timeline pattern covers it later).
