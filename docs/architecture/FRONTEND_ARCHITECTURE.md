# AgentOS Frontend Architecture

> Status: `authoritative` — architecture design only. No migration implemented here.
> Stack: pure HTML5 + CSS3 + vanilla JS (ES modules). No framework, ever in this phase;
> boundaries kept clean so a future framework migration reuses API, services, domain
> logic, state concepts, feature boundaries, and design tokens without rewrite.

## 1. Executive Summary

The current `frontend/` grew organically into two disconnected layers: eleven
scaffold domains (docs + 2-line `index.ts` stubs, no runtime code) and a working
vanilla prototype (`pages/home/home.html`, root `login.html`/`register.html`,
`css/*`, `js/*`, `assets/*`). The target is one `src/` tree with separated
concerns — app shell, pages, features, shared UI, design system, API, services,
state, realtime, utils, config, assets, styles — migrated in ten gated phases
(§29) without breaking the running prototype until its replacement is verified.

## 2. Architectural Goals

Clarity, maintainability, scalability, separation of concerns, developer
experience, enterprise quality — supporting Command Center, multi-agent
execution, RAG, realtime, auth, and future backend/framework moves with the
fewest folders that achieve them. Explicit non-goal: the largest possible tree.

## 3. Current Architecture Assessment

- Working: 3 pages, closed nav graph, shared `auth.css`/`base.css`, token file
  `variables.css`, per-page JS with no backend calls, zero dependencies.
- Scaffold-only: `api/auth/components/design-system/layouts/pages/realtime/
  routing/services/state/tests` (README + `*-plan.md` + stub). No interfaces,
  configs, fixtures, or tests exist despite plans claiming them.
- Debts (from prior audits): tokens live in `css/` not `design-system/`;
  `routing`/`state` plans assume forbidden frameworks; backend concepts
  (Postgres/Redis/CrewAI) copied into frontend plans; `assets/` undocumented;
  off-scale CSS values (`0.65rem`, `#fff`, `#e2e8f0`) outside tokens.
- Backend contract today: `GET /health`, `GET /api/v1/health` only — API layer
  designs against `/api/v1/*` + SSE conventions, not live endpoints.

## 4. Target Architecture

```text
frontend/
├── index.html              # entry redirect → src/pages/home/ (see §18)
├── src/
│   ├── app/                # bootstrap, guards (§5)
│   ├── pages/              # screens, one folder per route (§5)
│   ├── features/           # product capabilities (§5)
│   ├── components/         # shared UI only (§5)
│   ├── layouts/            # marketing / auth / application shells (§5)
│   ├── design-system/      # spec + foundations (§5, §17)
│   ├── api/                # HTTP/SSE transport only (§5)
│   ├── services/           # business operations (§5)
│   ├── state/              # owned stores (§5)
│   ├── realtime/           # event transport (§5)
│   ├── utils/              # generic helpers (§5)
│   ├── config/             # env/routes/features (§5)
│   ├── assets/             # images/icons/logos/fonts/media (§5)
│   └── styles/             # global CSS runtime (§5)
├── tests/                  # unit/integration/e2e/fixtures (§23)
└── docs/                   # architecture docs; PLANs stay with code (§24–25)
```

`src/` is the single runtime root. Nothing outside `src/` (except root
`index.html` and `tests/`) executes in the browser.

## 5. Complete Directory Tree

