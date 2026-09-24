# rag_flow — CrewAI Flow cho RAG e-commerce đa kênh (Shopee / TikTok Shop / P2P)

## Kiến trúc

```text
query
  -> prepare_input (@start): detect channel (shopee/tiktok/p2p)
  -> classify_intent (@router, keyword, deterministic):
       policy_question  -> PolicyCrew (researcher + rag_retriever)
       data_question    -> DataCrew (rag + data_analyst + analyst, csv_query tool)
       complex_analysis -> FullAnalysisCrew (5-task chain)
       simple_ask       -> FastAskCrew (1 analyst task)
  -> review_and_format (@listen or_(4 nhánh), Reviewer): verify + format + confidence
```

- State typed Pydantic: `src/rag_flow/state.py` (`RagFlowState`).
- Tools (`src/rag_flow/tools/`, stdlib only): `csv_query` (sum/count/filter/group_sum
  chính xác trên `data/*.csv`), `document_search` (tìm theo từ khóa, trả `file:line`).
- Mỗi Crew: `agents.yaml` + `tasks.yaml` + `*_crew.py` (build, không kickoff trong đó).
- Mở rộng: thêm crew mới = thêm folder + 1 nhánh `@listen` + 1 case trong router.

## Cài đặt

```bash
pip install crewai "crewai[tools]" litellm python-dotenv pyyaml "pydantic>=2"
cp .env.example /path/to/.env   # repo root đã có .env (gitignored)
```

`.env` cần: `OPENAI_API_KEY`, `OPENAI_API_BASE=https://tokenharbor.ai/v1`,
`OPENAI_MODEL_NAME` (id chính xác của provider, vd `deepseek-v4.1-flash:free`;
code tự gắn prefix `openai/` cho litellm khi có custom base).

## Chạy

```bash
cd flows/rag_flow/src
python -m rag_flow.main "Tổng doanh thu Q3 năm 2024 là bao nhiêu?"
```

Hoặc từ Python:

```python
import sys; sys.path.insert(0, "flows/rag_flow/src")
from rag_flow.main import kickoff
print(kickoff("Chính sách đổi trả thế nào?"))
```

## Test ground-truth

Câu hỏi: **"Tổng doanh thu quý 3 năm 2024 là bao nhiêu?"**
→ route `data_question` → `csv_query(sum total_vnd)` trên `data/demo_q3_2024.csv`
→ kết quả phải chứa **28.035.000 VND** (tổng đã biết trước: Shopee 10.235.000,
TikTok 11.680.000, P2P 6.120.000).

## Lưu ý vận hành

- Model free qua proxy chậm (60–150s/call); chain dài có thể quá timeout —
  đó là giới hạn provider, không phải bug flow.
- Planner/Builder nối vào sau qua `kickoff(query, context_text, channel)`.
