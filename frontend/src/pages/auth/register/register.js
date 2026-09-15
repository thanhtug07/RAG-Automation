// Register: validation + session + redirect. No backend calls in this phase.
(function () {
  function setInvalid(fieldId, errorId, invalid) {
    document.getElementById(fieldId).classList.toggle("invalid", invalid);
    document.getElementById(errorId).classList.toggle("visible", invalid);
    return !invalid;
  }

  function strengthOf(v) {
    var score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  }

  // Shared: tenant theme (?org=) + analytics stub (local queue, cap 50).
  function tenantTheme() {
    try {
      var org = new URLSearchParams(window.location.search).get("org");
      if (!org) return;
      org = org.replace(/[^a-z0-9 .\-]/gi, "").slice(0, 24);
      if (!org) return;
      var el = document.querySelector(".brand-word");
      if (el) el.textContent = "AgentOS · " + org;
    } catch (err) { /* decorative only */ }
  }
  function track(event, data) {
    try {
      var q = JSON.parse(localStorage.getItem("agentos.events") || "[]");
      q.push({ page: "register", event: event, data: data || null, ts: Date.now() });
      localStorage.setItem("agentos.events", JSON.stringify(q.slice(-50)));
      if (window.console && console.debug) console.debug("[analytics]", event, data || "");
    } catch (err) { /* never break auth */ }
  }
  tenantTheme();

  function initVideoPlayback() {
    var video = document.querySelector(".visual-video");
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(function () { /* autoplay can be blocked by the browser */ });
  }

  initVideoPlayback();

  // i18n — EN/VI dictionary, same `agentos.lang` key as Home. Static markup
  // binds via data-i18n / data-i18n-ph / data-i18n-alt / data-i18n-aria-label.
  var I18N = {
    en: {
      "meta.title": "Create your workspace — AgentOS",
      "meta.description": "Create your AgentOS workspace.",
      "nav.brand_aria": "AgentOS home",
      "nav.aria": "Account",
      "nav.home": "Home",
      "nav.sibling": "Sign in",
      "brand.context": "Intelligent execution system",
      "visual.aria": "Plan work in AgentOS",
      "visual.alt": "A real team planning work around a whiteboard covered in notes",
      "visual.eyebrow": "Set up in minutes",
      "visual.quote": "Bring the goal. AgentOS plans, staffs, and traces the work.",
      "visual.credit": "Video: Mixkit",
      "visual.status": "Live orchestration",
      "visual.live": "LIVE",
      "visual.agents": "active agents",
      "visual.success": "successful runs",
      "visual.latency": "median latency",
      "form.eyebrow": "AgentOS workspace",
      "form.title": "Create your workspace",
      "form.sub": "Set up your AgentOS workspace.",
      "form.name_label": "Full name",
      "form.name_error": "Enter your full name.",
      "form.email_label": "Work email",
      "form.email_ph": "you@company.com",
      "form.email_error": "Enter a valid work email.",
      "form.pw_label": "Password",
      "form.pw_hint": "8+ characters",
      "form.pw_ph": "Minimum 8 characters",
      "form.show": "Show",
      "form.hide": "Hide",
      "form.show_aria": "Show password",
      "form.hide_aria": "Hide password",
      "form.pw_error": "Password must be at least 8 characters.",
      "form.confirm_pw_label": "Confirm password",
      "form.confirm_pw_ph": "Repeat your password",
      "form.confirm_pw_error": "Passwords do not match.",
      "form.strength_short": "Keep going — 8+ characters needed.",
      "form.strength_basic": "Password strength: basic.",
      "form.strength_good": "Password strength: good.",
      "form.strength_strong": "Password strength: strong.",
      "form.submit": "Create workspace",
      "form.submitting": "Creating workspace…",
      "form.note": "Prototype only — no backend connected.",
      "form.switch_prefix": "Already have an account?",
      "form.switch_link": "Sign in",
      "promo.ready": "Workspace ready.",
      "promo.lead": "Skip passwords next time:",
      "promo.li1": "Sign in with your fingerprint or face",
      "promo.li2": "Works on this device plus one more you add later",
      "promo.li3": "Lose a device? Recover by email, then re-enroll",
      "promo.create": "Create a passkey",
      "promo.skip": "Continue to workspace",
      "note.passkey_unsupported": "This device doesn't support passkeys — continuing with your password.",
      "note.passkey_needs_server": "Passkey registration needs a server challenge — prototype build, keeping your password for now."
    },
    vi: {
      "meta.title": "Tạo workspace — AgentOS",
      "meta.description": "Tạo workspace AgentOS của bạn.",
      "nav.brand_aria": "Trang chủ AgentOS",
      "nav.aria": "Tài khoản",
      "nav.home": "Trang chủ",
      "nav.sibling": "Đăng nhập",
      "brand.context": "Hệ thống thực thi thông minh",
      "visual.aria": "Lên kế hoạch công việc trong AgentOS",
      "visual.alt": "Một đội ngũ thực đang lên kế hoạch quanh bảng trắng đầy ghi chú",
      "visual.eyebrow": "Thiết lập trong vài phút",
      "visual.quote": "Mang mục tiêu đến. AgentOS lập kế hoạch, phân công và truy vết công việc.",
      "visual.credit": "Video: Mixkit",
      "visual.status": "Điều phối trực tiếp",
      "visual.live": "ĐANG CHẠY",
      "visual.agents": "agent đang hoạt động",
      "visual.success": "lượt chạy thành công",
      "visual.latency": "độ trễ trung vị",
      "form.eyebrow": "Workspace AgentOS",
      "form.title": "Tạo workspace",
      "form.sub": "Thiết lập workspace AgentOS của bạn.",
      "form.name_label": "Họ và tên",
      "form.name_error": "Nhập họ tên của bạn.",
      "form.email_label": "Email",
      "form.email_ph": "ban@congty.com",
      "form.email_error": "Nhập email hợp lệ.",
      "form.pw_label": "Mật khẩu",
      "form.pw_hint": "8+ ký tự",
      "form.pw_ph": "Tối thiểu 8 ký tự",
      "form.show": "Hiện",
      "form.hide": "Ẩn",
      "form.show_aria": "Hiện mật khẩu",
      "form.hide_aria": "Ẩn mật khẩu",
      "form.pw_error": "Mật khẩu phải có ít nhất 8 ký tự.",
      "form.confirm_pw_label": "Xác nhận mật khẩu",
      "form.confirm_pw_ph": "Nhập lại mật khẩu",
      "form.confirm_pw_error": "Mật khẩu không khớp.",
      "form.strength_short": "Cố lên — cần 8+ ký tự.",
      "form.strength_basic": "Độ mạnh mật khẩu: cơ bản.",
      "form.strength_good": "Độ mạnh mật khẩu: tốt.",
      "form.strength_strong": "Độ mạnh mật khẩu: mạnh.",
      "form.submit": "Tạo workspace",
      "form.submitting": "Đang tạo workspace…",
      "form.note": "Chỉ là bản mẫu — chưa kết nối backend.",
      "form.switch_prefix": "Đã có tài khoản?",
      "form.switch_link": "Đăng nhập",
      "promo.ready": "Workspace đã sẵn sàng.",
      "promo.lead": "Lần sau khỏi cần mật khẩu:",
      "promo.li1": "Đăng nhập bằng vân tay hoặc khuôn mặt",
      "promo.li2": "Dùng được trên thiết bị này và một thiết bị nữa bạn thêm sau",
      "promo.li3": "Mất thiết bị? Khôi phục qua email, rồi đăng ký lại",
      "promo.create": "Tạo passkey",
      "promo.skip": "Vào workspace",
      "note.passkey_unsupported": "Thiết bị này không hỗ trợ passkey — tiếp tục với mật khẩu của bạn.",
      "note.passkey_needs_server": "Đăng ký passkey cần thử thách từ máy chủ — bản mẫu này chưa có, giữ mật khẩu của bạn."
    }
  };
  var lang = "en";
  try {
    var savedLang = localStorage.getItem("agentos.lang");
    if (savedLang === "vi" || savedLang === "en") lang = savedLang;
  } catch (err) { /* default en */ }
  function t(key) {
    if (I18N[lang] && I18N[lang][key] != null) return I18N[lang][key];
    if (I18N.en[key] != null) return I18N.en[key];
    return key;
  }
  // Dynamic strings the static binding cannot own (toggle state, strength
  // meter, submit label). Called after every language switch.
  function refreshDynamicStrings() {
    var toggle = document.querySelector(".toggle-password");
    var input = document.getElementById("password");
    if (toggle && input) {
      var shown = input.type !== "password";
      toggle.textContent = shown ? t("form.hide") : t("form.show");
      toggle.setAttribute("aria-label", shown ? t("form.hide_aria") : t("form.show_aria"));
    }
    var submit = document.getElementById("registerSubmit");
    if (submit && !submit.disabled) submit.textContent = t("form.submit");
    var hint = document.getElementById("passwordHint");
    if (hint && input && input.value) {
      var v = input.value;
      var s = strengthOf(v);
      if (v.length < 8) { hint.textContent = t("form.strength_short"); hint.setAttribute("data-level", "weak"); }
      else if (s <= 2) { hint.textContent = t("form.strength_basic"); hint.setAttribute("data-level", "weak"); }
      else if (s <= 4) { hint.textContent = t("form.strength_good"); hint.setAttribute("data-level", "ok"); }
      else { hint.textContent = t("form.strength_strong"); hint.setAttribute("data-level", "strong"); }
    }
  }
  function paintStrength() {
    var hint = document.getElementById("passwordHint");
    var input = document.getElementById("password");
    if (!hint || !input) return;
    var v = input.value;
    if (!v) { hint.textContent = ""; hint.removeAttribute("data-level"); return; }
    var s = strengthOf(v);
    if (v.length < 8) { hint.textContent = t("form.strength_short"); hint.setAttribute("data-level", "weak"); }
    else if (s <= 2) { hint.textContent = t("form.strength_basic"); hint.setAttribute("data-level", "weak"); }
    else if (s <= 4) { hint.textContent = t("form.strength_good"); hint.setAttribute("data-level", "ok"); }
    else { hint.textContent = t("form.strength_strong"); hint.setAttribute("data-level", "strong"); }
  }
  function applyLang(next) {
    if (next === "vi" || next === "en") lang = next;
    try { localStorage.setItem("agentos.lang", lang); } catch (err) { /* never break auth */ }
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.description"));
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    refreshDynamicStrings();
  }
  function setupLang() {
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });
  }

  function init() {
    document.querySelectorAll(".toggle-password").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = document.getElementById(btn.getAttribute("data-target"));
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? t("form.hide") : t("form.show");
        btn.setAttribute("aria-label", show ? t("form.hide_aria") : t("form.show_aria"));
        btn.setAttribute("aria-pressed", show ? "true" : "false");
        input.focus();
      });
    });
    var form = document.getElementById("registerForm");
    if (!form) return;
    var note = document.getElementById("registerNote");
    var submit = document.getElementById("registerSubmit");
    var hint = document.getElementById("passwordHint");
    var pwInput = document.getElementById("password");
    ["fullName", "email", "password", "confirmPassword"].forEach(function (id) {
      var map = { fullName: "nameField", email: "emailField", password: "passwordField", confirmPassword: "confirmPasswordField" };
      var err = { fullName: "nameError", email: "emailError", password: "passwordError", confirmPassword: "confirmPasswordError" };
      document.getElementById(id).addEventListener("input", function () {
        document.getElementById(map[id]).classList.remove("invalid");
        document.getElementById(err[id]).classList.remove("visible");
      });
    });
    if (pwInput && hint) {
      pwInput.addEventListener("input", paintStrength);
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fullName").value.trim();
      var email = document.getElementById("email").value.trim();
      var password = document.getElementById("password").value;
      var confirmPassword = document.getElementById("confirmPassword").value;
      var okName = setInvalid("nameField", "nameError", name.length < 2);
      var okEmail = setInvalid("emailField", "emailError", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      var okPass = setInvalid("passwordField", "passwordError", password.length < 8);
      var okConfirm = setInvalid("confirmPasswordField", "confirmPasswordError", confirmPassword !== password || !confirmPassword);
      if (!okName || !okEmail || !okPass || !okConfirm) return;
      track("submit");
      submit.disabled = true;
      submit.textContent = t("form.submitting");
      setTimeout(function () {
        try {
          sessionStorage.setItem("agentos.session", "1");
          sessionStorage.setItem("agentos.email", email);
        } catch (err) {
          submit.disabled = false;
          submit.textContent = t("form.submit");
          note.classList.add("visible");
          return;
        }
        // Passkey upsell at the motivated moment (post-registration):
        // benefits first, creation optional, "don't push twice" via Skip.
        var promo = document.getElementById("passkeyPromo");
        submit.style.display = "none";
        promo.removeAttribute("hidden");
        document.getElementById("skipPasskey").addEventListener("click", function () {
          window.location.href = "../../dashboard/index.html";
        });
        document.getElementById("createPasskey").addEventListener("click", function () {
          track("passkey-create");
          var pkNote = document.getElementById("passkeyNote");
          if (!window.PublicKeyCredential) {
            pkNote.textContent = t("note.passkey_unsupported");
            pkNote.classList.add("visible");
            setTimeout(function () { window.location.href = "../../dashboard/index.html"; }, 1200);
            return;
          }
          pkNote.textContent = t("note.passkey_needs_server");
          pkNote.classList.add("visible");
          setTimeout(function () { window.location.href = "../../dashboard/index.html"; }, 1600);
        });
      }, 900);
    });
    setupLang();
    themeToggleSetup();
    applyLang();
  }

  function themeToggleSetup() {
    var themeToggle = document.getElementById("themeToggle");
    var html = document.documentElement;
    if (!themeToggle) return;
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var savedTheme = localStorage.getItem("agentos.theme");
    var isDarkInit = savedTheme ? savedTheme === "dark" : prefersDark;
    html.classList.toggle("dark", isDarkInit);
    themeToggle.setAttribute("aria-pressed", String(isDarkInit));
    themeToggle.addEventListener("click", function () {
      html.classList.toggle("dark");
      var isDark = html.classList.contains("dark");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      try { localStorage.setItem("agentos.theme", isDark ? "dark" : "light"); } catch (e) { /* never break */ }
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