```text
src/
├── app/
│   ├── app.js              # init: config → guards → router → global handlers
│   ├── bootstrap.js        # DOM-ready wiring, error/loading surfaces
│   └── guards/
│       ├── auth.guard.js   # redirect map for protected routes
│       └── PLAN.md
├── pages/
│   ├── home/               # index.html + page.js + page.css + PLAN.md
│   ├── auth/login/         # index.html + page.js + page.css + PLAN.md
│   ├── auth/register/      # index.html + page.js + page.css + PLAN.md
│   ├── dashboard/ command-center/ agents/ workflows/
│   ├── knowledge/ tools/ runs/ settings/   # future, same 4-file shape
│   └── PLAN.md
├── features/               # created on demand (§5-Features)
│   ├── authentication/     # session helpers, guards support, PLAN.md
│   ├── chat/ task/ planner/ agents/ workflow/
│   ├── knowledge/ rag/ tools/ execution/ runs/ notifications/
│   └── PLAN.md
├── components/             # button/ input/ modal/ dropdown/ badge/ table/
│   │                         tabs/ toast/ alert/ spinner/ skeleton/ empty-state/
│   └── PLAN.md             # one subfolder per component when extracted
├── layouts/
│   ├── marketing/ auth/ application/ command-center/
│   └── PLAN.md
├── design-system/
│   ├── PLAN.md             # visual source of truth (existing document)
│   ├── foundations/        # colors/type/spacing/radius/shadows/motion/
│   │                       # breakpoints/z-index/icons specs
│   ├── components/         # per-component guidelines (§19 template)
│   └── patterns/           # application patterns
├── api/
│   ├── client/             # http.js, headers.js, errors.js, interceptors.js
│   ├── auth/ agents/ tasks/ workflows/ knowledge/ tools/ runs/  # *.api.js
│   └── PLAN.md
├── services/
│   ├── auth/ task/ agent/ planner/ execution/ knowledge/ file/ notification/
│   └── PLAN.md
├── state/
│   ├── store.js            # tiny pub/sub core only, no domain data
│   ├── auth/ app/ ui/      # owned slices + PLAN.md
├── realtime/
│   ├── client/ events/ handlers/ subscriptions/
│   └── PLAN.md
├── utils/                  # format-date.js, format-number.js, debounce.js,
│                           # validators.js, dom.js, storage.js + PLAN.md
├── config/
│   ├── environment.js api.js routes.js features.js
├── assets/
│   ├── images/ icons/ logos/ fonts/ media/
└── styles/
    ├── reset.css globals.css tokens.css utilities.css responsive.css
```

Feature shape (minimal — only what the feature needs):

```text
src/features/<name>/
├── components/   # used ONLY by this feature
├── services/     # feature orchestration (may call src/services)
├── state/        # feature-local slice
├── utils/        # feature-specific helpers
├── types.js      # documented shapes (JSDoc, no TS dependency)
└── PLAN.md
```

Page shape: `<page>/index.html + page.js + page.css + PLAN.md`. Never one giant
JS file; never duplicated shared UI.

## 6. Responsibility of Every Directory

- `app/`: bootstrap + global init (event registration, guards, route init, global
  error/loading). No feature logic.
- `pages/`: screen composition only — assemble layouts + features + components,
  bind page lifecycle. No API calls, no business logic, no global state writes.
- `features/`: domain behavior (chat, planner, RAG…). Owns its components/services/
  state/utils. No global styling, no direct backend URLs.
- `components/`: reusable UI with zero business knowledge. Presentational props in,
  DOM events out. Agent-specific UI lives in its feature, never here.
- `layouts/`: structure (sidebar/topbar/main/context). No business logic, no fetching.
- `design-system/`: visual rules + token specs. No feature logic, no runtime imports
  of features.
- `api/`: transport. Returns data, throws typed errors. No DOM, no rendering, no state.
- `services/`: business operations composing API calls (`page → feature →
  service → api → backend`). No direct DOM manipulation.
- `state/`: owned stores with documented read/write/persistence/reset. No rendering.
- `realtime/`: event transport → handlers → state/service → UI. Never touches
  arbitrary DOM.
- `utils/`: generic pure helpers in focused modules. No business rules.
- `config/`: centralized env/URLs/routes/flags. Only place holding environment URLs.
- `assets/`: static files by type. No code.
- `styles/`: global CSS runtime. Tokens live here (`tokens.css`); rules live in
  `design-system/`. No duplication between them.
- `tests/`, `docs/`: verification and architecture knowledge (§23–24).

## 7. Responsibility of Every Major File Type

