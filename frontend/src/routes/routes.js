// AgentOS route table — multi-page app (one HTML file per page).
// Classic script. No fetch, no DOM. Used by router.js + guards.js.
(function () {
  "use strict";

  // file: path under frontend/src/pages/. auth: requires agentos.session.
  // apis: AgentApi domains the page consumes ( [] = mock-local for now ).
  var ROUTES = [
    { id: "home", file: "home/index.html", auth: false, apis: [] },
    { id: "login", file: "auth/login/index.html", auth: false, apis: [] },
    { id: "register", file: "auth/register/index.html", auth: false, apis: [] },
    { id: "dashboard", file: "dashboard/index.html", auth: false, apis: ["system", "agents"] },
    { id: "documents", file: "documents/index.html", auth: true, apis: [] }
  ];

  function byId(id) {
    for (var i = 0; i < ROUTES.length; i++) {
      if (ROUTES[i].id === id) return ROUTES[i];
    }
    return null;
  }

  // Match current URL to a route by path suffix (works on http(s), file://,
  // and subpath hosting like GitHub Pages /<repo>/pages/...).
  function current() {
    var path = "";
    try {
      path = window.location.pathname || "";
    } catch (err) {
      return null;
    }
    var i, r;
    for (i = 0; i < ROUTES.length; i++) {
      r = ROUTES[i];
      if (path.slice(-r.file.length) === r.file) return r;
    }
    // Deployed site root ("/", "/index.html", "/<repo>/") → home.
    var tail = path.replace(/\/+$/, "").split("/").pop() || "";
    if (tail === "" || tail === "index.html") {
      var home = byId("home");
      if (path.indexOf("/pages/") === -1) return home;
    }
    return null;
  }

  window.AgentRoutes = {
    all: ROUTES,
    byId: byId,
    current: current
  };
})();
