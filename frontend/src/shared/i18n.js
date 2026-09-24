// AgentOS shared: EN/VI i18n core. Classic script, no dependencies.
// Extracted from documents/policies/data-storage pages (identical logic).
// Each page keeps its own I18N dict and passes a refresh callback that
// re-renders page-dynamic content after a language switch.
(function () {
  "use strict";
  window.AgentShared = window.AgentShared || {};
  var store = { dict: null, lang: "en", onApply: null };

  function t(key) {
    var dict = store.dict || {};
    if (dict[store.lang] && dict[store.lang][key] != null) return dict[store.lang][key];
    if (dict.en && dict.en[key] != null) return dict.en[key];
    return key;
  }

  function applyLang(next) {
    if (next === "vi" || next === "en") store.lang = next;
    try { localStorage.setItem("agentos.lang", store.lang); } catch (err) {}
    document.documentElement.lang = store.lang;
    var title = t("meta.title");
    if (title !== "meta.title") document.title = title;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-btn") === store.lang ? "true" : "false");
    });
    if (store.onApply) store.onApply();
  }

  function setupLang() {
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang-btn")); });
    });
  }

  window.AgentShared.i18n = {
    init: function (dict, onApply) {
      store.dict = dict || {};
      store.onApply = onApply || null;
      try {
        var saved = localStorage.getItem("agentos.lang");
        if (saved === "vi" || saved === "en") store.lang = saved;
      } catch (err) {}
    },
    t: t,
    applyLang: applyLang,
    setupLang: setupLang,
    getLang: function () { return store.lang; }
  };
})();
