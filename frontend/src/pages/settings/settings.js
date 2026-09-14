// Settings: guard, shell wiring, workspace name form (local state).
(function () {
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
    document.getElementById("wsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("wsInput").value.trim();
      if (v.length < 2) return;
      document.getElementById("wsName").textContent = v;
      var el = document.createElement("div");
      el.className = "toast";
      el.textContent = "Settings saved";
      document.getElementById("toasts").appendChild(el);
      setTimeout(function () { el.remove(); }, 3000);
    });
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
