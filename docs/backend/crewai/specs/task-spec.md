# task-spec — Task Specification (normative)

Part of PHASE 1. Conceptual background: `../TASK_MODEL.md`. Agent
configuration is never duplicated inside tasks — tasks carry `agent_ref only.

## TaskSpec

Field: id | Type: string | Required: YES | Nullable: NO |
Description: sole handle for dependency and context references |
Allowed values: slug, unique within `tasks` | Default: none |
Reference: referenced by `tasks[].depends_on`, `tasks[].context`,
top-level `dependencies[]` | Validation: slug pattern; unique (V-TASK-01) |
Example: `research_data`

Field: name | Type: string | Required: YES | Nullable: NO |
Description: short label | Allowed values: 1–80 chars |
Validation: non-empty | Example: `Research data`

Field: description | Type: string | Required: YES | Nullable: NO |
Description: the work instruction; the only order the agent obeys |
Validation: non-empty | Example: `Collect Q3 sales figures per channel.`

Field: agent_ref | Type: string | Required: YES | Nullable: NO |
Description: the single executing agent |
Allowed values: one of `agents[].id` | Reference: `agents[].id` |
Validation: resolves; exactly one (V-TASK-02) |
Example: `researcher`

Field: expected_output | Type: string | Required: YES | Nullable: NO |
Description: result shape the agent must return; checked at result
registration | Validation: non-empty |
Example: `Table of Q3 figures per channel with sources.`

Field: context | Type: string[0..] | Required: NO | Nullable: NO |
Description: named inputs this task may read |
Allowed values: `crew_input.<key>` (run input) or `<task_id>.output`
(dependency output) | Default: `[]` |
Reference: `tasks[].id` for the second form |
Validation: every `<task_id>.output` reference resolves AND names a task
in this task's `depends_on` (V-TASK-03); unlisted outputs invisible |
Example: `[research_data.output]`

Field: depends_on | Type: string[0..] | Required: NO | Nullable: NO |
Description: prerequisite task ids, in any order; empty = runnable at start |
Allowed values: subset of `tasks[].id` | Default: `[]` |
Reference: `tasks[].id` | Validation: resolves (V-DEP-01); no
self-dependency (V-DEP-02); graph acyclic (V-DEP-03) |
Example: `[research_data]`

## Relationships

- Task → Agent: `agent_ref` → exactly one `agents[].id`.
- Task → Task: `depends_on` edges; see `./dependency-spec.md`.
- Task → Tool (indirect): runtime intersects assignee's `tool_refs` with the
  task's effective allowlist = assignee's `tool_refs` (no separate per-task
  tool field exists in this version — one mechanism, no duplication).

## Valid examples

Sequential chain:

```yaml
- { id: research_data, name: Research data, description: Collect Q3 figures.,
    agent_ref: researcher, expected_output: Figures table with sources. }
- { id: analyze_revenue, name: Analyze revenue,
    description: Analyze figures for drivers., agent_ref: analyst,
    expected_output: Driver analysis., depends_on: [research_data],
    context: [research_data.output] }
```

Independent tasks: two tasks with `depends_on: []` — both runnable at start
under `sequential` (document order) or in any order the process defines.

## Invalid examples

- Two tasks `id: research_data` → FAIL (V-TASK-01).
- `agent_ref: ghost` → FAIL (V-TASK-02 unknown agent).
- `depends_on: [ghost_task]` → FAIL (V-DEP-01).
- `depends_on: [analyze_revenue]` on task `analyze_revenue` → FAIL (V-DEP-02).
- `context: [secret_task.output]` without depending on it → FAIL (V-TASK-03).
