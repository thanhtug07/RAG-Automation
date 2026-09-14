// Login: validation + session + redirect. No backend calls in this phase.
(function () {
  function setInvalid(fieldId, errorId, invalid) {
    document.getElementById(fieldId).classList.toggle("invalid", invalid);
    document.getElementById(errorId).classList.toggle("visible", invalid);
    return !invalid;
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
    } catch (err) { /* theme is decorative, never break auth */ }
  }
  function track(event, data) {
    try {
      var q = JSON.parse(localStorage.getItem("agentos.events") || "[]");
      q.push({ page: "login", event: event, data: data || null, ts: Date.now() });
      localStorage.setItem("agentos.events", JSON.stringify(q.slice(-50)));
      if (window.console && console.debug) console.debug("[analytics]", event, data || "");
    } catch (err) { /* analytics never breaks auth */ }
  }
  tenantTheme();

  // i18n — EN/VI dictionary, same `agentos.lang` key as Home. Static markup
  // binds via data-i18n / data-i18n-ph / data-i18n-alt / data-i18n-aria-label.
  var I18N = {
    en: {
      "meta.title": "Sign in — AgentOS",
      "meta.description": "Sign in to your AgentOS workspace.",
      "nav.brand_aria": "AgentOS home",
      "nav.aria": "Account",
      "nav.home": "Home",
      "nav.sibling": "Create your workspace",
      "brand.context": "Intelligent execution system",
      "visual.aria": "AgentOS in real workplaces",
      "visual.alt": "A real team collaborating around laptops in a modern workspace",
      "visual.eyebrow": "AgentOS in production",
      "visual.quote": "One request in. A traced, board-ready result out.",
      "visual.credit": "Photo: Unsplash",
      "form.eyebrow": "AgentOS workspace",
      "form.title": "Welcome back",
      "form.sub": "Sign in to your AgentOS workspace.",
      "form.email_label": "Work email",
      "form.email_ph": "you@company.com",
      "form.email_error": "Check your email format.",
      "form.continue": "Continue",
      "form.route_corp": "Work domain detected — Continue with SSO is usually fastest for your organization.",
      "form.route_personal": "Personal email — continue with a password or a passkey.",
      "form.change_email": "Use a different email",
      "form.pw_label": "Password",
      "form.forgot": "Forgot password?",
      "form.show": "Show",
      "form.hide": "Hide",
      "form.show_aria": "Show password",
      "form.hide_aria": "Hide password",
      "form.caps": "Caps Lock is on.",
      "form.pw_error": "Password must be at least 8 characters.",
      "form.remember": "Keep me signed in for 30 days",
      "form.submit": "Sign in",
      "form.submitting": "Signing in…",
      "form.cred_error": "Your email or password is incorrect. Try again or reset it.",
      "form.note": "Prototype only — no backend connected.",
      "form.divider": "or continue with",
      "form.passkey": "Sign in with a passkey",
      "form.sso": "Continue with SSO",
      "form.switch_prefix": "New to AgentOS?",
      "form.switch_link": "Create your workspace",
      "note.forgot": "Password reset is disabled in this prototype.",
      "note.passkey_unsupported": "This device doesn't support passkeys. Use a password or SSO.",
      "note.passkey_needs_cred": "Passkeys need a registered credential — prototype build, use a password or SSO for now.",
      "note.sso": "SSO redirects to your identity provider in production — not connected in this prototype."
    },
    vi: {
      "meta.title": "Đăng nhập — AgentOS",
      "meta.description": "Đăng nhập vào workspace AgentOS của bạn.",
      "nav.brand_aria": "Trang chủ AgentOS",
      "nav.aria": "Tài khoản",
      "nav.home": "Trang chủ",
      "nav.sibling": "Tạo workspace",
      "brand.context": "Hệ thống thực thi thông minh",
      "visual.aria": "AgentOS trong môi trường làm việc thực tế",
      "visual.alt": "Một đội ngũ thực đang cộng tác quanh laptop trong văn phòng hiện đại",
      "visual.eyebrow": "AgentOS trong thực tế",
      "visual.quote": "Một yêu cầu vào. Một kết quả truy vết được, sẵn sàng trình bày.",
      "visual.credit": "Ảnh: Unsplash",
      "form.eyebrow": "Workspace AgentOS",
      "form.title": "Chào mừng trở lại",
      "form.sub": "Đăng nhập vào workspace AgentOS của bạn.",
      "form.email_label": "Email công việc",
      "form.email_ph": "ban@congty.com",
      "form.email_error": "Kiểm tra định dạng email.",
      "form.continue": "Tiếp tục",
      "form.route_corp": "Đã nhận diện tên miền công việc — SSO thường là cách nhanh nhất cho tổ chức của bạn.",
      "form.route_personal": "Email cá nhân — tiếp tục bằng mật khẩu hoặc passkey.",
      "form.change_email": "Dùng email khác",
      "form.pw_label": "Mật khẩu",
      "form.forgot": "Quên mật khẩu?",
      "form.show": "Hiện",
      "form.hide": "Ẩn",
      "form.show_aria": "Hiện mật khẩu",
      "form.hide_aria": "Ẩn mật khẩu",
      "form.caps": "Caps Lock đang bật.",
      "form.pw_error": "Mật khẩu phải có ít nhất 8 ký tự.",
      "form.remember": "Giữ tôi đăng nhập 30 ngày",
      "form.submit": "Đăng nhập",
      "form.submitting": "Đang đăng nhập…",
      "form.cred_error": "Email hoặc mật khẩu chưa đúng. Thử lại hoặc đặt lại.",
      "form.note": "Chỉ là bản mẫu — chưa kết nối backend.",
      "form.divider": "hoặc tiếp tục với",
      "form.passkey": "Đăng nhập bằng passkey",
      "form.sso": "Tiếp tục với SSO",
      "form.switch_prefix": "Mới dùng AgentOS?",
      "form.switch_link": "Tạo workspace",
      "note.forgot": "Đặt lại mật khẩu đang tắt trong bản mẫu này.",
      "note.passkey_unsupported": "Thiết bị này không hỗ trợ passkey. Hãy dùng mật khẩu hoặc SSO.",
      "note.passkey_needs_cred": "Passkey cần một credential đã đăng ký — bản mẫu này chưa có, hãy dùng mật khẩu hoặc SSO.",
      "note.sso": "SSO sẽ chuyển tới nhà cung cấp danh tính khi vận hành — bản mẫu này chưa kết nối."
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
  // Dynamic strings that static binding cannot own (toggle state, hints,
  // notes, submit label). Called after every language switch.
  function refreshDynamicStrings() {
    var toggle = document.querySelector(".toggle-password");
    var input = document.getElementById("password");
    if (toggle && input) {
      var shown = input.type !== "password";
      toggle.textContent = shown ? t("form.hide") : t("form.show");
      toggle.setAttribute("aria-label", shown ? t("form.hide_aria") : t("form.show_aria"));
    }
    var submit = document.getElementById("loginSubmit");
    if (submit && !submit.disabled) submit.textContent = t("form.submit");
    var hint = document.getElementById("routeHint");
    var methodStep = document.getElementById("methodStep");
    if (hint && methodStep && !methodStep.hasAttribute("hidden") && hint.textContent) {
      var email = document.getElementById("email").value.trim();
      var at = email.lastIndexOf("@");
      var corp = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]
        .indexOf(at > 0 ? email.slice(at + 1).toLowerCase() : "") === -1;
      hint.textContent = corp ? t("form.route_corp") : t("form.route_personal");
    }
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
    var form = document.getElementById("loginForm");
    if (!form) return;
    var note = document.getElementById("loginNote");
    var submit = document.getElementById("loginSubmit");
    var cont = document.getElementById("emailContinue");
    var methodStep = document.getElementById("methodStep");
    var routeHint = document.getElementById("routeHint");
    var credError = document.getElementById("credentialError");
    var PERSONAL = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"];
    var DEMO_UNKNOWN = ["example.com", "test.com", "invalid.com"];
    function emailValue() { return document.getElementById("email").value.trim(); }
    function domainOf(email) {
      var at = email.lastIndexOf("@");
      return at > 0 ? email.slice(at + 1).toLowerCase() : "";
    }
    // Identifier-first: valid email reveals the method step and routes by domain.
    function revealMethodStep() {
      var email = emailValue();
      var ok = setInvalid("emailField", "emailError", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (!ok) {
        document.getElementById("email").focus();
        return false;
      }
      methodStep.removeAttribute("hidden");
      cont.style.display = "none";
      var corp = PERSONAL.indexOf(domainOf(email)) === -1;
      routeHint.textContent = corp ? t("form.route_corp") : t("form.route_personal");
      document.getElementById("password").focus();
      return true;
    }
    cont.addEventListener("click", revealMethodStep);
    var changeEmail = document.getElementById("changeEmail");
    if (changeEmail) {
      changeEmail.addEventListener("click", function () {
        methodStep.setAttribute("hidden", "");
        cont.style.display = "";
        routeHint.textContent = "";
        credError.classList.remove("visible");
        var emailInput = document.getElementById("email");
        emailInput.focus();
      });
    }
    ["email", "password"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", function () {
        document.getElementById(id + "Field").classList.remove("invalid");
        document.getElementById(id + "Error").classList.remove("visible");
        credError.classList.remove("visible");
      });
    });
    // Caps Lock warning (does not block paste — paste stays allowed).
    document.getElementById("password").addEventListener("keyup", function (e) {
      var on = e.getModifierState && e.getModifierState("CapsLock");
      document.getElementById("capsWarning").hidden = !on;
    });
    var forgot = document.getElementById("forgotLink");
    if (forgot) {
      forgot.addEventListener("click", function (e) {
        e.preventDefault();
        note.textContent = t("note.forgot");
        note.classList.add("visible");
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Enter pressed before Continue: reveal the method step instead of
      // flagging the still-hidden password field.
      if (methodStep.hasAttribute("hidden")) {
        revealMethodStep();
        return;
      }
      var email = emailValue();
      var password = document.getElementById("password").value;
      var okEmail = setInvalid("emailField", "emailError", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      var okPass = setInvalid("passwordField", "passwordError", password.length < 8);
      if (!okEmail || !okPass) return;
      // Demo anti-enumeration rule: reserved domains fail with ONE generic
      // message that never blames a specific field. Production: same rule,
      // backed by throttling + no account-existence leak.
      if (DEMO_UNKNOWN.indexOf(domainOf(email)) !== -1) {
        credError.textContent = t("form.cred_error");
        credError.classList.add("visible");
        return;
      }
      submit.disabled = true;
      submit.textContent = t("form.submitting");
      var remember = document.getElementById("rememberDevice").checked;
      track("submit", { remember: remember });
      setTimeout(function () {
        try {
          var store = remember ? localStorage : sessionStorage;
          store.setItem("agentos.session", "1");
          store.setItem("agentos.email", email);
          window.location.href = "../../dashboard/index.html";
        } catch (err) {
          submit.disabled = false;
          submit.textContent = t("form.submit");
          note.textContent = t("form.note");
          note.classList.add("visible");
        }
      }, 900);
    });
    document.getElementById("passkeyButton").addEventListener("click", function () {
      track("passkey");
      if (!window.PublicKeyCredential) {
        note.textContent = t("note.passkey_unsupported");
      } else {
        note.textContent = t("note.passkey_needs_cred");
      }
      note.classList.add("visible");
    });
    document.getElementById("ssoButton").addEventListener("click", function () {
      track("sso");
      note.textContent = t("note.sso");
      note.classList.add("visible");
    });
    setupLang();
    applyLang();
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
