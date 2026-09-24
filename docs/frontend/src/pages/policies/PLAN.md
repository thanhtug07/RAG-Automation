# Policies — PLAN

> Files: `index.html` + `policies.css` + `policies.js` + `PLAN.md`, colocated in
> `frontend/src/pages/policies/`. Status: `demo-complete`.
> Frontend-only: no fetch, no backend, in-memory state (reload = 6 demos).

## 1. Purpose

Enterprise governance console: define rules controlling how agents access data,
use tools, and execute tasks. Distinct from Documents (knowledge material):
Policies are rules/constraints. Page answers in 3 seconds: "Policies là nơi
định nghĩa luật kiểm soát AgentOS."

## 2. Layout

3-column app shell (copied pattern from Documents, own CSS):
sidebar (220px, fixed) + main (flex, independent scroll) + right context panel
(300px static: Agents, RAG Sources, Tools). Tablet ≤1200px: icon sidebar, right
panel hidden. Mobile ≤640px: sidebar hidden, grid 1 column.

Main order: header (title + New Policy) → search/filter → grid/empty → detail.

## 3. Components

Sidebar (Policies active after Tài liệu, deep-links `?view=`), page-head
(+LangSwitch EN/VI, theme toggle), toolbar (search, 2 selects, clear),
policy cards (icon, name, category badge, desc clamp, status dot, version,
priority), detail (overview/version/history/scope/rules/resources/actions),
drawer (create/edit + rule builder), generic confirm modal (delete/unsaved),
toasts, empty state.

## 4. Static data model

`{ id, name{en,vi}, category, desc{en,vi}, status, version,
history[{v,st}], priority, updated{en,vi},
scope{agents|tools|knowledge:[{name,allowed}]},
rules[{action:allow|deny|approval, text{en,vi}, target}], resources[] }`.
6 seeds. No localStorage (QA-clean reload).

## 5. Interactions

Search (name/category/desc), 2 filters + clear, card→detail, back, create/
edit (shared drawer), duplicate, disable/enable, delete (confirm), rule
add/remove, dirty-guard (Discard/Keep editing), Esc (modal>drawer), focus
restore, toasts. All Vietnamese/English via `agentos.lang`.

## 6. Responsive behavior

Grid 3→2 (≤1400px)→1 (≤640px); drawer `min(430px,100vw)`; no horizontal
overflow; `prefers-reduced-motion` respected.

## 7. Accessibility

Semantic landmarks, labelled inputs, aria-label icon buttons, `aria-current`
nav, `role=dialog/alertdialog`, Esc, visible focus, no nested interactives.

## 8. Future API integration points

`AgentApi.policies.*` (to be defined): list/search/filter, get, create
(+multipart if attachments ever needed), update, duplicate, disable,
delete, rules sub-resource. Detail/drawer field names already match the
in-memory model 1:1 for a mechanical swap. No code depends on a server.

## 9. Known limitations

- In-memory only; reload discards edits.
- No pagination (6–N policies render all; add when backend lands).
- Agent/tool/knowledge scope lists are fixed demo vocabularies.
- Version history is static display (no diff engine).
