// AgentOS shared: HTML escaping. Classic script, no dependencies.
// Extracted byte-identical from documents/policies/data-storage pages.
(function () {
  "use strict";
  window.AgentShared = window.AgentShared || {};
  window.AgentShared.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };
})();
