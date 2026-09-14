# Command Center — PLAN

> Files: `index.html` + `command-center.js` + `command-center.css` + `PLAN.md`.
> Status: `scaffold-pending`. Shell: `src/layouts/command-center` (see layouts PLAN).

## 1. Purpose

Operate work: chat with agents (message list + composer) beside task creation
and task detail context panel.

## 2. Content

Chat (user/agent messages, cited RAG sources per agent reply, streaming into
message bodies), New-task form (title → queued Task card), task list with status
pills. Realtime: run progress via `src/realtime`; freeze at last values on
disconnect.

## 3. Non-goals

No plan editing (→ Planner inside Workflows), no tool configuration (→ Tools).