- `index.html` (per page): semantic shell, CSS/JS links, mount points. No inline
  logic beyond an optional module bootstrap tag.
- `page.js`: page lifecycle (init/teardown), feature wiring, guard checks.
- `page.css`: page-scoped styles using tokens only; no token definitions.
- `*.api.js`: endpoint functions returning promises of documented shapes.
- `services/*.js`: operation functions (validate → call → normalize → update state).
- `state/*.js`: slice with initial state, selectors (read), actions (write),
  persistence + reset rules.
- `PLAN.md`: the contract of its folder (§25). Code without a PLAN is unreviewable.

## 8. Dependency Rules

Allowed: `pages → features → services → api`; everything → `components`,
`design-system` tokens, `utils`, `config`; `realtime → state/services`;
`app → all` (wiring only).

Forbidden: `api → page`, `service → component`, `component → page`,
`utils → feature`, `design-system → feature`, `state → rendering`,
`feature → feature` (share via services/components, never direct imports),
any cycle. `config` imports nothing internal.

## 9. Data Flow

User action → page handler → feature logic → service operation → `api` transport
→ backend. Responses return normalized data up the same chain; state updates
publish; subscribed UI re-renders. No layer skips its neighbor.

## 10. API Flow

`src/api/client/http.js` owns fetch, timeouts, base URL (from `config/api.js`),
header injection, and error mapping (`errors.js`: 400/401/403/404/409/422/429/500
+ `traceId`). Domain modules (`auth.api.js`, …) expose typed functions only.
Interceptors attach auth headers and translate 401 → session-expired signal.
Retry/backoff lives in services, not transport. No DOM, no state writes inside `api/`.

## 11. Authentication Flow

Login page → `services/auth` validates fields → `api/auth.login` → server sets
httpOnly session cookie → `state/auth` marks session → `guards/auth.guard.js`
allows protected routes. Refresh is server-driven; frontend never stores tokens
in localStorage. SSO delegates to provider redirect + callback route. Logout
clears slices per documented reset behavior.

## 12. State Flow

`store.js` is a tiny pub/sub core. Slices (`auth/app/ui`, feature-local) own:
initial state, read selectors, write actions, persistence (session-scoped only
where justified), reset on logout. Prefer feature-local state; global holds only
session, app shell (sidebar/drawer), and toast queue. State never renders — UI
subscribes and renders.

## 13. Realtime Flow

Backend event → `realtime/client` (EventSource first; WebSocket path reserved) →
`events/` parsing → `handlers/` routing → `state`/`service` update → subscribed
UI updates. Reconnect with backoff + Last-Event-ID resume owned by client.
On disconnect UI freezes at last known values; no error takeover. Handlers never
query the DOM directly.

## 14. Page Architecture

One folder per route under `src/pages/` (`home/`, `auth/login/`,
`auth/register/`, future `dashboard/`, `command-center/`, …), each with
`index.html + page.js + page.css + PLAN.md`. Pages compose layouts, features,
and shared components; they own route-specific assembly and nothing else.
Current mapping: `pages/home/home.html` + root `login.html`/`register.html`
migrate into this shape during §29 Phase 5, preserving URLs via `index.html`
redirect shims until cutover.

## 15. Feature Architecture

Features map 1:1 to product capabilities (`authentication/chat/task/planner/
agents/workflow/knowledge/rag/tools/execution/runs/notifications`). Each owns
domain behavior and internal folders created on demand — never forced full sets.
Cross-feature needs go through `services/` or shared `components/`, keeping
features independently understandable and future-framework-portable.

## 16. Component Architecture

`src/components/` admits a component only after its second consumer (first use
stays in the owning feature/page, then promoted). Each: markup contract,
variants, states (§14 of design PLAN), keyboard/a11y contract, content rules.
AgentOS product views (Task card, Agent status, RAG result…) compose shared
primitives and live in features, referencing design-system patterns — never
redefining color/radius/motion.

## 17. Design System Relationship

