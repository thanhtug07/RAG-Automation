# Refactor Report — Frontend Code Cleanup

> Baseline: `create-frontend @ 6b92e23`, clean tree, empty diff (saved outside
> repo before starting). No commit/push made by this task.

## Before

| File | Lines | Responsibility / duplication |
|---|---|---|
| `dashboard.js` | ~2736 | 6 views + i18n dict + search + tabs + avatar + catalogs + settings |
| `dashboard.css` | ~3431 | shell + 6 views + modals + dark + responsive |
| `documents.js` / `policies.js` / `data-storage.js` | 812 / 790 / 912 | own `esc`, `showToast`, `initTheme`, `t/applyLang/setupLang` each (byte-identical ×3) |
| `documents/policies/data-storage.css` | — | `[hidden]`, LangSwitch, theme icons, toast blocks identical ×3 |
| 7 page heads | — | identical lang+theme bootstrap inline (6 full + home lang-only) |
| `renderModelList` (dashboard.js) | ~36 | 0 callers (dead after catalog rewrite) |
| `runGlobalSearch` agents branch | — | BUG: rendered backend cards over the static demo grid |

## Refactored

- `frontend/src/shared/`: `esc.js`, `toast.js` (timeout standardized 3000ms;
  documents used 3200ms), `theme.js`, `bootstrap.js`, `i18n.js`
  (`init(dict, onApply)` + `t/applyLang/setupLang/getLang`). Pages keep dicts;
  call sites untouched via 3-line shims.
- `frontend/src/styles/shared.css`: `[hidden]`, LangSwitch, theme icons, toast
  set; linked before page CSS in documents/policies/data-storage.
- 7 heads use `shared/bootstrap.js` (home additionally gains theme preset on
  first paint, matching its toggle — intentional alignment).
- `runGlobalSearch` filters the static agent catalog in place (demo grid never
  overwritten); right panel still filters backend cache.
- Deleted `renderModelList` (dead, 0 callers).

## Shared components

`AgentShared.esc/toast/initTheme/bootstrap` + `AgentShared.i18n`. Dashboard,
home, login, register keep their richer variants (different behavior/coupling).

## Deleted code

`renderModelList` only. Kept `renderAgentCards/openEditAgentModal/deleteAgent`
(live via search-rendered cards), `agentCardGrid`/`btnOpenCreateAgent` consts,
`agents.loading` dict key (harmless data).

## Preserved behavior

Navigation, guards, theme, language (incl. live re-render hooks), modals,
toasts (same markup), search/filter/CRUD, avatar upload, chat tabs, agent/model
catalogs, settings provider flow, API layer usage (11 `AgentApi.*` calls
untouched), responsive, dark mode.

## Risk

- `home` first paint now honors saved theme (was lang-only bootstrap).
- Toast timeout unified 3000ms (was 3200ms on documents).
- Pages without JS (blocked scripts) lose toast/esc — same as before (they
  were page-local too).

## Verification

- `node --check`: shared ×5, documents/policies/data-storage/dashboard JS pass.
- Serve 200: all touched HTML/CSS/JS + shared files.
- `fetch(` still only in `api/client.js`; no axios/XHR/import/export added.
- Final diff: shared/ new (6 files), page JS shims, 3 CSS trims, 7 head swaps,
  search-catalog fix, 1 deletion. No api/routes/backend/visual/route changes.

## Remaining technical debt

- `dashboard.js` (~2700 lines): NOT split — ~60 shared DOM consts couple all
  views; splitting raises coupling. Revisit only with a state-module design.
- `home.js` (1743): sections + dict; same reasoning, untouched.
- Dashboard keeps own toast/i18n/theme variants (behavior differs).
- Sidebar markup ×4, right-panel ×3, dead modal open-paths: reported, untouched.
