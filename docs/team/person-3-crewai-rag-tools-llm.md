# Phân công công việc - Người 3: CrewAI + Tools + RAG + LLM

## 1. Mục tiêu
Triển khai phần trí tuệ và xử lý nghiệp vụ của hệ thống: agent runtime, tool registry, retrieval, và LLM gateway. Người này sẽ làm phần mà hệ thống thực sự suy luận và trả lời dữ liệu từ các nguồn còn lại.

## 2. Scope công việc
### 2.1. CrewAI adapter
- Tạo `AgentRuntime` abstraction
- Tạo `CrewAIAdapter` thực thi
- Tạo `FakeRuntime` cho testing
- Không gọi CrewAI trực tiếp ở nhiều nơi ngoài adapter

### 2.2. Tool registry
- Tạo registry cho tools
- Đăng ký tool theo role / permission
- Chuẩn hóa input/output tool interface
- Audit log cho tool execution

### 2.3. RAG
- Tạo ingest / chunk / embed / search / retrieve skeleton
- Tạo query-time filter theo tenant
- Chuẩn hóa context retrieval trước khi gọi model

### 2.4. LLM gateway
- OpenAI / provider abstraction
- Request/response chuẩn
- Fallback / retry cơ bản
- Prompt + response metadata

## 3. Files cần làm chính
- `backend/crewai/`
- `backend/tools/`
- `backend/rag/`
- `backend/llm/`
- `backend/memory/`
- `backend/providers/`

## 4. Interface phải đồng bộ
### 4.1. Agent execution input
```json
{
  "agent_id": "analyst",
  "task": "Tìm đơn hàng theo khách hàng A",
  "context": {
    "tenant_id": "tenant_001"
  }
}
```

### 4.2. Tool execution interface
```json
{
  "tool_name": "lookup_order",
  "arguments": {
    "order_id": "ORD-1001"
  },
  "tenant_id": "tenant_001",
  "user_id": "user_001"
}
```

### 4.3. RAG retrieval response
```json
{
  "documents": [
    { "source": "policy", "content": "...", "score": 0.94 }
  ],
  "query": "chính sách hoàn trả"
}
```

### 4.4. LLM response
```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "content": "Kết quả phân tích...",
  "metadata": { "tokens": 1200 }
}
```

## 5. Yêu cầu kỹ thuật
- Mọi giao tiếp với CrewAI phải qua adapter
- Tool phải có validation input
- Retrieval phải filter theo tenant
- Không làm business logic quá sâu nếu không có plan rõ từ Người 2
- Chỉ sử dụng interface chuẩn với Người 1 và Người 2

## 6. Output deliverables
- Adapter + runtime abstraction
- Registry tool cơ bản
- RAG skeleton chạy được với dữ liệu mẫu
- LLM gateway với request/response chuẩn
- Memory base stub

## 7. Acceptance criteria
- Có thể chạy agent mẫu với dữ liệu test
- Có thể gọi tool qua registry
- Có retrieval trả về context có filter tenant
- Có response từ LLM gateway trong schema chuẩn
- Có unit test cho tool và adapter

## 8. Dependencies / handoff
### Handoff cho Người 1
- Shared tenant context / auth context
- Error response format

### Handoff cho Người 2
- Task type và step type contract
- Run lifecycle contract

### Handoff cho Người 4
- Event và SSE contract để hiển thị stream trạng thái agent

## 9. Không làm trong phần này
- Không code giao diện frontend
- Không xây dựng toàn bộ hệ thống auth
- Không thay đổi database schema lớn nếu chưa đồng ý chung
- Không phát triển máy chủ HTTP riêng lẻ ngoài backend app

## 10. Gợi ý timeline
- Ngày 1: adapter + tool registry
- Ngày 2: RAG contract và retrieval skeleton
- Ngày 3: LLM gateway + memory base
- Ngày 4: test và handoff

## 11. Checklist cuối cùng
- [ ] CrewAI adapter base ready
- [ ] Tool registry hoạt động
- [ ] RAG retrieval skeleton ready
- [ ] LLM gateway chuẩn
- [ ] Test cho tool/adapter running
- [ ] Handoff cho các module còn lại đã được gửi
