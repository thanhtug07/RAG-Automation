// Aurelia AI — Agent Mission Control UI Logic

let agentsCache = [];
let modelsCache = [];
let activeModel = "nousresearch/hermes-3-llama-3.1-405b";

// Agent status colors for right panel
const AGENT_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];

// DOM References
const healthPill = document.getElementById("healthPill");
const healthDot = document.getElementById("healthDot");
const healthText = document.getElementById("healthText");
const healthLatency = document.getElementById("healthLatency");

const kpiStatus = document.getElementById("kpiStatus");
const kpiProvider = document.getElementById("kpiProvider");
const kpiLatency = document.getElementById("kpiLatency");
const kpiModel = document.getElementById("kpiModel");
const kpiModelProvider = document.getElementById("kpiModelProvider");
const kpiTotalTokens = document.getElementById("kpiTotalTokens");
const kpiPromptTokens = document.getElementById("kpiPromptTokens");
const kpiCompTokens = document.getElementById("kpiCompTokens");
const kpiAgentCount = document.getElementById("kpiAgentCount");

const providerSelect = document.getElementById("providerSelect");
const customUrlGroup = document.getElementById("customUrlGroup");
const customBaseUrl = document.getElementById("customBaseUrl");
const apiKeyInput = document.getElementById("apiKeyInput");
const btnToggleKey = document.getElementById("btnToggleKey");
const chkSaveEnv = document.getElementById("chkSaveEnv");
const btnValidateAndFetch = document.getElementById("btnValidateAndFetch");
const pingResultBox = document.getElementById("pingResultBox");
const pingBadge = document.getElementById("pingBadge");
const pingLatency = document.getElementById("pingLatency");
const pingMsg = document.getElementById("pingMsg");

const modelListContainer = document.getElementById("modelListContainer");
const modelSearchInput = document.getElementById("modelSearchInput");
const modelCountBadge = document.getElementById("modelCountBadge");

const agentCardGrid = document.getElementById("agentCardGrid");
const btnOpenCreateAgent = document.getElementById("btnOpenCreateAgent");
const btnSyncYaml = document.getElementById("btnSyncYaml");

const agentModal = document.getElementById("agentModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelModal = document.getElementById("btnCancelModal");
const agentForm = document.getElementById("agentForm");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const formIsEdit = document.getElementById("formIsEdit");
const agentIdInput = document.getElementById("agentIdInput");
const agentRoleInput = document.getElementById("agentRoleInput");
const agentGoalInput = document.getElementById("agentGoalInput");
const agentBackstoryInput = document.getElementById("agentBackstoryInput");
const agentModelSelect = document.getElementById("agentModelSelect");
const btnToggleCustomModel = document.getElementById("btnToggleCustomModel");
const customModelGroup = document.getElementById("customModelGroup");
const agentCustomModelInput = document.getElementById("agentCustomModelInput");

const testAgentSelect = document.getElementById("testAgentSelect");
const agentAssignedModelText = document.getElementById("agentAssignedModelText");
const testPromptInput = document.getElementById("testPromptInput");
const btnRunTest = document.getElementById("btnRunTest");
const terminalOutput = document.getElementById("terminalOutput");

// Right Panel
const rpAgentsList = document.getElementById("rpAgentsList");

// Logs View DOM References
const navErrorBadge = document.getElementById("navErrorBadge");
const kpiTotalLogs = document.getElementById("kpiTotalLogs");
const kpiApiSuccess = document.getElementById("kpiApiSuccess");
const kpiWarnings = document.getElementById("kpiWarnings");
const kpiErrors = document.getElementById("kpiErrors");

const countAll = document.getElementById("countAll");
const countErrors = document.getElementById("countErrors");
const countWarnings = document.getElementById("countWarnings");
const countApiGet = document.getElementById("countApiGet");
const countApiPost = document.getElementById("countApiPost");
const countSuccess = document.getElementById("countSuccess");

const logTableBody = document.getElementById("logTableBody");
const logSearchInput = document.getElementById("logSearchInput");
const btnToggleAutoRefresh = document.getElementById("btnToggleAutoRefresh");
const refreshDot = document.getElementById("refreshDot");
const refreshLabel = document.getElementById("refreshLabel");
const btnRefreshLogs = document.getElementById("btnRefreshLogs");
const btnClearLogs = document.getElementById("btnClearLogs");

let activeLogFilter = "all";
let logAutoRefreshInterval = null;
let isAutoRefreshActive = true;
let logsCache = [];

// ----------------------------------------------------------------
// Initialization
// ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  initKeyToggle();
  initProviderChange();
  initModal();
  populateAgentModelSelect();
  initSearch();
  initAvatarPhoto();
  initGlobalSearch();
  initChromePrefs();
  initChatExtras();
  // Deep-link (?view=analyticsView) wins; otherwise restore last view on reload.
  try {
    var deepView = new URLSearchParams(window.location.search).get("view");
    var knownViews = ["chatView", "agentsView", "analyticsView", "modelsView", "logsView", "settingsView"];
    var storedView = null;
    try { storedView = sessionStorage.getItem("agentos.dash.view"); } catch (err2) { /* ignore */ }
    var targetView = (deepView && knownViews.indexOf(deepView) !== -1) ? deepView
      : (storedView && knownViews.indexOf(storedView) !== -1) ? storedView : "chatView";
    if (targetView !== "chatView") switchView(targetView);
  } catch (err) { /* default chat view */ }
  initLogsView();
  initLogDetailModal();
  loadSavedSettings();
  setWelcomeTime();

  // Auto-resize chat textarea and allow Enter to send
  testPromptInput.addEventListener("input", autoResizeTextarea);
  testPromptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      btnRunTest.click();
    }
  });

  // Load initial state
  checkHealth();
  fetchModels();
  fetchAgents();
  fetchTelemetry();
  fetchLogs();
  startLogAutoRefresh();

  // Periodic health check
  setInterval(checkHealth, 15000);
});

function setWelcomeTime() {
  const el = document.getElementById("welcomeTime");
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}

function autoResizeTextarea() {
  testPromptInput.style.height = "auto";
  testPromptInput.style.height = Math.min(testPromptInput.scrollHeight, 120) + "px";
}

// ----------------------------------------------------------------
// Toast Notifications
// ----------------------------------------------------------------
function showToast(msg, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "⚠"}</span>
    <span>${msg}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ----------------------------------------------------------------
// Sidebar Navigation
// ----------------------------------------------------------------
function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      document.querySelectorAll(".view-panel").forEach(v => v.classList.remove("active"));

      item.classList.add("active");
      const target = document.getElementById(item.dataset.view);
      if (target) target.classList.add("active");
      if (item.dataset.view === "logsView") {
        fetchLogs();
      }
    });
  });

  // New Task button → switch to chat view
  document.getElementById("btnNewTask").addEventListener("click", () => {
    navItems.forEach(n => n.classList.remove("active"));
    document.querySelectorAll(".view-panel").forEach(v => v.classList.remove("active"));
    document.querySelector('[data-view="chatView"]').classList.add("active");
    document.getElementById("chatView").classList.add("active");
    testPromptInput.value = "";
    testPromptInput.focus();
  });
}

// ----------------------------------------------------------------
// Key Toggle & Provider
// ----------------------------------------------------------------
function initKeyToggle() {
  btnToggleKey.addEventListener("click", () => {
    apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
  });
}

function initProviderChange() {
  providerSelect.addEventListener("change", () => {
    const val = providerSelect.value;
    localStorage.setItem("aurelia_provider", val);
    if (val === "custom" || val === "ollama") {
      customUrlGroup.style.display = "block";
      customBaseUrl.placeholder = val === "ollama" ? "http://localhost:11434" : "https://api.your-endpoint.com/v1";
    } else {
      customUrlGroup.style.display = "none";
    }
    checkHealth();
  });
}

function loadSavedSettings() {
  const savedKey = localStorage.getItem("aurelia_api_key");
  const savedProvider = localStorage.getItem("aurelia_provider");
  const savedBaseUrl = localStorage.getItem("aurelia_base_url");

  if (savedKey) {
    apiKeyInput.value = savedKey;
  }
  if (savedProvider) {
    providerSelect.value = savedProvider;
    if (savedProvider === "custom" || savedProvider === "ollama") {
      customUrlGroup.style.display = "block";
      customBaseUrl.placeholder = savedProvider === "ollama" ? "http://localhost:11434" : "https://api.your-endpoint.com/v1";
    }
  }
  if (savedBaseUrl) {
    customBaseUrl.value = savedBaseUrl;
  }

  apiKeyInput.addEventListener("input", () => {
    const val = apiKeyInput.value.trim();
    if (val) localStorage.setItem("aurelia_api_key", val);
  });
  customBaseUrl.addEventListener("input", () => {
    const val = customBaseUrl.value.trim();
    if (val) localStorage.setItem("aurelia_base_url", val);
  });
}

