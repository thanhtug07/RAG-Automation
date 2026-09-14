// Dashboard: guard, shell wiring, stats + recent runs from local mock data.
(function () {
  var RUNS = [
    { id: "run-1042", task: "Q2 Market Intelligence Report", status: "running", progress: 72 },
    { id: "run-1041", task: "Weekly revenue analysis", status: "success", progress: 100 },
    { id: "run-1040", task: "Policy lookup: returns", status: "failed", progress: 41 },
    { id: "run-1039", task: "Competitor price scan", status: "queued", progress: 0 }
  ];
  var PILL = { running: "running", success: "success", failed: "failed", queued: "", indexed: "success", pending: "warning" };
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
    var active = RUNS.filter(function (r) { return r.status === "running"; }).length;
    var stats = [["Active runs", active], ["Agents", 4], ["Knowledge sources", 4], ["Tools", 4]];
    document.getElementById("stats").innerHTML = stats.map(function (s) {
      return '<div class="stat"><span>' + s[0] + "</span><strong>" + s[1] + "</strong></div>";
    }).join("");
    document.getElementById("runsBody").innerHTML = RUNS.map(function (r) {
      return "<tr><td>" + r.id + "</td><td>" + r.task + "</td>" +
        '<td><span class="pill ' + (PILL[r.status] || "") + '">' + r.status + "</span></td>" +
        '<td class="num">' + r.progress + "%</td></tr>";
    }).join("");
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
