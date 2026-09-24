"""Chat CLI tren Flow moi (flows/rag_flow). Khong phu thuoc backend.crewai.

Usage (repo root):  python scripts/chat_crew.py
Neu console loi font tieng Viet:  chcp 65001
Config doc tu .env (load_dotenv). Vong loop khong bao gio crash.
"""

import concurrent.futures
import sys
import time
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "flows" / "rag_flow" / "src"))

from dotenv import load_dotenv

from rag_flow.llm import default_model
from rag_flow.main import kickoff

for _stream in (sys.stdin, sys.stdout, sys.stderr):  # console Windows cp1252
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ALLOWED_EXT = {".txt", ".md", ".json", ".csv", ".log", ".tsv"}
# Owner decision: NO size caps — large files make slow/expensive prompts.
AGENTS = [  # mirrors flows/rag_flow crews (agents.yaml files)
    ("researcher", "Researcher", "policy, full"),
    ("rag_retriever", "Knowledge Retriever", "data, policy, full"),
    ("data_analyst", "Data Analyst", "data, full"),
    ("analyst", "Analyst", "data, full, fast"),
    ("executor", "Executor", "full"),
    ("reviewer", "Reviewer", "buoc cuoi moi flow"),
]
HELP = ("Lenh:\n"
        "  /upload <file>  - nap file text (txt/md/json/csv/log/tsv)\n"
        "  /files           - liet ke file da nap\n"
        "  /ask <cau hoi>   - hoi Flow (go thang cau hoi cung duoc)\n"
        "  /agents          - liet ke 6 agent roles\n"
        "  /model [ten]     - xem/doi model trong session\n"
        "  /timeout <giay>  - xem/dat gioi han moi cau hoi (0 = KHONG gioi han, mac dinh 300)\n"
        "  /history         - cac cau hoi da hoi\n"
        "  /save <file>     - luu cau tra loi gan nhat ra file\n"
        "  /clear           - xoa file da nap\n"
        "  /quit            - thoat")


def safe_input(prompt: str) -> str | None:
    """Doc 1 dong, khong bao gio crash vi encoding; None khi EOF/Ctrl+C."""
    try:
        return input(prompt)
    except (KeyboardInterrupt, EOFError):
        return None
    except (UnicodeDecodeError, OSError):
        return ""


def cmd_upload(files: dict, arg: str) -> str:
    path = Path(arg.strip().strip('"').strip("'")).expanduser()
    if not path.is_file():
        return f"FAILURE: khong thay file: {arg}"
    if path.suffix.lower() not in ALLOWED_EXT:
        return f"FAILURE: chi nhan file text {sorted(ALLOWED_EXT)}"
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:
        return f"FAILURE: khong doc duoc file: {exc}"
    files[path.name] = text
    return f"OK: da nap {path.name} ({len(text)} ky tu, {path.stat().st_size} bytes)"


def build_context(files: dict) -> str:
    return "\n\n".join(f"=== {name} ===\n{text}" for name, text in files.items())


def cmd_ask(model: str, question: str, files: dict, timeout: int) -> str:
    if not question.strip():
        return "FAILURE: cau hoi rong. Dung: /ask <cau hoi>"
    import os
    if model != default_model():
        os.environ["OPENAI_MODEL_NAME"] = model  # session override for this ask
    context = build_context(files) or "(khong co file nao)"
    t0 = time.perf_counter()
    try:
        if timeout and timeout > 0:
            ex = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            fut = ex.submit(kickoff, question, context, None)
            try:
                answer = fut.result(timeout=float(timeout))
            except concurrent.futures.TimeoutError:
                ex.shutdown(wait=False, cancel_futures=True)
                return f"FAILURE: het thoi gian cho ({timeout}s). Tang /timeout hoac doi model nhanh hon."
            else:
                ex.shutdown(wait=True)
        else:
            answer = kickoff(question, context, None)
    except Exception as exc:  # khong de exception la nao thoat loop
        return f"FAILURE unexpected {type(exc).__name__}: {str(exc)[:200]}"
    dt = time.perf_counter() - t0
    if not (answer or "").strip():
        return f"FAILURE: Flow tra ve rong sau {dt:.0f}s (xem state.error trong log)."
    return f"[{dt:.0f}s]\n{answer.strip()}"


def main() -> int:
    load_dotenv(REPO_ROOT / ".env")
    session = {"model": default_model(), "timeout": 300, "files": {},
               "history": [], "last_answer": ""}
    files = session["files"]
    print(f"CrewAI chat tren Flow moi (model={session['model']}). Go /help de xem lenh.")
    while True:
        line = safe_input("\n> ")
        if line is None:
            print("\nTam biet.")
            return 0
        line = line.strip()
        if not line:
            continue
        if line in ("/quit", "/exit", "/q"):
            print("Tam biet.")
            return 0
        if line in ("/help", "/h"):
            print(HELP)
        elif line.startswith("/upload "):
            print(cmd_upload(files, line[len("/upload "):]))
        elif line == "/files":
            print("Chua nap file nao." if not files else
                  "\n".join(f"- {n} ({len(t)} ky tu)" for n, t in files.items()))
        elif line.startswith("/ask "):
            answer = cmd_ask(session["model"], line[len("/ask "):], files, session["timeout"])
            session["history"].append(line[len("/ask "):])
            session["last_answer"] = answer
            print(answer)
        elif line == "/agents":
            for aid, role, crews in AGENTS:
                print(f"- {aid} ({role}): {crews}")
        elif line.startswith("/model"):
            arg = line[len("/model"):].strip()
            if arg:
                session["model"] = arg
                print(f"OK: model session = {arg}")
            else:
                print(f"model hien tai: {session['model']}")
        elif line.startswith("/timeout"):
            arg = line[len("/timeout"):].strip()
            if arg.isdigit() and 0 <= int(arg) <= 3600:
                session["timeout"] = int(arg)
                print(f"OK: timeout = {arg}s (0 = unlimited)")
            else:
                print(f"timeout hien tai: {session['timeout']}s (dat: /timeout 0..3600, 0 = unlimited)")
        elif line == "/history":
            print("(chua hoi gi)" if not session["history"] else
                  "\n".join(f"{i+1}. {q}" for i, q in enumerate(session["history"])))
        elif line.startswith("/save "):
            path = Path(line[len("/save "):].strip().strip('"')).expanduser()
            if not session["last_answer"]:
                print("FAILURE: chua co cau tra loi nao.")
            else:
                try:
                    path.write_text(session["last_answer"], encoding="utf-8")
                    print(f"OK: da luu vao {path}")
                except Exception as exc:
                    print(f"FAILURE: khong luu duoc: {exc}")
        elif line == "/clear":
            files.clear()
            print("OK: da xoa file da nap.")
        elif line.startswith("/"):
            print("FAILURE: lenh la. Go /help.")
        else:
            answer = cmd_ask(session["model"], line, files, session["timeout"])
            session["history"].append(line)
            session["last_answer"] = answer
            print(answer)


if __name__ == "__main__":
    raise SystemExit(main())