// ----------------------------------------------------------------
// Health Check
// ----------------------------------------------------------------
async function checkHealth() {
  const provider = providerSelect.value;
  try {
    const data = await window.AgentApi.system.health({ provider: provider });

    if (data.status === "healthy") {
      healthDot.className = "status-dot healthy";
      healthDot.style.background = "";
      healthDot.style.boxShadow = "";
      healthText.textContent = "Online";
      healthLatency.textContent = `${data.latency_ms}ms`;
      healthLatency.style.display = "";
      kpiStatus.textContent = "ONLINE";
      kpiProvider.textContent = provider.toUpperCase();
      kpiLatency.textContent = `RTT: ${data.latency_ms}ms`;

      if (data.api_key_configured) {
        document.getElementById("headerKeyStatus").textContent = `Key: ${data.masked_key}`;
        document.getElementById("keyConfiguredNotice").innerHTML = `Configured in .env: <code>${data.masked_key}</code>`;
      }

      if (data.base_url && !customBaseUrl.value) {
        customBaseUrl.value = data.base_url;
        localStorage.setItem("aurelia_base_url", data.base_url);
        if (data.provider === "custom" || data.provider === "ollama") {
          customUrlGroup.style.display = "block";
        }
      }
    } else if (data.status === "no_key") {
      healthDot.className = "status-dot";
      healthDot.style.background = "#F59E0B";
      healthDot.style.boxShadow = "none";
      healthText.textContent = "No API Key";
      healthLatency.style.display = "none";
      kpiStatus.textContent = "NO KEY";
      kpiProvider.textContent = provider.toUpperCase();
      kpiLatency.textContent = "—";
      document.getElementById("headerKeyStatus").textContent = "Key: Not configured";
    } else {
      setHealthDegraded("Degraded");
    }
  } catch (err) {
    setHealthDegraded("Offline");
  } finally {
    fetchLogs();
  }
}

function setHealthDegraded(msg) {
  healthDot.className = "status-dot";
  healthDot.style.background = "#EF4444";
  healthDot.style.boxShadow = "0 0 6px #EF4444";
  healthText.textContent = msg;
  kpiStatus.textContent = msg.toUpperCase();
}

// ----------------------------------------------------------------
// Validate Key
// ----------------------------------------------------------------
btnValidateAndFetch.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  const provider = providerSelect.value;
  const base_url = customBaseUrl.value.trim();
  const save_to_env = chkSaveEnv.checked;

  btnValidateAndFetch.disabled = true;
  btnValidateAndFetch.innerHTML = `<span>Validating...</span>`;

  try {
    const valData = await window.AgentApi.system.validateKey({ api_key: key, provider, base_url, save_to_env });

    pingResultBox.style.display = "block";
    if (valData.valid) {
      pingResultBox.className = "ping-result-box";
      pingBadge.textContent = "ONLINE 200 OK";
      pingLatency.textContent = `${valData.latency_ms}ms`;
      pingMsg.textContent = valData.message || "Provider connection active.";
      localStorage.setItem("aurelia_api_key", key);
      localStorage.setItem("aurelia_provider", provider);
      if (base_url) localStorage.setItem("aurelia_base_url", base_url);
      showToast("API Key validated and saved successfully!");
      checkHealth();
    } else {
      pingResultBox.className = "ping-result-box error";
      pingBadge.textContent = `ERROR ${valData.status_code || 400}`;
      pingLatency.textContent = `${valData.latency_ms || '--'}ms`;
      pingMsg.textContent = valData.error || "Authentication failed.";
      showToast(valData.error || "Validation failed.", "error");
    }
    await fetchModels(key, provider, base_url);
  } catch (err) {
    const offline = !err || err.status === 0 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT";
    pingResultBox.style.display = "block";
    pingResultBox.className = "ping-result-box error";
    if (offline) {
      pingBadge.textContent = "CONN FAILED";
      pingMsg.textContent = "Cannot reach server.";
      showToast("Network error validating key", "error");
    } else {
      pingBadge.textContent = `ERROR ${err.status || 400}`;
      pingMsg.textContent = err.message || "Authentication failed.";
      showToast(err.message || "Validation failed.", "error");
    }
    pingLatency.textContent = "--";
  } finally {
    btnValidateAndFetch.disabled = false;
    btnValidateAndFetch.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Validate & Fetch Models</span>
    `;
    fetchLogs();
  }
});

// ----------------------------------------------------------------
// Models
// ----------------------------------------------------------------
async function fetchModels(key = "", provider = "", base_url = "") {
  try {
    const data = await window.AgentApi.system.getModels({ api_key: key, provider: provider || providerSelect.value, base_url });
    modelsCache = data.models || [];
    renderModelList(modelsCache, data.message || "");
    updateModelDropdowns(modelsCache);
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

function renderModelList(models, message) {
  modelCountBadge.textContent = `${models.length} ${chromeT("models.count")}`;
  modelListContainer.innerHTML = "";

  if (models.length === 0) {
    modelListContainer.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px; display: block; opacity: 0.4;">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <p>${message || "No models available."}</p>
        <p style="margin-top:6px; font-size: 0.78rem;">Go to <strong>Settings</strong> → add your API key → click <strong>Validate & Fetch Models</strong></p>
      </div>
    `;
    return;
  }

  models.forEach(m => {
    const item = document.createElement("div");
    item.className = `model-item ${m.id === activeModel ? "active" : ""}`;
    const isHermes = m.id.toLowerCase().includes("hermes");

    item.innerHTML = `
      <div class="model-info-main">
        <span class="model-title">${m.name}</span>
        <span class="model-id-code">${m.id}</span>
      </div>
      <div class="model-badge-right ${isHermes ? "hermes" : ""}">
        ${m.badge || (isHermes ? "HERMES" : m.provider)}
      </div>
    `;

    item.addEventListener("click", () => selectModel(m));
    modelListContainer.appendChild(item);
  });
}

function selectModel(m) {
  activeModel = m.id;
  kpiModel.textContent = m.name;
  kpiModelProvider.textContent = m.provider || "Nous Research";
  showToast(`Switched model to: ${m.name}`);
  renderModelList(modelsCache);
}

