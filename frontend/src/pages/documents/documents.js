// Documents — Enterprise Document Management (mock CRUD, no backend).
// All data lives in memory; every mutation re-renders instantly.
(function () {
  "use strict";

  /* ---------------- i18n (EN/VI, shared agentos.lang key) ---------------- */
  var I18N = {
    en: {
      "meta.title": "Documents — AgentOS",
      "nav.new": "New Task", "nav.chat": "Chat", "nav.agents": "Agents",
      "nav.docs": "Documents", "nav.storage": "Data Storage",
      "nav.analytics": "Analytics", "nav.models": "Models",
      "nav.logs": "Logs", "nav.settings": "Settings",
      "nav.plan": "Company Plan",
      "page.title": "Documents",
      "page.sub": "Manage workspace documents and knowledge sources.",
      "page.add": "Add document", "page.add_short": "Add",
      "page.search_label": "Search documents", "page.search_ph": "Search documents...",
      "filter.type_label": "Filter by type", "filter.type_all": "Type: All",
      "filter.status_label": "Filter by status", "filter.status_all": "Status: All",
      "filter.kb_label": "Filter by knowledge base", "filter.kb_all": "Knowledge: All",
      "filter.sort_label": "Sort", "filter.time_label": "Filter by updated time",
      "filter.time_all": "Time: All", "filter.time_day": "Last 24 hours",
      "filter.time_week": "Last 7 days", "filter.time_month": "Last 30 days",
      "filter.clear": "Clear filters",
      "sort.newest": "Newest", "sort.oldest": "Oldest", "sort.az": "Name A–Z",
      "sort.za": "Name Z–A", "sort.size": "Size",
      "status.indexed": "Indexed", "status.processing": "Processing", "status.failed": "Failed",
      "stats.total": "Total documents", "stats.processing": "Processing",
      "stats.indexed": "Indexed", "stats.storage": "Storage",
      "bulk.selected": " selected", "bulk.reindex": "Re-index", "bulk.delete": "Delete",
      "col.name": "Document", "col.type": "Type", "col.kb": "Knowledge Base",
      "col.size": "Size", "col.updated": "Updated", "col.status": "Status",
      "col.check_all": "Select all", "col.select": "Select ",
      "col.actions": "Actions for ",
      "empty.title": "No documents yet",
      "empty.sub": "Upload your first document to build workspace knowledge.",
      "empty.add": "Add document",
      "empty.search_title": "No documents found",
      "empty.search_sub": "Try another keyword or change your filters.",
      "menu.detail": "Details", "menu.download": "Download", "menu.error": "View error",
      "menu.edit": "Edit", "menu.reindex": "Re-index", "menu.delete": "Delete",
      "detail.title": "Document details", "detail.error_title": "Processing error",
      "detail.info": "Information", "detail.tags": "Tags", "detail.desc": "Description",
      "detail.f_type": "Type", "detail.f_size": "Size", "detail.f_created": "Created",
      "detail.f_updated": "Updated", "detail.f_kb": "Knowledge Base",
      "detail.err_title": "Processing status", "detail.err_failed": "Processing failed",
      "detail.err_reason": "Reason", "detail.err_unknown": "Unknown error.",
      "act.retry": "Retry", "act.download": "Download", "act.edit": "Edit",
      "act.reindex": "Re-index", "act.delete": "Delete",
      "edit.title": "Edit document",
      "edit.name": "Document name", "edit.kb": "Knowledge Base",
      "edit.tags": "Tags (comma separated)", "edit.desc": "Description",
      "edit.cancel": "Cancel", "edit.save": "Save changes",
      "edit.need_name": "Document name cannot be empty.",
      "upload.title": "Add document",
      "upload.drop_title": "Upload file",
      "upload.drop": "Drag & drop file here", "upload.or": "or", "upload.browse": "Browse files",
      "upload.pick_aria": "Choose file to upload",
      "upload.kb": "Knowledge Base", "upload.tags": "Tags (comma separated)",
      "upload.tags_ph": "e.g.: financial, q3", "upload.desc": "Description",
      "upload.desc_ph": "Short description of the document...",
      "upload.cancel": "Cancel", "upload.submit": "Upload document",
      "del.title": "Delete document?",
      "del.one": "Are you sure you want to delete “{name}”? This cannot be undone.",
      "del.bulk": "Are you sure you want to delete {n} selected documents? This cannot be undone.",
      "del.confirm_one": "Delete document",
      "del.confirm": "Delete",
      "del.confirm_many": "Delete documents",
      "form.cancel": "Cancel",
      "misc.just_now": "Just now",
      "toast.download_backend": "Download functionality will be connected to the backend later.",
      "toast.updated": "Document updated.",
      "toast.uploaded": "Document uploaded. Processing...",
      "toast.indexed": "Document has been indexed.",
      "toast.reindexed": "Document has been re-indexed.",
      "toast.bulk_reindex": "Re-indexing documents...",
      "toast.deleted_one": "Document deleted.",
      "toast.deleted_many": " documents deleted.",
      "drawer.close": "Close"
    },
    vi: {
      "meta.title": "Tài liệu — AgentOS",
      "nav.new": "Tác vụ mới", "nav.chat": "Đoạn chat", "nav.agents": "Agent",
      "nav.docs": "Tài liệu", "nav.storage": "Lưu trữ dữ liệu",
      "nav.analytics": "Phân tích", "nav.models": "Mô hình",
      "nav.logs": "Nhật ký", "nav.settings": "Cài đặt",
      "nav.plan": "Gói công ty",
      "page.title": "Tài liệu",
      "page.sub": "Quản lý tài liệu và nguồn kiến thức của workspace.",
      "page.add": "Thêm tài liệu", "page.add_short": "Thêm",
      "page.search_label": "Tìm kiếm tài liệu", "page.search_ph": "Tìm kiếm tài liệu...",
      "filter.type_label": "Lọc theo loại", "filter.type_all": "Loại: Tất cả",
      "filter.status_label": "Lọc theo trạng thái", "filter.status_all": "Trạng thái: Tất cả",
      "filter.kb_label": "Lọc theo knowledge base", "filter.kb_all": "Knowledge: Tất cả",
      "filter.sort_label": "Sắp xếp", "filter.time_label": "Lọc theo thời gian cập nhật",
      "filter.time_all": "Thời gian: Tất cả", "filter.time_day": "24 giờ qua",
      "filter.time_week": "7 ngày qua", "filter.time_month": "30 ngày qua",
      "filter.clear": "Xóa lọc",
      "sort.newest": "Mới nhất", "sort.oldest": "Cũ nhất", "sort.az": "Tên A–Z",
      "sort.za": "Tên Z–A", "sort.size": "Dung lượng",
      "status.indexed": "Đã lập chỉ mục", "status.processing": "Đang xử lý", "status.failed": "Lỗi",
      "stats.total": "Tổng tài liệu", "stats.processing": "Đang xử lý",
      "stats.indexed": "Đã lập chỉ mục", "stats.storage": "Dung lượng",
      "bulk.selected": " đã chọn", "bulk.reindex": "Lập chỉ mục lại", "bulk.delete": "Xóa",
      "col.name": "Tài liệu", "col.type": "Loại", "col.kb": "Knowledge Base",
      "col.size": "Dung lượng", "col.updated": "Cập nhật", "col.status": "Trạng thái",
      "col.check_all": "Chọn tất cả", "col.select": "Chọn ",
      "col.actions": "Thao tác với ",
      "empty.title": "Chưa có tài liệu",
      "empty.sub": "Tải lên tài liệu đầu tiên để xây dựng knowledge cho workspace.",
      "empty.add": "Thêm tài liệu",
      "empty.search_title": "Không tìm thấy tài liệu",
      "empty.search_sub": "Thử từ khóa khác hoặc thay đổi bộ lọc.",
      "menu.detail": "Chi tiết", "menu.download": "Tải xuống", "menu.error": "Xem lỗi",
      "menu.edit": "Chỉnh sửa", "menu.reindex": "Lập chỉ mục lại", "menu.delete": "Xóa",
      "detail.title": "Chi tiết tài liệu", "detail.error_title": "Lỗi xử lý",
      "detail.info": "Thông tin", "detail.tags": "Tags", "detail.desc": "Mô tả",
      "detail.f_type": "Loại", "detail.f_size": "Dung lượng", "detail.f_created": "Ngày tạo",
      "detail.f_updated": "Cập nhật", "detail.f_kb": "Knowledge Base",
      "detail.err_title": "Trạng thái xử lý", "detail.err_failed": "Xử lý thất bại",
      "detail.err_reason": "Lý do", "detail.err_unknown": "Lỗi không xác định.",
      "act.retry": "Thử lại", "act.download": "Tải xuống", "act.edit": "Chỉnh sửa",
      "act.reindex": "Lập chỉ mục lại", "act.delete": "Xóa",
      "edit.title": "Chỉnh sửa tài liệu",
      "edit.name": "Tên tài liệu", "edit.kb": "Knowledge Base",
      "edit.tags": "Tags (cách nhau bằng dấu phẩy)", "edit.desc": "Mô tả",
      "edit.cancel": "Hủy", "edit.save": "Lưu thay đổi",
      "edit.need_name": "Tên tài liệu không được để trống.",
      "upload.title": "Thêm tài liệu",
      "upload.drop_title": "Tải lên file",
      "upload.drop": "Kéo & thả file vào đây", "upload.or": "hoặc", "upload.browse": "Chọn file",
      "upload.pick_aria": "Chọn file để tải lên",
      "upload.kb": "Knowledge Base", "upload.tags": "Tags (cách nhau bằng dấu phẩy)",
      "upload.tags_ph": "vd: financial, q3", "upload.desc": "Mô tả",
      "upload.desc_ph": "Mô tả ngắn về tài liệu...",
      "upload.cancel": "Hủy", "upload.submit": "Tải lên tài liệu",
      "del.title": "Xóa tài liệu?",
      "del.one": "Bạn có chắc muốn xóa “{name}”? Hành động này không thể hoàn tác.",
      "del.bulk": "Bạn có chắc muốn xóa {n} tài liệu đã chọn? Hành động này không thể hoàn tác.",
      "del.confirm_one": "Xóa tài liệu",
      "del.confirm": "Xóa",
      "del.confirm_many": "Xóa tài liệu",
      "form.cancel": "Hủy",
      "misc.just_now": "Vừa xong",
      "toast.download_backend": "Chức năng tải xuống sẽ được kết nối backend sau.",
      "toast.updated": "Đã cập nhật tài liệu.",
      "toast.uploaded": "Đã tải lên tài liệu. Đang xử lý...",
      "toast.indexed": "Tài liệu đã được lập chỉ mục.",
      "toast.reindexed": "Tài liệu đã được lập chỉ mục lại.",
      "toast.bulk_reindex": "Đang lập chỉ mục lại tài liệu...",
      "toast.deleted_one": "Đã xóa tài liệu.",
      "toast.deleted_many": " tài liệu đã xóa.",
      "drawer.close": "Đóng"
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
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    renderAll();
  }

  function setupLang() {
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });
  }

  /* ---------------- Mock data (12 docs, mixed types/statuses) ---------------- */
  var seedDocs = [
    { id: "d01", name: "Financial_Report_Q3.pdf", type: "PDF", kb: "Finance", sizeMB: 12.4, created: "2026-09-15", updated: "2026-09-16T09:41", updatedLabel: "2 giờ trước", status: "indexed", tags: ["financial", "q3", "revenue"], desc: "Báo cáo tài chính quý 3 với đầy đủ số liệu doanh thu, chi phí và biên lợi nhuận theo từng kênh bán." },
    { id: "d02", name: "HR_Policy_2026.docx", type: "DOCX", kb: "HR", sizeMB: 3.1, created: "2026-08-02", updated: "2026-09-14T16:20", updatedLabel: "2 ngày trước", status: "indexed", tags: ["hr", "policy"], desc: "Chính sách nhân sự 2026: nghỉ phép, đánh giá hiệu suất và phúc lợi." },
    { id: "d03", name: "Sales_Data_Q3.xlsx", type: "XLSX", kb: "Sales", sizeMB: 8.7, created: "2026-09-10", updated: "2026-09-16T08:05", updatedLabel: "5 giờ trước", status: "indexed", tags: ["sales", "q3", "data"], desc: "Dữ liệu bán hàng Q3 theo SKU, khu vực và kênh phân phối." },
    { id: "d04", name: "Engineering_Guidelines.pdf", type: "PDF", kb: "Engineering", sizeMB: 21.9, created: "2026-07-19", updated: "2026-09-11T11:30", updatedLabel: "5 ngày trước", status: "indexed", tags: ["engineering", "guidelines"], desc: "Hướng dẫn kỹ thuật: quy ước code, review và quy trình release." },
    { id: "d05", name: "Company_Handbook.pdf", type: "PDF", kb: "HR", sizeMB: 15.2, created: "2026-01-05", updated: "2026-09-09T14:00", updatedLabel: "1 tuần trước", status: "indexed", tags: ["hr", "handbook"], desc: "Sổ tay công ty: văn hóa, quy định chung và liên hệ nội bộ." },
    { id: "d06", name: "Marketing_Report_August.pdf", type: "PDF", kb: "Sales", sizeMB: 6.4, created: "2026-09-01", updated: "2026-09-13T10:12", updatedLabel: "3 ngày trước", status: "indexed", tags: ["marketing", "report"], desc: "Báo cáo marketing tháng 8: chiến dịch, CAC và 전환 funnel." },
    { id: "d07", name: "Customer_Feedback_Raw.csv", type: "CSV", kb: "Sales", sizeMB: 44.8, created: "2026-09-15", updated: "2026-09-16T10:58", updatedLabel: "30 phút trước", status: "processing", tags: ["feedback", "raw"], desc: "Dữ liệu phản hồi khách hàng thô, đang trích xuất văn bản." },
    { id: "d08", name: "Payroll_Summary_Q3.xlsx", type: "XLSX", kb: "Finance", sizeMB: 2.2, created: "2026-09-12", updated: "2026-09-16T09:02", updatedLabel: "4 giờ trước", status: "processing", tags: ["payroll", "finance"], desc: "Tổng hợp bảng lương Q3 theo phòng ban." },
    { id: "d09", name: "Legacy_Contract_Scan.pdf", type: "PDF", kb: "Finance", sizeMB: 58.3, created: "2026-09-05", updated: "2026-09-16T07:44", updatedLabel: "6 giờ trước", status: "failed", tags: ["contract", "legacy"], desc: "Bản scan hợp đồng cũ, OCR không đọc được.", error: "Unable to extract text from this document." },
    { id: "d10", name: "Onboarding_Checklist.txt", type: "TXT", kb: "HR", sizeMB: 0.04, created: "2026-06-21", updated: "2026-09-02T09:15", updatedLabel: "2 tuần trước", status: "indexed", tags: ["hr", "onboarding"], desc: "Checklist tiếp nhận nhân sự mới theo ngày." },
    { id: "d11", name: "API_Rate_Limits.csv", type: "CSV", kb: "Engineering", sizeMB: 1.1, created: "2026-08-28", updated: "2026-09-10T17:40", updatedLabel: "6 ngày trước", status: "indexed", tags: ["api", "limits"], desc: "Bảng giới hạn tốc độ API theo từng gói dịch vụ." },
    { id: "d12", name: "Brand_Assets_Brief.docx", type: "DOCX", kb: "Sales", sizeMB: 9.6, created: "2026-09-08", updated: "2026-09-15T13:27", updatedLabel: "1 ngày trước", status: "processing", tags: ["brand", "brief"], desc: "Brief tài sản thương hiệu dùng cho chiến dịch Q4." }
  ];

  var docs = seedDocs.map(function (d) { return Object.assign({}, d, { tags: d.tags.slice() }); });

  var state = {
    q: "", type: "", status: "", kb: "", time: "", sort: "newest",
    selected: {},
    timers: {} // docId -> timeout id (mock processing)
  };

  var STATUS = {
    indexed: { label: "Đã lập chỉ mục", cls: "status-indexed", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>' },
    processing: { label: "Đang xử lý", cls: "status-processing", icon: '<span class="spinner" aria-hidden="true"></span>' },
    failed: { label: "Lỗi", cls: "status-failed", icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' }
  };

  /* ---------------- Helpers ---------------- */
  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function fmtSize(mb) {
    if (mb >= 1024) return (mb / 1024).toFixed(1) + " GB";
    if (mb >= 1) return mb.toFixed(1) + " MB";
    return Math.max(1, Math.round(mb * 1024)) + " KB";
  }

  function fmtStorage() {
    var totalMB = docs.reduce(function (s, d) { return s + d.sizeMB; }, 0);
    if (totalMB >= 1024) return (totalMB / 1024).toFixed(1) + " GB";
    return Math.round(totalMB) + " MB";
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
    }, 3200);
  }

  function getDoc(id) {
    for (var i = 0; i < docs.length; i++) if (docs[i].id === id) return docs[i];
    return null;
  }

  /* ---------------- Filtering / sorting ---------------- */
  function visibleDocs() {
    var q = state.q.toLowerCase();
    // Time filter is relative to the newest doc (mock data is timeless).
    var ref = 0;
    docs.forEach(function (d) {
      var t = Date.parse(d.updated);
      if (!isNaN(t) && t > ref) ref = t;
    });
    var window_ms = state.time === "day" ? 864e5 : state.time === "week" ? 7 * 864e5 : state.time === "month" ? 30 * 864e5 : 0;
    var list = docs.filter(function (d) {
      if (state.type && d.type !== state.type) return false;
      if (state.status && d.status !== state.status) return false;
      if (state.kb && d.kb !== state.kb) return false;
      if (window_ms) {
        var t = Date.parse(d.updated);
        if (isNaN(t) || ref - t > window_ms) return false;
      }
      if (q) {
        var hay = (d.name + " " + d.desc + " " + d.tags.join(" ") + " " + d.kb).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var by = state.sort;
    list.sort(function (a, b) {
      if (by === "oldest") return a.updated < b.updated ? -1 : 1;
      if (by === "az") return a.name.localeCompare(b.name);
      if (by === "za") return b.name.localeCompare(a.name);
      if (by === "size") return b.sizeMB - a.sizeMB;
      return a.updated < b.updated ? 1 : -1; // newest
    });
    return list;
  }

  function filtersActive() {
    return !!(state.q || state.type || state.status || state.kb || state.time);
  }

  /* ---------------- Render: stats + table ---------------- */
  function renderStats() {
    var processing = 0, indexed = 0;
    docs.forEach(function (d) {
      if (d.status === "processing") processing++;
      if (d.status === "indexed") indexed++;
    });
    $("statTotal").textContent = docs.length;
    $("statProcessing").textContent = processing;
    $("statIndexed").textContent = indexed;
    $("statStorage").textContent = fmtStorage();
  }

  function statusPill(d) {
    var s = STATUS[d.status];
    return '<span class="status-pill ' + s.cls + '">' + s.icon + "<span>" + t("status." + d.status) + "</span></span>";
  }

  function renderTable() {
    var list = visibleDocs();
    var body = $("docBody");
    body.innerHTML = "";
    var empty = $("emptyState");
    var selCount = Object.keys(state.selected).length;

    if (list.length === 0) {
      empty.hidden = false;
      var searching = filtersActive();
      $("emptyTitle").textContent = searching ? t("empty.search_title") : t("empty.title");
      $("emptySub").textContent = searching ? t("empty.search_sub") : t("empty.sub");
      $("btnEmptyAdd").hidden = searching;
      $("btnEmptyClear").hidden = !searching;
    } else {
      empty.hidden = true;
    }

    list.forEach(function (d) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", d.id);
      var checked = state.selected[d.id] ? " checked" : "";
      tr.innerHTML =
        '<td class="col-check" data-label=""><input type="checkbox" data-check="' + d.id + '"' + checked + ' aria-label="' + t("col.select") + esc(d.name) + '" /></td>' +
        '<td data-label="' + esc(t("col.name")) + '"><div class="doc-cell"><span class="file-icon file-' + d.type.toLowerCase() + '" aria-hidden="true">' + d.type + '</span>' +
        '<div style="min-width:0"><div class="doc-name" title="' + esc(d.name) + '">' + esc(d.name) + '</div>' +
        '<div class="doc-meta">' + esc(d.tags.slice(0, 2).join(" · ")) + "</div></div></div></td>" +
        '<td data-label="' + esc(t("col.type")) + '">' + d.type + "</td>" +
        '<td data-label="' + esc(t("col.kb")) + '"><span class="kb-tag">' + esc(d.kb) + "</span></td>" +
        '<td class="num" data-label="' + esc(t("col.size")) + '">' + fmtSize(d.sizeMB) + "</td>" +
        '<td data-label="' + esc(t("col.updated")) + '">' + esc(d.updatedLabel) + "</td>" +
        '<td data-label="' + esc(t("col.status")) + '">' + statusPill(d) + "</td>" +
        '<td class="row-actions" data-label=""><button type="button" class="icon-btn" data-menu="' + d.id + '" aria-label="' + t("col.actions") + esc(d.name) + '" aria-haspopup="menu">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button></td>';
      body.appendChild(tr);
    });

    // header checkbox reflects page state
    var all = list.length > 0 && list.every(function (d) { return state.selected[d.id]; });
    $("checkAll").checked = all;

    renderBulkBar(selCount);
    $("btnClearFilters").hidden = !filtersActive();
  }

  function renderBulkBar(selCount) {
    var bar = $("bulkBar");
    bar.hidden = selCount === 0;
    $("bulkCount").textContent = selCount + t("bulk.selected");
  }

  function renderAll() {
    renderStats();
    renderTable();
  }

  /* ---------------- Row action menu ---------------- */
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
    var d = getDoc(id);
    if (!d) return;
    var busy = d.status === "processing";
    var menu = document.createElement("div");
    menu.className = "action-menu";
    menu.setAttribute("role", "menu");
    menu.innerHTML =
      '<button type="button" data-act="detail" role="menuitem">' + esc(t("menu.detail")) + "</button>" +
      '<button type="button" data-act="download" role="menuitem">' + esc(t("menu.download")) + "</button>" +
      (d.status === "failed"
        ? '<button type="button" data-act="error" role="menuitem">' + esc(t("menu.error")) + "</button>"
        : "") +
      '<button type="button" data-act="edit" role="menuitem">' + esc(t("menu.edit")) + "</button>" +
      '<button type="button" data-act="reindex" role="menuitem"' + (busy ? " disabled" : "") + ">" + esc(t("menu.reindex")) + "</button>" +
      '<button type="button" data-act="delete" role="menuitem" class="danger">' + esc(t("menu.delete")) + "</button>";
    // Fixed positioning from button rect: never clipped by table scroll.
    document.body.appendChild(menu);
    var r = btn.getBoundingClientRect();
    var mw = 170;
    var mh = menu.offsetHeight || 220;
    var left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.position = "fixed";
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.margin = "0";
    openMenuEl = menu;
    var first = menu.querySelector("button");
    if (first) first.focus();
    menu.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-act]") : null;
      if (!b || b.disabled) return;
      var act = b.getAttribute("data-act");
      closeMenu();
      if (act === "detail") openDetail(id);
      else if (act === "download") showToast(t("toast.download_backend"));
      else if (act === "error") openDetail(id, true);
      else if (act === "edit") openEdit(id);
      else if (act === "reindex") reindexDoc(id);
      else if (act === "delete") askDelete([id]);
    });
  }

  /* ---------------- Drawer ---------------- */
  var lastFocus = null;

  function openDrawer(title) {
    lastFocus = document.activeElement;
    $("drawerTitle").textContent = title;
    $("drawer").hidden = false;
    $("drawerOverlay").hidden = false;
    document.body.style.overflow = "hidden";
    var c = $("drawerClose");
    if (c) c.focus();
  }

  function closeDrawer() {
    $("drawer").hidden = true;
    $("drawerOverlay").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function kvRow(k, v) {
    return "<dt>" + esc(k) + "</dt><dd>" + v + "</dd>";
  }

  function openDetail(id, showError) {
    var d = getDoc(id);
    if (!d) return;
    var s = STATUS[d.status];
    var body = $("drawerBody");
    var foot = $("drawerFoot");
    var errHtml = "";
    if (d.status === "failed") {
      errHtml =
        '<span class="section-label">' + esc(t("detail.err_title")) + "</span>" +
        '<div class="error-box"><strong>' + esc(t("detail.err_failed")) + "</strong><br />" + esc(t("detail.err_reason")) + ": " + esc(d.error || t("detail.err_unknown")) + "</div>";
    }
    body.innerHTML =
      '<div class="detail-title-row"><span class="file-icon file-' + d.type.toLowerCase() + '" aria-hidden="true">' + d.type + "</span>" +
      "<h3>" + esc(d.name) + "</h3></div>" +
      '<div style="margin:6px 0 2px">' + statusPill(d) + "</div>" +
      errHtml +
      '<span class="section-label">' + esc(t("detail.info")) + "</span>" +
      "<dl class=\"kv\">" +
      kvRow(t("detail.f_type"), d.type) +
      kvRow(t("detail.f_size"), fmtSize(d.sizeMB)) +
      kvRow(t("detail.f_created"), d.created) +
      kvRow(t("detail.f_updated"), d.updatedLabel) +
      kvRow(t("detail.f_kb"), esc(d.kb)) +
      "</dl>" +
      '<span class="section-label">' + esc(t("detail.tags")) + "</span>" +
      '<div class="tag-row">' + d.tags.map(function (tg) { return '<span class="tag-chip">' + esc(tg) + "</span>"; }).join("") + "</div>" +
      '<span class="section-label">' + esc(t("detail.desc")) + "</span>" +
      '<p class="desc-text">' + esc(d.desc || "—") + "</p>";
    var busy = d.status === "processing";
    foot.innerHTML =
      (d.status === "failed"
        ? '<button type="button" class="btn btn-primary btn-sm" data-foot="retry">' + esc(t("act.retry")) + "</button>"
        : "") +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="download">' + esc(t("act.download")) + "</button>" +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="edit">' + esc(t("act.edit")) + "</button>" +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="reindex"' + (busy ? " disabled" : "") + ">" + esc(t("act.reindex")) + "</button>" +
      '<button type="button" class="btn btn-danger btn-sm" data-foot="delete">' + esc(t("act.delete")) + "</button>";
    openDrawer(showError ? t("detail.error_title") : t("detail.title"));
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b || b.disabled) return;
      var act = b.getAttribute("data-foot");
      if (act === "download") showToast(t("toast.download_backend"));
      else if (act === "edit") openEdit(id);
      else if (act === "reindex" || act === "retry") { reindexDoc(id); closeDrawer(); }
      else if (act === "delete") { closeDrawer(); askDelete([id]); }
    };
  }

  function openEdit(id) {
    var d = getDoc(id);
    if (!d) return;
    var body = $("drawerBody");
    var foot = $("drawerFoot");
    body.innerHTML =
      '<div class="form-group"><label for="fName">' + esc(t("edit.name")) + "</label>" +
      '<input class="text-input" id="fName" value="' + esc(d.name) + '" maxlength="120" /></div>' +
      '<div class="form-group"><label for="fKb">' + esc(t("edit.kb")) + "</label>" +
      '<select class="select" id="fKb">' +
      ["Finance", "HR", "Sales", "Engineering"].map(function (k) {
        return '<option value="' + k + '"' + (d.kb === k ? " selected" : "") + ">" + k + "</option>";
      }).join("") + "</select></div>" +
      '<div class="form-group"><label for="fTags">' + esc(t("edit.tags")) + "</label>" +
      '<input class="text-input" id="fTags" value="' + esc(d.tags.join(", ")) + '" /></div>' +
      '<div class="form-group"><label for="fDesc">' + esc(t("edit.desc")) + "</label>" +
      '<textarea class="text-input" id="fDesc">' + esc(d.desc || "") + "</textarea></div>";
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="cancel">' + esc(t("edit.cancel")) + "</button>" +
      '<button type="button" class="btn btn-primary btn-sm" data-foot="save">' + esc(t("edit.save")) + "</button>";
    openDrawer(t("edit.title"));
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b) return;
      if (b.getAttribute("data-foot") === "cancel") { openDetail(id); return; }
      var name = $("fName").value.trim();
      if (!name) { $("fName").focus(); showToast(t("edit.need_name"), "error"); return; }
      d.name = name;
      d.kb = $("fKb").value;
      d.tags = $("fTags").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      d.desc = $("fDesc").value.trim();
      d.updatedLabel = t("misc.just_now");
      renderAll();
      showToast(t("toast.updated"));
      openDetail(id);
    };
  }

  /* ---------------- Upload drawer ---------------- */
  var pendingFile = null;

  function openUpload() {
    pendingFile = null;
    var body = $("drawerBody");
    var foot = $("drawerFoot");
    body.innerHTML =
      '<div class="form-group"><label>' + esc(t("upload.drop_title")) + "</label>" +
      '<div class="dropzone" id="dropzone" role="button" tabindex="0" aria-label="' + esc(t("upload.pick_aria")) + '">' +
      "<div><strong>" + esc(t("upload.drop")) + "</strong></div><div>" + esc(t("upload.or")) + "</div>" +
      '<div><button type="button" class="btn btn-secondary btn-sm" id="btnBrowse">' + esc(t("upload.browse")) + "</button></div></div>" +
      '<input type="file" id="fileInput" hidden aria-label="' + esc(t("upload.pick_aria")) + '" /></div>' +
      '<div id="filePicked"></div>' +
      '<div class="progress-track" id="uploadProgress" hidden><div class="progress-fill" id="uploadFill"></div></div>' +
      '<div class="form-group" style="margin-top:14px"><label for="fUpKb">' + esc(t("upload.kb")) + "</label>" +
      '<select class="select" id="fUpKb"><option>Finance</option><option>HR</option><option>Sales</option><option>Engineering</option></select></div>' +
      '<div class="form-group"><label for="fUpTags">' + esc(t("upload.tags")) + "</label>" +
      '<input class="text-input" id="fUpTags" placeholder="' + esc(t("upload.tags_ph")) + '" /></div>' +
      '<div class="form-group"><label for="fUpDesc">' + esc(t("upload.desc")) + "</label>" +
      '<textarea class="text-input" id="fUpDesc" placeholder="' + esc(t("upload.desc_ph")) + '"></textarea></div>';
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="cancel">' + esc(t("upload.cancel")) + "</button>" +
      '<button type="button" class="btn btn-primary btn-sm" data-foot="upload" id="btnDoUpload" disabled>' + esc(t("upload.submit")) + "</button>";
    openDrawer(t("upload.title"));

    var dz = $("dropzone");
    var fi = $("fileInput");
    dz.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#btnBrowse")) { fi.click(); return; }
      fi.click();
    });
    dz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fi.click(); }
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("dragover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("dragover"); });
    });
    dz.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
    });
    fi.addEventListener("change", function () {
      if (fi.files && fi.files[0]) pickFile(fi.files[0]);
    });
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b || b.disabled) return;
      if (b.getAttribute("data-foot") === "cancel") { closeDrawer(); return; }
      startUpload();
    };
  }

  function pickFile(f) {
    pendingFile = f;
    var ext = (f.name.split(".").pop() || "").toUpperCase();
    if (["PDF", "DOCX", "XLSX", "CSV", "TXT"].indexOf(ext) === -1) ext = "TXT";
    $("filePicked").innerHTML =
      '<div class="file-chip"><span class="file-icon file-' + ext.toLowerCase() + '" aria-hidden="true">' + ext + "</span>" +
      '<span class="doc-name" title="' + esc(f.name) + '">' + esc(f.name) + "</span></div>";
    $("btnDoUpload").disabled = false;
  }

  function startUpload() {
    if (!pendingFile) return;
    var f = pendingFile;
    var ext = (f.name.split(".").pop() || "").toUpperCase();
    if (["PDF", "DOCX", "XLSX", "CSV", "TXT"].indexOf(ext) === -1) ext = "TXT";
    var bar = $("uploadProgress");
    var fill = $("uploadFill");
    var btn = $("btnDoUpload");
    btn.disabled = true;
    bar.hidden = false;
    var p = 0;
    var tick = setInterval(function () {
      p = Math.min(100, p + 12 + Math.random() * 18);
      fill.style.width = p + "%";
      if (p >= 100) {
        clearInterval(tick);
        var now = new Date();
        var doc = {
          id: "d" + now.getTime().toString(36),
          name: f.name,
          type: ext,
          kb: $("fUpKb").value,
          sizeMB: Math.max(0.01, f.size / 1048576),
          created: now.toISOString().slice(0, 10),
          updated: now.toISOString().slice(0, 16),
          updatedLabel: t("misc.just_now"),
          status: "processing",
          tags: $("fUpTags").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean),
          desc: $("fUpDesc").value.trim()
        };
        docs.unshift(doc);
        renderAll();
        closeDrawer();
        showToast(t("toast.uploaded"));
        state.timers[doc.id] = setTimeout(function () {
          doc.status = "indexed";
          doc.updatedLabel = t("misc.just_now");
          renderAll();
          showToast(t("toast.indexed"));
        }, 2600);
      }
    }, 160);
  }

  /* ---------------- Re-index (mock) ---------------- */
  function reindexDoc(id) {
    var d = getDoc(id);
    if (!d || d.status === "processing") return;
    d.status = "processing";
    d.updatedLabel = t("misc.just_now");
    renderAll();
    if (state.timers[id]) clearTimeout(state.timers[id]);
    state.timers[id] = setTimeout(function () {
      d.status = "indexed";
      delete d.error;
      renderAll();
      showToast(t("toast.reindexed"));
    }, 2000);
  }

  /* ---------------- Delete + confirm modal ---------------- */
  var pendingDelete = [];

  function askDelete(ids) {
    pendingDelete = ids.slice();
    var names = ids.map(function (id) { var d = getDoc(id); return d ? d.name : id; });
    $("modalDesc").textContent =
      ids.length === 1
        ? t("del.one").replace("{name}", names[0])
        : t("del.bulk").replace("{n}", String(ids.length));
    $("modalConfirm").textContent = ids.length === 1 ? t("del.confirm_one") : ids.length + " " + t("del.confirm_many");
    lastFocus = document.activeElement;
    $("confirmModal").hidden = false;
    $("modalOverlay").hidden = false;
    $("modalCancel").focus();
  }

  function closeModal() {
    $("confirmModal").hidden = true;
    $("modalOverlay").hidden = true;
    pendingDelete = [];
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function doDelete() {
    var n = pendingDelete.length;
    pendingDelete.forEach(function (id) {
      if (state.timers[id]) { clearTimeout(state.timers[id]); delete state.timers[id]; }
      delete state.selected[id];
    });
    docs = docs.filter(function (d) { return pendingDelete.indexOf(d.id) === -1; });
    closeModal();
    renderAll();
    showToast(n === 1 ? t("toast.deleted_one") : n + t("toast.deleted_many"));
  }

  /* ---------------- Events ---------------- */
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

  function init() {
    initTheme();
    setupLang();

    $("searchInput").addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      renderAll();
    });
    $("filterType").addEventListener("change", function (e) { state.type = e.target.value; renderAll(); });
    $("filterStatus").addEventListener("change", function (e) { state.status = e.target.value; renderAll(); });
    $("filterKb").addEventListener("change", function (e) { state.kb = e.target.value; renderAll(); });
    $("filterTime").addEventListener("change", function (e) { state.time = e.target.value; renderAll(); });
    $("sortBy").addEventListener("change", function (e) { state.sort = e.target.value; renderAll(); });

    $("btnClearFilters").addEventListener("click", clearFilters);
    $("btnEmptyClear").addEventListener("click", clearFilters);
    function clearFilters() {
      state.q = ""; state.type = ""; state.status = ""; state.kb = ""; state.time = "";
      $("searchInput").value = "";
      $("filterType").value = ""; $("filterStatus").value = ""; $("filterKb").value = ""; $("filterTime").value = "";
      renderAll();
    }

    $("btnAdd").addEventListener("click", openUpload);
    $("btnAddInline").addEventListener("click", openUpload);
    $("btnEmptyAdd").addEventListener("click", openUpload);

    $("checkAll").addEventListener("change", function (e) {
      var on = e.target.checked;
      visibleDocs().forEach(function (d) {
        if (on) state.selected[d.id] = true;
        else delete state.selected[d.id];
      });
      renderTable();
    });

    $("docBody").addEventListener("click", function (e) {
      var check = e.target.closest ? e.target.closest("[data-check]") : null;
      if (check) {
        var id = check.getAttribute("data-check");
        if (check.checked) state.selected[id] = true;
        else delete state.selected[id];
        renderTable();
        return;
      }
      var menuBtn = e.target.closest ? e.target.closest("[data-menu]") : null;
      if (menuBtn) {
        e.stopPropagation();
        showRowMenu(menuBtn, menuBtn.getAttribute("data-menu"));
        return;
      }
      var tr = e.target.closest ? e.target.closest("tr[data-id]") : null;
      if (tr) openDetail(tr.getAttribute("data-id"));
    });

    $("btnBulkDelete").addEventListener("click", function () {
      askDelete(Object.keys(state.selected));
    });
    $("btnBulkReindex").addEventListener("click", function () {
      var ids = Object.keys(state.selected);
      ids.forEach(reindexDoc);
      showToast(t("toast.bulk_reindex"));
    });

    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerOverlay").addEventListener("click", closeDrawer);
    $("modalCancel").addEventListener("click", closeModal);
    $("modalOverlay").addEventListener("click", closeModal);
    $("modalConfirm").addEventListener("click", doDelete);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!$("confirmModal").hidden) closeModal();
        else if (!$("drawer").hidden) closeDrawer();
        else closeMenu();
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
