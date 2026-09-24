// AgentOS shared: toast notifications. Classic script, needs AgentShared.esc.
// Extracted from documents/policies/data-storage pages (identical bodies,
// timeout standardized to 3000ms; documents used 3200ms before).
// Requires a <div class="toast-wrap" id="toasts"> in the page.
(function () {
  "use strict";
  window.AgentShared = window.AgentShared || {};
  window.AgentShared.toast = function (msg, type) {
    var wrap = document.getElementById("toasts");
    if (!wrap) return;
    var esc = window.AgentShared.esc;
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
  };
})();