const CURATED_MODELS = [
  {
    group: "OpenAI Models",
    models: [
      { id: "openai/gpt-4o", name: "GPT-4o (Flagship Multimodal)" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (Fast & Cost-Effective - Recommended)" },
      { id: "openai/o1", name: "o1 (Advanced Reasoning)" },
      { id: "openai/o3-mini", name: "o3-mini (High Speed Reasoning)" },
      { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" }
    ]
  },
  {
    group: "OpenRouter & Open Weights",
    models: [
      { id: "nousresearch/hermes-3-llama-3.1-405b", name: "Hermes 3 Llama 3.1 405B (Agent Flagship)" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
      { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (Reasoning)" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3" },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B Instruct" }
    ]
  },
  {
    group: "Groq High-Speed",
    models: [
      { id: "groq/llama-3.3-70b-versatile", name: "Groq Llama 3.3 70B Versatile" },
      { id: "groq/llama-3.1-8b-instant", name: "Groq Llama 3.1 8B Instant" },
      { id: "groq/mixtral-8x7b-32768", name: "Groq Mixtral 8x7B (32k)" }
    ]
  },
  {
    group: "Ollama (Local)",
    models: [
      { id: "ollama/llama3.2", name: "Ollama Llama 3.2" },
      { id: "ollama/llama3.3", name: "Ollama Llama 3.3" },
      { id: "ollama/qwen2.5-coder", name: "Ollama Qwen 2.5 Coder" },
      { id: "ollama/deepseek-r1", name: "Ollama DeepSeek R1 Local" },
      { id: "ollama/mistral", name: "Ollama Mistral 7B" }
    ]
  }
];

function populateAgentModelSelect(selectedLlm = "") {
  if (!agentModelSelect) return;

  const currentVal = selectedLlm || agentModelSelect.value || activeModel || "openai/gpt-4o-mini";
  agentModelSelect.innerHTML = "";

  // 1. If currently assigned model is custom or unique, display it in dedicated group
  const isKnown = (modelsCache || []).some(m => m.id === currentVal) ||
    CURATED_MODELS.some(g => g.models.some(m => m.id === currentVal));

  if (currentVal && !isKnown && currentVal !== "__custom__") {
    const curGroup = document.createElement("optgroup");
    curGroup.label = "Current Agent Model";
    const curOpt = document.createElement("option");
    curOpt.value = currentVal;
    curOpt.textContent = `${currentVal} (Current Assigned Model)`;
    curGroup.appendChild(curOpt);
    agentModelSelect.appendChild(curGroup);
  }

  // 2. Discovered models from live connected provider
  if (modelsCache && modelsCache.length > 0) {
    const liveGroup = document.createElement("optgroup");
    liveGroup.label = `Discovered from Provider (${modelsCache.length} Available)`;
    modelsCache.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.name} (${m.id})`;
      liveGroup.appendChild(opt);
    });
    agentModelSelect.appendChild(liveGroup);
  }

  // 3. Curated standard models
  CURATED_MODELS.forEach(grp => {
    const groupEl = document.createElement("optgroup");
    groupEl.label = grp.group;
    grp.models.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      groupEl.appendChild(opt);
    });
    agentModelSelect.appendChild(groupEl);
  });

  // 4. Custom Specification Option
  const customGroup = document.createElement("optgroup");
  customGroup.label = "Custom Specification";
  const customOpt = document.createElement("option");
  customOpt.value = "__custom__";
  customOpt.textContent = "✎ Enter Custom Model ID...";
  customGroup.appendChild(customOpt);
  agentModelSelect.appendChild(customGroup);

  // 5. Select right item & update toggle state
  const optionExists = Array.from(agentModelSelect.options).some(opt => opt.value === currentVal);
  if (optionExists) {
    agentModelSelect.value = currentVal;
    if (customModelGroup) customModelGroup.style.display = "none";
    if (btnToggleCustomModel) {
      btnToggleCustomModel.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px;">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span>Custom Model</span>
      `;
    }
  } else if (currentVal === "__custom__" || (currentVal && !isKnown)) {
    agentModelSelect.value = "__custom__";
    if (customModelGroup) customModelGroup.style.display = "block";
    if (agentCustomModelInput && currentVal !== "__custom__") {
      agentCustomModelInput.value = currentVal;
    }
    if (btnToggleCustomModel) {
      btnToggleCustomModel.innerHTML = "<span>Select from Presets</span>";
    }
  } else {
    agentModelSelect.value = "openai/gpt-4o-mini";
    if (!agentModelSelect.value && agentModelSelect.options.length > 0) {
      agentModelSelect.selectedIndex = 0;
    }
    if (customModelGroup) customModelGroup.style.display = "none";
  }
}

function updateModelDropdowns(models) {
  populateAgentModelSelect(agentModelSelect ? agentModelSelect.value : "");
}

function initSearch() {
  modelSearchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) { renderModelList(modelsCache); return; }
    const filtered = modelsCache.filter(m =>
      m.id.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      (m.provider && m.provider.toLowerCase().includes(q))
    );
    renderModelList(filtered);
  });
}

// ----------------------------------------------------------------
// Agents
// ----------------------------------------------------------------
async function fetchAgents() {
  try {
    const data = await window.AgentApi.agents.getAgents();
    agentsCache = data.agents || [];
    renderAgentCards(agentsCache);
    renderRightPanelAgents(agentsCache);
    updateAgentSelectDropdown(agentsCache);
    kpiAgentCount.textContent = agentsCache.length;
  } catch (err) {
    agentCardGrid.innerHTML = `<div class="loading-placeholder">${chromeT("agents.load_error")}</div>`;
  }
}

function renderAgentCards(agents) {
  agentCardGrid.innerHTML = "";

  if (agents.length === 0) {
    agentCardGrid.innerHTML = `
      <div class="agent-mission-card" style="grid-column: 1 / -1; text-align: center;">
        <p style="color: var(--text-muted);">No agents found. Click "Add Agent" to deploy one.</p>
      </div>
    `;
    return;
  }

  agents.forEach(ag => {
    const card = document.createElement("div");
    card.className = "agent-mission-card";

    card.innerHTML = `
      <div>
        <div class="agent-card-header">
          <span class="agent-id-tag">${ag.id.toUpperCase()}</span>
          <span class="badge-mini">CREW AGENT</span>
        </div>
        <div class="agent-role-title">${escapeHtml(ag.role)}</div>

        <div class="agent-detail-section">
          <span class="detail-label">Goal</span>
          <p class="detail-text goal-text">${escapeHtml(ag.goal)}</p>

          <span class="detail-label">Backstory</span>
          <p class="detail-text">${escapeHtml(ag.backstory || "No backstory configured.")}</p>
        </div>
      </div>

      <div class="agent-card-footer">
        <span class="agent-model-badge">${escapeHtml(ag.llm || "gpt-4o-mini")}</span>
        <div class="agent-actions">
          <button class="btn btn-secondary btn-sm edit-agent-btn" data-id="${ag.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-agent-btn" data-id="${ag.id}">Delete</button>
        </div>
      </div>
    `;

    card.querySelector(".edit-agent-btn").addEventListener("click", () => openEditAgentModal(ag));
    card.querySelector(".delete-agent-btn").addEventListener("click", () => deleteAgent(ag.id));
    agentCardGrid.appendChild(card);
  });
}

function renderRightPanelAgents(agents) {
  rpAgentsList.innerHTML = "";
  const statuses = ["In progress", "In progress", "Queued", "Pending"];

  agents.forEach((ag, i) => {
    const color = AGENT_COLORS[i % AGENT_COLORS.length];
    const status = statuses[i % statuses.length];
    const statusClass = status === "In progress" ? "in-progress" : status.toLowerCase();

    const el = document.createElement("div");
    el.className = "rp-agent-item";
    el.innerHTML = `
      <span class="rp-agent-dot" style="background:${color}"></span>
      <span class="rp-agent-name">${escapeHtml(ag.role)}</span>
      <span class="rp-agent-status ${statusClass}">${status}</span>
    `;
    rpAgentsList.appendChild(el);
  });
}

function updateAgentSelectDropdown(agents) {
  testAgentSelect.innerHTML = "";
  agents.forEach(ag => {
    const opt = document.createElement("option");
    opt.value = ag.id;
    opt.dataset.llm = ag.llm || "";
    opt.textContent = `${ag.id.toUpperCase()} — ${ag.role}`;
    testAgentSelect.appendChild(opt);
  });

  function refreshActiveModelBadge() {
    const selectedOpt = testAgentSelect.selectedOptions[0];
    if (selectedOpt && agentAssignedModelText) {
      const assignedLlm = selectedOpt.dataset.llm || "Auto (Configured with Agent)";
      agentAssignedModelText.textContent = `Model: ${assignedLlm}`;
    }
  }

  testAgentSelect.onchange = refreshActiveModelBadge;
  refreshActiveModelBadge();
}

