# Agents — PLAN

> Files: `index.html` + `agents.js` + `agents.css` + `PLAN.md`.
> Status: `scaffold-pending`. Feature: `src/features/agents/PLAN.md` (when created).

## 1. Purpose

Browse and inspect agents: table/cards (name, type Static/Configurable, status,
run count) + detail drawer (activity, recent runs).

## 2. Content

Reads `src/services/agent` → `src/api/agents`. Agent-specific cards stay in the
feature folder until a second consumer justifies promotion to `src/components`.

## 3. Non-goals

No agent building/editing flows in this phase (future Agent Builder).
