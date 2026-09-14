// Knowledge: guard, shell wiring, sources table from local mock data.
(function () {
  var SOURCES = [
    { name: "Returns policy v4", type: "Policy", updated: "2026-09-02", status: "indexed" },
    { name: "Q2 orders export", type: "Dataset", updated: "2026-09-10", status: "indexed" },
    { name: "Pricing sheet", type: "Dataset", updated: "2026-08-28", status: "pending" },
    { name: "Support macros", type: "Policy", updated: "2026-09-01", status: "indexed" }
  ];
  var PILL = { indexed: "success", pending: "warning" };
  function init() {
    document.getElementById("menuBtn").addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("open");
    });
    document.getElementById("signOut").addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("agentos.session"); localStorage.removeItem("agentos.session"); localStorage.removeItem("agentos.email");
      window.location.href = "../auth/login/index.html";
    });
    var email = sessionStorage.getItem("agentos.email");
    if (email) document.getElementById("sideUser").textContent = email;
    document.getElementById("sourceCount").textContent = SOURCES.length + " sources";
    document.getElementById("sourcesBody").innerHTML = SOURCES.map(function (s) {
      return "<tr><td>" + s.name + "</td><td>" + s.type + "</td><td>" + s.updated + "</td>" +
        '<td><span class="pill ' + (PILL[s.status] || "") + '">' + s.status + "</span></td></tr>";
    }).join("");
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