// ----------------------------------------------------------------
// Modal
// ----------------------------------------------------------------
function initModal() {
  // Toggle between select and custom input
  if (agentModelSelect) {
    agentModelSelect.addEventListener("change", () => {
      if (agentModelSelect.value === "__custom__") {
        if (customModelGroup) customModelGroup.style.display = "block";
        if (agentCustomModelInput) agentCustomModelInput.focus();
        if (btnToggleCustomModel) btnToggleCustomModel.innerHTML = "<span>Select from Presets</span>";
      } else {
        if (customModelGroup) customModelGroup.style.display = "none";
        if (btnToggleCustomModel) {
          btnToggleCustomModel.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px;">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>Custom Model</span>
          `;
        }
      }
    });
  }

  if (btnToggleCustomModel) {
    btnToggleCustomModel.addEventListener("click", () => {
      const isCustomVisible = customModelGroup && customModelGroup.style.display !== "none";
      if (isCustomVisible) {
        if (customModelGroup) customModelGroup.style.display = "none";
        if (agentModelSelect) agentModelSelect.value = "openai/gpt-4o-mini";
        btnToggleCustomModel.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px;">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>Custom Model</span>
        `;
      } else {
        if (customModelGroup) customModelGroup.style.display = "block";
        if (agentModelSelect) agentModelSelect.value = "__custom__";
        if (agentCustomModelInput) agentCustomModelInput.focus();
        btnToggleCustomModel.innerHTML = "<span>Select from Presets</span>";
      }
    });
  }

  btnOpenCreateAgent.addEventListener("click", () => {
    formIsEdit.value = "0";
    modalTitle.textContent = "Deploy New Agent";
    modalSubtitle.textContent = "Configure role, mission goal and backstory";
    agentIdInput.disabled = false;
    agentIdInput.value = "";
    agentRoleInput.value = "";
    agentGoalInput.value = "";
    agentBackstoryInput.value = "";
    
    // Refresh model options and set recommended default
    const defaultModel = activeModel || "openai/gpt-4o-mini";
    populateAgentModelSelect(defaultModel);
    if (customModelGroup) customModelGroup.style.display = "none";
    if (agentCustomModelInput) agentCustomModelInput.value = "";
    if (btnToggleCustomModel) {
      btnToggleCustomModel.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px;">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        <span>Custom Model</span>
      `;
    }

    document.getElementById("btnSubmitAgent").textContent = "Deploy Agent";
    agentModal.classList.add("active");
  });

  btnCloseModal.addEventListener("click", closeModal);
  btnCancelModal.addEventListener("click", closeModal);

  agentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEdit = formIsEdit.value === "1";
    const id = agentIdInput.value.trim().toLowerCase();
    const role = agentRoleInput.value.trim();
    const goal = agentGoalInput.value.trim();
    const backstory = agentBackstoryInput.value.trim();

    // Determine LLM identifier
    let llm = agentModelSelect ? agentModelSelect.value : "";
    if (llm === "__custom__") {
      llm = agentCustomModelInput ? agentCustomModelInput.value.trim() : "";
    }
    if (!llm) {
      llm = "openai/gpt-4o-mini";
    }

    try {
      let resData;
      if (isEdit) {
        resData = await window.AgentApi.agents.updateAgent(id, { role, goal, backstory, llm });
      } else {
        resData = await window.AgentApi.agents.createAgent({ id, role, goal, backstory, llm });
      }

      showToast(resData.message || "Agent saved!");
      closeModal();
      await fetchAgents();
    } catch (err) {
      showToast((err && err.message) || "Server communication error", "error");
    }
  });

  btnSyncYaml.addEventListener("click", async () => {
    btnSyncYaml.disabled = true;
    await fetchAgents();
    showToast("agents.yaml synchronized!");
    setTimeout(() => { btnSyncYaml.disabled = false; }, 1000);
  });
}

function openEditAgentModal(ag) {
  formIsEdit.value = "1";
  modalTitle.textContent = `Edit Agent [${ag.id.toUpperCase()}]`;
  modalSubtitle.textContent = "Update role, goal, backstory, and model";
  agentIdInput.value = ag.id;
  agentIdInput.disabled = true;
  agentRoleInput.value = ag.role || "";
  agentGoalInput.value = ag.goal || "";
  agentBackstoryInput.value = ag.backstory || "";
  
  // Populate options and select current agent's model
  populateAgentModelSelect(ag.llm || "openai/gpt-4o-mini");

  document.getElementById("btnSubmitAgent").textContent = "Save Changes";
  agentModal.classList.add("active");
}

function closeModal() {
  agentModal.classList.remove("active");
}

async function deleteAgent(id) {
  if (!confirm(`Delete agent '${id.toUpperCase()}' from agents.yaml?`)) return;

  try {
    await window.AgentApi.agents.deleteAgent(id);
    showToast(`Agent '${id}' removed`);
    await fetchAgents();
  } catch (err) {
    showToast((err && err.message) || "Server error during deletion", "error");
  }
}

// ----------------------------------------------------------------
// Telemetry
// ----------------------------------------------------------------
async function fetchTelemetry() {
  try {
    const data = await window.AgentApi.system.getTelemetry();

    const tot = data.total_tokens || 0;
    const pTot = data.total_prompt_tokens || 0;
    const cTot = data.total_completion_tokens || 0;

    kpiTotalTokens.textContent = tot.toLocaleString();
    kpiPromptTokens.textContent = pTot.toLocaleString();
    kpiCompTokens.textContent = cTot.toLocaleString();

    document.getElementById("telemetryEstCost").textContent = `$${(data.estimated_cost_usd || 0).toFixed(4)}`;
    document.getElementById("telemetryTotalCalls").textContent = (data.history || []).length;

    // Update Meter
    if (tot > 0) {
      const pPct = Math.round((pTot / tot) * 100);
      const cPct = 100 - pPct;
      document.getElementById("meterPromptVal").textContent = `${pPct}% (${pTot.toLocaleString()})`;
      document.getElementById("meterCompVal").textContent = `${cPct}% (${cTot.toLocaleString()})`;
      document.getElementById("meterPromptBar").style.width = `${pPct}%`;
      document.getElementById("meterCompBar").style.width = `${cPct}%`;
    }

    // History Table
    const tbody = document.getElementById("telemetryHistoryBody");
    tbody.innerHTML = "";
    (data.history || []).forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><code>${row.id}</code></td>
        <td>${row.timestamp}</td>
        <td><strong>${(row.agent || '').toUpperCase()}</strong></td>
        <td style="color: var(--text-muted);">${row.model}</td>
        <td>${(row.prompt_tokens || 0).toLocaleString()}</td>
        <td>${(row.completion_tokens || 0).toLocaleString()}</td>
        <td><strong style="color: #D97706;">${(row.total_tokens || 0).toLocaleString()}</strong></td>
        <td><span class="badge badge-green">SUCCESS</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Telemetry error:", err);
  }
}

// ----------------------------------------------------------------
// Chat Execution
// ----------------------------------------------------------------
btnRunTest.addEventListener("click", async () => {
  const agent_id = testAgentSelect.value;
  const selectedOpt = testAgentSelect.selectedOptions[0];
  const model = selectedOpt ? (selectedOpt.dataset.llm || "") : "";
  const prompt = testPromptInput.value.trim();

  if (!prompt) {
    showToast("Please enter a task description", "error");
    return;
  }

  // Switch to chat view if not there
  const chatView = document.getElementById("chatView");
  if (!chatView.classList.contains("active")) {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.querySelectorAll(".view-panel").forEach(v => v.classList.remove("active"));
    document.querySelector('[data-view="chatView"]').classList.add("active");
    chatView.classList.add("active");
  }

  btnRunTest.disabled = true;

  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Add user message
  appendChatMessage("user", "You", now, `<p>${escapeHtml(prompt)}</p>`);

  // Add AI "thinking" message
  const thinkingId = "thinking-" + Date.now();
  appendChatMessage("ai", "AI Assistant", now, `
    <p>Processing your request with agent <strong>${agent_id.toUpperCase()}</strong>...</p>
    <div class="exec-plan-cards">
      <div class="exec-plan-step">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span>Analyze task</span>
      </div>
      <span class="exec-plan-arrow">→</span>
      <div class="exec-plan-step">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>Dispatch agent</span>
      </div>
      <span class="exec-plan-arrow">→</span>
      <div class="exec-plan-step">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <span>Collect results</span>
      </div>
    </div>
  `, thinkingId);

  // Update right panel task
  document.getElementById("rpCurrentTaskSection").style.display = "";
  document.getElementById("rpPlanSection").style.display = "";
  document.getElementById("rpTaskTitle").textContent = prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt;
  document.getElementById("rpTaskStatus").textContent = "In progress";
  document.getElementById("rpTaskStatus").className = "badge badge-blue";
  document.getElementById("rpTaskTime").textContent = `Started at ${now}`;

  // Show plan steps
  const planList = document.getElementById("rpPlanList");
  planList.innerHTML = `
    <li class="plan-step done">Parse user request</li>
    <li class="plan-step active">Execute with agent ${agent_id.toUpperCase()}</li>
    <li class="plan-step">Collect LLM response</li>
    <li class="plan-step">Return results</li>
  `;

  try {
    const data = await window.AgentApi.system.testAgent({
      agent_id,
      model,
      prompt,
      provider: providerSelect.value,
      base_url: customBaseUrl.value.trim(),
      api_key: apiKeyInput.value.trim() || localStorage.getItem("aurelia_api_key") || ""
    });

    // Remove thinking message
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (data.success) {
      // Add result message
      const resultTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      appendChatMessage("ai", "AI Assistant", resultTime, `
        <p>Task completed successfully in <strong>${data.latency_ms}ms</strong>.</p>
        <div class="msg-result">${escapeHtml(data.output)}</div>
        <div class="msg-metrics">
          <span class="metric-pill success">✓ Completed</span>
          <span class="metric-pill">${data.token_metrics.total_tokens} tokens</span>
          <span class="metric-pill amber">Prompt: ${data.token_metrics.prompt_tokens}</span>
          <span class="metric-pill amber">Comp: ${data.token_metrics.completion_tokens}</span>
        </div>
      `);

      showToast(`Agent task executed! +${data.token_metrics.total_tokens} tokens`);
      document.getElementById("rpTaskStatus").textContent = "Completed";
      document.getElementById("rpTaskStatus").className = "badge badge-green";

      // Update plan to completed
      const planList = document.getElementById("rpPlanList");
      planList.innerHTML = `
        <li class="plan-step done">Parse user request</li>
        <li class="plan-step done">Execute with agent ${agent_id.toUpperCase()}</li>
        <li class="plan-step done">Collect LLM response</li>
        <li class="plan-step done">Return results</li>
      `;

      await fetchTelemetry();
    } else {
      appendChatMessage("ai", "AI Assistant", now, `
        <p style="color: var(--color-error);">⚠ Execution error: ${data.error || "Task failed"}</p>
      `);
    }
  } catch (err) {
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    appendChatMessage("ai", "AI Assistant", now, `
      <p style="color: var(--color-error);">⚠ ${escapeHtml((err && err.message) || "Network communication failed.")}</p>
    `);
  } finally {
    btnRunTest.disabled = false;
    testPromptInput.value = "";
    autoResizeTextarea();
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    fetchLogs();
  }
});

function appendChatMessage(type, name, time, bodyHtml, id = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-msg ${type}`;
  if (id) wrapper.id = id;

  if (type === "user") {
    wrapper.innerHTML = `
      <div class="msg-avatar user-msg-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-header">
          <span class="msg-name">${name}</span>
          <span class="msg-time">${time}</span>
        </div>
        <div class="msg-body">${bodyHtml}</div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="msg-avatar ai-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <div class="msg-content">
        <div class="msg-header">
          <span class="msg-name">${name}</span>
          <span class="msg-time">${time}</span>
        </div>
        <div class="msg-body">${bodyHtml}</div>
      </div>
    `;
  }

  terminalOutput.appendChild(wrapper);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// ----------------------------------------------------------------
// Helper
// ----------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ----------------------------------------------------------------
// Logs & Diagnostics
// ----------------------------------------------------------------
function initLogsView() {
  // Filter tabs
  document.querySelectorAll(".log-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".log-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeLogFilter = tab.dataset.filter;
      fetchLogs();
    });
  });

  // Search input with debounce
  let searchTimeout = null;
  logSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchLogs();
    }, 200);
  });

  // Toggle Auto Refresh
  btnToggleAutoRefresh.addEventListener("click", () => {
    isAutoRefreshActive = !isAutoRefreshActive;
    if (isAutoRefreshActive) {
      refreshDot.className = "refresh-indicator active";
      refreshLabel.textContent = chromeT("logs.auto_on");
      refreshLabel.setAttribute("data-i18n", "logs.auto_on");
      startLogAutoRefresh();
      showToast("Log auto-refresh enabled (3s)");
    } else {
      refreshDot.className = "refresh-indicator";
      refreshLabel.textContent = chromeT("logs.auto_off");
      refreshLabel.setAttribute("data-i18n", "logs.auto_off");
      stopLogAutoRefresh();
      showToast("Log auto-refresh paused");
    }
  });

  // Manual Refresh
  btnRefreshLogs.addEventListener("click", async () => {
    btnRefreshLogs.disabled = true;
    await fetchLogs();
    showToast("Logs updated");
    setTimeout(() => { btnRefreshLogs.disabled = false; }, 500);
  });

  // Clear Logs
  btnClearLogs.addEventListener("click", async () => {
    if (!confirm("Clear in-memory operational logs?")) return;
    try {
      await window.AgentApi.system.clearLogs();
      showToast("Logs cleared successfully");
      await fetchLogs();
    } catch (err) {
      showToast((err && err.message) || "Server error clearing logs", "error");
    }
  });
}

