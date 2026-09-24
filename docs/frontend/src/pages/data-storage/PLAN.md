# Data Storage — PLAN

> Files: `index.html` + `data-storage.css` + `data-storage.js` + `PLAN.md`,
> colocated in `frontend/src/pages/data-storage/`. Status: `demo-complete`.
> Frontend-only: no fetch, no backend, in-memory state (reload = demo data).

## 1. Purpose

Manage **outputs/artifacts** generated across AgentOS (reports, chat exports,
agent outputs, generated files, task results). Distinct from Documents, which
manages **inputs/knowledge** fed into RAG. The differentiator is source
traceability: every artifact shows the Agent → Task → Run → Goal chain.

## 2. Information architecture

Header (title + Upload) → toolbar (search, type, source, sort, grid toggle,
new folder, clear) → folder tabs → storage summary (compact bar + counts) →
bulk bar (when selected) → table/grid (only scroll region) → preview drawer.

## 3. Layout

3-column app shell (own CSS copy): sidebar 220px fixed + main flex
(independent scroll) + right context panel 300px static (Agents, RAG Sources,
Tools). Tablet ≤1200px: icon sidebar, right panel hidden. Mobile ≤640px:
sidebar hidden, table becomes cards.

## 4. Data model

`{ id, name, ext, kind: Report|Chat Export|Agent Output|File|Other,
source: Chat|Agent|Task|Run|Upload, sizeMB, modified (ISO), modifiedLabel,
folder, by, desc, trace: { agent, task, run, goal } }`.
12 seeds across 4 folders (Research, Reports, Chat exports, Agent outputs).

## 5. Components

Sidebar (Data Storage active after Analytics), page-head (+LangSwitch EN/VI,
theme toggle), toolbar, folder tabs (dbl-click rename, × delete with rules),
storage summary, bulk bar, file table (checkbox, icon, truncate, tags, ⋮ menu)
+ grid view toggle, preview drawer with trace chain, upload modal
(drag&drop + progress mock), prompt modal (rename/new folder/move), confirm
modal (delete), toasts, empty states.

## 6. CRUD interactions

Upload (mock progress → adds to current/Research folder), preview (drawer +
trace + Download/View source toasts), rename (prompt modal), move (folder
select), delete (confirm; bulk supported), new/rename/delete folders
(delete blocked when non-empty; double-click renames). All instant, in-memory.

## 7. File preview

Right drawer, never a route change: icon + name, kv (type/size/source+by/
task/created), description, trace chain (Agent → Task → Run → Goal → file),
Download + View source actions.

## 8. Source traceability

Static `trace` per file rendered as a vertical chain. Backend will later
resolve agent/task/run/goal ids; field names already match that shape.

## 9. Responsive

Table wrapper scrolls horizontally on tablet if needed; mobile converts rows
to labelled cards (`data-label`); grid view 3→2→1 columns; drawer full-width
on mobile.

## 10. Accessibility

Landmarks, labelled inputs, aria-label icon buttons, `aria-current` nav,
`role=dialog/alertdialog/tablist`, Esc hierarchy (confirm > prompt > upload >
drawer > menu), visible focus, no nested interactives.

## 11. i18n

EN/VI dict via `data-i18n` / `data-i18n-ph`, shared `agentos.lang` key.
Proper-noun data (filenames, agent names) stays untranslated by design.

## 12. Dark mode

`html.dark` VS Code palette, shared `agentos.theme` key. No separate theme.

## 13. Future API integration

`AgentApi.storage.*` (to be defined): list/search/filter/sort, folders CRUD,
upload (FormData), rename/move/delete, preview metadata + trace resolve,
bulk ops. Field names already 1:1 with the in-memory model for a mechanical
swap. No code depends on a server.

## 14. Known limitations

- In-memory only; reload discards changes.
- No pagination (12 demo files render all).
- Trace chain is static display (no live resolution).
- Download is a toast (no backend file serving).

## 15. QA checklist

Sidebar + active state; 3-col shell; right panel; main scroll; search;
type/source/sort; folder open/new/rename/delete rules; preview + trace;
upload UI + progress; rename; move; delete + confirm; bulk; grid toggle;
empty states; toasts; Esc/keyboard; EN/VI; dark; responsive; no h-overflow;
no fetch/axios/API/backend; no console error.
