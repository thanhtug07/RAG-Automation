// AgentOS API config — single place for backend addressing.
// Load FIRST (before client.js). Classic script, no imports.
(function () {
  "use strict";

  // "" = same-origin (page host serves the API, e.g. dev server / Pages+proxy).
  // Set to "http://127.0.0.1:8000" for local backend during development.
  var API_BASE_URL = "";

  // Prefix for assumed v1 contract (modules without a verified backend).
  // Verified legacy routes (agents, system) keep their exact "/api/..." paths.
  var API_V1_PREFIX = "/api/v1";

  // Request timeouts (ms). Uploads / AI runs may override per call.
  var TIMEOUT_DEFAULT = 15000;
  var TIMEOUT_UPLOAD = 120000;

  // localStorage key reserved for the future Bearer token (Phase 17 hook).
  var TOKEN_KEY = "agentos.token";

  window.AgentApiConfig = {
    API_BASE_URL: API_BASE_URL,
    API_V1_PREFIX: API_V1_PREFIX,
    TIMEOUT_DEFAULT: TIMEOUT_DEFAULT,
    TIMEOUT_UPLOAD: TIMEOUT_UPLOAD,
    TOKEN_KEY: TOKEN_KEY
  };
})();
