// AgentOS shared: dark-theme toggle wiring. Classic script, no dependencies.
// Extracted byte-identical from documents/policies/data-storage pages.
// Requires <button id="..."> toggle; persists shared agentos.theme key.
(function () {
  "use strict";
  window.AgentShared = window.AgentShared || {};
  window.AgentShared.initTheme = function (toggleId) {
    var tt = document.getElementById(toggleId || "themeToggle");
    if (!tt) return;
    try { tt.setAttribute("aria-pressed", String(document.documentElement.classList.contains("dark"))); } catch (err) {}
    tt.addEventListener("click", function () {
      var dark = document.documentElement.classList.toggle("dark");
      tt.setAttribute("aria-pressed", String(dark));
      try { localStorage.setItem("agentos.theme", dark ? "dark" : "light"); } catch (err) {}
    });
  };
})();
