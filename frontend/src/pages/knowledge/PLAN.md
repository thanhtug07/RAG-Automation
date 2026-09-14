# Knowledge — PLAN

> Files: `index.html` + `knowledge.js` + `knowledge.css` + `PLAN.md`.
> Status: `scaffold-pending`. Feature: `src/features/knowledge/PLAN.md` (when created).

## 1. Purpose

Manage enterprise knowledge: sources table (name, type, updated, index status)
+ detail drawer. Every RAG answer must link visible sources.

## 2. Content

Reads `src/services/knowledge` → `src/api/knowledge`. Tenant filtering is
server-side; frontend never filters by tenant. Upload/index flows are future
scope — table + detail only.

## 3. Non-goals

No embedding/retrieval tuning UI.
