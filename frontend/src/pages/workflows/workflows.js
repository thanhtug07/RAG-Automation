// Workflows: guard, shell wiring, plan-step lists from local mock data.
(function () {
  var FLOWS = [
    { name: "Market intelligence", steps: ["Research", "Analysis", "Report"], active: 3 },
    { name: "Revenue review", steps: ["Collect", "Analyze", "Summarize"], active: 1 }
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
    document.getElementById("workflows").innerHTML = FLOWS.map(function (w) {
      return '<section class="panel"><div class="panel-head"><span>' + w.name + "</span><span>" +
        w.active + ' active</span></div><div class="panel-body"><ol class="steps">' +
        w.steps.map(function (s, i) {
          return '<li><span class="step-n' + (i === 0 ? " done" : "") + '">' + (i + 1) + "</span>" + s + "</li>";
        }).join("") + "</ol></div></section>";
    }).join("");
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
