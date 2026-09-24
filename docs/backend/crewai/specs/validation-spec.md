# validation-spec — Validation, Tests, Demo, Reviews (normative)

Part of PHASE 1. All rules below are deterministic: same spec → same verdict.
Rule IDs are stable and referenced by the other six specs. If validation
fails on ANY rule, CrewAI MUST NOT execute.

## 1. Validation matrix

| Rule | Scope | Input | Expected |
|---|---|---|---|
| V-TOP-01 | structure | unknown top-level key | FAIL |
| V-TOP-02 | structure | required section/field missing | FAIL |
| V-AG-01 | agents | duplicate `agents[].id` | FAIL |
| V-AG-02 | agents | malformed id (not slug) | FAIL |
| V-AG-03 | agents | agent referenced by no task | FAIL |
| V-TASK-01 | tasks | duplicate `tasks[].id` | FAIL |
| V-TASK-02 | tasks | `agent_ref` unknown | FAIL |
| V-TASK-03 | tasks | `context` references undeclared/undepended output | FAIL |
| V-TOOL-01 | tools | referenced tool id not in catalog | FAIL |
| V-TOOL-02 | tools | duplicate `tools[].id` | FAIL |
| V-DEP-01 | dependencies | edge endpoint unknown task | FAIL |
| V-DEP-02 | dependencies | self dependency | FAIL |
| V-DEP-03 | dependencies | directed cycle, any length | FAIL |
| V-DEP-04 | dependencies | duplicate edge | FAIL |
| V-DEP-05 | dependencies | top-level `dependencies[]` ≠ derived edge set | FAIL |
| V-PROC-01 | process | unknown `process.type` | FAIL |
| V-PROC-02 | process | `execution_order` not a valid topological order | FAIL |
| V-PROC-03 | process | `coordinator` unknown agent | FAIL |
| V-EXE-01 | execution | field out of range / unknown enum | FAIL |
| V-CON-01 | constraints | `len(tasks)` > `task_limit` etc. | FAIL |
| V-SEC-01 | security | secret pattern in ANY string field | FAIL |

Secret patterns (V-SEC-01): `api[_-]?key`, `password`, `passwd`, `token`,
`secret`, `bearer `, `sk-`, `-----BEGIN .*PRIVATE KEY-----`
(case-insensitive). Scope: every string field of the spec.

## 2. Valid test cases (must PASS)

V1 Minimal valid Crew — Input: 1 agent, 1 task, 1 tool, `sequential`,
no `execution`/`constraints`. Expected: PASS. Reason: smallest complete
contract exercises all required-field rules.

V2 Multi-agent Crew — Input: 3 agents, 3 tasks, each task a different
assignee. Expected: PASS. Rule: V-AG-03 (every agent referenced).

V3 Sequential task chain — Input: A→B→C via `depends_on`, `execution_order`
omitted (derived). Expected: PASS. Rule: derivation ownership default.

V4 Multiple independent tasks — Input: 3 tasks, all `depends_on: []`.
Expected: PASS. Reason: roots are legal; order = document order.

V5 Task context dependency — Input: B `depends_on: [A]`,
`context: [A.output]`. Expected: PASS. Rule: V-TASK-03 satisfied.

V6 Multiple tools — Input: agent `tool_refs: [t1, t2]`, both cataloged.
Expected: PASS. Rule: V-TOOL-01 satisfied.

V7 Agent with multiple tasks — Input: 2 tasks, same `agent_ref`.
Expected: PASS. Reason: no rule forbids one-to-many assignment.

V8 Context passed between tasks — Input: chain with `crew_input.q`
referenced by first task. Expected: PASS. Reason: `crew_input.*` needs no
declaration.

## 3. Invalid test cases (must FAIL)

I1 Missing required field — Input: no `objective.goal`. Expected: FAIL.
Rule: V-TOP-02. Reason: goal required for coverage check.

I2 Duplicate Agent ID — Input: two agents `id: researcher`. Expected: FAIL.
Rule: V-AG-01. Reason: references would be ambiguous.

I3 Duplicate Task ID — Input: two tasks `id: research_data`. Expected:
FAIL. Rule: V-TASK-01. Reason: dependency edges unresolvable.

I4 Unknown Agent reference — Input: `agent_ref: ghost`. Expected: FAIL.
Rule: V-TASK-02. Reason: no executor exists.

I5 Unknown Task reference — Input: `depends_on: [ghost_task]`. Expected:
FAIL. Rule: V-DEP-01. Reason: dangling edge.

I6 Circular dependency — Input: A→B→C→A. Expected: FAIL. Rule: V-DEP-03.
Reason: no valid execution order exists.

I7 Unknown Tool reference — Input: `tool_refs: [mind_reader]` undeclared.
Expected: FAIL. Rule: V-TOOL-01. Reason: capability does not exist.