`src/design-system/PLAN.md` (existing spec) is the visual source of truth.
`foundations/` holds token/system specs; `components/` + `patterns/` hold
guidelines. `src/styles/` is the runtime mirror (`tokens.css` implements tokens;
`globals.css`/`utilities.css`/`responsive.css` implement mechanics). Rule:
spec defines, styles implement, pages consume — tokens defined exactly once.

## 18. HTML Architecture

Strategy chosen: **one `index.html` per page folder** (`src/pages/<route>/
index.html`), root `frontend/index.html` redirects to `src/pages/home/`.
Rationale: uniform depth → uniform relative asset paths (`../../`), directly
servable without build, portable to any static host. All pages load:
`reset → tokens → globals → utilities → layout → page → responsive` CSS, then
one module script (`page.js` via `app.js` bootstrap). Shared layout markup is
duplicated minimally until Phase 4 extracts layout partials loaded by convention
(documented loader, not a framework). Asset paths always relative; no absolute
`/src` references (works under any sub-path deploy). No inline JS except the
bootstrap module tag.

## 19. CSS Architecture

Layers in load order: `reset.css` (normalize) → `tokens.css` (custom properties
only) → `globals.css` (body, focus ring, utilities base) → `utilities.css`
(spacing/visibility helpers) → layout CSS → page CSS → `responsive.css`
(all breakpoints; page files contain none). Specificity stays flat (single
classes, no ID selectors, no `!important`); page CSS may only use tokens +
utilities. Current `css/*.css` files migrate verbatim into these layers in
Phase 2–3 (variables→tokens, base→globals/utilities, home/auth→page files).

## 20. JavaScript Module Architecture

ES modules throughout: `import`/`export`, no globals, no `window.*` state, no
duplicated script tags. Naming: `kebab-case` files (`auth.guard.js`,
`tasks.api.js`), `camelCase` functions, `PascalCase` reserved for future
component factories. Exports: named exports preferred; default export only for
page entry (`page.js`). Init pattern: `app.js` boots on `DOMContentLoaded` →
loads config → runs guards → mounts current page module → registers global
handlers. DOM mounting: page module queries its own root scope only
(`root.querySelector`), never `document`-global except app shell regions.
Teardown removes listeners/subscriptions on navigation.

## 21. Configuration Strategy

All environment sensitivity lives in `src/config/`: `environment.js`
(dev/staging/prod detection), `api.js` (base URLs, versions, timeouts),
`routes.js` (route table + guard map), `features.js` (flags). Feature/page code
holding a URL string is a defect. Local dev overrides via a documented
git-ignored file, never committed secrets.

## 22. Asset Strategy

`src/assets/{images,icons,logos,fonts,media}`. Icons: single inline-SVG approach
per design PLAN (currentColor, 24px grid). Images optimized and sized; no stock
or AI-cliché decoration. Fonts: system stacks only (per typography spec), so
`fonts/` stays empty until brand typography is licensed. Referenced by relative
path; fingerprinted names on production copy.

## 23. Testing Architecture

`tests/{unit,integration,e2e,fixtures}`. unit: utils, state slices, validators,
error mapping (zero-dep runnable). integration: service + mocked api, guard
decisions, realtime handler → state updates. e2e: nav graph, form validation,
critical flows (login, task create, run monitor) — runnable against static build.
`fixtures/`: canned API/SSE payloads shared by all levels. Coverage follows risk:
API client, services, state, routing, auth, command-center flows first.

## 24. Documentation Strategy

`docs/architecture/` holds system-level docs (this file, ADRs). PLAN.md files
live beside the code they govern and are the only per-folder docs — no parallel
doc trees. Onboarding/testing/API-compat notes go in `docs/`; anything describing
a folder's contract belongs in that folder's PLAN.md.

## 25. PLAN.md Ownership Strategy

