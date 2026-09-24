# Phân công công việc - Người 2: Planner + Workflow + Execution

## 1. Mục tiêu
Triển khai nền tảng lên kế hoạch công việc và chạy workflow theo mô hình DAG/step-based, phục vụ cho việc chạy agent và pipeline. Người này chịu trách nhiệm cho logic định nghĩa job, chạy job, trạng thái, và event lifecycle.

## 2. Scope công việc
### 2.1. Planner
- Khởi tạo mô hình planning input/output
- Chuẩn hóa task decomposition
- Tạo execution plan từ user request
- Xác định các bước công việc và thứ tự chạy

### 2.2. Workflow
- Tạo workflow definition
- Có thể biểu diễn pipeline dạng DAG (dependency graph)
- Hỗ trợ `queued`, `running`, `succeeded`, `failed`, `blocked`

### 2.3. Execution engine
- Tạo `Run` object
- Tạo `RunStep` object
- Tạo `RunEvent` stream
- Gửi event thay đổi trạng thái
- Có retry / failure handling cơ bản

## 3. Files cần làm chính
- `backend/planner/`
- `backend/workflows/`
- `backend/execution/`
- `backend/events/`
- `backend/services/run_service.py`
- `backend/services/execution_service.py`

## 4. Interface phải đồng bộ
### 4.1. Planner input
```json
{
  "user_query": "kiểm tra doanh thu tháng này",
  "tenant_id": "tenant_001",
  "user_id": "user_001"
}
```

### 4.2. Planner output
```json
{
  "plan_id": "plan_001",
  "steps": [
    { "id": "step_01", "type": "lookup", "depends_on": [] },
    { "id": "step_02", "type": "analysis", "depends_on": ["step_01"] },
    { "id": "step_03", "type": "report", "depends_on": ["step_02"] }
  ]
}
```

### 4.3. Run lifecycle
```json
{
  "run_id": "run_123",
  "plan_id": "plan_001",
  "status": "queued"
}
```

### 4.4. Event stream
```json
{
  "event_type": "run.started",
  "run_id": "run_123",
  "step_id": "step_01",
  "payload": {}
}
```

## 5. Yêu cầu kỹ thuật
- Không code trực tiếp vào model agent
- Execution phải có thể chạy theo workflow nhưng không cần hoàn thiện business logic của từng agent
- Tất cả step phải có `depends_on` rõ ràng
- Tạo lớp `RunManager` / `ExecutionController` để chuẩn hóa trạng thái
- Gửi event qua interface chuẩn để Frontend và Người 3 có thể theo dõi

## 6. Output deliverables
- Planner base module
- Workflow definition schema
- Run lifecycle cơ bản
- Event bus integration skeleton
- Execution engine đơn giản nhưng có trạng thái rõ ràng

## 7. Acceptance criteria
- Có thể tạo plan từ 1 request đơn giản
- Có thể chạy step theo dependency order
- Có status thay đổi đúng: queued → running → succeeded/failed
- Có event stream được phát ra khi status đổi
- Có ít nhất 1 flow test chạy được

## 8. Dependencies / handoff
### Handoff cho Người 1
- Shared run/event schema chuẩn
- API status và health status matching

### Handoff cho Người 3
- Step type contract: `lookup`, `analysis`, `report`, `review`
- Input/output schema cho mỗi task type

### Handoff cho Người 4
- SSE event structure và run status response được đồng bộ

## 9. Không làm trong phần này
- Không code quá sâu về RAG retrieval
- Không triển khai agent reasoning thật
- Không tạo UI frontend
- Không thay đổi auth bên ngoài contract

## 10. Gợi ý timeline
- Ngày 1: model plan + run + status
- Ngày 2: execution engine và dependency order
- Ngày 3: event stream + error handling
- Ngày 4: smoke test + handoff

## 11. Checklist cuối cùng
- [ ] Có planner base module
- [ ] Có workflow schema
- [ ] Có run lifecycle
- [ ] Có event stream
- [ ] Có test chạy với dependency order
- [ ] Handoff document đã gửi cho các module liên quan
