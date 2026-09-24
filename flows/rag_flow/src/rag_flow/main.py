"""RAG Flow: route -> branch crew -> reviewer. Public entry: kickoff()."""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crewai import Agent, Crew, Process, Task
from crewai.flow import Flow, listen, or_, router, start

from rag_flow.crews.fast_ask_crew.fast_ask_crew import build as build_fast
from rag_flow.llm import default_model
from rag_flow.state import RagFlowState
from rag_flow.tools import CsvQueryTool, DocumentSearchTool

_POLICY_WORDS = ("chinh sach", "chính sách", "doi tra", "đổi trả", "hoan tra",
                 "hoàn trả", "van chuyen", "vận chuyển", "phi ", "phí", "bao hanh",
                 "bảo hành", "quy dinh", "quy định", "dieu khoan", "điều khoản")
_COMPLEX_WORDS = ("phan tich", "phân tích", "danh gia", "đánh giá", "so sanh",
                  "so sánh", "ke hoach", "kế hoạch", "chien luoc", "chiến lược",
                  "nguyen nhan", "nguyên nhân", "du bao", "dự báo")
_DATA_WORDS = ("tong", "tổng", "bao nhieu", "bao nhiêu", "doanh thu", "liet ke",
               "liệt kê", "tinh ", "tính ", "thong ke", "thống kê", "bao cao",
               "báo cáo")


def _norm(text: str) -> str:
    return (text or "").lower()


