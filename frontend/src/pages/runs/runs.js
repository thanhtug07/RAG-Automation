// Runs: guard, shell wiring, live progress simulation + cancel/retry (local state).
(function () {
  var RUNS = [
    { id: "run-1042", task: "Q2 Market Intelligence Report", status: "running", progress: 72 },
    { id: "run-1041", task: "Weekly revenue analysis", status: "success", progress: 100 },
    { id: "run-1040", task: "Policy lookup: returns", status: "failed", progress: 41 },
    { id: "run-1039", task: "Competitor price scan", status: "queued", progress: 0 }
  ];
  var PILL = { running: "running", success: "success", failed: "failed", queued: "", cancelled: "" };
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.getElementById("toasts").appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }
  function draw() {
    document.getElementById("runsBody").innerHTML = RUNS.map(function (r) {
      var action = r.status === "running"
        ? '<button class="btn btn-secondary" data-cancel="' + r.id + '">Cancel</button>'
        : r.status === "failed"
          ? '<button class="btn btn-secondary" data-retry="' + r.id + '">Retry</button>'
          : "";
      return "<tr><td>" + r.id + "</td><td>" + r.task + "</td>" +
        '<td><span class="pill ' + (PILL[r.status] || "") + '">' + r.status + "</span></td>" +
        '<td><div class="progress"><span style="width:' + r.progress + '%"></span></div></td>' +
        '<td class="num">' + r.progress + "%</td><td>" + action + "</td></tr>";
    }).join("");
  }
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
    draw();
    var timer = setInterval(function () {
      var active = RUNS.filter(function (r) { return r.status === "running"; })[0];
      if (!active) { clearInterval(timer); return; }
      active.progress = Math.min(100, active.progress + 3);
      if (active.progress >= 100) active.status = "success";
      draw();
    }, 1500);
    document.getElementById("runsBody").addEventListener("click", function (e) {
      var cancel = e.target.closest("[data-cancel]");
      var retry = e.target.closest("[data-retry]");
      if (cancel) {
        RUNS.forEach(function (r) { if (r.id === cancel.getAttribute("data-cancel")) r.status = "cancelled"; });
        draw();
        toast("Run cancelled");
      }
      if (retry) {
        RUNS.forEach(function (r) { if (r.id === retry.getAttribute("data-retry")) { r.status = "running"; r.progress = 5; } });
        draw();
        toast("Run retried");
      }
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
