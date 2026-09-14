// Agents: guard, shell wiring, agent table from local mock data.
(function () {
  var AGENTS = [
    { name: "Research Agent", type: "Static", status: "running", runs: 128 },
    { name: "Analysis Agent", type: "Configurable", status: "running", runs: 96 },
    { name: "Report Agent", type: "Static", status: "queued", runs: 61 },
    { name: "Policy Agent", type: "Static", status: "success", runs: 54 }
  ];
  var PILL = { running: "running", success: "success", failed: "failed", queued: "" };
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
    document.getElementById("agentCount").textContent = AGENTS.length + " agents";
    document.getElementById("agentsBody").innerHTML = AGENTS.map(function (a) {
      return "<tr><td>" + a.name + "</td><td>" + a.type + "</td>" +
        '<td><span class="pill ' + (PILL[a.status] || "") + '">' + a.status + "</span></td>" +
        '<td class="num">' + a.runs + "</td></tr>";
    }).join("");
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
