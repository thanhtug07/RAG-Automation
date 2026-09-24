# Shared Contract cho toàn bộ team

## 1. Mục tiêu
Tài liệu này là source of truth cho các phần backend, workflow, agent, và frontend. Tất cả module phải tuân theo contract này để có thể kết nối lại sau khi từng phần hoàn tất.

## 2. Shared types
### Tenant context
```json
{
  "tenant_id": "tenant_001",
  "user_id": "user_001",
  "organization_id": "org_001",
  "roles": ["admin", "operator"]
}
```

### Run status
Các trạng thái hợp lệ:
- queued
- running
- succeeded
- failed
- blocked

### Event type
Các event hợp lệ:
- run.created
- run.started
- run.completed
- run.failed
- step.started
- step.completed
- tool.called
- result.generated

## 3. Response format chuẩn
```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "error": null
}
```

## 4. Run summary format
```json
{
  "run_id": "run_123",
  "status": "queued",
  "updated_at": "2026-09-22T10:00:00+00:00"
}
```

## 5. Event format
```json
{
  "event_id": "evt_run_123_1",
  "run_id": "run_123",
  "event_type": "run.started",
  "created_at": "2026-09-22T10:00:00+00:00",
  "payload": {
    "message": "starting"
  }
}
```

## 6. Workflow step format
```json
{
  "id": "step_01",
  "type": "lookup",
  "depends_on": [],
  "metadata": {
    "source": "orders"
  }
}
```

## 7. Quy tắc kết nối
- Không viết schema riêng ở từng module nếu đã có contract chuẩn.
- Tất cả module phải dùng cùng run status và event type.
- Các module có thể mở rộng payload nhưng không được đổi tên field cốt lõi.
- Frontend chỉ đọc status + event_type + run_id từ response/stream.
- Backend chỉ phát event khi có trạng thái mới hoặc task mới bắt đầu.

## 8. Bắt đầu nhanh
- API health: `/health` và `/api/v1/health`
- Tạo run: `POST /api/v1/runs`
- Xem status: `GET /api/v1/runs/{run_id}/status`
- Xem event: `GET /api/v1/runs/{run_id}/events`
- Tạo plan: `POST /api/v1/plans`
