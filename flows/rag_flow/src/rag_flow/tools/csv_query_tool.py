"""Deterministic CSV aggregation over data/*.csv (exact math, no LLM arithmetic)."""

import csv
from pathlib import Path
from typing import Any, Dict, List, Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

DATA_DIR = Path(__file__).resolve().parents[5] / "data"


class CsvQueryInput(BaseModel):
    """Input schema for CsvQueryTool."""
    file: str = Field(description="CSV filename under data/, e.g. demo_q3_2024.csv")
    operation: str = Field(
        description="One of: sum, count, filter, group_sum. "
        "sum: total of a column. count: row count. "
        "filter: first N matching rows as text. "
        "group_sum: totals grouped by a column.")
    column: str = Field(default="", description="Numeric column for sum/group_sum.")
    group_by: str = Field(default="", description="Column to group by (group_sum).")
    match_column: str = Field(default="", description="Column to match (filter).")
    match_value: str = Field(default="", description="Substring to match (filter).")
    limit: int = Field(default=10, description="Max rows for filter.")


class CsvQueryTool(BaseTool):
    name: str = "csv_query"
    description: str = (
        "Query a CSV file in data/ with exact computation. "
        "Use for totals, counts, filtering and grouped sums. "
        "Input is a JSON object matching CsvQueryInput.")
    args_schema: Type[BaseModel] = CsvQueryInput

    def _run(self, file: str, operation: str, column: str = "",
             group_by: str = "", match_column: str = "",
             match_value: str = "", limit: int = 10) -> str:
        path = (DATA_DIR / file).resolve()
        if DATA_DIR not in path.parents and path.parent != DATA_DIR:
            return "ERROR: file must be directly under data/"
        if not path.is_file():
            return f"ERROR: unknown file: {file}"
        try:
            with open(path, newline="", encoding="utf-8") as f:
                rows: List[Dict[str, Any]] = list(csv.DictReader(f))
        except Exception as exc:
            return f"ERROR: cannot read {file}: {exc}"
        if operation == "count":
            return f"{file}: {len(rows)} rows."
        if operation == "sum":
            try:
                total = sum(float(r.get(column, 0) or 0) for r in rows)
            except ValueError:
                return f"ERROR: column '{column}' is not numeric."
            return f"{file}: sum({column}) = {total:g} over {len(rows)} rows."
        if operation == "group_sum":
            groups: Dict[str, float] = {}
            for r in rows:
                try:
                    groups[r.get(group_by, "?")] = \
                        groups.get(r.get(group_by, "?"), 0.0) + float(r.get(column, 0) or 0)
                except ValueError:
                    return f"ERROR: column '{column}' is not numeric."
            lines = [f"{k}: {v:g}" for k, v in sorted(groups.items(), key=lambda x: -x[1])]
            return f"{file}: sum({column}) by {group_by}:\n" + "\n".join(lines)
        if operation == "filter":
            hits = [r for r in rows if match_value.lower() in str(r.get(match_column, "")).lower()]
            lines = [", ".join(f"{k}={v}" for k, v in r.items()) for r in hits[:limit]]
            return (f"{file}: {len(hits)} row(s) where {match_column} contains "
                    f"'{match_value}':\n" + ("\n".join(lines) if lines else "(none)"))
        return f"ERROR: unknown operation '{operation}'. Use sum|count|filter|group_sum."
