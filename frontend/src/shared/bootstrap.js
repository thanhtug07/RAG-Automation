// AgentOS shared: head bootstrap (language + theme preset before first paint).
// Extracted byte-identical from 6 page heads. Classic script, runs synchronously.
try {
  var __l = localStorage.getItem("agentos.lang");
  if (__l !== "vi") __l = "en";
  document.documentElement.lang = __l;
  var __t = localStorage.getItem("agentos.theme");
  if (__t === "dark" || (!__t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch (__e) {
  document.documentElement.lang = "en";
}
