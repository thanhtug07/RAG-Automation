// AgentOS router — navigation helper for the multi-page app.
// Browser back/forward + refresh are native (real page loads). Classic script.
(function () {
  "use strict";

  // All pages live under frontend/src/pages/, so the pages root is derived
  // from the current URL: everything up to and including "/pages/".
  function pagesRoot() {
    var href = "";
    try {
      href = window.location.href || "";
    } catch (err) {
      return "";
    }
    var marker = "/pages/";
    var at = href.indexOf(marker);
    if (at === -1) return "";
    return href.slice(0, at + marker.length);
  }

  // Navigate to a route id from the route table. Unknown id → no-op (returns false).
  function go(id) {
    if (!window.AgentRoutes) return false;
    var route = window.AgentRoutes.byId(id);
    if (!route) return false;
    var root = pagesRoot();
    if (!root) return false;
    try {
      window.location.href = root + route.file;
      return true;
    } catch (err) {
      return false;
    }
  }

  function loginUrl() {
    var root = pagesRoot();
    return root ? root + "auth/login/index.html" : "";
  }

  window.AgentRouter = {
    go: go,
    loginUrl: loginUrl,
    current: function () {
      return window.AgentRoutes ? window.AgentRoutes.current() : null;
    }
  };
})();