I8 Secret inside specification — Input: `config_ref: "sk-live-abc123"`.
Expected: FAIL. Rule: V-SEC-01. Reason: credentials outside the spec;
CrewAI MUST NOT execute.

I9 Invalid process — Input: `process.type: random`. Expected: FAIL.
Rule: V-PROC-01. Reason: strategy unknown to the runtime.

I10 Invalid execution configuration — Input: `timeout_seconds: 99999`.
Expected: FAIL. Rule: V-EXE-01. Reason: out of allowed range 30–3600.

## 4. Self-validation checklist (§14)

- [x] Every required field defined (crew/agent/task/tool/process specs)
- [x] Every field has type; required/optional defined; nullable stated
- [x] Relationships defined (`agent_ref`, `depends_on`, `tool_refs`,
      `context`, `coordinator`, `config_ref`)
- [x] References defined with target catalogs
- [x] Validation rules defined with stable IDs (V-* matrix above)
- [x] Allowed values defined (enums, ranges, slug pattern)
- [x] Invalid cases covered (I1–I10); valid cases covered (V1–V8)
- [x] No contradictory rules (single source per concept; see §5)
- [x] No duplicate fields (dependencies declared once, in `depends_on`)
- [x] No unnecessary fields (execution optional-only; constraint vocab minimal)
- [x] No secrets in schema (V-SEC-01 normative)
- [x] Independent from runtime code (names only: model, config_ref)
- [x] Builder can theoretically produce it (all fields generatable from a Plan)
- [x] CrewAI can theoretically consume it (closed contract, deterministic order)

## 5. Consistency review (against existing docs)

Checked: `../CREW_SPECIFICATION.md`, `../CREW_MODEL.md`, `../AGENT_MODEL.md`,
`../TASK_MODEL.md`, `../TOOL_MODEL.md`, `../PROCESS_MODEL.md`,
`../EXECUTION_FLOW.md`, `crew.py`/`agents.py` legacy.

- CONFLICTS: none critical. One naming delta (non-critical): the conceptual
  `CREW_SPECIFICATION.md` uses generic labels (`assigned_agent`, `tools`,
  `dependencies`) while this package normatively fixes `agent_ref`,
  `tool_refs`, `depends_on`. This package is authoritative for implementation;
  the conceptual doc remains valid as background. No silent resolution — the
  delta is declared here.
- MISSING REQUIREMENTS: none — every concept from the existing docs
  (role/goal/backstory, expected output, allowlist, blocks-dependency,
  sequential/hierarchical, Crew Result) has a normative field.
- DUPLICATES: none — `depends_on` is the single dependency source;
  top-level `dependencies[]` is a checked redundant view (V-DEP-05).
- AMBIGUOUS DEFINITIONS: none open — remaining TBDs are catalog contents
  (model list) and fleet defaults (process), both non-blocking since every
  instance is explicit.

## 6. Completeness review (architect)

1. Implement without guessing? YES — field blocks give type, range, ref,
   rule, example for every field.
2. Builder generates deterministically? YES — all fields derivable from a
   Plan; no runtime-only information required.
3. Validator validates deterministically? YES — matrix is decidable
   (equality, membership, DFS cycle check, pattern scan).
4. CrewAI consumes deterministically? YES — closed contract, explicit order.
5. Agent/Task/Tool references unambiguous? YES — id-keyed, uniqueness
   enforced.
6. Dependencies formally defined? YES — edge model + 5 rules.
7. Invalid configurations rejected? YES — I1–I10 cover all rule groups.
8. Secrets prohibited? YES — V-SEC-01, fail-closed.
9. Required decisions decided? YES — all structural decisions fixed; open
   TBDs (model catalog, fleet process default) are explicitly non-blocking
   by construction (per-instance explicitness).

## 7. End-to-end demo (conceptual, Q3 revenue)

User request: "Analyze Q3 revenue." Plan (upstream, not shown) → Builder
produces a CrewSpecification (sketch, names only):

- agents: `researcher` (tool_refs: [document_search]), `analyst`
  (tool_refs: [database_query]), `writer` (tool_refs: []).
- tasks: `research_data` (agent_ref: researcher) → `analyze_revenue`
  (agent_ref: analyst, depends_on: [research_data],
  context: [research_data.output]) → `generate_report` (agent_ref: writer,
  depends_on: [analyze_revenue], context: [analyze_revenue.output]).
- tools: `document_search`, `database_query` (config_ref names only).
- dependencies: derived edges researcher→analyst→writer chain; acyclic.
- process: `type: sequential`, no `execution_order` (derived).
- expected result: report with findings, figures, cited sources.

Demo check: every `agent_ref` resolves (§V-TASK-02) · every `depends_on`
resolves, acyclic (V-DEP-01/03) · every `tool_ref` cataloged (V-TOOL-01) ·
context only from dependencies (V-TASK-03) · no secrets (V-SEC-01) ·
process known (V-PROC-01). Demo verdict: PASS. Nothing executed, no code,
no LLM calls.
