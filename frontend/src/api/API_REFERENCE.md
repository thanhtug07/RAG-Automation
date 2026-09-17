# API Reference — AgentOS Frontend API Layer

> Load order: `config.js → client.js → *.api.js → index.js` via classic
> `<script>` tags. Usage: `AgentApi.<domain>.<fn>()` → `Promise`.
> Errors: `ApiError { status, code, message, details?, requestId? }`.
> Auth: `Authorization: Bearer <agentos.token>` attached automatically when set.
> Status: `BACKEND-AVAILABLE` (verified) / `CONTRACT-READY` (assumed `/api/v1`)
> / `UNKNOWN` (path/shape unconfirmed).

## client (`AgentApi.client`)

`get(path, params?, options?)`, `post(path, body?, options?)`,
`put(path, body?, options?)`, `patch(path, body?, options?)`,
`delete(path, params?, options?)`. `options: { headers?, timeout? }`.
Also `getToken()`, `getAuthHeaders()`. Timeouts: 15000ms default, 120000ms upload.

## auth — CONTRACT-READY

| Function | Method | Endpoint | Body |
|---|---|---|---|
| `register(data)` | POST | `/api/v1/auth/register` | `{ name, email, password }` |
| `login(data)` | POST | `/api/v1/auth/login` | `{ email, password, remember? }` → `{ token, user }` |
| `logout()` | POST | `/api/v1/auth/logout` | — |
| `refresh(data?)` | POST | `/api/v1/auth/refresh` | `{ refresh_token? }` → `{ token }` |
| `getMe()` | GET | `/api/v1/auth/me` | Bearer |
| `changePassword(data)` | POST | `/api/v1/auth/change-password` | `{ current_password, new_password }` |

## users — CONTRACT-READY

| Function | Method | Endpoint |
|---|---|---|
| `getMe()` | GET | `/api/v1/users/me` |
| `updateMe(data)` | PATCH | `/api/v1/users/me` (`{ name?, email?, avatar? }`) |
| `getUser(id)` | GET | `/api/v1/users/{id}` |

## workspaces — CONTRACT-READY

`getWorkspaces(params)` GET `/api/v1/workspaces{?page,page_size,search}`;
`getWorkspace(id)` GET `/api/v1/workspaces/{id}`;
`createWorkspace(data)` POST `{ name, plan? }`;
`updateWorkspace(id, data)` PATCH `{ name?, plan? }`;
`deleteWorkspace(id)` DELETE;
`getMembers(workspaceId, params)` GET `.../{id}/members`;
`addMember(workspaceId, data)` POST `{ email, role }`;
`updateMember(workspaceId, memberId, data)` PATCH `{ role }`;
`removeMember(workspaceId, memberId)` DELETE.

## conversations — CONTRACT-READY

`getConversations(params)` GET `...{?page,page_size,search,workspace_id}`;
`getConversation(id)` GET; `createConversation(data)` POST
`{ title?, agent_id?, workspace_id? }`; `updateConversation(id, data)` PATCH
`{ title? }`; `deleteConversation(id)` DELETE.

## messages — CONTRACT-READY

`getMessages(conversationId, params)` GET `.../{id}/messages{?page,page_size,order}`;
`sendMessage(conversationId, data, options?)` POST `{ content, agent_id?, model? }`
(long timeout allowed via `options.timeout`).

## documents — CONTRACT-READY

`getDocuments(params)` GET `...{?page,page_size,search,type,status,knowledge_base_id,sort,order}`;
`getDocument(id)` GET; `createDocument(data)` POST `{ name, knowledge_base_id?, tags?, description? }`;
`updateDocument(id, data)` PATCH; `deleteDocument(id)` DELETE;
`uploadDocument(file, metadata)` POST multipart (`file` + metadata fields);
`reindexDocument(id)` POST `.../{id}/reindex`;
`retryDocument(id)` POST `.../{id}/retry`;
`getDocumentStatus(id)` GET `.../{id}/status`;
`bulkDeleteDocuments(ids)` / `bulkReindexDocuments(ids)` POST `{ ids: [] }`.

