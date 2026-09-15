import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List

import httpx
import uvicorn
import yaml
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import FileResponse, HTMLResponse, JSONResponse
from starlette.routing import Mount, Route
from starlette.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
STATIC_DIR = BASE_DIR / "static"
CONFIG_PATH = BASE_DIR / "crews" / "content_crew" / "config" / "agents.yaml"
ENV_PATH = PROJECT_ROOT / ".env"

# In-memory telemetry storage — starts empty, populated by real executions only
TELEMETRY_STORE: Dict[str, Any] = {
    "total_prompt_tokens": 0,
    "total_completion_tokens": 0,
    "total_tokens": 0,
    "estimated_cost_usd": 0.0,
    "history": []
}

# In-memory log buffer — records real API requests, errors, warnings
LOGS_STORE: List[Dict[str, Any]] = []
MAX_LOGS = 250

def add_log_entry(
    level: str,
    message: str,
    method: str = "-",
    path: str = "-",
    status_code: int = None,
    duration_ms: float = None,
    details: str = "",
    log_type: str = "API",
    context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Record an operational log entry into in-memory ring buffer with diagnostic context."""
    entry = {
        "id": f"log-{int(time.time() * 1000)}-{len(LOGS_STORE) + 1}",
        "timestamp": time.strftime("%H:%M:%S"),
        "datetime": time.strftime("%Y-%m-%d %H:%M:%S"),
        "level": level.upper(),  # ERROR, WARNING, SUCCESS, INFO
        "type": log_type,        # API, SYSTEM, or AGENT
        "method": method.upper(),
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 1) if duration_ms is not None else None,
        "message": message,
        "details": details or "",
        "context": context or {}
    }
    LOGS_STORE.insert(0, entry)
    if len(LOGS_STORE) > MAX_LOGS:
        LOGS_STORE.pop()
    return entry

# System initialization log
add_log_entry(
    level="INFO",
    message="Aurelia AI Mission Control service initialized",
    method="SYSTEM",
    path="/",
    status_code=200,
    duration_ms=0.0,
    details="System online, ready to receive agent tasks",
    log_type="SYSTEM",
    context={"version": "2026.1", "environment": "local"}
)

def load_agents_yaml() -> Dict[str, Any]:
    """Load agents dictionary from agents.yaml."""
    if not CONFIG_PATH.exists():
        return {}
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            return data if isinstance(data, dict) else {}
    except Exception as e:
        print(f"Error loading agents.yaml: {e}")
        return {}

def save_agents_yaml(agents: Dict[str, Any]) -> bool:
    """Save agents dictionary back to agents.yaml."""
    try:
        CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            yaml.dump(agents, f, sort_keys=False, allow_unicode=True, default_flow_style=False)
        return True
    except Exception as e:
        print(f"Error saving agents.yaml: {e}")
        return False

def get_env_config() -> Dict[str, str]:
    """Read API Key, provider, and custom base URL from .env and os.environ."""
    cfg = {
        "api_key": os.environ.get("OPENAI_API_KEY", ""),
        "provider": os.environ.get("LLM_PROVIDER", "openai"),
        "base_url": os.environ.get("OPENAI_API_BASE", "") or os.environ.get("LLM_BASE_URL", "")
    }
    if cfg["api_key"] == "YOUR_API_KEY":
        cfg["api_key"] = ""

    if ENV_PATH.exists():
        try:
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("OPENAI_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val != "YOUR_API_KEY":
                            cfg["api_key"] = val
                    elif line.startswith("LLM_PROVIDER="):
                        cfg["provider"] = line.split("=", 1)[1].strip().strip('"').strip("'")
                    elif line.startswith("OPENAI_API_BASE=") or line.startswith("LLM_BASE_URL="):
                        cfg["base_url"] = line.split("=", 1)[1].strip().strip('"').strip("'")
        except Exception:
            pass
    return cfg

def get_env_api_key() -> str:
    return get_env_config()["api_key"]

def update_env_config(key: str = None, provider: str = None, base_url: str = None) -> bool:
    """Persist API key, provider, and base URL into .env file."""
    try:
        data = {}
        if ENV_PATH.exists():
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, v = line.split("=", 1)
                        data[k.strip()] = v.strip().strip('"').strip("'")

        if key is not None:
            data["OPENAI_API_KEY"] = key
            os.environ["OPENAI_API_KEY"] = key
        if provider is not None:
            data["LLM_PROVIDER"] = provider
            os.environ["LLM_PROVIDER"] = provider
        if base_url is not None:
            data["OPENAI_API_BASE"] = base_url
            data["LLM_BASE_URL"] = base_url
            os.environ["OPENAI_API_BASE"] = base_url
            os.environ["LLM_BASE_URL"] = base_url

        with open(ENV_PATH, "w", encoding="utf-8") as f:
            for k, v in data.items():
                f.write(f"{k}={v}\n")
        return True
    except Exception as e:
        print(f"Error saving .env: {e}")
        return False

def update_env_api_key(key: str) -> bool:
    return update_env_config(key=key)

# ----------------- API Endpoints ----------------- #

async def api_health(request: Request) -> JSONResponse:
    """Check health — reflects real API key, provider, base_url, and connectivity status."""
    start_time = time.perf_counter()
    cfg = get_env_config()
    api_key = cfg["api_key"]
    has_key = bool(api_key and api_key != "YOUR_API_KEY")

    provider = request.query_params.get("provider") or cfg["provider"] or "openai"
    base_url = cfg["base_url"]
    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return JSONResponse({
        "status": "healthy" if has_key else "no_key",
        "service": "Aurelia AI Mission Control",
        "provider": provider,
        "base_url": base_url,
        "api_key_configured": has_key,
        "masked_key": f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else ("Configured" if has_key else "Not configured"),
        "latency_ms": max(latency_ms, 1.0),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })

async def api_validate_key(request: Request) -> JSONResponse:
    """Validate API Key and measure live ping."""
    body = await request.json()
    key = body.get("api_key", "").strip()
    provider = body.get("provider", "openai").lower()
    base_url = body.get("base_url", "").strip()
    save_to_env = body.get("save_to_env", True)

    if not key:
        return JSONResponse({"valid": False, "error": "API Key cannot be empty."}, status_code=400)

    start_time = time.perf_counter()
    headers = {"Authorization": f"Bearer {key}"}

    # Determine endpoint to probe
    test_url = "https://api.openai.com/v1/models"
    if provider == "openrouter":
        test_url = "https://openrouter.ai/api/v1/models"
    elif provider == "groq":
        test_url = "https://api.groq.com/openai/v1/models"
    elif provider == "ollama":
        test_url = (base_url or "http://localhost:11434") + "/api/tags"
        headers = {}
    elif base_url:
        test_url = f"{base_url.rstrip('/')}/models"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(test_url, headers=headers)
            latency_ms = round((time.perf_counter() - start_time) * 1000, 1)

            if resp.status_code == 200:
                # Save key, provider, and base_url to .env if requested
                if body.get("save_to_env", True):
                    update_env_config(key=key, provider=provider, base_url=base_url)
                return JSONResponse({
                    "valid": True,
                    "status": "active",
                    "status_code": resp.status_code,
                    "latency_ms": latency_ms,
                    "provider": provider,
                    "message": f"Successfully authenticated with {provider.upper()} API."
                })
            else:
                return JSONResponse({
                    "valid": False,
                    "status_code": resp.status_code,
                    "latency_ms": latency_ms,
                    "error": f"Provider responded with status {resp.status_code}: {resp.text[:150]}"
                }, status_code=resp.status_code)
    except httpx.ConnectError:
        return JSONResponse({
            "valid": False,
            "error": f"Cannot connect to {test_url}. Please check your network or base URL."
        }, status_code=502)
    except Exception as e:
        return JSONResponse({
            "valid": False,
            "error": f"Error validating key: {str(e)}"
        }, status_code=500)

async def api_models(request: Request) -> JSONResponse:
    """Fetch available models from provider. Only returns real models from live API discovery."""
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass

    key = body.get("api_key", "").strip() or get_env_api_key()
    provider = body.get("provider", "openai").lower()
    base_url = body.get("base_url", "").strip()

    models_list: List[Dict[str, Any]] = []

    # Only discover models if a real API key is provided (except for local Ollama)
    if (not key or key == "YOUR_API_KEY") and provider != "ollama":
        return JSONResponse({
            "provider": provider,
            "count": 0,
            "models": [],
            "message": "No API key configured. Please add your API key in Settings to discover available models."
        })

    # Live discovery from provider
    test_url = "https://api.openai.com/v1/models"
    headers = {"Authorization": f"Bearer {key}"}
    if provider == "openrouter":
        test_url = "https://openrouter.ai/api/v1/models"
    elif provider == "groq":
        test_url = "https://api.groq.com/openai/v1/models"
    elif provider == "ollama":
        test_url = (base_url or "http://localhost:11434") + "/api/tags"
        headers = {}
    elif base_url:
        test_url = f"{base_url.rstrip('/')}/models"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(test_url, headers=headers)
            if resp.status_code == 200:
                raw_data = resp.json()
                raw_models = raw_data.get("data", []) or raw_data.get("models", [])
                for m in raw_models:
                    m_id = m.get("id") or m.get("name")
                    if not m_id:
                        continue
                    models_list.append({
                        "id": m_id,
                        "name": m.get("name", m_id),
                        "provider": provider.title(),
                        "context": "128k",
                        "badge": "LIVE",
                        "featured": any(h in m_id.lower() for h in ["hermes", "gpt-4", "claude", "llama"])
                    })
            else:
                return JSONResponse({
                    "provider": provider,
                    "count": 0,
                    "models": [],
                    "message": f"Provider returned status {resp.status_code}. Check your API key."
                })
    except Exception as e:
        return JSONResponse({
            "provider": provider,
            "count": 0,
            "models": [],
            "message": f"Failed to connect to provider: {str(e)}"
        })

    return JSONResponse({
        "provider": provider,
        "count": len(models_list),
        "models": models_list
    })

async def api_get_agents(request: Request) -> JSONResponse:
    """Retrieve all configured agents from agents.yaml."""
    data = load_agents_yaml()
    agent_list = []
    for key, val in data.items():
        if isinstance(val, dict):
            agent_list.append({
                "id": key,
                "role": val.get("role", "").strip(),
                "goal": val.get("goal", "").strip(),
                "backstory": val.get("backstory", "").strip(),
                "llm": val.get("llm", "openai/gpt-4o-mini"),
                "max_iter": val.get("max_iter", 20),
                "verbose": val.get("verbose", True),
                "tools": val.get("tools", [])
            })
    return JSONResponse({"count": len(agent_list), "agents": agent_list})

async def api_create_agent(request: Request) -> JSONResponse:
    """Create a new agent in agents.yaml."""
    body = await request.json()
    agent_id = body.get("id", "").strip().lower()
    role = body.get("role", "").strip()
    goal = body.get("goal", "").strip()
    backstory = body.get("backstory", "").strip()
    llm = body.get("llm", "openai/gpt-4o-mini").strip()

    if not agent_id or not role or not goal:
        return JSONResponse({"error": "Fields 'id', 'role', and 'goal' are required."}, status_code=400)

    # Sanitize ID
    agent_id = "".join(c for c in agent_id if c.isalnum() or c in "_-")
    agents = load_agents_yaml()

    if agent_id in agents:
        return JSONResponse({"error": f"Agent '{agent_id}' already exists."}, status_code=409)

    agents[agent_id] = {
        "role": role,
        "goal": goal,
        "backstory": backstory or f"You are a dedicated specialist functioning as {role}.",
        "llm": llm
    }

    if save_agents_yaml(agents):
        return JSONResponse({"message": f"Agent '{agent_id}' created successfully.", "agent": agents[agent_id]})
    else:
        return JSONResponse({"error": "Failed to write agents.yaml"}, status_code=500)

async def api_update_agent(request: Request) -> JSONResponse:
    """Update role, goal, backstory, or model of an existing agent."""
    agent_id = request.path_params.get("agent_id", "").strip().lower()
    body = await request.json()

    agents = load_agents_yaml()
    if agent_id not in agents:
        return JSONResponse({"error": f"Agent '{agent_id}' not found."}, status_code=404)

    cur = agents[agent_id]
    if "role" in body:
        cur["role"] = body["role"].strip()
    if "goal" in body:
        cur["goal"] = body["goal"].strip()
    if "backstory" in body:
        cur["backstory"] = body["backstory"].strip()
    if "llm" in body and body["llm"]:
        cur["llm"] = body["llm"].strip()

    if save_agents_yaml(agents):
        return JSONResponse({"message": f"Agent '{agent_id}' updated successfully.", "agent": cur})
    else:
        return JSONResponse({"error": "Failed to write agents.yaml"}, status_code=500)

async def api_delete_agent(request: Request) -> JSONResponse:
    """Delete an agent from agents.yaml."""
    agent_id = request.path_params.get("agent_id", "").strip().lower()
    agents = load_agents_yaml()

    if agent_id not in agents:
        return JSONResponse({"error": f"Agent '{agent_id}' not found."}, status_code=404)

    del agents[agent_id]
    if save_agents_yaml(agents):
        return JSONResponse({"message": f"Agent '{agent_id}' deleted successfully."})
    else:
        return JSONResponse({"error": "Failed to delete agent from agents.yaml"}, status_code=500)

async def api_telemetry(request: Request) -> JSONResponse:
    """Return real-time token telemetry and metrics."""
    return JSONResponse(TELEMETRY_STORE)

async def api_record_token_usage(request: Request) -> JSONResponse:
    """Record token usage to telemetry store."""
    body = await request.json()
    p_tokens = int(body.get("prompt_tokens", 0))
    c_tokens = int(body.get("completion_tokens", 0))
    tot = p_tokens + c_tokens
    cost = round((p_tokens * 0.000002) + (c_tokens * 0.000006), 4)

    TELEMETRY_STORE["total_prompt_tokens"] += p_tokens
    TELEMETRY_STORE["total_completion_tokens"] += c_tokens
    TELEMETRY_STORE["total_tokens"] += tot
    TELEMETRY_STORE["estimated_cost_usd"] = round(TELEMETRY_STORE["estimated_cost_usd"] + cost, 4)

    record = {
        "id": f"run-{int(time.time())}",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "agent": body.get("agent", "custom-agent"),
        "model": body.get("model", "nousresearch/hermes-3-llama-3.1-405b"),
        "prompt_tokens": p_tokens,
        "completion_tokens": c_tokens,
        "total_tokens": tot,
        "cost": cost,
        "status": "success",
        "topic": body.get("topic", "Agent Test Query")
    }
    TELEMETRY_STORE["history"].insert(0, record)
    # keep max 30 records
    TELEMETRY_STORE["history"] = TELEMETRY_STORE["history"][:30]

    return JSONResponse({"status": "recorded", "telemetry": TELEMETRY_STORE})

async def api_test_agent_run(request: Request) -> JSONResponse:
    """Execute a real agent task by calling the LLM API."""
    body = await request.json()
    agent_id = body.get("agent_id", "planner")
    prompt = body.get("prompt", "Analyze recent breakthroughs in AI multi-agent workflows.")
    model = body.get("model", "")

    # Retrieve full configuration from request body or saved .env
    cfg = get_env_config()
    api_key = body.get("api_key", "").strip() or cfg["api_key"]
    provider = body.get("provider", "").strip().lower() or cfg["provider"].lower()
    base_url = body.get("base_url", "").strip() or cfg["base_url"].strip()

    # Check for API key
    if not api_key or api_key == "YOUR_API_KEY":
        add_log_entry(
            level="ERROR",
            message=f"Agent '{agent_id}' execution rejected: No API Key configured",
            method="POST",
            path="/api/test-agent",
            status_code=400,
            details="Configure your API key in Settings.",
            log_type="AGENT",
            context={
                "provider": provider,
                "base_url": base_url,
                "agent_id": agent_id,
                "status_code": 400
            }
        )
        return JSONResponse({
            "success": False,
            "error": "No API key configured. Go to Settings and add your API key first."
        }, status_code=400)

    agents = load_agents_yaml()
    agent_info = agents.get(agent_id, {"role": "AI Specialist", "goal": "Assist user"})
    if not model:
        model = agent_info.get("llm", "")

    # Build system prompt from agent config
    system_prompt = (
        f"You are {agent_info.get('role', 'an AI assistant')}. "
        f"Your goal: {agent_info.get('goal', 'Help the user with their task.')} "
        f"Background: {agent_info.get('backstory', 'You are a dedicated specialist.')}"
    )

    # Determine target chat completions endpoint URL
    if base_url:
        chat_url = base_url.rstrip("/")
        if not chat_url.endswith("/chat/completions"):
            chat_url += "/chat/completions"
    elif "groq" in provider or (model and model.startswith("groq/")):
        chat_url = "https://api.groq.com/openai/v1/chat/completions"
    elif "ollama" in provider or (model and model.startswith("ollama/")):
        chat_url = (base_url or "http://localhost:11434").rstrip("/") + "/v1/chat/completions"
    elif "openrouter" in provider or (model and "/" in model and not model.startswith("openai/") and not model.startswith("gpt")):
        chat_url = "https://openrouter.ai/api/v1/chat/completions"
    else:
        chat_url = "https://api.openai.com/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Clean model ID (remove provider prefix)
    clean_model = model
    if clean_model.startswith("openai/"):
        clean_model = clean_model.replace("openai/", "", 1)
    elif clean_model.startswith("groq/"):
        clean_model = clean_model.replace("groq/", "", 1)
    elif clean_model.startswith("ollama/"):
        clean_model = clean_model.replace("ollama/", "", 1)

    request_body = {
        "model": clean_model or "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1024,
        "temperature": 0.7
    }

    start_t = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(chat_url, json=request_body, headers=headers)
            dur_ms = round((time.perf_counter() - start_t) * 1000, 1)

            if resp.status_code != 200:
                error_detail = resp.text[:1000]
                add_log_entry(
                    level="ERROR",
                    message=f"LLM API error ({resp.status_code}) calling agent '{agent_id}'",
                    method="POST",
                    path="/api/test-agent",
                    status_code=resp.status_code,
                    duration_ms=dur_ms,
                    details=error_detail,
                    log_type="AGENT",
                    context={
                        "target_url": chat_url,
                        "provider": provider,
                        "model": clean_model,
                        "agent_id": agent_id,
                        "status_code": resp.status_code,
                        "response_body": error_detail,
                        "prompt_preview": prompt[:120],
                        "auth_configured": bool(api_key),
                        "masked_key": f"{api_key[:6]}...{api_key[-4:]}" if len(api_key) > 10 else "configured"
                    }
                )
                return JSONResponse({
                    "success": False,
                    "error": f"LLM API error ({resp.status_code}): {error_detail}"
                }, status_code=resp.status_code)

            data = resp.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")
            usage = data.get("usage", {})
            p_tokens = usage.get("prompt_tokens", 0)
            c_tokens = usage.get("completion_tokens", 0)
            tot = usage.get("total_tokens", p_tokens + c_tokens)
            cost = round((p_tokens * 0.000002) + (c_tokens * 0.000006), 6)

            # Record to telemetry
            TELEMETRY_STORE["total_prompt_tokens"] += p_tokens
            TELEMETRY_STORE["total_completion_tokens"] += c_tokens
            TELEMETRY_STORE["total_tokens"] += tot
            TELEMETRY_STORE["estimated_cost_usd"] = round(TELEMETRY_STORE["estimated_cost_usd"] + cost, 6)

            record = {
                "id": f"run-{int(time.time())}",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "agent": agent_id,
                "model": clean_model,
                "prompt_tokens": p_tokens,
                "completion_tokens": c_tokens,
                "total_tokens": tot,
                "cost": cost,
                "status": "success",
                "topic": prompt[:40] + ("..." if len(prompt) > 40 else "")
            }
            TELEMETRY_STORE["history"].insert(0, record)
            TELEMETRY_STORE["history"] = TELEMETRY_STORE["history"][:30]

            add_log_entry(
                level="SUCCESS",
                message=f"Agent '{agent_id}' completed task ({tot} tokens, {dur_ms}ms)",
                method="POST",
                path="/api/test-agent",
                status_code=200,
                duration_ms=dur_ms,
                details=f"Model: {clean_model} via {chat_url}",
                log_type="AGENT",
                context={
                    "target_url": chat_url,
                    "provider": provider,
                    "model": clean_model,
                    "agent_id": agent_id,
                    "status_code": 200,
                    "token_metrics": {
                        "prompt_tokens": p_tokens,
                        "completion_tokens": c_tokens,
                        "total_tokens": tot
                    },
                    "output_preview": content[:300]
                }
            )

            return JSONResponse({
                "success": True,
                "agent_id": agent_id,
                "model": clean_model,
                "latency_ms": dur_ms,
                "output": content,
                "token_metrics": {
                    "prompt_tokens": p_tokens,
                    "completion_tokens": c_tokens,
                    "total_tokens": tot
                },
                "telemetry": {
                    "total_tokens": TELEMETRY_STORE["total_tokens"],
                    "total_cost": TELEMETRY_STORE["estimated_cost_usd"]
                }
            })
    except httpx.TimeoutException:
        add_log_entry(
            level="ERROR",
            message=f"Agent '{agent_id}' request timed out after 30s",
            method="POST",
            path="/api/test-agent",
            status_code=504,
            log_type="AGENT",
            context={"target_url": chat_url, "agent_id": agent_id, "timeout_sec": 30}
        )
        return JSONResponse({
            "success": False,
            "error": "Request timed out after 30 seconds. Try a faster model."
        }, status_code=504)
    except Exception as e:
        add_log_entry(
            level="ERROR",
            message=f"Exception executing agent '{agent_id}': {str(e)}",
            method="POST",
            path="/api/test-agent",
            status_code=500,
            details=str(e),
            log_type="AGENT",
            context={"target_url": chat_url, "agent_id": agent_id, "error": str(e)}
        )
        return JSONResponse({
            "success": False,
            "error": f"Failed to call LLM API: {str(e)}"
        }, status_code=500)

# ----------------- Logs Endpoints ----------------- #

async def api_get_logs(request: Request) -> JSONResponse:
    """Return operational logs and aggregate metrics."""
    level = request.query_params.get("level", "all").lower()
    limit = int(request.query_params.get("limit", "100"))
    search = request.query_params.get("search", "").lower()

    total = len(LOGS_STORE)
    errors = sum(1 for item in LOGS_STORE if item["level"] == "ERROR")
    warnings = sum(1 for item in LOGS_STORE if item["level"] == "WARNING")
    api_success = sum(1 for item in LOGS_STORE if item["level"] == "SUCCESS" and item["type"] == "API")
    api_failed = sum(1 for item in LOGS_STORE if item["level"] in ("ERROR", "WARNING") and item["type"] == "API")

    filtered = LOGS_STORE

    if level == "error":
        filtered = [l for l in filtered if l["level"] == "ERROR"]
    elif level == "warning":
        filtered = [l for l in filtered if l["level"] == "WARNING"]
    elif level == "success":
        filtered = [l for l in filtered if l["level"] == "SUCCESS"]
    elif level == "api":
        filtered = [l for l in filtered if l["type"] == "API"]
    elif level == "api_get":
        filtered = [l for l in filtered if l["type"] == "API" and l["method"] == "GET"]
    elif level == "api_post":
        filtered = [l for l in filtered if l["type"] == "API" and l["method"] == "POST"]

    if search:
        filtered = [
            l for l in filtered
            if search in l["message"].lower() or search in l["path"].lower() or search in (l.get("details") or "").lower()
        ]

    return JSONResponse({
        "logs": filtered[:limit],
        "stats": {
            "total": total,
            "errors": errors,
            "warnings": warnings,
            "api_success": api_success,
            "api_failed": api_failed
        }
    })

async def api_clear_logs(request: Request) -> JSONResponse:
    """Clear all in-memory logs."""
    LOGS_STORE.clear()
    add_log_entry(
        level="INFO",
        message="Logs buffer reset by user",
        method="SYSTEM",
        path="/api/logs/clear",
        status_code=200,
        log_type="SYSTEM"
    )
    return JSONResponse({"success": True, "message": "Logs cleared successfully"})

# Serve root index.html
async def serve_index(request: Request) -> HTMLResponse:
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return HTMLResponse(index_file.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>Hermes Dashboard Frontend building...</h1>")

# ----------------- Middleware ----------------- #

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Intercept all HTTP requests to log API GET/POST statuses, latencies, and errors."""
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Do not log GET /api/logs to avoid recursive polling noise
        if path == "/api/logs":
            return await call_next(request)

        start_time = time.perf_counter()
        method = request.method

        try:
            response = await call_next(request)
            dur_ms = (time.perf_counter() - start_time) * 1000
            status = response.status_code

            # Log all /api/ requests and any 4xx/5xx requests
            if path.startswith("/api/") or status >= 400:
                if status >= 500:
                    level = "ERROR"
                    msg = f"{method} {path} - Server Error ({status})"
                elif status >= 400:
                    level = "WARNING"
                    msg = f"{method} {path} - Client Warning ({status})"
                elif 200 <= status < 300:
                    level = "SUCCESS"
                    msg = f"{method} {path} - Succeeded ({status} OK)"
                else:
                    level = "INFO"
                    msg = f"{method} {path} - Status {status}"

                add_log_entry(
                    level=level,
                    message=msg,
                    method=method,
                    path=path,
                    status_code=status,
                    duration_ms=dur_ms,
                    details=f"Params: {str(request.query_params)}" if request.query_params else "",
                    log_type="API",
                    context={
                        "path": path,
                        "method": method,
                        "status_code": status,
                        "query_params": dict(request.query_params),
                        "duration_ms": round(dur_ms, 2)
                    }
                )
            return response
        except Exception as exc:
            dur_ms = (time.perf_counter() - start_time) * 1000
            add_log_entry(
                level="ERROR",
                message=f"{method} {path} - Server exception: {str(exc)}",
                method=method,
                path=path,
                status_code=500,
                duration_ms=dur_ms,
                details=str(exc),
                log_type="API",
                context={
                    "path": path,
                    "method": method,
                    "status_code": 500,
                    "error": str(exc),
                    "duration_ms": round(dur_ms, 2)
                }
            )
            raise exc

routes = [
    Route("/", serve_index),
    Route("/api/health", api_health, methods=["GET"]),
    Route("/api/keys/validate", api_validate_key, methods=["POST"]),
    Route("/api/models", api_models, methods=["GET", "POST"]),
    Route("/api/agents", api_get_agents, methods=["GET"]),
    Route("/api/agents", api_create_agent, methods=["POST"]),
    Route("/api/agents/{agent_id}", api_update_agent, methods=["PUT"]),
    Route("/api/agents/{agent_id}", api_delete_agent, methods=["DELETE"]),
    Route("/api/telemetry", api_telemetry, methods=["GET"]),
    Route("/api/telemetry/record", api_record_token_usage, methods=["POST"]),
    Route("/api/test-agent", api_test_agent_run, methods=["POST"]),
    Route("/api/logs", api_get_logs, methods=["GET"]),
    Route("/api/logs/clear", api_clear_logs, methods=["POST"]),
    Mount("/static", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    ),
    Middleware(RequestLoggingMiddleware)
]

app = Starlette(routes=routes, middleware=middleware)

def run(host: str = "127.0.0.1", port: int = 8080):
    """Run server directly."""
    print(f"\n=======================================================")
    print(f"  AURELIA AI MISSION CONTROL // ONLINE")
    print(f"  Dashboard URL: http://{host}:{port}")
    print(f"=======================================================\n")
    uvicorn.run(app, host=host, port=port, log_level="info")

if __name__ == "__main__":
    run()
