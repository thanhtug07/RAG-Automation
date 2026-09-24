# Phân công công việc - Người 4: Frontend + Integration

## 1. Mục tiêu
Xây dựng phần giao diện và tích hợp cuối cùng với backend. Mục tiêu là cho frontend có thể gửi request, hiển thị dashboard, hiển thị trạng thái chạy task, và lấy event stream từ backend theo chuẩn SSE.

## 2. Scope công việc
### 2.1. Frontend app
- Khởi tạo route app và layout cơ bản
- Dashboard, auth screen, workflow runner UI
- Trang hiển thị kết quả và trạng thái execution

### 2.2. API client
- Gọi backend theo contract chuẩn
- Tạo client cho health, run, workflow, agent action
- Xử lý lỗi và loading state

### 2.3. SSE / realtime
- Xử lý stream event từ backend
- Cập nhật tự động trạng thái tiến độ
- Hiển thị log / event timeline

### 2.4. Integration
- Nối frontend với backend contract và event payload chuẩn
- Không tạo logic nghiệp vụ mới ngoài UI và integration

## 3. Files cần làm chính
- `frontend/src/`
- `frontend/src/api/`
- `frontend/src/pages/`
- `frontend/src/services/`
- `frontend/src/components/`
- `frontend/src/hooks/`

## 4. Interface phải đồng bộ
### 4.1. Request start run
```json
{
  "user_query": "kiểm tra doanh thu tháng này",
  "tenant_id": "tenant_001"
}
```

### 4.2. Response start run
```json
{
  "run_id": "run_123",
  "status": "queued"
}
```

### 4.3. SSE event
```json
{
  "event_type": "run.status",
  "run_id": "run_123",
  "status": "running",
  "payload": {}
}
```

### 4.4. Result panel
```json
{
  "run_id": "run_123",
  "final_output": "Kết quả phân tích...",
  "status": "succeeded"
}
```

## 5. Yêu cầu kỹ thuật
- Frontend phải suy theo contract API chung, không tùy biến đặt tên riêng
- Không hardcode response shape mà không có agreement
- Mỗi event cập nhật phải hiển thị rõ trạng thái
- Đảm bảo UX cơ bản cho loading, error, success

## 6. Output deliverables
- Dashboard UI cơ bản
- Giao diện tạo request / xem trạng thái
- API client chuẩn
- SSE consumer cho realtime updates
- Kết nối với backend khi đã có contract hoàn thiện

## 7. Acceptance criteria
- Người dùng có thể bắt đầu 1 request từ UI
- UI hiển thị trạng thái `queued`, `running`, `succeeded`, `failed`
- Event stream cập nhật thời gian thực
- Kết quả cuối hiển thị đúng format
- Có ít nhất 1 flow test UI hoặc smoke test

## 8. Dependencies / handoff
### Handoff từ Người 1
- API base contract, auth context, status schema

### Handoff từ Người 2
- Run lifecycle, event model, plan status

### Handoff từ Người 3
- Final output format, task result schema

## 9. Không làm trong phần này
- Không viết logic nghiệp vụ planner/phân tích sâu
- Không triển khai cơ sở dữ liệu
- Không code agent runtime
- Không tự phát triển schema riêng biệt ngoài contract chung

## 10. Gợi ý timeline
- Ngày 1: layout + api client + base screen
- Ngày 2: run request UI + loading/error flow
- Ngày 3: SSE realtime updates
- Ngày 4: smoke test và polish

## 11. Checklist cuối cùng
- [ ] UI dashboard cơ bản ready
- [ ] API client hoạt động
- [ ] SSE stream update được
- [ ] Kết nối run flow hoạt động
- [ ] Error/empty/loading state rõ
- [ ] Handoff cuối cùng với nhóm đã hoàn tất
