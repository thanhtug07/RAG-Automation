// Runs API — CONTRACT-READY. Frontend only reads run state; no execution
// engine lives here. Classic script. No fetch, no DOM, no UI.
(function () {
  "use strict";

  function v1(path) {
    var prefix = (window.AgentApiConfig && window.AgentApiConfig.API_V1_PREFIX) || "/api/v1";
    return prefix + path;
  }

  function client() {
    return window.AgentApiClient;
  }

  window.AgentApi = window.AgentApi || {};
  window.AgentApi.runs = {
    // GET /api/v1/runs{?page,page_size,search,status,workspace_id}
    getRuns: function (params) {
      return client().get(v1("/runs"), params);
    },
    // GET /api/v1/runs/{id}
    getRun: function (id) {
      return client().get(v1("/runs/" + encodeURIComponent(id)));
    },
    // GET /api/v1/runs/{id}/events{?page,page_size}
    getRunEvents: function (id, params) {
      return client().get(v1("/runs/" + encodeURIComponent(id) + "/events"), params);
    }
  };
})();
