// Command Center: guard, shell wiring, chat simulation + task creation (local state).
(function () {
  var TASKS = [
    { title: "Q2 Market Intelligence Report", status: "running" },
    { title: "Weekly revenue analysis", status: "success" }
  ];
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.getElementById("toasts").appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
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
    var chat = document.getElementById("chat");
    function addMsg(text, who, src) {
      var d = document.createElement("div");
      d.className = "msg " + who;
      d.textContent = text;
      if (src) {
        var s = document.createElement("span");
        s.className = "src";
        s.textContent = src;
        d.appendChild(s);
      }
      chat.appendChild(d);
    }
    addMsg("Welcome to the Command Center. Ask about orders, revenue, or policies.", "agent", "4 tools available");
    document.getElementById("composer").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("chatInput");
      var v = input.value.trim();
      if (!v) return;
      addMsg(v, "user");
      input.value = "";
      setTimeout(function () {
        addMsg("Working on it — research step started for: " + v, "agent", "Sources: Q2 orders export · Returns policy v4");
      }, 600);
    });
    function drawTasks() {
      document.getElementById("taskList").innerHTML = TASKS.map(function (t) {
        return '<p class="task-row"><span class="pill ' + (t.status === "running" ? "running" : t.status === "success" ? "success" : "") + '">' + t.status + "</span> " + t.title + "</p>";
      }).join("");
    }
    drawTasks();
    document.getElementById("taskForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("taskTitle").value.trim();
      if (v.length < 3) return;
      TASKS.unshift({ title: v, status: "queued" });
      document.getElementById("taskTitle").value = "";
      drawTasks();
      toast("Task created");
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