function startLogAutoRefresh() {
  stopLogAutoRefresh();
  logAutoRefreshInterval = setInterval(() => {
    if (isAutoRefreshActive) {
      fetchLogs(false);
    }
  }, 3000);
}

function stopLogAutoRefresh() {
  if (logAutoRefreshInterval) {
    clearInterval(logAutoRefreshInterval);
    logAutoRefreshInterval = null;
  }
}

async function fetchLogs(showLoading = false) {
  const query = logSearchInput.value.trim();

  try {
    const data = await window.AgentApi.system.getLogs({
      level: activeLogFilter,
      limit: 100,
      search: query || undefined
    });

    logsCache = data.logs || [];
    const stats = data.stats || { total: 0, errors: 0, warnings: 0, api_success: 0, api_failed: 0 };

    renderLogStats(stats);
    renderLogTable(logsCache);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
  }
}

function renderLogStats(stats) {
  if (kpiTotalLogs) kpiTotalLogs.textContent = (stats.total || 0).toLocaleString();
  if (kpiApiSuccess) kpiApiSuccess.textContent = (stats.api_success || 0).toLocaleString();
  if (kpiWarnings) kpiWarnings.textContent = (stats.warnings || 0).toLocaleString();
  if (kpiErrors) kpiErrors.textContent = (stats.errors || 0).toLocaleString();

  if (countAll) countAll.textContent = stats.total || 0;
  if (countErrors) countErrors.textContent = stats.errors || 0;
  if (countWarnings) countWarnings.textContent = stats.warnings || 0;
  if (countApiGet) countApiGet.textContent = stats.api_success || 0;
  if (countSuccess) countSuccess.textContent = stats.api_success || 0;

  // Update sidebar error badge
  if (navErrorBadge) {
    if (stats.errors > 0) {
      navErrorBadge.style.display = "inline-block";
      navErrorBadge.textContent = stats.errors > 99 ? "99+" : stats.errors;
    } else {
      navErrorBadge.style.display = "none";
    }
  }
}

let currentInspectedLog = null;

function initLogDetailModal() {
  const modal = document.getElementById("logDetailModal");
  const btnClose1 = document.getElementById("btnCloseLogModal");
  const btnClose2 = document.getElementById("btnCloseLogModalBtn");
  const btnCopy = document.getElementById("btnCopyLogJson");

  const closeModal = () => modal.classList.remove("active");
  if (btnClose1) btnClose1.addEventListener("click", closeModal);
  if (btnClose2) btnClose2.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      if (!currentInspectedLog) return;
      const text = JSON.stringify(currentInspectedLog, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        showToast("Diagnostic JSON copied to clipboard!");
      }).catch(() => {
        showToast("Could not copy to clipboard", "error");
      });
    });
  }
}

function openLogDetailModal(log) {
  currentInspectedLog = log;
  const modal = document.getElementById("logDetailModal");
  if (!modal) return;

  const badgeEl = document.getElementById("logModalBadge");
  const titleEl = document.getElementById("logModalTitle");
  const subtitleEl = document.getElementById("logModalSubtitle");
  const statusEl = document.getElementById("logModalStatus");
  const latencyEl = document.getElementById("logModalLatency");
  const typeEl = document.getElementById("logModalType");
  const urlEl = document.getElementById("logModalUrl");
  const messageEl = document.getElementById("logModalMessage");
  const jsonEl = document.getElementById("logModalJson");

  titleEl.textContent = `Log Inspection [${log.id}]`;
  subtitleEl.textContent = `${log.datetime || log.timestamp} · Event Category: ${log.type || 'API'}`;

  // Badge
  badgeEl.className = "log-badge";
  if (log.level === "ERROR") badgeEl.classList.add("log-badge-error");
  else if (log.level === "WARNING") badgeEl.classList.add("log-badge-warning");
  else if (log.level === "SUCCESS") badgeEl.classList.add("log-badge-success");
  else badgeEl.classList.add("log-badge-info");
  badgeEl.textContent = log.level;

  // Grid fields
  statusEl.textContent = `${log.method || '-'} ${log.status_code ? `(${log.status_code})` : ''}`;
  latencyEl.textContent = (log.duration_ms !== null && log.duration_ms !== undefined) ? `${log.duration_ms} ms` : '—';
  typeEl.textContent = `${log.type || 'API'} Event`;

  const targetUrl = (log.context && log.context.target_url) ? log.context.target_url : log.path;
  urlEl.textContent = targetUrl || '—';

  messageEl.textContent = log.message || 'No description recorded';

  // Format clean diagnostic context
  const displayContext = {
    log_id: log.id,
    timestamp: log.datetime || log.timestamp,
    level: log.level,
    category: log.type,
    method: log.method,
    path: log.path,
    status_code: log.status_code,
    duration_ms: log.duration_ms,
    message: log.message,
    details: log.details || undefined,
    context: log.context || {}
  };
  jsonEl.textContent = JSON.stringify(displayContext, null, 2);

  modal.classList.add("active");
}

