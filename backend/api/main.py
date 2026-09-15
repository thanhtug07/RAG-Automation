"""Backend API skeleton — FastAPI healthcheck only."""
from fastapi import FastAPI
app = FastAPI(title="RAG Automation API", version="0.1.0")
@app.get("/health")
def health(): return {"status":"ok"}
@app.get("/api/v1/health")
def health_v1(): return {"status":"ok","version":"v1"}
