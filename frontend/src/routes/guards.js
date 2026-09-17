// AgentOS route guards — runs on DOMContentLoaded in protected pages.
// Uses the EXISTING mock-session mechanism (agentos.session flag), not tokens.
// Classic script. No fetch. Pages opt in by including this file.
(function () {
  "use strict";

  function hasSession() {
    try {
      return !!(
        (window.sessionStorage && window.sessionStorage.getItem("agentos.session")) ||
        (window.localStorage && window.localStorage.getItem("agentos.session"))
      );
    } catch (err) {
      return false;
    }
  }

  function guard() {
    if (!window.AgentRoutes || !window.AgentRouter) return;
    var route = window.AgentRoutes.current();
    if (!route || !route.auth) return; // public page or unknown path: allow
    if (hasSession()) return;
    var url = window.AgentRouter.loginUrl();
    if (url) {
      try {
        window.location.href = url;
      } catch (err) {
        /* never break page */
      }
    }
  }

  window.AgentGuards = {
    hasSession: hasSession,
    guard: guard
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", guard);
  } else {
    guard();
  }
})();
