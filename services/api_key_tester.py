"""API Key Tester - Kiểm tra API key còn hoạt động không."""
import time
import requests


def test_openai_key(api_key: str) -> dict:
    """Test OpenAI API key bằng cách gọi GET /v1/models."""
    url = "https://api.openai.com/v1/models"
    headers = {"Authorization": f"Bearer {api_key}"}
    start = time.time()
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        latency = int((time.time() - start) * 1000)
        if resp.status_code == 200:
            models = [m["id"] for m in resp.json().get("data", [])[:5]]
            return {"alive": True, "latency_ms": latency, "error": None, "models": models}
        else:
            error = resp.json().get("error", {}).get("message", resp.text[:200])
            return {"alive": False, "latency_ms": latency, "error": error, "models": []}
    except requests.RequestException as e:
        latency = int((time.time() - start) * 1000)
        return {"alive": False, "latency_ms": latency, "error": str(e), "models": []}


def test_google_key(api_key: str) -> dict:
    """Test Google Gemini API key bằng cách gọi GET /v1/models."""
    url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
    start = time.time()
    try:
        resp = requests.get(url, timeout=10)
        latency = int((time.time() - start) * 1000)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])[:5]]
            return {"alive": True, "latency_ms": latency, "error": None, "models": models}
        else:
            error = resp.json().get("error", {}).get("message", resp.text[:200])
            return {"alive": False, "latency_ms": latency, "error": error, "models": []}
    except requests.RequestException as e:
        latency = int((time.time() - start) * 1000)
        return {"alive": False, "latency_ms": latency, "error": str(e), "models": []}


def test_anthropic_key(api_key: str) -> dict:
    """Test Anthropic API key bằng cách gọi POST /v1/messages với payload nhỏ."""
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": "claude-3-haiku-20240307",
        "max_tokens": 1,
        "messages": [{"role": "user", "content": "ping"}],
    }
    start = time.time()
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        latency = int((time.time() - start) * 1000)
        if resp.status_code in (200, 201):
            return {"alive": True, "latency_ms": latency, "error": None, "models": ["claude-3-haiku"]}
        else:
            error = resp.json().get("error", {}).get("message", resp.text[:200])
            return {"alive": False, "latency_ms": latency, "error": error, "models": []}
    except requests.RequestException as e:
        latency = int((time.time() - start) * 1000)
        return {"alive": False, "latency_ms": latency, "error": str(e), "models": []}


# Map provider name -> test function
TESTERS = {
    "openai": test_openai_key,
    "google": test_google_key,
    "anthropic": test_anthropic_key,
}


def test_api_key(provider: str, api_key: str) -> dict:
    """Test API key dựa trên provider. Trả về dict với alive, latency_ms, error, models."""
    tester = TESTERS.get(provider)
    if not tester:
        return {"alive": False, "latency_ms": 0, "error": f"Provider '{provider}' không hỗ trợ test tự động.", "models": []}
    return tester(api_key)
