# Progress Review — AgentOS (chi tiết, số liệu verify trực tiếp)

- Branch: `crew_AI-flow`, HEAD `6b92e23` đã push (`rev-list origin/crew_AI-flow..HEAD` = 0). Mọi việc dưới đây còn uncommitted trong worktree.
- Ngày verify: 2026-09-22. Mỗi con số đều chạy lệnh thật; mục ngoài phiên này ghi UNVERIFIED.

## 1. Git state (verify)

### 1.1 Log: 14 commits (`git log --oneline | Measure` = 14)
```
6b92e23 Fix P3: localize Policies nav label across 4 sidebars
a4116af Frontend api routes: policies/storage modules + routes, sidebar/fonts/i18n unify
44cdf32 Phase 1-2: frontend api layer + routes + dashboard integration, tester 17-17 PASS
1d6bf30 Deploy frontend to GitHub Pages via Actions
3cf26ca Dashboard mission-control + documents module, keep auth/home, VS Code theme, VI/EN
cebd447 feat: redesign auth pages with video visuals
9fee509 Fix hero H1 size/wrap to prevent lapping: smaller clamp, balance text, padding, reduced margin
b386d5f Make hero secondary CTA identical primary button
0ad09a4 Make hero secondary CTA a matching secondary button
e186045 Fix hero quiet button showing native button chrome (gray box)
637a498 Frontend: fullscreen Home slides, auth photo+fracture redesign, nav/i18n polish
d6bea2d docs: establish enterprise agent platform architecture
2d6f230 Add source code for RAG Automation project
1629f6d Initial commit
```

### 1.2 Worktree: 67 D + 23 M + 24 ??, staged = 0
- `git diff --stat`: 90 files, +764 / -4676.
- Untracked 24: `.freebuff/`, `backend/auth/{audit,deps,jwt_auth,rbac}.py`, `backend/auth/test_rbac.py`, `backend/core/`, `backend/crewai/agents/`, `backend/crewai/runtime.py`, `backend/crewai/validation/`, `backend/execution/service.py`, `backend/planner/service.py`, `backend/tests/test_*.py` (2), `docs/{README,review}.md`, `docs/{backend,database,frontend,infrastructure,team}/`, `frontend/src/shared/`, `frontend/src/styles/shared.css`, `scripts/`.

### 1.3 Deletions theo vùng (67 D, verify)
| Vùng | Số file | Ghi chú |
|---|---|---|
| Root (`README.md`, `agents.py`, `crew.py`, `main.py`) | 4 | Chủ ý: CLI-era dọn về đúng part |
| `backend/agents/` (3), `api/` `auth/` `context/` `database/` `evaluation/` `events/` `execution/` `llm/` `memory/` `observability/` `planner/` `policy/` `rag/`(3) `tests/` `tools/` `workflows/` (2 mỗi cái) | 35 | Migrate md → docs/, đã verify SHA256 80/80 trước xóa |
| `frontend/src` (11) + `frontend/tests` (2) | 13 | Xóa PLAN/REFERENCE md |
| `infrastructure/{deployment,docker,monitoring,postgres,redis,vector}` | 12 | Migrate md → docs/ |
| `README.md` root + 2 file lẻ | 3 | Vào `docs/README.md` |

## 2. Test suite: 49 passed, 0 failed (verify 2 lần)

`python -m pytest backend -q` → `49 passed in 0.86s`.

| File | Tests | Nội dung |
|---|---|---|
| `backend/crewai/validation/test_validator.py` | 21 | V1–V8 valid, I1–I10 invalid, duplicate-edge, Q3 regression, determinism/read-only |
| `backend/auth/test_rbac.py` | 21 | Matrix 11 case, JWT (hết hạn/sai ký/khuyết org/role lạ/thiếu secret), deps 401/403, audit bất biến |
| `backend/tests/test_planner_execution_runtime.py` | 3 | UNVERIFIED chi tiết (ngoài phiên này) |
| `backend/tests/test_shared_contracts.py` | 4 | UNVERIFIED chi tiết (ngoài phiên này) |

## 3. Phase inventory (verify file tồn tại + đọc nội dung)

### 3.1 Phase 1 — CrewAI Specification: PASS, 7/7 file tại `docs/backend/crewai/specs/`
`crew-spec.md agent-spec.md task-spec.md tool-spec.md process-spec.md dependency-spec.md validation-spec.md` — hợp đồng normative, field-block đầy đủ, rule IDs `V-*` ổn định. Conceptual đi kèm: `AGENT_MODEL TASK_MODEL TOOL_MODEL PROCESS_MODEL CREW_MODEL CREWAI_SYSTEM EXECUTION_FLOW CREW_SPECIFICATION` (8 file).

### 3.2 Phase 2 — Validator: PASS
- `backend/crewai/validation/validator.py` — stdlib only (grep 0 import ngoài), `validate()` read-only/deterministic, 21/21 rules matrix implement, message lỗi `{rule:path:message}`, secret không vào message (verify bằng test I8).
- Bug tự bắt khi verify: self-duplicate thiếu V-DEP-04 → đã fix + khóa bằng test mới.

### 3.3 Agent structure: 6 folders + 6 specs + 96 section files
- Code: `backend/crewai/agents/{research,rag,data_analyst,analyst,executor,reviewer}/` — mỗi agent 7 subdirs + `__init__.py` 0-byte (verify 42/42 rỗng) + legacy `legacy_agents.py`/`legacy_crew.py` giữ nguyên logic.
- Spec: `docs/backend/crewai/agents/<slug>/AGENT.md` × 6 + 96 section md (16/agent) + index trong `README.md` — trích từ AGENT.md, 0 claim mới, Memory/MCP/Skills/Access = TBD.
- Quyết định đã chốt với owner: Executor (tránh lẫn Builder kiến trúc), data_analyst ra số / analyst ra insight, 6 production roles là override explicit của lệnh cấm AGENT_MODEL.

