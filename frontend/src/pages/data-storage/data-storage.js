// Data Storage — artifacts & outputs of AgentOS (frontend-only, in-memory).
// Distinct from Documents (inputs/knowledge): table-first, folders,
// source traceability. No fetch, no backend. Reload restores demo data.
(function () {
  "use strict";

  /* ---------------- i18n (EN/VI, shared agentos.lang key) ---------------- */
  var I18N = {
    en: {
      "meta.title": "Data Storage — AgentOS",
      "meta.desc": "Manage files, artifacts and outputs generated across AgentOS.",
      "nav.new": "New Task", "nav.chat": "Chat", "nav.agents": "Agents",
      "nav.docs": "Documents", "nav.policies": "Policies", "nav.analytics": "Analytics", "nav.models": "Models",
      "nav.logs": "Logs", "nav.settings": "Settings", "nav.storage": "Data Storage",
      "rp.ws_plan": "Company Plan",
      "rp.agents": "Agents", "rp.sources": "RAG Sources", "rp.tools": "Tools",
      "rp.src_dw": "Enterprise Data Warehouse", "rp.src_kb": "Finance KnowledgeBase", "rp.src_q3": "Q3 Reports & Docs",
      "rp.tool_sql": "SQL Query", "rp.tool_py": "Python", "rp.tool_charts": "Charts",
      "rp.tool_web": "Web Search", "rp.tool_files": "Files",
      "page.title": "Data Storage",
      "page.sub": "Manage files and artifacts generated across AgentOS.",
      "page.upload": "Upload",
      "page.search_ph": "Search files...",
      "filter.type_all": "Type: All",
      "filter.source_all": "Source: All",
      "filter.clear": "Clear filters",
      "type.report": "Reports", "type.chat": "Chat Exports", "type.agent": "Agent Outputs",
      "type.file": "Files", "type.other": "Other",
      "kind.report": "Report", "kind.chat": "Chat Export", "kind.agent": "Agent Output",
      "kind.file": "File", "kind.other": "Other",
      "source.upload": "Upload",
      "sort.newest": "Newest", "sort.oldest": "Oldest", "sort.az": "Name", "sort.size": "Size",
      "folder.new": "New folder", "folder.all": "All files",
      "folder.rename": "Rename folder", "folder.delete": "Delete folder",
      "folder.delete_confirm": "Delete this folder? Files inside stay in All files.",
      "folder.not_empty": "Folder is not empty. Move files out first.",
      "folder.name_ph": "Folder name",
      "summary.title": "Storage",
      "summary.used": "12.4 GB used · 37.6 GB available",
      "summary.files": "Files", "summary.artifacts": "Artifacts", "summary.reports": "Reports",
      "col.name": "Name", "col.type": "Type", "col.source": "Source",
      "col.size": "Size", "col.modified": "Modified",
      "bulk.download": "Download", "bulk.delete": "Delete",
      "empty.title": "No files yet",
      "empty.sub": "Files and artifacts created by AgentOS will appear here.",
      "empty.upload": "Upload files",
      "empty.search_title": "No matching files",
      "empty.search_sub": "Try changing your search or filters.",
      "menu.open": "Open", "menu.preview": "Preview", "menu.download": "Download",
      "menu.rename": "Rename", "menu.move": "Move", "menu.source": "View source", "menu.delete": "Delete",
      "preview.title": "Preview",
      "preview.type": "Type", "preview.size": "Size", "preview.source": "Source",
      "preview.task": "Task", "preview.created": "Created", "preview.desc": "Description",
      "preview.trace": "Source trace",
      "trace.agent": "Agent", "trace.task": "Task", "trace.run": "Run", "trace.goal": "Goal",
      "upload.title": "Upload files",
      "upload.drop": "Drag & drop files here", "upload.or": "or", "upload.browse": "Browse files",
      "upload.supported": "Supported: PDF · DOCX · XLSX · CSV · TXT · JSON",
      "form.cancel": "Cancel", "form.upload": "Upload", "form.save": "Save",
      "rename.title": "Rename",
      "rename.label": "New name",
      "move.title": "Move to folder",
      "move.label": "Folder",
      "del.title": "Delete file?",
      "del.msg": "This file will be permanently removed from Data Storage.",
      "del.confirm": "Delete",
      "del.bulk_msg": "These files will be permanently removed from Data Storage.",
      "toast.uploaded": "Files uploaded.",
      "toast.deleted": "File deleted.",
      "toast.bulk_deleted": "Files deleted.",
      "toast.renamed": "File renamed.",
      "toast.moved": "File moved.",
      "toast.download": "Download will be connected to the backend later.",
      "toast.folder_created": "Folder created.",
      "toast.folder_renamed": "Folder renamed.",
      "toast.folder_deleted": "Folder deleted.",
      "toast.need_name": "Name is required."
    },
    vi: {
      "meta.title": "Lưu trữ dữ liệu — AgentOS",
      "meta.desc": "Quản lý file và artifact do AgentOS tạo ra.",
      "nav.new": "Tác vụ mới", "nav.chat": "Đoạn chat", "nav.agents": "Agent",
      "nav.docs": "Tài liệu", "nav.policies": "Policies", "nav.analytics": "Phân tích", "nav.models": "Mô hình",
      "nav.logs": "Nhật ký", "nav.settings": "Cài đặt", "nav.storage": "Lưu trữ dữ liệu",
      "rp.ws_plan": "Gói công ty",
      "rp.agents": "Agent", "rp.sources": "Nguồn RAG", "rp.tools": "Công cụ",
      "rp.src_dw": "Kho dữ liệu doanh nghiệp", "rp.src_kb": "Cơ sở tri thức Tài chính", "rp.src_q3": "Báo cáo & Tài liệu Q3",
      "rp.tool_sql": "Truy vấn SQL", "rp.tool_py": "Python", "rp.tool_charts": "Biểu đồ",
      "rp.tool_web": "Tìm kiếm Web", "rp.tool_files": "Tệp",
      "page.title": "Lưu trữ dữ liệu",
      "page.sub": "Quản lý file và artifact do AgentOS tạo ra.",
      "page.upload": "Tải lên",
      "page.search_ph": "Tìm kiếm file...",
      "filter.type_all": "Loại: Tất cả",
      "filter.source_all": "Nguồn: Tất cả",
      "filter.clear": "Xóa lọc",
      "type.report": "Báo cáo", "type.chat": "Xuất chat", "type.agent": "Kết quả agent",
      "type.file": "File", "type.other": "Khác",
      "kind.report": "Báo cáo", "kind.chat": "Xuất chat", "kind.agent": "Kết quả agent",
      "kind.file": "File", "kind.other": "Khác",
      "source.upload": "Tải lên",
      "sort.newest": "Mới nhất", "sort.oldest": "Cũ nhất", "sort.az": "Tên", "sort.size": "Dung lượng",
      "folder.new": "Thư mục mới", "folder.all": "Tất cả file",
      "folder.rename": "Đổi tên thư mục", "folder.delete": "Xóa thư mục",
      "folder.delete_confirm": "Xóa thư mục này? File bên trong vẫn ở Tất cả file.",
      "folder.not_empty": "Thư mục còn file. Hãy chuyển file ra trước.",
      "folder.name_ph": "Tên thư mục",
      "summary.title": "Lưu trữ",
      "summary.used": "Đã dùng 12.4 GB · Còn 37.6 GB",
      "summary.files": "File", "summary.artifacts": "Artifact", "summary.reports": "Báo cáo",
      "col.name": "Tên", "col.type": "Loại", "col.source": "Nguồn",
      "col.size": "Dung lượng", "col.modified": "Sửa đổi",
      "bulk.download": "Tải xuống", "bulk.delete": "Xóa",
      "empty.title": "Chưa có file",
      "empty.sub": "File và artifact do AgentOS tạo sẽ hiện ở đây.",
      "empty.upload": "Tải file lên",
      "empty.search_title": "Không có file khớp",
      "empty.search_sub": "Thử đổi từ khóa hoặc bộ lọc.",
      "menu.open": "Mở", "menu.preview": "Xem trước", "menu.download": "Tải xuống",
      "menu.rename": "Đổi tên", "menu.move": "Di chuyển", "menu.source": "Xem nguồn", "menu.delete": "Xóa",
      "preview.title": "Xem trước",
      "preview.type": "Loại", "preview.size": "Dung lượng", "preview.source": "Nguồn",
      "preview.task": "Tác vụ", "preview.created": "Ngày tạo", "preview.desc": "Mô tả",
      "preview.trace": "Truy vết nguồn",
      "trace.agent": "Agent", "trace.task": "Tác vụ", "trace.run": "Lượt chạy", "trace.goal": "Mục tiêu",
      "upload.title": "Tải file lên",
      "upload.drop": "Kéo & thả file vào đây", "upload.or": "hoặc", "upload.browse": "Chọn file",
      "upload.supported": "Hỗ trợ: PDF · DOCX · XLSX · CSV · TXT · JSON",
      "form.cancel": "Hủy", "form.upload": "Tải lên", "form.save": "Lưu",
      "rename.title": "Đổi tên",
      "rename.label": "Tên mới",
      "move.title": "Chuyển tới thư mục",
      "move.label": "Thư mục",
      "del.title": "Xóa file?",
      "del.msg": "File sẽ bị xóa vĩnh viễn khỏi Data Storage.",
      "del.confirm": "Xóa",
      "del.bulk_msg": "Các file này sẽ bị xóa vĩnh viễn khỏi Data Storage.",
      "toast.uploaded": "Đã tải file lên.",
      "toast.deleted": "Đã xóa file.",
      "toast.bulk_deleted": "Đã xóa các file.",
      "toast.renamed": "Đã đổi tên file.",
      "toast.moved": "Đã di chuyển file.",
      "toast.download": "Tải xuống sẽ được kết nối backend sau.",
      "toast.folder_created": "Đã tạo thư mục.",
      "toast.folder_renamed": "Đã đổi tên thư mục.",
      "toast.folder_deleted": "Đã xóa thư mục.",
      "toast.need_name": "Tên là bắt buộc."
    }
  };

  window.AgentShared.i18n.init(I18N, renderAll);

  function t(key) { return window.AgentShared.i18n.t(key); }
  function applyLang(next) { window.AgentShared.i18n.applyLang(next); }

  /* ---------------- Static demo data (12 records) ---------------- */
  var FOLDERS = ["Research", "Reports", "Chat exports", "Agent outputs"];

  function seed() {
    return [
      { id: "f01", name: "Q3_Report.pdf", ext: "PDF", kind: "Report", source: "Agent", sizeMB: 2.4, modified: "2026-09-16T10:22", modifiedLabel: "10 min ago", folder: "Reports", by: "Research Agent", desc: "Board-ready Q3 revenue report with cited sources.", trace: { agent: "Research Agent", task: "Task #2841", run: "Run #9182", goal: "Q3 Revenue Analysis" } },
      { id: "f02", name: "Revenue.xlsx", ext: "XLSX", kind: "Report", source: "Task", sizeMB: 0.84, modified: "2026-09-16T10:07", modifiedLabel: "25 min ago", folder: "Reports", by: "Data Agent", desc: "Revenue breakdown by segment and channel.", trace: { agent: "Data Agent", task: "Task #2840", run: "Run #9180", goal: "Weekly Revenue Review" } },
      { id: "f03", name: "chat-2841.json", ext: "JSON", kind: "Chat Export", source: "Chat", sizeMB: 0.12, modified: "2026-09-16T09:31", modifiedLabel: "1 hour ago", folder: "Chat exports", by: "You", desc: "Exported chat transcript with agent citations.", trace: { agent: "—", task: "Task #2841", run: "—", goal: "Q3 Revenue Analysis" } },
      { id: "f04", name: "output.mp4", ext: "MP4", kind: "Agent Output", source: "Agent", sizeMB: 84, modified: "2026-09-16T08:40", modifiedLabel: "2 hours ago", folder: "Agent outputs", by: "Media Agent", desc: "Translated product walkthrough video.", trace: { agent: "Media Agent", task: "Task #2836", run: "Run #9171", goal: "Product Video i18n" } },
      { id: "f05", name: "research_summary.docx", ext: "DOCX", kind: "Agent Output", source: "Agent", sizeMB: 1.2, modified: "2026-09-15T16:12", modifiedLabel: "Yesterday", folder: "Research", by: "Research Agent", desc: "Competitor pricing summary with 74 sources.", trace: { agent: "Research Agent", task: "Task #2829", run: "Run #9155", goal: "Q2 Market Intel" } },
      { id: "f06", name: "customer_analysis.csv", ext: "CSV", kind: "Report", source: "Run", sizeMB: 4.6, modified: "2026-09-15T11:03", modifiedLabel: "Yesterday", folder: "Reports", by: "Data Agent", desc: "Customer cohort analysis export.", trace: { agent: "Data Agent", task: "Task #2825", run: "Run #9148", goal: "Cohort Analysis" } },
      { id: "f07", name: "final_report.pdf", ext: "PDF", kind: "Report", source: "Task", sizeMB: 9.8, modified: "2026-09-14T15:44", modifiedLabel: "2 days ago", folder: "Reports", by: "Synthesis", desc: "Final validated executive report.", trace: { agent: "Synthesis", task: "Task #2819", run: "Run #9139", goal: "Q3 Revenue Analysis" } },
      { id: "f08", name: "workflow_result.json", ext: "JSON", kind: "Agent Output", source: "Run", sizeMB: 0.32, modified: "2026-09-13T09:26", modifiedLabel: "3 days ago", folder: "Agent outputs", by: "Orchestrator", desc: "Workflow execution result payload.", trace: { agent: "Orchestrator", task: "Task #2811", run: "Run #9120", goal: "Nightly Triage" } },
      { id: "f09", name: "agent_output.md", ext: "MD", kind: "Agent Output", source: "Agent", sizeMB: 0.08, modified: "2026-09-12T17:51", modifiedLabel: "4 days ago", folder: "Agent outputs", by: "Analyst", desc: "Markdown notes from variance review.", trace: { agent: "Analyst", task: "Task #2804", run: "Run #9102", goal: "Variance Review" } },
      { id: "f10", name: "translated_video.mp4", ext: "MP4", kind: "Agent Output", source: "Agent", sizeMB: 132, created: "2026-09-11", modified: "2026-09-11T13:15", modifiedLabel: "5 days ago", folder: "Agent outputs", by: "Media Agent", desc: "Localized onboarding video.", trace: { agent: "Media Agent", task: "Task #2798", run: "Run #9090", goal: "Onboarding i18n" } },
      { id: "f11", name: "research_sources.zip", ext: "ZIP", kind: "File", source: "Upload", sizeMB: 22.5, modified: "2026-09-10T10:08", modifiedLabel: "6 days ago", folder: "Research", by: "You", desc: "Archived filings bundle.", trace: { agent: "—", task: "—", run: "—", goal: "Q2 Market Intel" } },
      { id: "f12", name: "notes.txt", ext: "TXT", kind: "File", source: "Upload", sizeMB: 0.01, modified: "2026-09-09T08:00", modifiedLabel: "7 days ago", folder: "Research", by: "You", desc: "Scratch notes.", trace: { agent: "—", task: "—", run: "—", goal: "—" } }
    ];
  }

  var files = seed();
  var folders = FOLDERS.slice();
  var state = { q: "", type: "", source: "", sort: "newest", folder: "", grid: false, selected: {} };

  /* ---------------- Helpers ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) { return window.AgentShared.esc(s); }

  function fmtSize(mb) {
    if (mb >= 1024) return (mb / 1024).toFixed(1) + " GB";
    if (mb >= 1) return (mb >= 10 ? Math.round(mb) : mb.toFixed(1)) + " MB";
    return Math.max(1, Math.round(mb * 1024)) + " KB";
  }

  function showToast(msg, type) { window.AgentShared.toast(msg, type); }

  function getFile(id) {
    for (var i = 0; i < files.length; i++) if (files[i].id === id) return files[i];
    return null;
  }

  function kindName(k) {
    return k === "Report" ? t("kind.report") : k === "Chat Export" ? t("kind.chat") :
      k === "Agent Output" ? t("kind.agent") : k === "File" ? t("kind.file") : t("kind.other");
  }

  function srcName(s) {
    return s === "Upload" ? t("source.upload") : s;
  }

  /* ---------------- Filter / sort ---------------- */
  function visibleFiles() {
    var q = state.q.toLowerCase();
    var list = files.filter(function (f) {
      if (state.folder && f.folder !== state.folder) return false;
      if (state.type && f.kind !== state.type) return false;
      if (state.source && f.source !== state.source) return false;
      if (q && (f.name + " " + f.desc + " " + f.by + " " + f.folder).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var by = state.sort;
    list.sort(function (a, b) {
      if (by === "oldest") return a.modified < b.modified ? -1 : 1;
      if (by === "az") return a.name.localeCompare(b.name);
      if (by === "size") return b.sizeMB - a.sizeMB;
      return a.modified < b.modified ? 1 : -1;
    });
    return list;
  }

  function filtersActive() {
    return !!(state.q || state.type || state.source || state.folder);
  }

  /* ---------------- Render ---------------- */
  function renderFolders() {
    var bar = $("folderBar");
    bar.innerHTML = "";
    function tab(label, folder, title) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "folder-tab" + (state.folder === folder ? " active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", state.folder === folder ? "true" : "false");
      b.textContent = label;
      if (title) b.title = title;
      b.addEventListener("click", function () { state.folder = folder; renderAll(); });
      if (folder) {
        b.addEventListener("dblclick", function () { renameFolder(folder); });
        var x = document.createElement("span");
        x.textContent = " ×";
        x.style.cssText = "opacity:.55;font-weight:700";
        x.setAttribute("role", "button");
        x.setAttribute("tabindex", "0");
        x.setAttribute("aria-label", t("folder.delete") + ": " + folder);
        x.addEventListener("click", function (e) { e.stopPropagation(); deleteFolder(folder); });
        x.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); deleteFolder(folder); }
        });
        b.appendChild(x);
      }
      bar.appendChild(b);
    }
    tab(t("folder.all"), "");
    folders.forEach(function (f) { tab(f, f, t("folder.rename") + " (double-click)"); });
  }

  function renderSummary() {
    var nFiles = files.length;
    var nArt = files.filter(function (f) { return f.kind === "Agent Output" || f.kind === "File"; }).length;
    var nRep = files.filter(function (f) { return f.kind === "Report"; }).length;
    $("countFiles").textContent = nFiles;
    $("countArtifacts").textContent = nArt;
    $("countReports").textContent = nRep;
  }

  function extCls(ext) {
    ext = (ext || "").toUpperCase();
    if (ext === "PDF") return "file-pdf";
    if (ext === "XLSX" || ext === "CSV") return "file-xlsx";
    if (ext === "DOCX") return "file-docx";
    if (ext === "JSON") return "file-json";
    if (ext === "MP4") return "file-mp4";
    if (ext === "ZIP") return "file-zip";
    if (ext === "MD" || ext === "TXT") return "file-txt";
    return "file-txt";
  }

  function renderTable(list) {
    var body = $("fileBody");
    body.innerHTML = "";
    list.forEach(function (f) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", f.id);
      var checked = state.selected[f.id] ? " checked" : "";
      tr.innerHTML =
        '<td class="col-check" data-label=""><input type="checkbox" data-check="' + f.id + '"' + checked + ' aria-label="Select ' + esc(f.name) + '" /></td>' +
        '<td data-label="' + esc(t("col.name")) + '"><div class="file-cell"><span class="file-icon ' + extCls(f.ext) + '" aria-hidden="true">' + esc(f.ext) + "</span>" +
        '<div style="min-width:0"><div class="file-name" title="' + esc(f.name) + '">' + esc(f.name) + "</div>" +
        '<div class="file-sub">' + esc(f.folder) + " · " + esc(f.by) + "</div></div></div></td>" +
        '<td data-label="' + esc(t("col.type")) + '"><span class="type-tag">' + esc(kindName(f.kind)) + "</span></td>" +
        '<td data-label="' + esc(t("col.source")) + '"><span class="src-tag">' + esc(srcName(f.source)) + "</span></td>" +
        '<td class="num" data-label="' + esc(t("col.size")) + '">' + fmtSize(f.sizeMB) + "</td>" +
        '<td data-label="' + esc(t("col.modified")) + '">' + esc(f.modifiedLabel) + "</td>" +
        '<td class="row-actions" data-label=""><button type="button" class="icon-btn" data-menu="' + f.id + '" aria-label="Actions for ' + esc(f.name) + '" aria-haspopup="menu">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button></td>';
      body.appendChild(tr);
    });
  }

  function renderGridView(list) {
    var grid = $("fileGrid");
    grid.innerHTML = "";
    list.forEach(function (f) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "file-grid-card";
      card.setAttribute("data-id", f.id);
      card.setAttribute("aria-label", f.name);
      card.innerHTML =
        '<div class="file-grid-top"><span class="file-icon ' + extCls(f.ext) + '" aria-hidden="true">' + esc(f.ext) + "</span>" +
        '<span class="file-grid-name" title="' + esc(f.name) + '">' + esc(f.name) + "</span></div>" +
        '<div class="file-grid-meta">' + esc(kindName(f.kind)) + " · " + esc(srcName(f.source)) + " · " + fmtSize(f.sizeMB) + "</div>" +
        '<div class="file-grid-meta">' + esc(f.modifiedLabel) + "</div>";
      card.addEventListener("click", function () { openPreview(f.id); });
      grid.appendChild(card);
    });
  }

  function renderAll() {
    var list = visibleFiles();
    var searching = filtersActive();
    var table = document.querySelector(".file-table");
    var grid = $("fileGrid");
    var empty = $("emptyState");
    if (list.length === 0) {
      table.hidden = true;
      grid.hidden = true;
      empty.hidden = false;
      $("emptyTitle").textContent = searching ? t("empty.search_title") : t("empty.title");
      $("emptySub").textContent = searching ? t("empty.search_sub") : t("empty.sub");
      $("btnEmptyUpload").hidden = searching;
      $("btnEmptyClear").hidden = !searching;
    } else {
      empty.hidden = true;
      table.hidden = state.grid;
      grid.hidden = !state.grid;
      if (state.grid) renderGridView(list);
      else renderTable(list);
    }
    var all = list.length > 0 && list.every(function (f) { return state.selected[f.id]; });
    $("checkAll").checked = all;
    var selCount = Object.keys(state.selected).length;
    $("bulkBar").hidden = selCount === 0;
    $("bulkCount").textContent = selCount + (window.AgentShared.i18n.getLang() === "vi" ? " đã chọn" : " selected");
    $("btnClearFilters").hidden = !searching;
    renderFolders();
    renderSummary();
  }

  /* ---------------- Row menu ---------------- */
  var openMenuEl = null;

  function closeMenu() {
    if (openMenuEl) { openMenuEl.remove(); openMenuEl = null; }
  }

  document.addEventListener("click", function (e) {
    if (openMenuEl && (!e.target.closest || !e.target.closest(".action-menu"))) closeMenu();
  });
  document.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu);

  function showRowMenu(btn, id) {
    closeMenu();
    var f = getFile(id);
    if (!f) return;
    var menu = document.createElement("div");
    menu.className = "action-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML =
      '<button type="button" data-act="open" role="menuitem">' + esc(t("menu.open")) + "</button>" +
      '<button type="button" data-act="preview" role="menuitem">' + esc(t("menu.preview")) + "</button>" +
      '<button type="button" data-act="download" role="menuitem">' + esc(t("menu.download")) + "</button>" +
      '<button type="button" data-act="rename" role="menuitem">' + esc(t("menu.rename")) + "</button>" +
      '<button type="button" data-act="move" role="menuitem">' + esc(t("menu.move")) + "</button>" +
      '<button type="button" data-act="source" role="menuitem">' + esc(t("menu.source")) + "</button>" +
      '<button type="button" data-act="delete" role="menuitem" class="danger">' + esc(t("menu.delete")) + "</button>";
    document.body.appendChild(menu);
    var r = btn.getBoundingClientRect();
    var mw = 180;
    var mh = menu.offsetHeight || 260;
    menu.style.position = "fixed";
    menu.style.left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8)) + "px";
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.top = top + "px";
    menu.style.margin = "0";
    openMenuEl = menu;
    var first = menu.querySelector("button");
    if (first) first.focus();
    menu.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-act]") : null;
      if (!b) return;
      var act = b.getAttribute("data-act");
      closeMenu();
      if (act === "open" || act === "preview" || act === "source") openPreview(id);
      else if (act === "download") showToast(t("toast.download"));
      else if (act === "rename") renameFile(id);
      else if (act === "move") moveFile(id);
      else if (act === "delete") askDelete([id]);
    });
  }

  /* ---------------- Preview drawer + trace ---------------- */
  var lastFocus = null;

  function openDrawer(title) {
    lastFocus = document.activeElement;
    $("drawerTitle").textContent = title;
    $("drawer").hidden = false;
    $("drawerOverlay").hidden = false;
    document.body.style.overflow = "hidden";
    $("drawerClose").focus();
  }

  function closeDrawer() {
    $("drawer").hidden = true;
    $("drawerOverlay").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function traceHtml(f) {
    var steps = [
      { k: t("trace.agent"), v: f.trace.agent },
      { k: t("trace.task"), v: f.trace.task },
      { k: t("trace.run"), v: f.trace.run },
      { k: t("trace.goal"), v: f.trace.goal },
      { k: "File", v: f.name }
    ];
    return '<ol class="trace-chain">' + steps.map(function (s) {
      return '<li><span class="trace-rail" aria-hidden="true"><span class="trace-dot"></span><span class="trace-line"></span></span>' +
        '<div class="trace-body"><span class="trace-kind">' + esc(s.k) + '</span><span class="trace-name">' + esc(s.v) + "</span></div></li>";
    }).join("") + "</ol>";
  }

  function openPreview(id) {
    var f = getFile(id);
    if (!f) return;
    var body = $("drawerBody");
    var foot = $("drawerFoot");
    body.innerHTML =
      '<div class="detail-title-row" style="display:flex;align-items:center;gap:10px">' +
      '<span class="file-icon ' + extCls(f.ext) + '" aria-hidden="true">' + esc(f.ext) + "</span>" +
      "<h3 style=\"margin:0;font-size:1rem;overflow-wrap:anywhere;flex:1\">" + esc(f.name) + "</h3></div>" +
      '<dl class="kv">' +
      "<dt>" + esc(t("preview.type")) + "</dt><dd>" + esc(kindName(f.kind)) + "</dd>" +
      "<dt>" + esc(t("preview.size")) + "</dt><dd>" + fmtSize(f.sizeMB) + "</dd>" +
      "<dt>" + esc(t("preview.source")) + "</dt><dd>" + esc(srcName(f.source)) + " · " + esc(f.by) + "</dd>" +
      "<dt>" + esc(t("preview.task")) + "</dt><dd>" + esc(f.trace.task) + "</dd>" +
      "<dt>" + esc(t("preview.created")) + "</dt><dd>" + esc(f.modifiedLabel) + "</dd>" +
      "</dl>" +
      '<span class="section-label">' + esc(t("preview.desc")) + "</span>" +
      '<p class="desc-text">' + esc(f.desc || "—") + "</p>" +
      '<span class="section-label">' + esc(t("preview.trace")) + "</span>" +
      traceHtml(f);
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="download">' + esc(t("menu.download")) + "</button>" +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="source">' + esc(t("menu.source")) + "</button>";
    openDrawer(t("preview.title"));
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b) return;
      if (b.getAttribute("data-foot") === "download") showToast(t("toast.download"));
      else { closeDrawer(); openPreview(id); }
    };
  }

  /* ---------------- Upload (mock UI) ---------------- */
  var pendingFiles = [];

  function openUpload() {
    pendingFiles = [];
    renderUploadList();
    $("uploadProgress").hidden = true;
    $("uploadFill").style.width = "0";
    $("uploadStart").disabled = true;
    $("fileInput").value = "";
    lastFocus = document.activeElement;
    $("uploadModal").hidden = false;
    $("uploadOverlay").hidden = false;
    document.body.style.overflow = "hidden";
    $("btnBrowse").focus();
  }

  function closeUpload() {
    $("uploadModal").hidden = true;
    $("uploadOverlay").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function renderUploadList() {
    var box = $("uploadList");
    box.innerHTML = "";
    pendingFiles.forEach(function (f) {
      var chip = document.createElement("div");
      chip.className = "file-chip";
      chip.innerHTML = '<span class="doc-name" style="font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' +
        esc(f.name) + '">' + esc(f.name) + "</span>";
      box.appendChild(chip);
    });
    $("uploadStart").disabled = pendingFiles.length === 0;
  }

  function startUpload() {
    if (!pendingFiles.length) return;
    var bar = $("uploadProgress");
    var fill = $("uploadFill");
    $("uploadStart").disabled = true;
    bar.hidden = false;
    var p = 0;
    var now = new Date();
    var iso = now.toISOString().slice(0, 16);
    var label = window.AgentShared.i18n.getLang() === "vi" ? "Vừa xong" : "Just now";
    var tick = setInterval(function () {
      p = Math.min(100, p + 14 + Math.random() * 20);
      fill.style.width = p + "%";
      if (p >= 100) {
        clearInterval(tick);
        pendingFiles.forEach(function (f) {
          var ext = (f.name.split(".").pop() || "").toUpperCase();
          files.unshift({
            id: "f" + now.getTime().toString(36) + Math.floor(Math.random() * 999),
            name: f.name, ext: ext, kind: "File", source: "Upload",
            sizeMB: Math.max(0.01, f.size / 1048576),
            modified: iso, modifiedLabel: label,
            folder: state.folder && folders.indexOf(state.folder) !== -1 ? state.folder : "Research",
            by: "You", desc: "",
            trace: { agent: "—", task: "—", run: "—", goal: "—" }
          });
        });
        closeUpload();
        renderAll();
        showToast(t("toast.uploaded"));
      }
    }, 150);
  }

  /* ---------------- Rename / Move / Folders ---------------- */
  var promptCb = null;

  function openPrompt(title, label, initial, isSelect, options, onConfirm) {
    promptCb = onConfirm;
    $("promptTitle").textContent = title;
    var field = $("promptField");
    if (isSelect) {
      field.innerHTML = '<label class="sr-only" for="promptInput">' + esc(label) + "</label>" +
        '<select class="select" id="promptInput" style="width:100%">' +
        options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join("") +
        "</select>";
    } else {
      field.innerHTML = '<label for="promptInput" style="display:block;margin-bottom:6px;font-size:0.78rem;font-weight:600">' +
        esc(label) + '</label><input class="text-input" id="promptInput" style="width:100%" maxlength="80" value="' +
        esc(initial || "") + '" placeholder="' + esc(label) + '" />';
    }
    $("promptConfirm").textContent = t("form.save");
    $("promptCancel").textContent = t("form.cancel");
    lastFocus = document.activeElement;
    $("promptModal").hidden = false;
    $("promptOverlay").hidden = false;
    var input = $("promptInput");
    if (input) { input.focus(); if (!isSelect && input.select) input.select(); }
  }

  function closePrompt() {
    $("promptModal").hidden = true;
    $("promptOverlay").hidden = true;
    promptCb = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function renameFile(id) {
    var f = getFile(id);
    if (!f) return;
    openPrompt(t("menu.rename"), t("rename.label"), f.name, false, null, function (value) {
      if (!value) { showToast(t("toast.need_name"), "error"); return; }
      f.name = value;
      f.ext = (value.split(".").pop() || "").toUpperCase();
      renderAll();
      showToast(t("toast.renamed"));
    });
  }

  function moveFile(id) {
    var f = getFile(id);
    if (!f) return;
    openPrompt(t("move.title"), t("move.label"), f.folder, true, folders, function (value) {
      f.folder = value;
      renderAll();
      showToast(t("toast.moved"));
    });
  }

  function renameFolder(name) {
    openPrompt(t("folder.rename"), t("rename.label"), name, false, null, function (value) {
      if (!value) { showToast(t("toast.need_name"), "error"); return; }
      if (folders.indexOf(value) !== -1 && value !== name) { showToast(t("toast.need_name"), "error"); return; }
      folders = folders.map(function (f) { return f === name ? value : f; });
      files.forEach(function (f) { if (f.folder === name) f.folder = value; });
      if (state.folder === name) state.folder = value;
      renderAll();
      showToast(t("toast.folder_renamed"));
    });
  }

  function deleteFolder(name) {
    var hasFiles = files.some(function (f) { return f.folder === name; });
    if (hasFiles) { showToast(t("folder.not_empty"), "error"); return; }
    openConfirm(t("folder.delete"), t("folder.delete_confirm"), t("folder.delete"), true, function () {
      folders = folders.filter(function (f) { return f !== name; });
      if (state.folder === name) state.folder = "";
      renderAll();
      showToast(t("toast.folder_deleted"));
    });
  }

  /* ---------------- Delete confirm ---------------- */
  var confirmCb = null;

  function openConfirm(title, desc, confirmLabel, danger, onConfirm) {
    confirmCb = onConfirm || null;
    $("modalTitle").textContent = title;
    $("modalDesc").textContent = desc;
    var ok = $("modalConfirm");
    ok.textContent = confirmLabel;
    ok.className = danger ? "btn btn-danger" : "btn btn-primary";
    $("modalCancel").textContent = t("form.cancel");
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

  function askDelete(ids) {
    var names = ids.map(function (id) { var f = getFile(id); return f ? f.name : id; });
    openConfirm(
      t("del.title"),
      (ids.length === 1 ? '"' + names[0] + '"\n' + t("del.msg") : ids.length + "\n" + t("del.bulk_msg")),
      t("del.confirm"), true, function () {
        var set = {};
        ids.forEach(function (id) { set[id] = true; });
        files = files.filter(function (f) { return !set[f.id]; });
        ids.forEach(function (id) { delete state.selected[id]; });
        closeModal();
        renderAll();
        showToast(ids.length === 1 ? t("toast.deleted") : t("toast.bulk_deleted"));
      }
    );
  }

  /* ---------------- Theme + lang ---------------- */
  function initTheme() { window.AgentShared.initTheme("themeToggle"); }

  function applyLang(next) { window.AgentShared.i18n.applyLang(next); }

  /* ---------------- Init ---------------- */
  function init() {
    initTheme();
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });

    $("searchInput").addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      renderAll();
    });
    $("filterType").addEventListener("change", function (e) { state.type = e.target.value; renderAll(); });
    $("filterSource").addEventListener("change", function (e) { state.source = e.target.value; renderAll(); });
    $("sortBy").addEventListener("change", function (e) { state.sort = e.target.value; renderAll(); });
    $("btnViewToggle").addEventListener("click", function () {
      state.grid = !state.grid;
      $("btnViewToggle").setAttribute("aria-pressed", String(state.grid));
      renderAll();
    });

    $("btnClearFilters").addEventListener("click", clearFilters);
    $("btnEmptyClear").addEventListener("click", clearFilters);
    function clearFilters() {
      state.q = ""; state.type = ""; state.source = ""; state.folder = "";
      $("searchInput").value = "";
      $("filterType").value = ""; $("filterSource").value = "";
      renderAll();
    }

    $("btnUpload").addEventListener("click", openUpload);
    $("btnEmptyUpload").addEventListener("click", openUpload);
    $("btnNewFolder").addEventListener("click", function () {
      openPrompt(t("folder.new"), t("folder.name_ph"), "", false, null, function (value) {
        if (!value) { showToast(t("toast.need_name"), "error"); return; }
        if (folders.indexOf(value) === -1) folders.push(value);
        state.folder = value;
        renderAll();
        showToast(t("toast.folder_created"));
      });
    });

    $("checkAll").addEventListener("change", function (e) {
      var on = e.target.checked;
      visibleFiles().forEach(function (f) {
        if (on) state.selected[f.id] = true;
        else delete state.selected[f.id];
      });
      renderAll();
    });

    $("fileBody").addEventListener("click", function (e) {
      var check = e.target.closest ? e.target.closest("[data-check]") : null;
      if (check) {
        var cid = check.getAttribute("data-check");
        if (check.checked) state.selected[cid] = true;
        else delete state.selected[cid];
        renderAll();
        return;
      }
      var menuBtn = e.target.closest ? e.target.closest("[data-menu]") : null;
      if (menuBtn) {
        e.stopPropagation();
        showRowMenu(menuBtn, menuBtn.getAttribute("data-menu"));
        return;
      }
      var tr = e.target.closest ? e.target.closest("tr[data-id]") : null;
      if (tr) openPreview(tr.getAttribute("data-id"));
    });

    $("btnBulkDelete").addEventListener("click", function () {
      askDelete(Object.keys(state.selected));
    });
    $("btnBulkDownload").addEventListener("click", function () {
      showToast(t("toast.download"));
    });

    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerOverlay").addEventListener("click", closeDrawer);

    $("btnBrowse").addEventListener("click", function () { $("fileInput").click(); });
    var dz = $("dropzone");
    dz.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#btnBrowse")) return;
      $("fileInput").click();
    });
    dz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("fileInput").click(); }
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("dragover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("dragover"); });
    });
    dz.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addPicked(e.dataTransfer.files);
    });
    $("fileInput").addEventListener("change", function () { addPicked($("fileInput").files); });
    function addPicked(list) {
      for (var i = 0; i < list.length; i++) pendingFiles.push(list[i]);
      renderUploadList();
    }
    function renderUploadList() {
      var box = $("uploadList");
      box.innerHTML = "";
      pendingFiles.forEach(function (f) {
        var chip = document.createElement("div");
        chip.className = "file-chip";
        chip.innerHTML = '<span class="file-name" title="' + esc(f.name) + '">' + esc(f.name) + "</span>";
        box.appendChild(chip);
      });
      $("uploadStart").disabled = pendingFiles.length === 0;
    }
    $("uploadCancel").addEventListener("click", closeUpload);
    $("uploadOverlay").addEventListener("click", closeUpload);
    $("uploadStart").addEventListener("click", startUpload);

    $("modalCancel").addEventListener("click", closeModal);
    $("modalOverlay").addEventListener("click", closeModal);
    $("modalConfirm").addEventListener("click", function () {
      var cb = confirmCb;
      closeModal();
      if (cb) cb();
    });

    $("promptCancel").addEventListener("click", closePrompt);
    $("promptOverlay").addEventListener("click", closePrompt);
    $("promptConfirm").addEventListener("click", function () {
      var cb = promptCb;
      var input = $("promptInput");
      var value = input ? input.value.trim() : "";
      closePrompt();
      if (cb) cb(value);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!$("confirmModal").hidden) closeModal();
        else if (!$("promptModal").hidden) closePrompt();
        else if (!$("uploadModal").hidden) closeUpload();
        else if (!$("drawer").hidden) closeDrawer();
        else closeMenu();
      }
      if (e.key === "Enter" && !$("promptModal").hidden && document.activeElement === $("promptInput")) {
        $("promptConfirm").click();
      }
    });

    function startUpload() {
      if (!pendingFiles.length) return;
      var bar = $("uploadProgress");
      var fill = $("uploadFill");
      $("uploadStart").disabled = true;
      bar.hidden = false;
      var p = 0;
      var now = new Date();
      var iso = now.toISOString().slice(0, 16);
    var label = window.AgentShared.i18n.getLang() === "vi" ? "Vừa xong" : "Just now";
      var tick = setInterval(function () {
        p = Math.min(100, p + 14 + Math.random() * 20);
        fill.style.width = p + "%";
        if (p >= 100) {
          clearInterval(tick);
          pendingFiles.forEach(function (f) {
            var ext = (f.name.split(".").pop() || "").toUpperCase();
            files.unshift({
              id: "f" + now.getTime().toString(36) + Math.floor(Math.random() * 999),
              name: f.name, ext: ext, kind: "File", source: "Upload",
              sizeMB: Math.max(0.01, f.size / 1048576),
              modified: iso, modifiedLabel: label,
              folder: state.folder && folders.indexOf(state.folder) !== -1 ? state.folder : "Research",
              by: "You", desc: "",
              trace: { agent: "—", task: "—", run: "—", goal: "—" }
            });
          });
          pendingFiles = [];
          closeUpload();
          renderAll();
          showToast(t("toast.uploaded"));
        }
      }, 150);
    }

    applyLang();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
