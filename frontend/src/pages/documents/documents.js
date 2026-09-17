// Documents — Enterprise Document Management (mock CRUD, no backend).
// All data lives in memory; every mutation re-renders instantly.
(function () {
  "use strict";

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
    return '<span class="status-pill ' + s.cls + '">' + s.icon + "<span>" + s.label + "</span></span>";
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
      $("emptyTitle").textContent = searching ? "Không tìm thấy tài liệu" : "Chưa có tài liệu";
      $("emptySub").textContent = searching
        ? "Thử từ khóa khác hoặc thay đổi bộ lọc."
        : "Tải lên tài liệu đầu tiên để xây dựng knowledge cho workspace.";
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
        '<td class="col-check" data-label=""><input type="checkbox" data-check="' + d.id + '"' + checked + ' aria-label="Chọn ' + esc(d.name) + '" /></td>' +
        '<td data-label="Tài liệu"><div class="doc-cell"><span class="file-icon file-' + d.type.toLowerCase() + '" aria-hidden="true">' + d.type + '</span>' +
        '<div style="min-width:0"><div class="doc-name" title="' + esc(d.name) + '">' + esc(d.name) + '</div>' +
        '<div class="doc-meta">' + esc(d.tags.slice(0, 2).join(" · ")) + "</div></div></div></td>" +
        '<td data-label="Loại">' + d.type + "</td>" +
        '<td data-label="Knowledge Base"><span class="kb-tag">' + esc(d.kb) + "</span></td>" +
        '<td class="num" data-label="Dung lượng">' + fmtSize(d.sizeMB) + "</td>" +
        '<td data-label="Cập nhật">' + esc(d.updatedLabel) + "</td>" +
        '<td data-label="Trạng thái">' + statusPill(d) + "</td>" +
        '<td class="row-actions" data-label=""><button type="button" class="icon-btn" data-menu="' + d.id + '" aria-label="Thao tác với ' + esc(d.name) + '" aria-haspopup="menu">' +
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
    $("bulkCount").textContent = selCount + " đã chọn";
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
      '<button type="button" data-act="detail" role="menuitem">Chi tiết</button>' +
      '<button type="button" data-act="download" role="menuitem">Tải xuống</button>' +
      (d.status === "failed"
        ? '<button type="button" data-act="error" role="menuitem">Xem lỗi</button>'
        : "") +
      '<button type="button" data-act="edit" role="menuitem">Chỉnh sửa</button>' +
      '<button type="button" data-act="reindex" role="menuitem"' + (busy ? " disabled" : "") + ">Lập chỉ mục lại</button>" +
      '<button type="button" data-act="delete" role="menuitem" class="danger">Xóa</button>';
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
      else if (act === "download") showToast("Chức năng tải xuống sẽ được kết nối backend sau.");
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
        '<span class="section-label">Trạng thái xử lý</span>' +
        '<div class="error-box"><strong>Xử lý thất bại</strong><br />Lý do: ' + esc(d.error || "Lỗi không xác định.") + "</div>";
    }
    body.innerHTML =
      '<div class="detail-title-row"><span class="file-icon file-' + d.type.toLowerCase() + '" aria-hidden="true">' + d.type + "</span>" +
      "<h3>" + esc(d.name) + "</h3></div>" +
      '<div style="margin:6px 0 2px">' + statusPill(d) + "</div>" +
      errHtml +
      '<span class="section-label">Thông tin</span>' +
      "<dl class=\"kv\">" +
      kvRow("Loại", d.type) +
      kvRow("Dung lượng", fmtSize(d.sizeMB)) +
      kvRow("Ngày tạo", d.created) +
      kvRow("Cập nhật", d.updatedLabel) +
      kvRow("Knowledge Base", esc(d.kb)) +
      "</dl>" +
      '<span class="section-label">Tags</span>' +
      '<div class="tag-row">' + d.tags.map(function (tg) { return '<span class="tag-chip">' + esc(tg) + "</span>"; }).join("") + "</div>" +
      '<span class="section-label">Mô tả</span>' +
      '<p class="desc-text">' + esc(d.desc || "—") + "</p>";
    var busy = d.status === "processing";
    foot.innerHTML =
      (d.status === "failed"
        ? '<button type="button" class="btn btn-primary btn-sm" data-foot="retry">Thử lại</button>'
        : "") +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="download">Tải xuống</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="edit">Chỉnh sửa</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="reindex"' + (busy ? " disabled" : "") + ">Lập chỉ mục lại</button>" +
      '<button type="button" class="btn btn-danger btn-sm" data-foot="delete">Xóa</button>';
    openDrawer(showError ? "Lỗi xử lý" : "Chi tiết tài liệu");
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b || b.disabled) return;
      var act = b.getAttribute("data-foot");
      if (act === "download") showToast("Chức năng tải xuống sẽ được kết nối backend sau.");
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
      '<div class="form-group"><label for="fName">Tên tài liệu</label>' +
      '<input class="text-input" id="fName" value="' + esc(d.name) + '" maxlength="120" /></div>' +
      '<div class="form-group"><label for="fKb">Knowledge Base</label>' +
      '<select class="select" id="fKb">' +
      ["Finance", "HR", "Sales", "Engineering"].map(function (k) {
        return '<option value="' + k + '"' + (d.kb === k ? " selected" : "") + ">" + k + "</option>";
      }).join("") + "</select></div>" +
      '<div class="form-group"><label for="fTags">Tags (cách nhau bằng dấu phẩy)</label>' +
      '<input class="text-input" id="fTags" value="' + esc(d.tags.join(", ")) + '" /></div>' +
      '<div class="form-group"><label for="fDesc">Mô tả</label>' +
      '<textarea class="text-input" id="fDesc">' + esc(d.desc || "") + "</textarea></div>";
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="cancel">Hủy</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-foot="save">Lưu thay đổi</button>';
    openDrawer("Chỉnh sửa tài liệu");
    foot.onclick = function (e) {
      var b = e.target.closest ? e.target.closest("[data-foot]") : null;
      if (!b) return;
      if (b.getAttribute("data-foot") === "cancel") { openDetail(id); return; }
      var name = $("fName").value.trim();
      if (!name) { $("fName").focus(); showToast("Tên tài liệu không được để trống.", "error"); return; }
      d.name = name;
      d.kb = $("fKb").value;
      d.tags = $("fTags").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      d.desc = $("fDesc").value.trim();
      d.updatedLabel = "Vừa xong";
      renderAll();
      showToast("Đã cập nhật tài liệu.");
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
      '<div class="form-group"><label>Tải lên file</label>' +
      '<div class="dropzone" id="dropzone" role="button" tabindex="0" aria-label="Chọn file để tải lên">' +
      "<div><strong>Kéo &amp; thả file vào đây</strong></div><div>hoặc</div>" +
      '<div><button type="button" class="btn btn-secondary btn-sm" id="btnBrowse">Chọn file</button></div></div>' +
      '<input type="file" id="fileInput" hidden aria-label="Chọn file" /></div>' +
      '<div id="filePicked"></div>' +
      '<div class="progress-track" id="uploadProgress" hidden><div class="progress-fill" id="uploadFill"></div></div>' +
      '<div class="form-group" style="margin-top:14px"><label for="fUpKb">Knowledge Base</label>' +
      '<select class="select" id="fUpKb"><option>Finance</option><option>HR</option><option>Sales</option><option>Engineering</option></select></div>' +
      '<div class="form-group"><label for="fUpTags">Tags (cách nhau bằng dấu phẩy)</label>' +
      '<input class="text-input" id="fUpTags" placeholder="vd: financial, q3" /></div>' +
      '<div class="form-group"><label for="fUpDesc">Mô tả</label>' +
      '<textarea class="text-input" id="fUpDesc" placeholder="Mô tả ngắn về tài liệu..."></textarea></div>';
    foot.innerHTML =
      '<button type="button" class="btn btn-secondary btn-sm" data-foot="cancel">Hủy</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-foot="upload" id="btnDoUpload" disabled>Tải lên tài liệu</button>';
    openDrawer("Thêm tài liệu");

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
          updatedLabel: "Vừa xong",
          status: "processing",
          tags: $("fUpTags").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean),
          desc: $("fUpDesc").value.trim()
        };
        docs.unshift(doc);
        renderAll();
        closeDrawer();
        showToast("Đã tải lên tài liệu. Đang xử lý...");
        state.timers[doc.id] = setTimeout(function () {
          doc.status = "indexed";
          doc.updatedLabel = "Vừa xong";
          renderAll();
          showToast("Tài liệu đã được lập chỉ mục.");
        }, 2600);
      }
    }, 160);
  }

  /* ---------------- Re-index (mock) ---------------- */
  function reindexDoc(id) {
    var d = getDoc(id);
    if (!d || d.status === "processing") return;
    d.status = "processing";
    d.updatedLabel = "Vừa xong";
    renderAll();
    if (state.timers[id]) clearTimeout(state.timers[id]);
    state.timers[id] = setTimeout(function () {
      d.status = "indexed";
      delete d.error;
      renderAll();
      showToast("Tài liệu đã được lập chỉ mục lại.");
    }, 2000);
  }

  /* ---------------- Delete + confirm modal ---------------- */
  var pendingDelete = [];

  function askDelete(ids) {
    pendingDelete = ids.slice();
    var names = ids.map(function (id) { var d = getDoc(id); return d ? d.name : id; });
    $("modalDesc").textContent =
      ids.length === 1
        ? "Bạn có chắc muốn xóa \"" + names[0] + "\"? Hành động này không thể hoàn tác."
        : "Bạn có chắc muốn xóa " + ids.length + " tài liệu đã chọn? Hành động này không thể hoàn tác.";
    $("modalConfirm").textContent = ids.length === 1 ? "Xóa tài liệu" : "Xóa " + ids.length + " tài liệu";
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
    showToast(n === 1 ? "Đã xóa tài liệu." : "Đã xóa " + n + " tài liệu.");
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
      showToast("Đang lập chỉ mục lại " + ids.length + " tài liệu...");
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

    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