### 3.4 RBAC: 4 modules + 21 tests, fail-closed
- `backend/auth/rbac.py` — `crew:submit` (admin, operator), `crew:view` (cả 3), `admin:manage` (admin); unknown → deny.
- `jwt_auth.py` — HS256 qua python-jose (đã có trong requirements), claims `sub`/`organization_id`/`roles`; không login endpoint, không user DB (quyết định đã chốt: JWT stateless).
- `deps.py` — 401/403, org chỉ từ token. `audit.py` — append-only thật (frozen entry, không API update/delete).
- Đính chính đã verify: lib crewai OSS không có API RBAC — kiểm soát nằm ở tầng backend này.

### 3.5 Reorgs (verify)
- `backend/agents/` đã xóa khỏi disk; 5 file sang `backend/crewai/agents/` (README/plan sửa path refs, verify từng dòng).
- 80 md migrate `backend|frontend|infrastructure` + root → `docs/` mirror (SHA256 khớp 80/80, 0 markdown hyperlink nên 0 link chết, 5 ref code `.py` đã sửa).
- Sự cố tự phát hiện khi verify: index README bị migrate ghi đè → đã khôi phục bằng bản merge (domain doc + index).

### 3.6 Docs hiện tại: 211 md (verify đếm)
`docs/backend` 151 (49 moved + 96 sections + 6 AGENT) + `docs/frontend` 18 + `docs/infrastructure` 12 + `docs/architecture` 21 + `docs/database` 2 + `docs/team` 5 (UNVERIFIED, ngoài phiên này) + `docs/README.md` + `docs/review.md`.

### 3.7 Dependencies (verify `pip list` vs `requirements.txt`)
| requirements.txt | Installed |
|---|---|
| `crewai`, `crewai[tools]` (unpinned) | **1.15.22** |
| `python-dotenv` / `fastapi` / `uvicorn` | 1.2.3 / **0.141.1** / 0.53.0 |
| `pydantic>=2` / `celery[redis]` | 2.12.5 / 5.6.3 + redis 6.4.0 |
| `psycopg[binary]` / `pgvector` | **3.3.6** / **0.5.0** (trước đó thiếu, đã cài khi upgrade) |
| `python-jose` / `pytest` | 3.5.0 / 9.1.1 |
- Smoke sau upgrade: import 6 lib ok, `create_agents()` đủ 4 agents, `create_crew()` dựng được Crew (API crewai mới tương thích, 0 sửa code).

## 4. Secrets scan (verify grep)
- `backend/auth/*.py`: chỉ từ `token`/`secret` trong logic JWT + 1 test-secret đã nhãn test-only — **0 secret thật**.
- `validator.py`: hits là regex definitions — không phải secret.

## 5. Findings (verify từng mục, xếp ưu tiên)

1. ~~Legacy import gãy~~ — **không tái hiện**: `tools/` còn trên disk, `create_agents()` import ok. (Reviewer cũ báo gãy do lệch môi trường.)
2. Stub `__init__.py` stale: `backend/auth/__init__.py:1` + `backend/crewai/agents/__init__.py:1` vẫn ghi "see README.md + *-plan.md" cùng thư mục — file đã sang docs/. Fix 2 dòng, 2 phút.
3. `requirements.txt:1-2` unpinned `crewai` vs thực tế 1.15.22 — tái lập môi trường trôi version. Fix: pin `crewai==1.15.22` + `crewai-tools==1.15.22`.
4. 42 dirs + 6 agent folders trống git không track — clone tươi mất cây thư mục (spec md trong docs vẫn đủ). Nếu cần durability: thêm `.gitkeep` (quyết sau).
5. `backend/api/main.py` đang `M` (ngoài phiên này, UNVERIFIED) — trước khi gắn auth, đọc kỹ diff của nó để khỏi đè việc người khác.
6. File ngoài phiên này (`backend/core/`, `runtime.py`, `service.py` ×2, `backend/tests/test_*`, `docs/team/`, `frontend/src/shared/`) — chưa review, không commit chung khi chưa đọc.
7. `dependency-spec.md` câu "collapse" mâu thuẫn rule V-DEP-04 — validator đã xử FAIL + ghi chú trong docstring; đồng bộ lại spec một dòng khi rảnh.

## 6. TBD mở (đều có bằng chứng chữ TBD trong spec)
Tool Registry · Memory/MCP/Skills/AccessControl per-agent · model catalog · audit persistence (DB) · token issuance/login · validator→runtime wiring · frontend↔backend contracts.

## 7. Đề xuất next phase (thứ tự)
1. Fix mục 2+3 (§5) — nhỏ, 10 phút.
2. Tool Registry tối thiểu (mở khóa Executor + V-TOOL-01 có catalog thật).
3. Đọc + review file ngoài phiên (§5 mục 5–6) rồi mới commit gộp.
4. Validator-gate trong execution + auth wiring API + audit persistence.
5. Agent `.py` đầu tiên từ AGENT.md (researcher → rag_retriever), FakeRuntime trước.

---
*Viết chi tiết từ số liệu chạy thật ngày 2026-09-22 trên nhánh `crew_AI-flow`. Mục UNVERIFIED là file tồn tại trên disk nhưng ngoài phiên làm việc này.*