function renderLogTable(logs) {
  if (!logTableBody) return;
  logTableBody.innerHTML = "";

  if (logs.length === 0) {
    logTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="padding: 36px 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No log events found matching the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.className = "log-row-clickable";

    // Level Badge
    let badgeClass = "log-badge-info";
    if (log.level === "ERROR") badgeClass = "log-badge-error";
    else if (log.level === "WARNING") badgeClass = "log-badge-warning";
    else if (log.level === "SUCCESS") badgeClass = "log-badge-success";

    // Method tag
    const methodLower = (log.method || "-").toLowerCase();
    let methodClass = "method-get";
    if (methodLower === "post") methodClass = "method-post";
    else if (methodLower === "put") methodClass = "method-put";
    else if (methodLower === "delete") methodClass = "method-delete";
    else if (methodLower === "system") methodClass = "method-system";

    // Status Code Pill
    let codePill = "";
    if (log.status_code) {
      let codeClass = "code-2xx";
      if (log.status_code >= 500) codeClass = "code-5xx";
      else if (log.status_code >= 400) codeClass = "code-4xx";
      codePill = `<span class="status-code-pill ${codeClass}">${log.status_code}</span>`;
    } else {
      codePill = `<span style="color: var(--text-muted); font-size: 0.75rem;">—</span>`;
    }

    // Latency
    const latencyText = (log.duration_ms !== null && log.duration_ms !== undefined)
      ? `<span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">${log.duration_ms}ms</span>`
      : `<span style="color: var(--text-muted); font-size: 0.75rem;">—</span>`;

    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-muted); white-space: nowrap;">${escapeHtml(log.timestamp)}</td>
      <td><span class="log-badge ${badgeClass}">${escapeHtml(log.level)}</span></td>
      <td><span class="log-method-tag ${methodClass}">${escapeHtml(log.method)}</span></td>
      <td><code class="log-endpoint-code">${escapeHtml(log.path)}</code></td>
      <td>${codePill}</td>
      <td>${latencyText}</td>
      <td>
        <div class="log-msg-text">${escapeHtml(log.message)}</div>
        ${log.details ? `<div class="log-msg-details">${escapeHtml(log.details)}</div>` : ""}
      </td>
      <td style="text-align: center;">
        <button class="btn btn-secondary btn-xs btn-inspect-log" type="button" title="View diagnostic details">Inspect</button>
      </td>
    `;

    tr.addEventListener("click", () => openLogDetailModal(log));
    logTableBody.appendChild(tr);
  });
}

// ----------------------------------------------------------------
// Global Search (cross-view: agents + models + logs, reuse filters)
// ----------------------------------------------------------------
function switchView(name) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.view === name));
  document.querySelectorAll(".view-panel").forEach(v => v.classList.toggle("active", v.id === name));
  try { sessionStorage.setItem("agentos.dash.view", name); } catch (err) { /* never break UI */ }
  if (name === "logsView") fetchLogs();
}

function initGlobalSearch() {
  const input = document.getElementById("globalSearch");
  if (!input) return;
  let t = null;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => runGlobalSearch(input.value.trim().toLowerCase()), 250);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; runGlobalSearch(""); }
  });
}

function runGlobalSearch(q) {
  // Models — reuse existing filter.
  modelSearchInput.value = q;
  modelSearchInput.dispatchEvent(new Event("input"));
  // Agents — filter cache locally.
  const aq = !q ? agentsCache : agentsCache.filter(ag =>
    (ag.id + " " + ag.role + " " + (ag.goal || "") + " " + (ag.llm || "")).toLowerCase().includes(q));
  renderAgentCards(aq);
  renderRightPanelAgents(aq);
  // Logs — reuse server-side filter.
  if (logSearchInput.value !== q) {
    logSearchInput.value = q;
    logSearchInput.dispatchEvent(new Event("input"));
  }
  if (!q) return;
  const mq = modelsCache.filter(m =>
    m.id.toLowerCase().includes(q) || (m.name || "").toLowerCase().includes(q) ||
    ((m.provider || "").toLowerCase().includes(q)));
  const lq = logsCache.filter(l => JSON.stringify(l).toLowerCase().includes(q));
  const total = aq.length + mq.length + lq.length;
  const target = aq.length ? "agentsView" : mq.length ? "modelsView" : lq.length ? "logsView" : null;
  if (target) switchView(target);
  showToast(total ? `Tìm thấy ${total} kết quả cho "${escapeHtml(q)}"` : `Không có kết quả cho "${escapeHtml(q)}"`, total ? "success" : "error");
}

// ----------------------------------------------------------------
// Avatar menu: upload / remove avatar photo (localStorage)
// ----------------------------------------------------------------
const AVATAR_KEY = "agentos.avatar";
const AVATAR_MAX = 2 * 1024 * 1024;

function applyAvatar(dataUrl) {
  const btn = document.getElementById("avatarBtn");
  if (!btn) return;
  if (dataUrl) {
    btn.classList.add("has-photo");
    btn.style.setProperty("--avatar-img", `url("${dataUrl}")`);
  } else {
    btn.classList.remove("has-photo");
    btn.style.removeProperty("--avatar-img");
  }
}

function initAvatarPhoto() {
  const btn = document.getElementById("avatarBtn");
  const menu = document.getElementById("avatarMenu");
  const file = document.getElementById("bgFileInput");
  if (!btn || !menu || !file) return;
  try { applyAvatar(localStorage.getItem(AVATAR_KEY)); } catch (err) { /* never break UI */ }
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !e.target.closest(".avatar-wrap")) {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
  document.getElementById("btnChangeBg").addEventListener("click", () => {
    menu.hidden = true;
    file.click();
  });
  document.getElementById("btnRemoveBg").addEventListener("click", () => {
    menu.hidden = true;
    try { localStorage.removeItem(AVATAR_KEY); } catch (err) { /* never break UI */ }
    applyAvatar(null);
    showToast("Đã xóa ảnh đại diện");
  });
  file.addEventListener("change", () => {
    const f = file.files[0];
    file.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { showToast("Chỉ nhận file ảnh", "error"); return; }
    if (f.size > AVATAR_MAX) { showToast("Ảnh quá lớn (tối đa 2MB)", "error"); return; }
    const rd = new FileReader();
    rd.onload = () => {
      try {
        localStorage.setItem(AVATAR_KEY, rd.result);
        applyAvatar(rd.result);
        showToast("Đã đổi ảnh đại diện");
      } catch (err) { showToast("Không lưu được ảnh (bộ nhớ đầy)", "error"); }
    };
    rd.onerror = () => showToast("Đọc ảnh thất bại", "error");
    rd.readAsDataURL(f);
  });
}

// ----------------------------------------------------------------
// Chat extras: suggestion chips + new chat section
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// Chat tabs (browser-like sessions) + centered suggestions on fresh tabs
// ----------------------------------------------------------------
let chatWelcomeHtml = "";
let chatTabs = [];
let activeChatTab = 0;
let chatTabSeq = 0;

function chatTabTitle(t) {
  return t.title || "New chat";
}

function saveActiveTab() {
  const t = chatTabs[activeChatTab];
  if (!t) return;
  const box = document.getElementById("terminalOutput");
  const input = document.getElementById("testPromptInput");
  if (box) t.html = box.innerHTML;
  if (input) t.input = input.value;
  if (!t.title && box) {
    const first = box.querySelector(".chat-msg.user .msg-body");
    if (first) t.title = first.textContent.trim().slice(0, 28);
  }
}

function restoreActiveTab() {
  const t = chatTabs[activeChatTab];
  const box = document.getElementById("terminalOutput");
  const input = document.getElementById("testPromptInput");
  if (box && t) { box.innerHTML = t.html; box.scrollTop = box.scrollHeight; }
  if (input && t) { input.value = t.input || ""; autoResizeTextarea(); }
  setWelcomeTime();
  renderChatTabs();
}

function renderChatTabs() {
  const list = document.getElementById("chatTabList");
  if (!list) return;
  list.innerHTML = "";
  chatTabs.forEach((t, i) => {
    const b = document.createElement("div");
    b.className = "chat-tab" + (i === activeChatTab ? " active" : "");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === activeChatTab ? "true" : "false");
    const label = document.createElement("button");
    label.type = "button";
    label.className = "chat-tab-label";
    label.textContent = chatTabTitle(t);
    label.title = chatTabTitle(t);
    label.addEventListener("click", () => switchChatTab(i));
    const x = document.createElement("button");
    x.type = "button";
    x.className = "chat-tab-close";
    x.textContent = "×";
    x.title = "Close";
    x.setAttribute("aria-label", "Close " + chatTabTitle(t));
    x.addEventListener("click", (e) => { e.stopPropagation(); closeChatTab(i); });
    b.appendChild(label);
    b.appendChild(x);
    list.appendChild(b);
  });
  const empty = document.getElementById("chatEmpty");
  const cur = chatTabs[activeChatTab];
  if (empty) empty.style.display = cur && cur.fresh ? "" : "none";
  // Persist tabs so reload restores the exact session.
  try {
    const slim = chatTabs.map(t => ({
      n: t.n, title: (t.title || "").slice(0, 60),
      html: (t.html || "").slice(0, 200000),
      input: (t.input || "").slice(0, 5000), fresh: !!t.fresh
    }));
    sessionStorage.setItem("agentos.dash.tabs", JSON.stringify({ tabs: slim, active: activeChatTab }));
  } catch (err) { /* quota/unavailable: skip */ }
}

function switchChatTab(i) {
  if (i === activeChatTab || !chatTabs[i]) return;
  saveActiveTab();
  activeChatTab = i;
  restoreActiveTab();
}

function addChatTab(focusInput) {
  saveActiveTab();
  chatTabSeq += 1;
  chatTabs.push({ n: chatTabSeq, title: "", html: chatWelcomeHtml, input: "", fresh: true });
  activeChatTab = chatTabs.length - 1;
  const box = document.getElementById("terminalOutput");
  const input = document.getElementById("testPromptInput");
  if (box) { box.innerHTML = chatWelcomeHtml; box.scrollTop = 0; }
  if (input) { input.value = ""; autoResizeTextarea(); if (focusInput !== false) input.focus(); }
  setWelcomeTime();
  renderChatTabs();
  showToast("Đoạn chat mới");
}

function closeChatTab(i) {
  if (chatTabs.length <= 1 || !chatTabs[i]) return;
  chatTabs.splice(i, 1);
  if (activeChatTab > i) activeChatTab -= 1;
  else if (activeChatTab >= chatTabs.length) activeChatTab = chatTabs.length - 1;
  restoreActiveTab();
}

// Welcome block rebuilt per language so tab restores + lang switches agree.
function buildWelcome() {
  return '<div class="chat-msg ai">' +
    '<div class="msg-avatar ai-avatar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
    "</div>" +
    '<div class="msg-content"><div class="msg-header"><span class="msg-name">AI Assistant</span> <span class="msg-time" id="welcomeTime"></span></div>' +
    '<div class="msg-body" id="welcomeBody" data-i18n-html="chat.welcome">' + chromeT("chat.welcome") + "</div></div></div>";
}

function refreshWelcomeLang() {
  if (!chatTabs || !chatTabs.length) return;
  chatWelcomeHtml = buildWelcome();
  chatTabs.forEach(t => { if (t.fresh) t.html = chatWelcomeHtml; });
  const cur = chatTabs[typeof activeChatTab === "number" ? activeChatTab : 0];
  const box = document.getElementById("terminalOutput");
  if (cur && cur.fresh && box && box.querySelector("#welcomeTime")) {
    box.innerHTML = chatWelcomeHtml;
    setWelcomeTime();
    box.scrollTop = 0;
  }
}

function initChatExtras() {
  const bar = document.getElementById("chatSuggest");
  const input = document.getElementById("testPromptInput");
  const box = document.getElementById("terminalOutput");
  if (!bar || !input || !box) return;
  chatWelcomeHtml = box.innerHTML;
  chatTabSeq = 1;
  chatTabs = [{ n: 1, title: "", html: chatWelcomeHtml, input: input.value || "", fresh: true }];
  activeChatTab = 0;
  // Restore tabs from last session (fresh tabs get current-language welcome).
  try {
    const saved = JSON.parse(sessionStorage.getItem("agentos.dash.tabs") || "null");
    if (saved && Array.isArray(saved.tabs) && saved.tabs.length) {
      const restored = saved.tabs.filter(t => t && typeof t.html === "string").slice(0, 20).map((t, i) => ({
        n: typeof t.n === "number" ? t.n : i + 1,
        title: typeof t.title === "string" ? t.title.slice(0, 60) : "",
        html: t.html,
        input: typeof t.input === "string" ? t.input : "",
        fresh: !!t.fresh
      }));
      if (restored.length) {
        chatTabs = restored;
        chatTabSeq = Math.max.apply(null, chatTabs.map(t => t.n).concat([0]));
        activeChatTab = Math.min(Math.max(0, saved.active | 0), chatTabs.length - 1);
        chatWelcomeHtml = buildWelcome();
        chatTabs.forEach(t => { if (t.fresh) t.html = chatWelcomeHtml; });
        box.innerHTML = chatTabs[activeChatTab].html;
        input.value = chatTabs[activeChatTab].input || "";
        autoResizeTextarea();
        setWelcomeTime();
        box.scrollTop = box.scrollHeight;
      }
    }
  } catch (err) { /* default single tab */ }
  bar.querySelectorAll(".suggest-chip").forEach(ch => {
    ch.addEventListener("click", () => {
      input.value = ch.getAttribute("data-prompt") || "";
      autoResizeTextarea();
      input.focus();
    });
  });
  document.getElementById("btnAddChatTab").addEventListener("click", () => addChatTab(true));
  document.getElementById("btnRunTest").addEventListener("click", () => {
    const t = chatTabs[activeChatTab];
    if (t && input.value.trim()) {
      t.fresh = false;
      if (!t.title) t.title = input.value.trim().slice(0, 28);
      renderChatTabs();
    }
  });
  renderChatTabs();
}

// ----------------------------------------------------------------
// Chrome prefs: EN/VI language + dark theme (shared keys w/ auth)
// ----------------------------------------------------------------
const CHROME_I18N = {
  en: {
    "meta.title": "Dashboard — AgentOS",
    "nav.new": "New Task", "nav.chat": "Chat", "nav.agents": "Agents",
    "nav.analytics": "Analytics", "nav.models": "Models", "nav.logs": "Logs", "nav.settings": "Settings",
    "search.ph": "Search across tasks, agents, knowledge, and more...",
    "view.agents_t": "Configured Crew Agents", "view.agents_s": "Direct synchronization with agents.yaml",
    "view.analytics_t": "Token Analytics & Telemetry", "view.analytics_s": "Real-time token consumption and cost tracking",
    "view.models_t": "Available Inference Models", "view.models_s": "Discover and select LLM models from your provider",
    "view.logs_t": "System & API Logs Monitor", "view.logs_s": "Real-time tracking of API GET/POST requests, warnings, and error diagnostics",
    "view.settings_t": "API Provider & Configuration", "view.settings_s": "Manage your LLM provider connections and API keys",
    "chat.empty": "What can I help with?",
    "chat.chip1": "Q2 revenue review", "chat.chip2": "Market intel scan",
    "chat.chip3": "Policy lookup", "chat.chip4": "Ticket triage",
    "chat.welcome": "<p>Hello! I'm your AI Agent assistant. Select an agent and describe your task below, and I'll coordinate the agent team to execute it.</p><p class=\"msg-hint\">You can manage agents, view analytics, configure models, and more from the sidebar.</p>",
    "rp.task": "Current Task", "rp.plan": "Plan", "rp.agents": "Agents", "rp.sources": "RAG Sources", "rp.tools": "Tools",
    "rp.tool_sql": "SQL Query", "rp.tool_py": "Python", "rp.tool_charts": "Charts", "rp.tool_web": "Web Search", "rp.tool_files": "Files",
    "agents.load_error": "Error loading agents.yaml",
    "agents.loading": "Loading agent definitions...",
    "models.count": "Models",
    "rp.src_dw": "Enterprise Data Warehouse", "rp.src_kb": "Finance KnowledgeBase", "rp.src_q3": "Q3 Reports & Docs",
    "logs.auto_on": "Auto-Refresh: ON", "logs.auto_off": "Auto-Refresh: OFF",
    "logs.refresh": "Refresh", "logs.clear": "Clear",
    "logs.k_total": "Total Logs", "logs.k_total_s": "All system & API events",
    "logs.k_ok": "API Success (200 OK)", "logs.k_ok_s": "GET / POST Succeeded",
    "logs.k_warn": "Warnings", "logs.k_warn_s": "Client 4xx / missing configs",
    "logs.k_err": "Errors", "logs.k_err_s": "5xx & LLM API failures",
    "logs.tab_all": "All Logs", "logs.tab_err": "Errors", "logs.tab_warn": "Warnings",
    "logs.tab_get": "API GET", "logs.tab_post": "API POST", "logs.tab_ok": "Success",
    "logs.search_ph": "Filter by endpoint, status, message...",
    "logs.th_time": "Time", "logs.th_level": "Level", "logs.th_method": "Method", "logs.th_endpoint": "Endpoint",
    "logs.th_status": "Status", "logs.th_latency": "Latency", "logs.th_message": "Message / Activity Details", "logs.th_details": "Details",
    "logs.loading": "Loading live operational logs...",
    "logs.m_title": "Log Diagnostic Details",
    "logs.m_method": "Request Method & Status", "logs.m_latency": "Latency / Response Time",
    "logs.m_type": "Log Type / Category", "logs.m_url": "Endpoint / Route",
    "logs.m_summary": "Summary Message", "logs.m_context": "Detailed Context & Response Data",
    "logs.m_copy": "Copy JSON", "logs.m_close": "Close Inspector",
    "set.llm": "LLM Provider", "set.provider": "Select Provider",
    "set.custom_url": "Custom Endpoint Base URL", "set.apikey": "API Key",
    "set.key_hint": "Stored in .env: <code>OPENAI_API_KEY</code>",
    "set.save_env": "Auto-save key to <code>.env</code> file",
    "set.validate": "Validate & Fetch Models", "set.conn": "Connection Status",
    "set.st_status": "API Status", "set.st_provider": "Provider", "set.st_latency": "Latency",
    "set.st_model": "Default Model", "set.st_model_provider": "Model Provider", "set.st_key": "Key"
  },
  vi: {
    "meta.title": "Bảng điều khiển — AgentOS",
    "nav.new": "Tác vụ mới", "nav.chat": "Đoạn chat", "nav.agents": "Agent",
    "nav.analytics": "Phân tích", "nav.models": "Mô hình", "nav.logs": "Nhật ký", "nav.settings": "Cài đặt",
    "search.ph": "Tìm kiếm tác vụ, agent, kiến thức và hơn nữa...",
    "view.agents_t": "Agent Crew đã cấu hình", "view.agents_s": "Đồng bộ trực tiếp với agents.yaml",
    "view.analytics_t": "Phân tích token & Telemetry", "view.analytics_s": "Tiêu thụ token và chi phí theo thời gian thực",
    "view.models_t": "Mô hình suy luận khả dụng", "view.models_s": "Khám phá và chọn mô hình LLM từ nhà cung cấp",
    "view.logs_t": "Giám sát log hệ thống & API", "view.logs_s": "Theo dõi trực tiếp request API GET/POST, cảnh báo và lỗi",
    "view.settings_t": "Nhà cung cấp API & Cấu hình", "view.settings_s": "Quản lý kết nối LLM provider và API key",
    "chat.empty": "Tôi có thể giúp gì?",
    "chat.chip1": "Đánh giá doanh thu Q2", "chat.chip2": "Quét tin thị trường",
    "chat.chip3": "Tra cứu chính sách", "chat.chip4": "Phân loại ticket",
    "chat.welcome": "<p>Chào! Tôi là trợ lý AI Agent của bạn. Chọn một agent và mô tả tác vụ, tôi sẽ điều phối nhóm agent thực hiện.</p><p class=\"msg-hint\">Bạn có thể quản lý agent, xem phân tích, cấu hình mô hình và hơn nữa từ sidebar.</p>",
    "rp.task": "Tác vụ hiện tại", "rp.plan": "Kế hoạch", "rp.agents": "Agent", "rp.sources": "Nguồn RAG", "rp.tools": "Công cụ",
    "rp.tool_sql": "Truy vấn SQL", "rp.tool_py": "Python", "rp.tool_charts": "Biểu đồ", "rp.tool_web": "Tìm kiếm Web", "rp.tool_files": "Tệp",
    "agents.load_error": "Lỗi tải agents.yaml",
    "agents.loading": "Đang tải định nghĩa agent...",
    "models.count": "Mô hình",
    "rp.src_dw": "Kho dữ liệu doanh nghiệp", "rp.src_kb": "Cơ sở tri thức Tài chính", "rp.src_q3": "Báo cáo & Tài liệu Q3",
    "logs.auto_on": "Tự động: BẬT", "logs.auto_off": "Tự động: TẮT",
    "logs.refresh": "Làm mới", "logs.clear": "Xóa",
    "logs.k_total": "Tổng log", "logs.k_total_s": "Mọi sự kiện hệ thống & API",
    "logs.k_ok": "API thành công (200 OK)", "logs.k_ok_s": "GET / POST thành công",
    "logs.k_warn": "Cảnh báo", "logs.k_warn_s": "Lỗi client 4xx / thiếu cấu hình",
    "logs.k_err": "Lỗi", "logs.k_err_s": "Lỗi 5xx & API LLM",
    "logs.tab_all": "Tất cả", "logs.tab_err": "Lỗi", "logs.tab_warn": "Cảnh báo",
    "logs.tab_get": "API GET", "logs.tab_post": "API POST", "logs.tab_ok": "Thành công",
    "logs.search_ph": "Lọc theo endpoint, trạng thái, thông điệp...",
    "logs.th_time": "Giờ", "logs.th_level": "Mức", "logs.th_method": "Phương thức", "logs.th_endpoint": "Endpoint",
    "logs.th_status": "Trạng thái", "logs.th_latency": "Độ trễ", "logs.th_message": "Thông điệp / Chi tiết", "logs.th_details": "Chi tiết",
    "logs.loading": "Đang tải log vận hành...",
    "logs.m_title": "Chi tiết chẩn đoán log",
    "logs.m_method": "Phương thức & Trạng thái", "logs.m_latency": "Độ trễ / Thời gian phản hồi",
    "logs.m_type": "Loại / Nhóm log", "logs.m_url": "Endpoint / Route",
    "logs.m_summary": "Thông điệp tóm tắt", "logs.m_context": "Ngữ cảnh & Dữ liệu phản hồi",
    "logs.m_copy": "Chép JSON", "logs.m_close": "Đóng xem chi tiết",
    "set.llm": "Nhà cung cấp LLM", "set.provider": "Chọn nhà cung cấp",
    "set.custom_url": "Base URL endpoint tùy chỉnh", "set.apikey": "API Key",
    "set.key_hint": "Đã lưu trong .env: <code>OPENAI_API_KEY</code>",
    "set.save_env": "Tự lưu key vào file <code>.env</code>",
    "set.validate": "Xác thực & Tải mô hình", "set.conn": "Trạng thái kết nối",
    "set.st_status": "Trạng thái API", "set.st_provider": "Nhà cung cấp", "set.st_latency": "Độ trễ",
    "set.st_model": "Mô hình mặc định", "set.st_model_provider": "Nhà cung cấp mô hình", "set.st_key": "Key"
  }
};

let chromeLang = "en";

function chromeT(key) {
  if (CHROME_I18N[chromeLang] && CHROME_I18N[chromeLang][key] != null) return CHROME_I18N[chromeLang][key];
  return CHROME_I18N.en[key] != null ? CHROME_I18N.en[key] : key;
}

function applyChromeLang(next) {
  if (next === "vi" || next === "en") chromeLang = next;
  try { localStorage.setItem("agentos.lang", chromeLang); } catch (err) { /* never break UI */ }
  document.documentElement.lang = chromeLang;
  document.title = chromeT("meta.title");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = chromeT(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = chromeT(el.getAttribute("data-i18n-html"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.setAttribute("placeholder", chromeT(el.getAttribute("data-i18n-ph")));
  });
  document.querySelectorAll("[data-lang-btn]").forEach(b => {
    b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === chromeLang ? "true" : "false");
  });
  refreshWelcomeLang();
}

function initChromePrefs() {
  try {
    const s = localStorage.getItem("agentos.lang");
    if (s === "vi" || s === "en") chromeLang = s;
  } catch (err) { /* never break UI */ }
  document.querySelectorAll("[data-lang-btn]").forEach(b => {
    b.addEventListener("click", () => applyChromeLang(b.getAttribute("data-lang-btn")));
  });
  const tt = document.getElementById("themeToggle");
  if (tt) {
    tt.addEventListener("click", () => {
      const dark = document.documentElement.classList.toggle("dark");
      tt.setAttribute("aria-pressed", String(dark));
      try { localStorage.setItem("agentos.theme", dark ? "dark" : "light"); } catch (err) { /* never break UI */ }
    });
    try { tt.setAttribute("aria-pressed", String(document.documentElement.classList.contains("dark"))); } catch (err) { /* never break UI */ }
  }
  applyChromeLang();
}

