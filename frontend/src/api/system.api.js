// System API — BACKEND-AVAILABLE. Exact legacy paths from the verified
// backend (origin/test server.py). Do NOT re-prefix these with /api/v1.
// Classic script. No fetch, no DOM, no UI.
(function () {
  "use strict";

  function client() {
    return window.AgentApiClient;
  }

  function uploadTimeout() {
    var cfg = window.AgentApiConfig || {};
    return cfg.TIMEOUT_UPLOAD || 120000;
  }

  window.AgentApi = window.AgentApi || {};
  window.AgentApi.system = {
    // GET /api/health?provider=
    health: function (params) {
      return client().get("/api/health", params);
    },
    // POST /api/keys/validate { api_key, provider, base_url?, save_to_env? }
    validateKey: function (data) {
      return client().post("/api/keys/validate", data);
    },
    // POST /api/models { api_key?, provider?, base_url? } (GET also accepted)
    getModels: function (data) {
      return client().post("/api/models", data || {});
    },
    // GET /api/telemetry
    getTelemetry: function () {
      return client().get("/api/telemetry");
    },
    // POST /api/telemetry/record { prompt_tokens, completion_tokens, ... }
    recordTelemetry: function (data) {
      return client().post("/api/telemetry/record", data);
    },
    // POST /api/test-agent { agent_id, model?, prompt, provider?, base_url?, api_key? }
    testAgent: function (data, options) {
      var opts = options || {};
      if (opts.timeout == null) opts.timeout = uploadTimeout();
      return client().post("/api/test-agent", data, opts);
    },
    // GET /api/logs?level=&limit=&search=
    getLogs: function (params) {
      return client().get("/api/logs", params);
    },
    // POST /api/logs/clear
    clearLogs: function () {
      return client().post("/api/logs/clear", {});
    }
  };
})();
