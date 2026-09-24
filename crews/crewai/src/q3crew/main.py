"""Entry point: run the Q3 crew with topic + context text inputs."""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[3] / ".." / ".env")

from q3crew.crew import build_crew, default_model  # noqa: E402  (sys.path above)


def run(topic: str, context_text: str = "", model: str | None = None) -> dict:
    crew = build_crew(model or default_model())
    t0 = time.perf_counter()
    raw = crew.kickoff(inputs={"topic": topic, "context_text": context_text})
    text = (getattr(raw, "raw", None) or str(raw)).strip()
    return {"status": "success", "output": text,
            "output_type": type(raw).__name__,
            "duration_s": round(time.perf_counter() - t0, 1)}


if __name__ == "__main__":
    topic = " ".join(sys.argv[1:]) or "Tong quan doanh thu Q3?"
    print(run(topic)["output"])
