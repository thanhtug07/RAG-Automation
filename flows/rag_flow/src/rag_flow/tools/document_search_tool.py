"""Keyword search over repo text data (CSV rows + docs), with file:line references."""

from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

DATA_DIR = Path(__file__).resolve().parents[5] / "data"
SEARCHABLE_EXT = {".csv", ".md", ".txt", ".json", ".log"}


class DocumentSearchInput(BaseModel):
    """Input schema for DocumentSearchTool."""
    keywords: str = Field(description="Space-separated keywords; a line matches if ALL appear.")
    limit: int = Field(default=8, description="Max matching lines returned.")


class DocumentSearchTool(BaseTool):
    name: str = "document_search"
    description: str = (
        "Search local data/ text files by keywords. Returns matching lines as "
        "`file:line: text` references. Use to ground claims in real data.")
    args_schema: Type[BaseModel] = DocumentSearchInput

    def _run(self, keywords: str, limit: int = 8) -> str:
        words = [w.lower() for w in keywords.split() if w]
        if not words:
            return "ERROR: empty keywords."
        hits = []
        for path in sorted(DATA_DIR.iterdir()):
            if not path.is_file() or path.suffix.lower() not in SEARCHABLE_EXT:
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for n, line in enumerate(text.splitlines(), 1):
                low = line.lower()
                if all(w in low for w in words) and line.strip():
                    hits.append(f"{path.name}:{n}: {line.strip()}")
                    if len(hits) >= limit:
                        return "\n".join(hits)
        return "\n".join(hits) if hits else f"No lines match '{keywords}' in data/."
