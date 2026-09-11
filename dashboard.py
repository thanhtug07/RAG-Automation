"""Dashboard Quản lý Agent & API Keys."""
import json
import os
import uuid
from datetime import datetime

from flask import Flask, flash, redirect, render_template, request, url_for

from services.api_key_tester import test_api_key

app = Flask(__name__)
app.secret_key = "agent-dashboard-secret-key-change-in-production"

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
AGENTS_FILE = os.path.join(DATA_DIR, "agents_config.json")
API_KEYS_FILE = os.path.join(DATA_DIR, "api_keys.json")

AVAILABLE_TOOLS = [
    "OrderSearchTool",
    "ProductSearchTool",
    "RevenueAnalysisTool",
    "PolicySearchTool",
]

AVAILABLE_PERMISSIONS = {
    "data": [
        {"value": "read_orders", "desc": "Đọc dữ liệu đơn hàng"},
        {"value": "read_products", "desc": "Đọc dữ liệu sản phẩm"},
        {"value": "read_policies", "desc": "Đọc dữ liệu chính sách"},
        {"value": "write_orders", "desc": "Ghi/sửa đơn hàng"},
        {"value": "write_products", "desc": "Ghi/sửa sản phẩm"},
        {"value": "analyze_revenue", "desc": "Phân tích doanh thu"},
    ],
    "system": [
        {"value": "delegate_tasks", "desc": "Ủy quyền task cho agent khác"},
        {"value": "manage_agents", "desc": "Quản lý cấu hình agents"},
        {"value": "manage_api_keys", "desc": "Quản lý API keys"},
        {"value": "execute_queries", "desc": "Thực thi truy vấn hệ thống"},
    ],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(filepath: str) -> list:
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(filepath: str, data: list):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.context_processor
def inject_now():
    return {"now": datetime.now().strftime("%d/%m/%Y %H:%M")}


# ---------------------------------------------------------------------------
# Index
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    agents = _load_json(AGENTS_FILE)
    api_keys = _load_json(API_KEYS_FILE)
    stats = {
        "total_agents": len(agents),
        "active_agents": sum(1 for a in agents if a.get("is_active")),
        "total_keys": len(api_keys),
        "alive_keys": sum(1 for k in api_keys if k.get("last_test_result") is True),
    }
    return render_template(
        "index.html",
        stats=stats,
        recent_agents=agents[:5],
        recent_keys=api_keys[:5],
    )


# ---------------------------------------------------------------------------
# Agents CRUD
# ---------------------------------------------------------------------------

@app.route("/agents")
def agents_list():
    agents = _load_json(AGENTS_FILE)
    return render_template("agents.html", agents=agents)


@app.route("/agents/create", methods=["GET", "POST"])
def agent_create():
    if request.method == "POST":
        agents = _load_json(AGENTS_FILE)
        agent_id = request.form["id"].strip()

        if any(a["id"] == agent_id for a in agents):
            flash(f"Agent ID '{agent_id}' đã tồn tại!", "danger")
            return redirect(url_for("agent_create"))

        new_agent = {
            "id": agent_id,
            "name": request.form["name"].strip(),
            "role": request.form["role"].strip(),
            "goal": request.form["goal"].strip(),
            "backstory": request.form["backstory"].strip(),
            "tools": request.form.getlist("tools"),
            "allow_delegation": "allow_delegation" in request.form,
            "permissions": [],
            "is_active": "is_active" in request.form,
            "created_at": datetime.now().isoformat(),
        }
        agents.append(new_agent)
        _save_json(AGENTS_FILE, agents)
        flash(f"Đã tạo agent '{new_agent['name']}' thành công!", "success")
        return redirect(url_for("agents_list"))

    return render_template(
        "agent_form.html", agent=None, available_tools=AVAILABLE_TOOLS
    )


@app.route("/agents/<agent_id>/edit", methods=["GET", "POST"])
def agent_edit(agent_id):
    agents = _load_json(AGENTS_FILE)
    agent = next((a for a in agents if a["id"] == agent_id), None)
    if not agent:
        flash("Không tìm thấy agent!", "danger")
        return redirect(url_for("agents_list"))

    if request.method == "POST":
        agent["name"] = request.form["name"].strip()
        agent["role"] = request.form["role"].strip()
        agent["goal"] = request.form["goal"].strip()
        agent["backstory"] = request.form["backstory"].strip()
        agent["tools"] = request.form.getlist("tools")
        agent["allow_delegation"] = "allow_delegation" in request.form
        agent["is_active"] = "is_active" in request.form
        _save_json(AGENTS_FILE, agents)
        flash(f"Đã cập nhật agent '{agent['name']}'!", "success")
        return redirect(url_for("agents_list"))

    return render_template(
        "agent_form.html", agent=agent, available_tools=AVAILABLE_TOOLS
    )


@app.route("/agents/<agent_id>/delete", methods=["POST"])
def agent_delete(agent_id):
    agents = _load_json(AGENTS_FILE)
    agents = [a for a in agents if a["id"] != agent_id]
    _save_json(AGENTS_FILE, agents)
    flash("Đã xóa agent!", "success")
    return redirect(url_for("agents_list"))


@app.route("/agents/<agent_id>/permissions", methods=["GET", "POST"])
def agent_permissions(agent_id):
    agents = _load_json(AGENTS_FILE)
    agent = next((a for a in agents if a["id"] == agent_id), None)
    if not agent:
        flash("Không tìm thấy agent!", "danger")
        return redirect(url_for("agents_list"))

    if request.method == "POST":
        agent["permissions"] = request.form.getlist("permissions")
        _save_json(AGENTS_FILE, agents)
        flash(f"Đã cập nhật quyền cho '{agent['name']}'!", "success")
        return redirect(url_for("agents_list"))

    return render_template(
        "agent_permissions.html",
        agent=agent,
        available_permissions=AVAILABLE_PERMISSIONS,
    )


# ---------------------------------------------------------------------------
# API Keys CRUD + Test
# ---------------------------------------------------------------------------

@app.route("/api-keys")
def api_keys_list():
    api_keys = _load_json(API_KEYS_FILE)
    return render_template("api_keys.html", api_keys=api_keys)


@app.route("/api-keys/create", methods=["GET", "POST"])
def api_key_create():
    if request.method == "POST":
        api_keys = _load_json(API_KEYS_FILE)
        new_key = {
            "id": f"key_{uuid.uuid4().hex[:8]}",
            "name": request.form["name"].strip(),
            "provider": request.form["provider"],
            "api_key": request.form["api_key"].strip(),
            "model": request.form.get("model", "").strip(),
            "is_active": "is_active" in request.form,
            "last_tested": None,
            "last_test_result": None,
            "created_at": datetime.now().isoformat(),
        }
        api_keys.append(new_key)
        _save_json(API_KEYS_FILE, api_keys)
        flash(f"Đã thêm API key '{new_key['name']}'!", "success")
        return redirect(url_for("api_keys_list"))

    return render_template("api_key_form.html", api_key=None)


@app.route("/api-keys/<key_id>/edit", methods=["GET", "POST"])
def api_key_edit(key_id):
    api_keys = _load_json(API_KEYS_FILE)
    api_key = next((k for k in api_keys if k["id"] == key_id), None)
    if not api_key:
        flash("Không tìm thấy API key!", "danger")
        return redirect(url_for("api_keys_list"))

    if request.method == "POST":
        api_key["name"] = request.form["name"].strip()
        api_key["provider"] = request.form["provider"]
        api_key["api_key"] = request.form["api_key"].strip()
        api_key["model"] = request.form.get("model", "").strip()
        api_key["is_active"] = "is_active" in request.form
        _save_json(API_KEYS_FILE, api_keys)
        flash(f"Đã cập nhật API key '{api_key['name']}'!", "success")
        return redirect(url_for("api_keys_list"))

    return render_template("api_key_form.html", api_key=api_key)


@app.route("/api-keys/<key_id>/delete", methods=["POST"])
def api_key_delete(key_id):
    api_keys = _load_json(API_KEYS_FILE)
    api_keys = [k for k in api_keys if k["id"] != key_id]
    _save_json(API_KEYS_FILE, api_keys)
    flash("Đã xóa API key!", "success")
    return redirect(url_for("api_keys_list"))


@app.route("/api-keys/<key_id>/test", methods=["POST"])
def api_key_test(key_id):
    api_keys = _load_json(API_KEYS_FILE)
    api_key = next((k for k in api_keys if k["id"] == key_id), None)
    if not api_key:
        flash("Không tìm thấy API key!", "danger")
        return redirect(url_for("api_keys_list"))

    result = test_api_key(api_key["provider"], api_key["api_key"])
    api_key["last_tested"] = datetime.now().strftime("%d/%m/%Y %H:%M")
    api_key["last_test_result"] = result["alive"]
    _save_json(API_KEYS_FILE, api_keys)

    if result["alive"]:
        flash(
            f"✅ Key '{api_key['name']}' ALIVE! Latency: {result['latency_ms']}ms",
            "success",
        )
    else:
        flash(
            f"❌ Key '{api_key['name']}' DEAD! Lỗi: {result['error']}",
            "danger",
        )
    return redirect(url_for("api_keys_list"))


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