One PLAN per owned folder; filename always exactly `PLAN.md` (never
`PLAN2/FINAL/NEW`). Ownership: `src/<layer>/PLAN.md` = layer contract;
`src/features/<x>/PLAN.md` = feature contract; `src/design-system/PLAN.md` =
visual truth; `docs/architecture/*.md` = cross-cutting decisions. A PLAN states
purpose, non-goals, dependencies, interfaces, and acceptance — code contradicting
its PLAN is a defect in the code.

## 26. Naming Conventions

Folders/files `kebab-case`; JS functions/variables `camelCase`; CSS custom
properties `--group-role-variant-state`; CSS classes `kebab-case` BEM-lite
(`.block`, `.block-element`, `.block--modifier`); events `domain:action`
(`runs:updated`); storage keys `agentos.<slice>.<key>`; routes lowercase
 plurals (`/runs`, `/agents`) with `/{id}` detail.

## 27. Import/Export Rules

- Import order: std → config → api/services → state → features/components →
  utils. No parent-directory spelunking beyond one level (`../`) — deeper need
  means wrong placement.
- No circular imports (pipeline check in §30 DoD). No side-effect imports except
  CSS and the single bootstrap.
- `export` named functions/objects; `export default` only for page entries.
- Types via JSDoc `types.js` per feature; no build step required.

## 28. Anti-patterns

Giant `utils.js`/`app.js`/global store; fetch in pages; business logic in
components; DOM in api/services; tokens outside `tokens.css`; page-specific
breakpoints; second component copies instead of promotion; feature→feature
imports; hardcoded URLs; `window.*` state; inline JS handlers; absolute asset
paths; framework imports of any kind.

## 29. Migration Phases

- **P1 foundation**: freeze this doc; add `src/` skeleton + root redirect plan.
  Acceptance: doc merged, empty tree, prototype untouched. Risk: none.
- **P2 app+config+styles**: `app/`, `config/`, `styles/` from current
  `js/`+`css/`; bootstrap boots home. Acceptance: home runs from new path.
- **P3 design-system**: foundations/components/patterns specs reference existing
  PLAN; `tokens.css` replaces `variables.css` via alias map.
- **P4 layouts+shared components**: extract shell + button/input/badge from home;
  both old and new pages pass visual check.
- **P5 pages**: migrate home/auth into `src/pages/` shape; shims preserve URLs.
- **P6 features**: carve `authentication` first (real consumer: auth pages), then
  task/chat skeletons with PLANs only.
- **P7 api+services**: client + `auth` domain against live `/health`→real
  endpoints; pages switch from mocks via services.
- **P8 state+realtime**: slices + EventSource wiring to run/progress UI.
- **P9 tests**: fixtures + unit/integration/e2e per §23.
- **P10 cleanup**: remove old `css/js/*.html` roots + scaffold stubs only after
  P1–P9 acceptance; never mid-migration. Each phase: objective, files, deps,
  acceptance, risks recorded in its PLAN before code moves.

## 30. Definition of Done

Per deliverable: PLAN updated first; dependency rules (§8) hold (verified by
import review); no anti-pattern (§28) present; responsive/keyboard/a11y checks
from design PLAN pass; tests added per §23; old and new paths verified before
old removed. Migration complete when: prototype runs entirely from `src/`,
zero files outside `src/tests/docs` execute, no stub domains remain, and this
document's self-review below still holds.

## Self-review

- Responsibilities unique per layer (§6 matrix); no overlaps found.
- No cycles in §8 graph (verified by tracing pages→features→services→api and
  infra edges).
- No giant modules: utils split by topic, store core vs slices, api per domain.
- Pages carry no API/business/state logic; components carry no business logic;
  api carries no DOM; tokens defined once (§17).
- Single HTML strategy (§18); folders justified by distinct ownership — leanest
  tree covering all 14 required separations.
- Vanilla ES modules throughout; API/services/state/features/framework-agnostic
  by construction (no DOM in logic layers).
- Scales to Command Center, multi-agent execution, RAG, realtime (§13–15
  patterns bind to these layers), future endpoints (§10), and framework
  migration (logic layers import nothing presentational).
