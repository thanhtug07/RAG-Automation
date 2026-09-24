# Phân công công việc - Người 1: Foundation Backend

## 1. Mục tiêu
Xây dựng phần nền tảng backend để các module khác có thể triển khai mà không bị lệch contract. Mục tiêu là tạo base app có thể chạy, có cấu hình, healthcheck, DB connection, logging, error handling, và shared schema cơ bản.

## 2. Scope công việc
### 2.1. Cấu hình base app
- Thiết lập FastAPI app cơ bản trong `backend/api/`
- Cấu hình env, settings, dependency injection
- Tạo versioning cho API: `/health`, `/api/v1/health`
- Cấu hình CORS, app metadata, middleware

### 2.2. Database foundation
- Tạo database connection layer
- Khởi tạo session / repository pattern cơ bản
- Xác định các model chung: `User`, `Tenant`, `Run`, `RunStep`, `RunEvent`
- Chuẩn bị migration folder hoặc bootstrap schema

### 2.3. Auth base
- Tạo JWT / session base contract
- JWT payload chuẩn
- User context từ token
- Tenant/organization context ràng buộc trên request

### 2.4. Shared service contract
- `BaseResponse`, `ErrorResponse`, `PaginationResponse`
- `RunStatus` enum
- `EventType` enum
- `TenantContext` contract

## 3. Files cần làm chính
- `backend/api/main.py`
- `backend/api/routes/` (nếu đã có hoặc tạo mới)
- `backend/core/config.py`
- `backend/core/security.py`
- `backend/database/connection.py`
- `backend/database/models/`
- `backend/core/errors.py`
- `backend/core/context.py`

## 4. ABI / interface phải đồng bộ với các phần khác
### 4.1. Health API
Request:
- GET `/health`
- GET `/api/v1/health`

Response mẫu:
```json
{
  "status": "ok",
  "version": "v1"
}
```

### 4.2. Run status contract
```json
{
  "id": "run_123",
  "status": "queued",
  "tenant_id": "tenant_001",
  "created_at": "2026-09-22T00:00:00Z"
}
```

### 4.3. Event contract
```json
{
  "event_id": "evt_123",
  "run_id": "run_123",
  "event_type": "run.started",
  "payload": {},
  "created_at": "2026-09-22T00:00:00Z"
}
```

### 4.4. Auth context
```json
{
  "user_id": "user_001",
  "tenant_id": "tenant_001",
  "roles": ["admin"]
}
```

## 5. Yêu cầu kỹ thuật
- Code sạch, theo mô hình modular monolith
- Không phụ thuộc trực tiếp vào CrewAI trong base app
- Không hardcode secrets vào code
- Tất cả phần mới phải có kiểu dữ liệu rõ ràng
- Tránh thay đổi schema khi chưa có agreement chung

## 6. Output deliverables
- FastAPI app khởi chạy được
- /health hoạt động
- Cấu hình môi trường chuẩn
- DB connection layer cơ bản
- Auth context và tenant context rõ ràng
- Shared response contract

## 7. Acceptance criteria
- App khởi chạy bằng lệnh dev chuẩn
- Healthcheck trả về status OK
- Không lỗi khi import module
- Không có secret hardcoded
- Có mô hình cơ bản cho run/event/tenant/user

## 8. Dependencies / handoff
### Handoff cho Người 2
- Run model/status contract
- Event schema
- API base path và error format

### Handoff cho Người 3
- Tenant context
- User context
- Common response schema

### Handoff cho Người 4
- API endpoint base và SSE event route chuẩn

## 9. Không làm trong phần này
- Không viết business logic planner
- Không triển khai agent chạy thật
- Không tạo UI frontend
- Không code RAG / LLM flow chi tiết

## 10. Gợi ý timeline
- Ngày 1: config + base app + health
- Ngày 2: DB + models + repository
- Ngày 3: auth context + shared contracts
- Ngày 4: cleanup + smoke test

## 11. Checklist cuối cùng
- [ ] App start được
- [ ] Healthcheck OK
- [ ] DB connect layer ready
- [ ] Shared schema chuẩn
- [ ] Tenant context và auth context định nghĩa rõ
- [ ] Handoff doc đã gửi cho các người còn lại
