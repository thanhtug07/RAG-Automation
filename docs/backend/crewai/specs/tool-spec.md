# tool-spec — Tool Reference Specification (normative)

Part of PHASE 1. Conceptual background: `../TOOL_MODEL.md`. The Tool Registry
itself is NOT built here — only how the spec references capabilities.

## ToolSpec (catalog entry)

Field: id | Type: string | Required: YES | Nullable: NO |
Description: capability handle referenced by agents |
Allowed values: slug, unique within `tools` | Reference: referenced by
`agents[].tool_refs` | Validation: slug pattern; unique (V-TOOL-02) |
Example: `document_search`

Field: name | Type: string | Required: YES | Nullable: NO |
Description: stable human-readable name | Validation: non-empty, 1–80 chars |
Example: `Document Search`

Field: purpose | Type: string | Required: YES | Nullable: NO |
Description: what it does and when to prefer it |
Validation: non-empty | Example: `Search approved sales reports.`

Field: config_ref | Type: string | Required: NO | Nullable: YES |
Description: pointer to runtime-side configuration BY NAME ONLY (never
values, never inline connection material) |
Allowed values: slug-like name | Default: null |
Validation: non-empty if present; secret scan applies (V-SEC-01) |
Example: `sales_reports_readonly`

## Reference rules (tool_ref)

- Agents use tools only via `tool_refs` entries matching `tools[].id`.
- Effective allowlist for a task = assignee's `tool_refs` (no per-task tool
  field in this version).
- Any referenced-but-undeclared tool id → FAIL (V-TOOL-01).
- A catalog tool referenced by no agent is allowed (catalog may be a
  superset) — but an agent referencing an undeclared tool is rejected.

## Secret prohibition (normative)

The Crew Specification MUST NOT contain: API keys, passwords, access tokens,
secrets, credentials, or inline connection strings/URLs with embedded auth.
`config_ref` carries names only; binding happens at runtime outside the spec.
Detection rule V-SEC-01 scans every string field for secret patterns
(`api[_-]?key`, `password`, `passwd`, `token`, `secret`, `bearer `,
`sk-`, `-----BEGIN .*PRIVATE KEY-----`); any hit → FAIL, CrewAI MUST NOT
execute. False-positive escapes: none in this version — rename the field.

## Allowed usage

A tool call is allowed iff: (a) the calling agent's `tool_refs` includes the
tool id, (b) the call occurs during one of that agent's assigned tasks.
All other calls are denied by definition.

## Valid example

```yaml
tools:
  - id: document_search
    name: Document Search
    purpose: Search approved sales reports.
    config_ref: sales_reports_readonly
```

## Invalid examples

- `tool_refs: [mind_reader]` with no catalog entry → FAIL (V-TOOL-01).
- `config_ref: "sk-live-abc123"` → FAIL (V-SEC-01 secret inside spec).
- Two catalog entries `id: document_search` → FAIL (V-TOOL-02).
