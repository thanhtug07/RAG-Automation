// Tools: guard, shell wiring, simulated tool runs (local only).
(function () {
  var TOOLS = [
    { id: "tool-orders", name: "Order lookup", params: "order_id", active: true },
    { id: "tool-products", name: "Product search", params: "query", active: true },
    { id: "tool-policy", name: "Policy search", params: "query", active: true },
    { id: "tool-revenue", name: "Revenue stats", params: "range", active: false }
  ];
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
    document.getElementById("toolCount").textContent = TOOLS.length + " tools";
    document.getElementById("toolList").innerHTML = TOOLS.map(function (t) {
      return '<div class="toolbar"><strong>' + t.name + "</strong>" +
        '<span class="pill">' + t.params + "</span>" +
        '<span class="pill ' + (t.active ? "success" : "") + '">' + (t.active ? "active" : "off") + "</span>" +
        '<span class="spacer"></span><button class="btn btn-secondary" data-tool="' + t.id + '">Run</button></div>';
    }).join("");
    document.getElementById("toolList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-tool]");
      if (!b) return;
      document.getElementById("toolLog").textContent =
        "[" + new Date().toISOString() + "] " + b.getAttribute("data-tool") + " executed (mock result: 12 rows).";
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