class RagFlow(Flow[RagFlowState]):
    """Intent-routed RAG flow over data/policy crews with reviewer finish."""

    @start()
    def prepare_input(self) -> None:
        q = _norm(self.state.query)
        for token, name in (("shopee", "shopee"), ("tiktok", "tiktok"),
                            ("tik tok", "tiktok"), ("p2p", "p2p")):
            if token in q:
                self.state.channel = name  # type: ignore[assignment]
                break

    @router(prepare_input)
    def classify_intent(self) -> str:
        q = _norm(self.state.query)
        if any(w in q for w in _POLICY_WORDS):
            return "policy_question"
        if any(w in q for w in _COMPLEX_WORDS):
            return "complex_analysis"
        if any(w in q for w in _DATA_WORDS):
            return "data_question"
        return "simple_ask"

    def _run_branch(self, crew: Crew, label: str) -> str:
        inputs = {"query": self.state.query, "context_text": self.state.context_text}
        try:
            raw = crew.kickoff(inputs=inputs)
        except Exception as exc:
            self.state.error = f"{label}: {type(exc).__name__}: {exc}"
            return ""
        text = (getattr(raw, "raw", None) or str(raw) or "").strip()
        if not text:
            self.state.error = f"{label}: empty result"
        return text

    def _run_sequential(self, crew_name: str, label: str,
                        task_timeout: float = 300) -> str:
        """Per-task kickoffs in yaml order; declared context inlined as text.

        Same workaround proven in the legacy runner: native Task-context crews
        stall on slow free-tier providers, while single-task kickoffs complete.
        Only DECLARED context entries are ever fed.
        """
        import concurrent.futures

        import yaml
        crew_dir = Path(__file__).resolve().parent / "crews" / crew_name
        agents_cfg = yaml.safe_load((crew_dir / "config" / "agents.yaml").read_text())
        tasks_cfg = yaml.safe_load((crew_dir / "config" / "tasks.yaml").read_text())
        llm = default_model()
        factories = {"document_search": DocumentSearchTool,
                     "kb_retrieve": DocumentSearchTool,
                     "database_query": CsvQueryTool}
        agents = {}
        for key, cfg in agents_cfg.items():
            tools = []
            for ref in (cfg.get("tools") or []):
                try:
                    tools.append(factories[ref]())
                except Exception as exc:
                    self.state.error = f"{label}: no factory for tool '{ref}'"
                    return ""
            agents[key] = Agent(role=cfg["role"], goal=cfg["goal"],
                                backstory=cfg.get("backstory", ""), llm=llm,
                                tools=tools, verbose=False, max_iter=10)
        registered: dict = {}
        last = ""
        for key, cfg in tasks_cfg.items():
            blocks = []
            for entry in (cfg.get("context") or []):
                if entry not in registered:
                    self.state.error = f"{label}: '{entry}' has no output yet"
                    return ""
                blocks.append(f"[output of '{entry}']:\n{registered[entry]}")
            description = cfg["description"].format(
                query=self.state.query, context_text=self.state.context_text)
            if blocks:
                description += "\n\nContext:\n" + "\n\n".join(blocks)
            task = Task(description=description,
                        expected_output=cfg["expected_output"],
                        agent=agents[cfg["agent"]])
            crew = Crew(agents=[agents[cfg["agent"]]], tasks=[task],
                        process=Process.sequential, verbose=False)
            ex = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            fut = ex.submit(crew.kickoff)
            try:
                raw = fut.result(timeout=float(task_timeout))
            except concurrent.futures.TimeoutError:
                ex.shutdown(wait=False, cancel_futures=True)
                self.state.error = f"{label}/{key}: timeout after {task_timeout:g}s"
                return ""
            except Exception as exc:
                ex.shutdown(wait=False)
                self.state.error = f"{label}/{key}: {type(exc).__name__}: {exc}"
                return ""
            else:
                ex.shutdown(wait=True)
            text = (getattr(raw, "raw", None) or str(raw) or "").strip()
            if not text:
                self.state.error = f"{label}/{key}: empty result"
                return ""
            registered[key] = text
            last = text
        return last

    @listen("data_question")
    def run_data(self) -> str:
        self.state.intent = "data_question"
        self.state.analysis_result = self._run_sequential("data_crew", "data")
        return self.state.analysis_result

    @listen("policy_question")
    def run_policy(self) -> str:
        self.state.intent = "policy_question"
        self.state.analysis_result = self._run_sequential("policy_crew", "policy")
        return self.state.analysis_result

    @listen("complex_analysis")
    def run_complex(self) -> str:
        self.state.intent = "complex_analysis"
        self.state.analysis_result = self._run_sequential("full_analysis_crew", "full")
        return self.state.analysis_result

    @listen("simple_ask")
    def run_simple(self) -> str:
        self.state.intent = "simple_ask"
        self.state.analysis_result = self._run_branch(build_fast(), "fast")
        return self.state.analysis_result

    @listen(or_("run_data", "run_policy", "run_complex", "run_simple"))
    def review_and_format(self) -> str:
        """Reviewer finish shared by all paths: verify + format + confidence."""
        if self.state.error or not self.state.analysis_result:
            self.state.final_answer = ""
            self.state.confidence = 0.0
            return ""
        llm = default_model()
        reviewer = Agent(
            role="Reviewer",
            goal="Verify the answer against the question and format it.",
            backstory=("An impartial inspector. Checks the draft answers the question, "
                       "keeps every cited number, outputs clean Vietnamese. Never invents."),
            llm=llm, verbose=False, max_iter=5,
        )
        task = Task(
            description=(f"Cau hoi goc: {self.state.query}\n\nBan nhap:\n"
                         f"{self.state.analysis_result}\n\nKiem tra ban nhap co tra loi "
                         f"dung cau hoi khong, giu nguyen moi con so, tra ve ban chinh thuc "
                         f"ngan gon bang tieng Viet."),
            expected_output="Ban tra loi chinh thuc, ngan gon, tieng Viet.",
            agent=reviewer,
        )
        try:
            raw = Crew(agents=[reviewer], tasks=[task],
                       process=Process.sequential, verbose=False).kickoff()
        except Exception as exc:
            self.state.error = f"review: {type(exc).__name__}: {exc}"
            self.state.final_answer, self.state.confidence = "", 0.0
            return ""
        self.state.final_answer = (getattr(raw, "raw", None) or str(raw) or "").strip()
        self.state.confidence = 0.85 if self.state.final_answer else 0.0
        return self.state.final_answer


def kickoff(query: str, context_text: str = "",
            channel: str | None = None) -> str:
    """Public entry: run the flow, return the final answer ("" on failure)."""
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[4] / ".env")
    flow = RagFlow()
    flow.state.query = query
    flow.state.context_text = context_text
    if channel in ("shopee", "tiktok", "p2p"):
        flow.state.channel = channel  # type: ignore[assignment]
    t0 = time.perf_counter()
    try:
        flow.kickoff()
    except Exception as exc:
        flow.state.error = f"flow: {type(exc).__name__}: {exc}"
        return ""
    flow.state.metadata["duration_s"] = round(time.perf_counter() - t0, 1)
    return flow.state.final_answer


if __name__ == "__main__":
    q = " ".join(sys.argv[1:]) or "Tong doanh thu Q3 nam 2024 la bao nhieu?"
    print(kickoff(q))
