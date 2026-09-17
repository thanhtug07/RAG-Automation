// Policies — Enterprise Governance Console (frontend-only, in-memory).
// No fetch, no backend. Reload restores the 6 demo policies.
(function () {
  "use strict";

  /* ---------------- i18n (EN/VI, shared agentos.lang key) ---------------- */
  var I18N = {
    en: {
      "meta.title": "Policies — AgentOS",
      "meta.desc": "Define rules that control how agents access data, use tools, and execute tasks.",
      "rp.agents": "Agents", "rp.sources": "RAG Sources", "rp.tools": "Tools",
      "rp.src_dw": "Enterprise Data Warehouse", "rp.src_kb": "Finance KnowledgeBase", "rp.src_q3": "Q3 Reports & Docs",
      "rp.tool_sql": "SQL Query", "rp.tool_py": "Python", "rp.tool_charts": "Charts",
      "rp.tool_web": "Web Search", "rp.tool_files": "Files",
      "rp.ws_plan": "Company Plan",
      "rp.progress": "Progress", "rp.m_active": "Active", "rp.m_agents": "Agents", "rp.m_rules": "Rules",
      "nav.new": "New Task", "nav.chat": "Chat", "nav.agents": "Agents",
      "nav.docs": "Documents", "nav.analytics": "Analytics", "nav.models": "Models",
      "nav.logs": "Logs", "nav.settings": "Settings", "nav.storage": "Data Storage",
      "page.title": "Policies",
      "page.sub": "Define rules that control how agents operate.",
      "page.new": "New Policy",
      "page.search_ph": "Search policies...",
      "filter.cat_all": "Type: All",
      "filter.status_all": "Status: All",
      "filter.clear": "Clear filters",
      "status.active": "Active", "status.draft": "Draft", "status.disabled": "Disabled",
      "empty.title": "No policies found",
      "empty.sub": "Try changing your search or filters.",
      "detail.back": "← Back to Policies",
      "detail.overview": "Overview",
      "detail.desc": "Description",
      "detail.scope": "Scope",
      "detail.scope_agents": "Agents",
      "detail.scope_tools": "Tools",
      "detail.scope_know": "Knowledge",
      "detail.rules": "Rules",
      "detail.resources": "Resources",
      "detail.version": "Version",
      "detail.status": "Status",
      "detail.priority": "Priority",
      "detail.updated": "Last updated",
      "detail.history": "Version history",
      "detail.actions": "Actions",
      "detail.rule_applies": "Applies to",
      "act.edit": "Edit Policy", "act.duplicate": "Duplicate",
      "act.disable": "Disable", "act.enable": "Enable", "act.delete": "Delete",
      "pri.high": "High", "pri.medium": "Medium", "pri.low": "Low",
      "rule.allow": "Allow", "rule.deny": "Deny", "rule.approval": "Require Approval",
      "drawer.create": "New Policy", "drawer.edit": "Edit Policy",
      "form.name": "Policy Name", "form.category": "Category",
      "form.desc": "Description", "form.status": "Status", "form.priority": "Priority",
      "form.applies": "Applies to", "form.rules": "Rules", "form.resources": "Resources",
      "form.res_ph": "One per line",
      "form.rule_action": "Action", "form.rule_text": "Rule", "form.rule_text_ph": "What is controlled...",
      "form.rule_target": "Target", "form.rule_target_ph": "Agent / Workspace / All",
      "form.add_rule": "+ Add Rule", "form.remove_rule": "Remove rule",
      "form.cancel": "Cancel", "form.create": "Create Policy", "form.save": "Save changes",
      "del.title": "Delete policy?",
      "del.msg": "This action cannot be undone.",
      "del.confirm": "Delete",
      "unsaved.title": "Unsaved changes",
      "unsaved.msg": "You have unsaved changes.",
      "unsaved.discard": "Discard", "unsaved.keep": "Keep editing",
      "toast.created": "Policy created.",
      "toast.updated": "Policy updated.",
      "toast.deleted": "Policy deleted.",
      "toast.duplicated": "Policy duplicated.",
      "toast.disabled": "Policy disabled.",
      "toast.enabled": "Policy enabled.",
      "toast.need_name": "Policy name is required."
    },
    vi: {
      "meta.title": "Chính sách — AgentOS",
      "meta.desc": "Định nghĩa luật kiểm soát cách agent truy cập dữ liệu, dùng công cụ và thực thi tác vụ.",
      "rp.agents": "Agent", "rp.sources": "Nguồn RAG", "rp.tools": "Công cụ",
      "rp.src_dw": "Kho dữ liệu doanh nghiệp", "rp.src_kb": "Cơ sở tri thức Tài chính", "rp.src_q3": "Báo cáo & Tài liệu Q3",
      "rp.tool_sql": "Truy vấn SQL", "rp.tool_py": "Python", "rp.tool_charts": "Biểu đồ",
      "rp.tool_web": "Tìm kiếm Web", "rp.tool_files": "Tệp",
      "rp.ws_plan": "Gói công ty",
      "rp.progress": "Tiến độ", "rp.m_active": "Đang bật", "rp.m_agents": "Agent", "rp.m_rules": "Luật",
      "nav.new": "Tác vụ mới", "nav.chat": "Đoạn chat", "nav.agents": "Agent",
      "nav.docs": "Tài liệu", "nav.analytics": "Phân tích", "nav.models": "Mô hình",
      "nav.logs": "Nhật ký", "nav.settings": "Cài đặt", "nav.storage": "Lưu trữ dữ liệu",
      "page.title": "Policies",
      "page.sub": "Định nghĩa luật kiểm soát cách agent vận hành.",
      "page.new": "Chính sách mới",
      "page.search_ph": "Tìm kiếm policies...",
      "filter.cat_all": "Loại: Tất cả",
      "filter.status_all": "Trạng thái: Tất cả",
      "filter.clear": "Xóa lọc",
      "status.active": "Đang bật", "status.draft": "Nháp", "status.disabled": "Đã tắt",
      "empty.title": "Không tìm thấy policy",
      "empty.sub": "Thử đổi từ khóa hoặc bộ lọc.",
      "detail.back": "← Về danh sách Policies",
      "detail.overview": "Tổng quan",
      "detail.desc": "Mô tả",
      "detail.scope": "Phạm vi",
      "detail.scope_agents": "Agent",
      "detail.scope_tools": "Công cụ",
      "detail.scope_know": "Tri thức",
      "detail.rules": "Luật",
      "detail.resources": "Tài nguyên",
      "detail.version": "Phiên bản",
      "detail.status": "Trạng thái",
      "detail.priority": "Ưu tiên",
      "detail.updated": "Cập nhật",
      "detail.history": "Lịch sử phiên bản",
      "detail.actions": "Thao tác",
      "detail.rule_applies": "Áp dụng cho",
      "act.edit": "Sửa policy", "act.duplicate": "Nhân bản",
      "act.disable": "Tắt", "act.enable": "Bật", "act.delete": "Xóa",
      "pri.high": "Cao", "pri.medium": "Trung bình", "pri.low": "Thấp",
      "rule.allow": "Cho phép", "rule.deny": "Từ chối", "rule.approval": "Cần phê duyệt",
      "drawer.create": "Chính sách mới", "drawer.edit": "Sửa policy",
      "form.name": "Tên policy", "form.category": "Danh mục",
      "form.desc": "Mô tả", "form.status": "Trạng thái", "form.priority": "Ưu tiên",
      "form.applies": "Áp dụng cho", "form.rules": "Luật", "form.resources": "Tài nguyên",
      "form.res_ph": "Mỗi dòng một mục",
      "form.rule_action": "Hành động", "form.rule_text": "Luật", "form.rule_text_ph": "Nội dung được kiểm soát...",
      "form.rule_target": "Đối tượng", "form.rule_target_ph": "Agent / Workspace / All",
      "form.add_rule": "+ Thêm luật", "form.remove_rule": "Xóa luật",
      "form.cancel": "Hủy", "form.create": "Tạo policy", "form.save": "Lưu thay đổi",
      "del.title": "Xóa policy?",
      "del.msg": "Hành động này không thể hoàn tác.",
      "del.confirm": "Xóa",
      "unsaved.title": "Thay đổi chưa lưu",
      "unsaved.msg": "Bạn có thay đổi chưa lưu.",
      "unsaved.discard": "Bỏ qua", "unsaved.keep": "Tiếp tục sửa",
      "toast.created": "Đã tạo policy.",
      "toast.updated": "Đã cập nhật policy.",
      "toast.deleted": "Đã xóa policy.",
      "toast.duplicated": "Đã nhân bản policy.",
      "toast.disabled": "Đã tắt policy.",
      "toast.enabled": "Đã bật policy.",
      "toast.need_name": "Tên policy là bắt buộc."
    }
  };

  var lang = "en";
  try {
    var savedLang = localStorage.getItem("agentos.lang");
    if (savedLang === "vi" || savedLang === "en") lang = savedLang;
  } catch (err) {}

  function t(key) {
    if (I18N[lang] && I18N[lang][key] != null) return I18N[lang][key];
    if (I18N.en[key] != null) return I18N.en[key];
    return key;
  }

  function L(obj) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] != null ? obj[lang] : (obj.en || "");
  }

  /* ---------------- Static demo data ---------------- */
  var CATS = ["Data Governance", "Agent Governance", "Tool Governance", "Workflow Governance", "Knowledge Governance", "Security"];
  var AGENT_LIST = ["Research Agent", "Planner", "Builder", "RAG Agent", "Analyst", "Reviewer"];
  var TOOL_LIST = ["Web Search", "SQL Query", "Python", "Charts", "Files"];
  var KNOW_LIST = ["Enterprise Data", "Finance Knowledge Base", "Q3 Reports"];

  function mkScope(agents, tools, know) {
    return {
      agents: AGENT_LIST.map(function (a) { return { name: a, allowed: agents.indexOf(a) !== -1 }; }),
      tools: TOOL_LIST.map(function (x) { return { name: x, allowed: tools.indexOf(x) !== -1 }; }),
      knowledge: KNOW_LIST.map(function (k) { return { name: k, allowed: know.indexOf(k) !== -1 }; })
    };
  }

  function seed() {
    return [
      { id: "p1", name: { en: "Data Access Policy", vi: "Chính sách truy cập dữ liệu" }, category: "Data Governance",
        desc: { en: "Controls how agents access enterprise data.", vi: "Kiểm soát cách agent truy cập dữ liệu doanh nghiệp." },
        status: "Active", version: "v1.2", priority: "High", updated: { en: "Today, 10:32", vi: "Hôm nay, 10:32" },
        history: [{ v: "v1.2", st: "Active" }, { v: "v1.1", st: "Archived" }, { v: "v1.0", st: "Archived" }],
        scope: mkScope(["Research Agent", "Analyst", "RAG Agent"], ["Web Search", "SQL Query"], ["Enterprise Data", "Finance Knowledge Base"]),
        rules: [
          { action: "approval", text: { en: "Financial data requires authorized access.", vi: "Dữ liệu tài chính cần quyền truy cập." }, target: "Research Agent" },
          { action: "deny", text: { en: "Sensitive information cannot be exposed.", vi: "Thông tin nhạy cảm không được để lộ." }, target: "All Agents" },
          { action: "deny", text: { en: "Restricted data cannot be sent to external tools.", vi: "Dữ liệu hạn chế không được gửi ra công cụ ngoài." }, target: "All Agents" }
        ],
        resources: ["Enterprise Knowledge", "Financial Knowledge Base"] },
      { id: "p2", name: { en: "Output Safety Policy", vi: "Chính sách an toàn đầu ra" }, category: "Agent Governance",
        desc: { en: "Screens agent outputs before delivery.", vi: "Kiểm duyệt đầu ra của agent trước khi giao." },
        status: "Active", version: "v2.0", priority: "High", updated: { en: "Yesterday, 16:05", vi: "Hôm qua, 16:05" },
        history: [{ v: "v2.0", st: "Active" }, { v: "v1.0", st: "Archived" }],
        scope: mkScope(AGENT_LIST.slice(), [], ["Enterprise Data"]),
        rules: [
          { action: "deny", text: { en: "Outputs with secrets are blocked.", vi: "Đầu ra chứa secret bị chặn." }, target: "All Agents" },
          { action: "approval", text: { en: "External publish needs approval.", vi: "Xuất bản ra ngoài cần phê duyệt." }, target: "All Agents" }
        ],
        resources: ["Output Filter"] },
      { id: "p3", name: { en: "Tool Access Policy", vi: "Chính sách truy cập công cụ" }, category: "Tool Governance",
        desc: { en: "Defines which tools each agent may call.", vi: "Quy định agent nào được gọi công cụ nào." },
        status: "Active", version: "v1.0", priority: "Medium", updated: { en: "Sep 12, 09:20", vi: "12/09, 09:20" },
        history: [{ v: "v1.0", st: "Active" }],
        scope: mkScope(["Builder", "Analyst"], ["Web Search", "SQL Query", "Python", "Charts", "Files"], []),
        rules: [
          { action: "allow", text: { en: "Read enterprise knowledge.", vi: "Đọc tri thức doanh nghiệp." }, target: "Research Agent" },
          { action: "deny", text: { en: "Export sensitive customer data.", vi: "Xuất dữ liệu khách hàng nhạy cảm." }, target: "All Agents" }
        ],
        resources: ["Tool Registry"] },
      { id: "p4", name: { en: "Human Approval Policy", vi: "Chính sách phê duyệt con người" }, category: "Workflow Governance",
        desc: { en: "Requires human approval before sensitive steps.", vi: "Yêu cầu con người phê duyệt trước bước nhạy cảm." },
        status: "Active", version: "v3.1", priority: "High", updated: { en: "Sep 10, 14:44", vi: "10/09, 14:44" },
        history: [{ v: "v3.1", st: "Active" }, { v: "v3.0", st: "Archived" }, { v: "v2.0", st: "Archived" }],
        scope: mkScope(AGENT_LIST.slice(), TOOL_LIST.slice(), KNOW_LIST.slice()),
        rules: [
          { action: "approval", text: { en: "Publishing reports needs Finance owner.", vi: "Xuất bản báo cáo cần chủ sở hữu Finance." }, target: "All Agents" },
          { action: "approval", text: { en: "Deleting data needs admin.", vi: "Xóa dữ liệu cần admin." }, target: "All Agents" }
        ],
        resources: ["Approval Queue"] },
      { id: "p5", name: { en: "Knowledge Access Policy", vi: "Chính sách truy cập tri thức" }, category: "Knowledge Governance",
        desc: { en: "Scopes which knowledge bases agents can read.", vi: "Giới hạn kho tri thức agent được đọc." },
        status: "Draft", version: "v0.9", priority: "Medium", updated: { en: "Sep 08, 11:02", vi: "08/09, 11:02" },
        history: [{ v: "v0.9", st: "Draft" }],
        scope: mkScope(["RAG Agent", "Research Agent"], [], ["Enterprise Data", "Finance Knowledge Base", "Q3 Reports"]),
        rules: [
          { action: "allow", text: { en: "RAG reads approved bases only.", vi: "RAG chỉ đọc kho đã duyệt." }, target: "RAG Agent" }
        ],
        resources: ["Enterprise Data", "Q3 Reports"] },
      { id: "p6", name: { en: "External Data Policy", vi: "Chính sách dữ liệu ngoài" }, category: "Security",
        desc: { en: "Guards outbound traffic to external services.", vi: "Bảo vệ luồng dữ liệu ra dịch vụ ngoài." },
        status: "Disabled", version: "v1.0", priority: "Low", updated: { en: "Aug 30, 15:30", vi: "30/08, 15:30" },
        history: [{ v: "v1.0", st: "Disabled" }],
        scope: mkScope([], ["Web Search"], []),
        rules: [
          { action: "deny", text: { en: "No raw exports to external APIs.", vi: "Không xuất thô ra API ngoài." }, target: "All Agents" }
        ],
        resources: ["Egress Filter"] }
    ];
  }

  var policies = seed();
  var state = { q: "", cat: "", status: "", detailId: null };

  /* ---------------- Helpers ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function showToast(msg, type) {
    var wrap = $("toasts");
    var el = document.createElement("div");
    el.className = "toast " + (type === "error" ? "error" : "success");
    el.innerHTML =
      (type === "error"
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>') +
      "<span>" + esc(msg) + "</span>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.25s";
      setTimeout(function () { el.remove(); }, 260);
    }, 3000);
  }

  function getPolicy(id) {
    for (var i = 0; i < policies.length; i++) if (policies[i].id === id) return policies[i];
    return null;
  }

  function statusCls(s) {
    return s === "Active" ? "st-active" : s === "Draft" ? "st-draft" : "st-disabled";
  }

  function priCls(p) {
    return p === "High" ? "pr-high" : p === "Medium" ? "pr-medium" : "";
  }

  /* ---------------- List ---------------- */
  function visiblePolicies() {
    var q = state.q.toLowerCase();
    return policies.filter(function (p) {
      if (state.cat && p.category !== state.cat) return false;
      if (state.status && p.status !== state.status) return false;
      if (q && (L(p.name) + " " + p.category + " " + L(p.desc)).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function filtersActive() {
    return !!(state.q || state.cat || state.status);
  }

  var SHIELD_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>';

  function statusName(s) {
    return s === "Active" ? t("status.active") : s === "Draft" ? t("status.draft") : t("status.disabled");
  }

  function renderGrid() {
    var list = visiblePolicies();
    var grid = $("policyGrid");
    grid.innerHTML = "";
    $("emptyState").hidden = list.length !== 0;
    list.forEach(function (p) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "policy-card";
      card.setAttribute("data-id", p.id);
      card.setAttribute("aria-label", L(p.name));
      card.innerHTML =
        '<div class="policy-card-top"><span class="policy-icon">' + SHIELD_SVG + "</span>" +
        '<span class="priority-badge ' + priCls(p.priority) + '">' + esc(t("pri." + p.priority.toLowerCase())) + "</span></div>" +
        '<h3 class="policy-name">' + esc(L(p.name)) + "</h3>" +
        '<span class="policy-cat">' + esc(p.category) + "</span>" +
        '<p class="policy-desc">' + esc(L(p.desc)) + "</p>" +
        '<div class="policy-foot"><span class="status-dot ' + statusCls(p.status) + '">' + esc(statusName(p.status)) + "</span>" +
        '<span class="policy-ver">' + esc(p.version) + "</span></div>";
      card.addEventListener("click", function () { openDetail(p.id); });
      grid.appendChild(card);
    });
    $("btnClearFilters").hidden = !filtersActive();
    renderPanel();
  }

  function renderPanel() {
    var active = policies.filter(function (p) { return p.status === "Active"; }).length;
    var pct = policies.length ? Math.round((active / policies.length) * 100) : 0;
    var agents = {};
    var rules = 0;
    policies.forEach(function (p) {
      rules += p.rules.length;
      (p.scope.agents || []).forEach(function (a) { if (a.allowed) agents[a.name] = true; });
    });
    var bar = $("rpPolicyBar");
    if (bar) bar.style.width = pct + "%";
    var wrap = $("rpPolicyBarWrap");
    if (wrap) wrap.setAttribute("aria-valuenow", String(pct));
    if ($("rpPolicyPct")) $("rpPolicyPct").textContent = pct + "%";
    if ($("rpStatActive")) $("rpStatActive").textContent = active;
    if ($("rpStatAgents")) $("rpStatAgents").textContent = Object.keys(agents).length;
    if ($("rpStatRules")) $("rpStatRules").textContent = rules;
  }

  /* ---------------- Detail (in main) ---------------- */
  function scopeList(items) {
    return '<ul class="scope-list">' + items.map(function (it) {
      return '<li><span class="' + (it.allowed ? "scope-allow" : "scope-deny") + '">' +
        (it.allowed ? "✓" : "✕") + "</span><span>" + esc(it.name) + "</span></li>";
    }).join("") + "</ul>";
  }

  function ruleActionName(a) {
    return a === "allow" ? t("rule.allow") : a === "deny" ? t("rule.deny") : t("rule.approval");
  }

  function ruleActionCls(a) {
    return a === "allow" ? "rule-allow" : a === "deny" ? "rule-deny" : "rule-approval";
  }

  function openDetail(id) {
    var p = getPolicy(id);
    if (!p) return;
    state.detailId = id;
    var body = $("policyDetailBody");
    body.innerHTML =
      '<div class="detail-card"><div class="detail-title-row"><h2>' + esc(L(p.name)) + "</h2></div>" +
      '<div class="detail-meta"><span class="policy-cat">' + esc(p.category) + "</span>" +
      '<span class="status-dot ' + statusCls(p.status) + '">' + esc(statusName(p.status)) + "</span>" +
      '<span class="priority-badge ' + priCls(p.priority) + '">' + esc(t("pri." + p.priority.toLowerCase())) + "</span></div>" +
      '<span class="section-label">' + esc(t("detail.desc")) + "</span>" +
      '<p class="desc-text">' + esc(L(p.desc)) + "</p></div>" +

      '<div class="detail-card"><span class="section-label">' + esc(t("detail.overview")) + "</span>" +
      '<dl class="kv">' +
      "<dt>" + esc(t("detail.version")) + "</dt><dd>" + esc(p.version) + "</dd>" +
      "<dt>" + esc(t("detail.status")) + "</dt><dd>" + esc(statusName(p.status)) + "</dd>" +
      "<dt>" + esc(t("detail.priority")) + "</dt><dd>" + esc(t("pri." + p.priority.toLowerCase())) + "</dd>" +
      "<dt>" + esc(t("detail.updated")) + "</dt><dd>" + esc(L(p.updated)) + "</dd>" +
      "</dl>" +
      '<span class="section-label">' + esc(t("detail.history")) + "</span>" +
      '<ul class="history-list">' + p.history.map(function (h) {
        return "<li><span>" + esc(h.v) + "</span><span class=\"status-dot " +
          (h.st === "Active" ? "st-active" : "st-disabled") + "\">" +
          esc(h.st === "Active" ? statusName("Active") : h.st) + "</span></li>";
      }).join("") + "</ul></div>" +

      '<div class="detail-card"><span class="section-label">' + esc(t("detail.scope")) + "</span>" +
      '<div class="scope-group"><span>' + esc(t("detail.scope_agents")) + "</span>" + scopeList(p.scope.agents) + "</div>" +
      '<div class="scope-group"><span>' + esc(t("detail.scope_tools")) + "</span>" + scopeList(p.scope.tools) + "</div>" +
      '<div class="scope-group"><span>' + esc(t("detail.scope_know")) + "</span>" + scopeList(p.scope.knowledge) + "</div></div>" +

      '<div class="detail-card"><span class="section-label">' + esc(t("detail.rules")) + "</span>" +
      p.rules.map(function (r, i) {
        var n = i + 1;
        return '<div class="rule-row"><span class="rule-num">' + (n < 10 ? "0" + n : n) + "</span><div>" +
          '<div class="rule-action ' + ruleActionCls(r.action) + '">' + esc(ruleActionName(r.action)) + "</div>" +
          '<div class="rule-text">' + esc(L(r.text)) + "</div>" +
          '<div class="rule-target">' + esc(t("detail.rule_applies")) + ": " + esc(r.target) + "</div></div></div>";
      }).join("") +
      '<span class="section-label">' + esc(t("detail.resources")) + "</span>" +
      '<p class="desc-text">' + esc(p.resources.join(" · ") || "—") + "</p></div>" +

      '<div class="detail-card"><span class="section-label">' + esc(t("detail.actions")) + "</span>" +
      '<div class="detail-actions">' +
      '<button type="button" class="btn btn-secondary btn-sm" data-dact="edit">' + esc(t("act.edit")) + "</button>" +
      '<button type="button" class="btn btn-secondary btn-sm" data-dact="duplicate">' + esc(t("act.duplicate")) + "</button>" +
      (p.status === "Disabled"
        ? '<button type="button" class="btn btn-secondary btn-sm" data-dact="enable">' + esc(t("act.enable")) + "</button>"
        : '<button type="button" class="btn btn-secondary btn-sm" data-dact="disable">' + esc(t("act.disable")) + "</button>") +
      '<button type="button" class="btn btn-danger btn-sm" data-dact="delete">' + esc(t("act.delete")) + "</button>" +
      "</div></div>";

    $("policyGrid").hidden = true;
    $("emptyState").hidden = true;
    $("policyDetail").hidden = false;
    document.querySelector(".policy-scroll").scrollTop = 0;

    body.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-dact]") : null;
      if (!b) return;
      var act = b.getAttribute("data-dact");
      if (act === "edit") openDrawer("edit", id);
      else if (act === "duplicate") duplicatePolicy(id);
      else if (act === "disable" || act === "enable") togglePolicy(id);
      else if (act === "delete") askDelete(id);
    };
  }

  function closeDetail() {
    state.detailId = null;
    $("policyDetail").hidden = true;
    renderGrid();
  }

  function refreshDetail() {
    if (state.detailId) {
      if (getPolicy(state.detailId)) openDetail(state.detailId);
      else closeDetail();
    }
  }

  /* ---------------- CRUD (in-memory) ---------------- */
  function duplicatePolicy(id) {
    var p = getPolicy(id);
    if (!p) return;
    var copy = JSON.parse(JSON.stringify(p));
    copy.id = "p" + Date.now().toString(36);
    copy.name = { en: p.name.en + " (copy)", vi: p.name.vi + " (bản sao)" };
    copy.status = "Draft";
    copy.version = "v0.1";
    copy.history = [{ v: "v0.1", st: "Draft" }];
    policies.unshift(copy);
    renderGrid();
    showToast(t("toast.duplicated"));
  }

  function togglePolicy(id) {
    var p = getPolicy(id);
    if (!p) return;
    p.status = p.status === "Disabled" ? "Active" : "Disabled";
    renderGrid();
    refreshDetail();
    showToast(p.status === "Disabled" ? t("toast.disabled") : t("toast.enabled"));
  }

  function askDelete(id) {
    var p = getPolicy(id);
    if (!p) return;
    openConfirm(t("del.title"), '"' + L(p.name) + '"\n' + t("del.msg"), t("del.confirm"), true, function () {
      policies = policies.filter(function (x) { return x.id !== id; });
      if (state.detailId === id) closeDetail();
      else renderGrid();
      showToast(t("toast.deleted"));
    });
  }

  /* ---------------- Drawer (create / edit) ---------------- */
  var drawerMode = null; // "create" | "edit"
  var drawerId = null;
  var drawerDirty = false;
  var lastFocus = null;

  function openDrawer(mode, id) {
    drawerMode = mode;
    drawerId = id || null;
    drawerDirty = false;
    var p = id ? getPolicy(id) : null;
    lastFocus = document.activeElement;
    $("drawerTitle").textContent = mode === "edit" ? t("drawer.edit") : t("drawer.create");
    var body = $("drawerBody");
    var foot = $("drawerFoot");
    body.innerHTML =
      '<div class="form-group"><label for="fName">' + esc(t("form.name")) + "</label>" +
      '<input class="text-input" id="fName" maxlength="80" value="' + esc(p ? L(p.name) : "") + '" /></div>' +
      '<div class="form-row"><div class="form-group"><label for="fCat">' + esc(t("form.category")) + "</label>" +
      '<select class="select" id="fCat">' + CATS.map(function (c) {
        return '<option value="' + esc(c) + '"' + (p && p.category === c ? " selected" : "") + ">" + esc(c) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="form-group"><label for="fStatus">' + esc(t("form.status")) + "</label>" +
      '<select class="select" id="fStatus">' + ["Active", "Draft", "Disabled"].map(function (s) {
        return '<option value="' + s + '"' + (p && p.status === s ? " selected" : "") + ">" + esc(statusName(s)) + "</option>";
      }).join("") + "</select></div></div>" +
      '<div class="form-group"><label for="fPri">' + esc(t("form.priority")) + "</label>" +
      '<select class="select" id="fPri">' + ["High", "Medium", "Low"].map(function (s) {
        return '<option value="' + s + '"' + (p && p.priority === s ? " selected" : "") + ">" + esc(t("pri." + s.toLowerCase())) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="form-group"><label for="fDesc">' + esc(t("form.desc")) + "</label>" +
      '<textarea class="text-input" id="fDesc">' + esc(p ? L(p.desc) : "") + "</textarea></div>" +
      '<div class="form-group"><label>' + esc(t("form.applies")) + "</label><div id=" + '"scopeBox"></div></div>' +
      '<div class="form-group"><label>' + esc(t("form.rules")) + "</label><div id=" + '"ruleBox"></div>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="btnAddRule">' + esc(t("form.add_rule")) + "</button></div>" +
      '<div class="form-group"><label for="fRes">' + esc(t("form.resources")) + "</label>" +
      '<textarea class="text-input" id="fRes" placeholder="' + esc(t("form.res_ph")) + '">' +
      esc(p ? p.resources.join("\n") : "") + "</textarea></div>";
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" id="btnDrawerCancel">' + esc(t("form.cancel")) + "</button>" +
      '<button type="button" class="btn btn-primary btn-sm" id="btnDrawerSave">' +
      esc(mode === "edit" ? t("form.save") : t("form.create")) + "</button>";

    renderScopeBox(p);
    renderRuleBox(p ? p.rules : [{ action: "allow", text: { en: "", vi: "" }, target: "All Agents" }]);

    $("drawer").hidden = false;
    $("drawerOverlay").hidden = false;
    document.body.style.overflow = "hidden";

    body.oninput = function () { drawerDirty = true; };
    body.onchange = function () { drawerDirty = true; };
    $("btnAddRule").addEventListener("click", function () {
      addRuleRow({ action: "allow", text: { en: "", vi: "" }, target: "All Agents" });
      drawerDirty = true;
    });
    $("btnDrawerCancel").addEventListener("click", tryCloseDrawer);
    $("btnDrawerSave").addEventListener("click", saveDrawer);
    var first = $("fName");
    if (first) first.focus();
  }

  function scopeChecks(list, picked, group) {
    return list.map(function (name) {
      var on = picked && picked.indexOf(name) !== -1;
      return '<label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;font-weight:400;margin-bottom:6px">' +
        '<input type="checkbox" data-scope-group="' + group + '" value="' + esc(name) + '"' +
        (on ? " checked" : "") + " /> " + esc(name) + "</label>";
    }).join("");
  }

  function renderScopeBox(p) {
    var box = $("scopeBox");
    if (!box) return;
    function picked(items, group) {
      if (!p || !p.scope || !p.scope[group]) return [];
      return p.scope[group].filter(function (x) { return x.allowed; }).map(function (x) { return x.name; });
    }
    box.innerHTML =
      '<div style="font-size:0.75rem;font-weight:700;margin:4px 0">' + esc(t("detail.scope_agents")) + "</div>" +
      scopeChecks(AGENT_LIST, picked(0, "agents"), "agents") +
      '<div style="font-size:0.75rem;font-weight:700;margin:8px 0 4px">' + esc(t("detail.scope_tools")) + "</div>" +
      scopeChecks(TOOL_LIST, picked(0, "tools"), "tools") +
      '<div style="font-size:0.75rem;font-weight:700;margin:8px 0 4px">' + esc(t("detail.scope_know")) + "</div>" +
      scopeChecks(KNOW_LIST, picked(0, "knowledge"), "knowledge");
  }

  function ruleRowHtml(r) {
    return '<div class="rule-editor">' +
      '<div class="form-row"><div><label style="font-size:0.75rem;font-weight:600">' + esc(t("form.rule_action")) + "</label>" +
      '<select class="select" data-rule="action">' + ["allow", "deny", "approval"].map(function (a) {
        return '<option value="' + a + '"' + (r.action === a ? " selected" : "") + ">" +
          esc(a === "allow" ? t("rule.allow") : a === "deny" ? t("rule.deny") : t("rule.approval")) + "</option>";
      }).join("") + "</select></div>" +
      '<div><label style="font-size:0.75rem;font-weight:600">' + esc(t("form.rule_target")) + "</label>" +
      '<input class="text-input" data-rule="target" placeholder="' + esc(t("form.rule_target_ph")) + '" value="' + esc(r.target || "") + '" /></div></div>' +
      '<div><label style="font-size:0.75rem;font-weight:600">' + esc(t("form.rule_text")) + "</label>" +
      '<input class="text-input" data-rule="text" placeholder="' + esc(t("form.rule_text_ph")) + '" value="' + esc(L(r.text)) + '" /></div>' +
      '<button type="button" class="btn btn-secondary btn-sm rule-remove">' + esc(t("form.remove_rule")) + "</button></div>";
  }

  function renderRuleBox(rules) {
    var box = $("ruleBox");
    if (!box) return;
    box.innerHTML = "";
    (rules.length ? rules : [{ action: "allow", text: { en: "", vi: "" }, target: "All Agents" }]).forEach(function (r) {
      addRuleRow(r);
    });
  }

  function addRuleRow(r) {
    var box = $("ruleBox");
    if (!box) return;
    var wrap = document.createElement("div");
    wrap.innerHTML = ruleRowHtml(r);
    var row = wrap.firstChild;
    row.querySelector(".rule-remove").addEventListener("click", function () {
      row.remove();
      drawerDirty = true;
    });
    box.appendChild(row);
  }

  function collectScope() {
    function group(name, all) {
      var picked = [];
      document.querySelectorAll('[data-scope-group="' + name + '"]:checked').forEach(function (c) {
        picked.push(c.value);
      });
      return all.map(function (n) { return { name: n, allowed: picked.indexOf(n) !== -1 }; });
    }
    return { agents: group("agents", AGENT_LIST), tools: group("tools", TOOL_LIST), knowledge: group("knowledge", KNOW_LIST) };
  }

  function collectRules() {
    var out = [];
    document.querySelectorAll("#ruleBox .rule-editor").forEach(function (row) {
      var action = row.querySelector('[data-rule="action"]').value;
      var text = row.querySelector('[data-rule="text"]').value.trim();
      var target = row.querySelector('[data-rule="target"]').value.trim() || "All Agents";
      if (!text) return;
      out.push({ action: action, text: { en: text, vi: text }, target: target });
    });
    return out;
  }

  function saveDrawer() {
    var name = $("fName").value.trim();
    if (!name) { $("fName").focus(); showToast(t("toast.need_name"), "error"); return; }
    var data = {
      name: { en: name, vi: name },
      category: $("fCat").value,
      desc: { en: $("fDesc").value.trim(), vi: $("fDesc").value.trim() },
      status: $("fStatus").value,
      priority: $("fPri").value,
      scope: collectScope(),
      rules: collectRules(),
      resources: $("fRes").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean)
    };
    if (drawerMode === "edit" && drawerId) {
      var p = getPolicy(drawerId);
      if (!p) return;
      Object.keys(data).forEach(function (k) { p[k] = data[k]; });
      p.updated = lang === "vi" ? "Vừa xong" : "Just now";
      showToast(t("toast.updated"));
    } else {
      policies.unshift(Object.assign({
        id: "p" + Date.now().toString(36),
        version: "v0.1",
        history: [{ v: "v0.1", st: "Draft" }],
        updated: lang === "vi" ? "Vừa xong" : "Just now"
      }, data));
      showToast(t("toast.created"));
    }
    drawerDirty = false;
    closeDrawer();
    renderGrid();
    refreshDetail();
  }

  function closeDrawer() {
    $("drawer").hidden = true;
    $("drawerOverlay").hidden = true;
    document.body.style.overflow = "";
    drawerMode = null;
    drawerId = null;
    drawerDirty = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function tryCloseDrawer() {
    if (!drawerDirty) { closeDrawer(); return; }
    openConfirm(t("unsaved.title"), t("unsaved.msg"), t("unsaved.discard"), false, function () {
      closeDrawer();
    }, t("unsaved.keep"));
  }

  /* ---------------- Generic confirm modal ---------------- */
  var confirmCb = null;
  var confirmCancelLabel = null;

  function openConfirm(title, desc, confirmLabel, danger, onConfirm, cancelLabel) {
    confirmCb = onConfirm || null;
    $("modalTitle").textContent = title;
    $("modalDesc").textContent = desc;
    var ok = $("modalConfirm");
    ok.textContent = confirmLabel;
    ok.className = danger ? "btn btn-danger" : "btn btn-primary";
    $("modalCancel").textContent = cancelLabel || t("form.cancel");
    lastFocus = document.activeElement;
    $("confirmModal").hidden = false;
    $("modalOverlay").hidden = false;
    $("modalCancel").focus();
  }

  function closeModal() {
    $("confirmModal").hidden = true;
    $("modalOverlay").hidden = true;
    confirmCb = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------------- Theme + lang ---------------- */
  function initTheme() {
    var tt = $("themeToggle");
    if (!tt) return;
    try { tt.setAttribute("aria-pressed", String(document.documentElement.classList.contains("dark"))); } catch (err) {}
    tt.addEventListener("click", function () {
      var dark = document.documentElement.classList.toggle("dark");
      tt.setAttribute("aria-pressed", String(dark));
      try { localStorage.setItem("agentos.theme", dark ? "dark" : "light"); } catch (err) {}
    });
  }

  function applyLang(next) {
    if (next === "vi" || next === "en") lang = next;
    try { localStorage.setItem("agentos.lang", lang); } catch (err) {}
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    renderGrid();
    refreshDetail();
  }

  /* ---------------- Init ---------------- */
  function init() {
    initTheme();
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });

    // Category options (static list, translated labels)
    var catSel = $("filterCat");
    CATS.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      catSel.appendChild(o);
    });

    $("searchInput").addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      if (state.detailId) closeDetail();
      renderGrid();
    });
    $("filterCat").addEventListener("change", function (e) { state.cat = e.target.value; renderGrid(); });
    $("filterStatus").addEventListener("change", function (e) { state.status = e.target.value; renderGrid(); });

    $("btnClearFilters").addEventListener("click", clearFilters);
    $("btnEmptyClear").addEventListener("click", clearFilters);
    function clearFilters() {
      state.q = ""; state.cat = ""; state.status = "";
      $("searchInput").value = "";
      $("filterCat").value = ""; $("filterStatus").value = "";
      renderGrid();
    }

    $("btnNew").addEventListener("click", function () { openDrawer("create"); });
    $("btnBack").addEventListener("click", closeDetail);

    $("drawerClose").addEventListener("click", tryCloseDrawer);
    $("drawerOverlay").addEventListener("click", tryCloseDrawer);
    $("modalCancel").addEventListener("click", closeModal);
    $("modalOverlay").addEventListener("click", closeModal);
    $("modalConfirm").addEventListener("click", function () {
      var cb = confirmCb;
      closeModal();
      if (cb) cb();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!$("confirmModal").hidden) closeModal();
        else if (!$("drawer").hidden) tryCloseDrawer();
      }
    });

    applyLang();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