## knowledge — CONTRACT-READY

`getKnowledgeBases(params)` / `getKnowledgeBase(id)` /
`createKnowledgeBase(data)` `{ name, description? }` /
`updateKnowledgeBase(id, data)` / `deleteKnowledgeBase(id)`;
`getKnowledgeDocuments(kbId, params)` GET; `addDocumentToKnowledge(kbId, docId)`
POST `{ document_id }`; `removeDocumentFromKnowledge(kbId, docId)` DELETE;
`searchKnowledgeBase(kbId, data)` POST `{ query, top_k? }`.

## agents — CRUD BACKEND-AVAILABLE, tools UNKNOWN

`getAgents(params)` GET `/api/agents{?page,page_size,search,status}`;
`getAgent(id)` GET `/api/agents/{id}` (UNKNOWN — backend returns full list today);
`createAgent(data)` POST `/api/agents` `{ id, role, goal, backstory?, llm? }`;
`updateAgent(id, data)` PUT; `deleteAgent(id)` DELETE;
`getAgentTools(agentId, params)` / `addAgentTool(agentId, toolId)` /
`removeAgentTool(agentId, toolId)` → assumed `/api/v1/agents/{id}/tools…` (UNKNOWN).

## tools — CONTRACT-READY

`getTools(params)` / `getTool(id)` / `createTool(data)` `{ name, type?, config? }` /
`updateTool(id, data)` (PATCH) / `deleteTool(id)` under `/api/v1/tools`.

## tasks — CONTRACT-READY (`getTaskSteps` UNKNOWN)

`getTasks(params)` `{?page,page_size,search,status,workspace_id}` /
`getTask(id)` / `createTask(data)` `{ title, agent_id?, conversation_id? }` /
`updateTask(id, data)` / `deleteTask(id)` /
`cancelTask(id)` + `retryTask(id)` (POST `.../cancel|/retry`) /
`getTaskSteps(id)` GET `.../steps` (UNKNOWN shape).

## runs — CONTRACT-READY

`getRuns(params)` `{?page,page_size,search,status,workspace_id}` /
`getRun(id)` / `getRunEvents(id, params)` `{?page,page_size}`. Read-only by design.

## experiments — CONTRACT-READY (run detail/metrics UNKNOWN)

`getExperiments(params)` / `getExperiment(id)` / `createExperiment(data)`
`{ name, config? }` / `updateExperiment(id, data)` / `deleteExperiment(id)` /
`getExperimentRuns(expId, params)` / `createExperimentRun(expId, data)` /
`getExperimentRun(id)` GET `/api/v1/experiment-runs/{id}` (UNKNOWN) /
`getExperimentMetrics(runId)` GET `.../metrics` (UNKNOWN).

## system — BACKEND-AVAILABLE (exact legacy paths, never `/api/v1`)

`health(params)` GET `/api/health{?provider}`;
`validateKey(data)` POST `/api/keys/validate` `{ api_key, provider, base_url?, save_to_env? }`;
`getModels(data)` POST `/api/models` `{ api_key?, provider?, base_url? }`;
`getTelemetry()` GET `/api/telemetry`;
`recordTelemetry(data)` POST `/api/telemetry/record`;
`testAgent(data, options?)` POST `/api/test-agent`
`{ agent_id, model?, prompt, provider?, base_url?, api_key? }` (long timeout);
`getLogs(params)` GET `/api/logs{?level,limit,search}`;
`clearLogs()` POST `/api/logs/clear`.

## Status codes (client mapping)

401 UNAUTHORIZED · 403 FORBIDDEN · 404 NOT_FOUND · 409 CONFLICT ·
422 VALIDATION_ERROR · 429 RATE_LIMITED · 5xx SERVER_ERROR ·
status 0 + TIMEOUT (abort) / NETWORK_ERROR (fetch reject).
Backend `{ message | error | detail, code? }` extracted when present.
