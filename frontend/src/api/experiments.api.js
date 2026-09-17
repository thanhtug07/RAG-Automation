// Experiments API — CONTRACT-READY (run detail + metrics UNKNOWN).
// Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.experiments = {
    // GET /api/v1/experiments{?page,page_size,search}
    getExperiments: function (params) {
      return client().get(v1("/experiments"), params);
    },
    // GET /api/v1/experiments/{id}
    getExperiment: function (id) {
      return client().get(v1("/experiments/" + encodeURIComponent(id)));
    },
    // POST /api/v1/experiments { name, config? }
    createExperiment: function (data) {
      return client().post(v1("/experiments"), data);
    },
    // PATCH /api/v1/experiments/{id} { name?, config? }
    updateExperiment: function (id, data) {
      return client().patch(v1("/experiments/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/experiments/{id}
    deleteExperiment: function (id) {
      return client().delete(v1("/experiments/" + encodeURIComponent(id)));
    },
    // GET /api/v1/experiments/{id}/runs{?page,page_size}
    getExperimentRuns: function (experimentId, params) {
      return client().get(
        v1("/experiments/" + encodeURIComponent(experimentId) + "/runs"), params
      );
    },
    // POST /api/v1/experiments/{id}/runs { config? }
    createExperimentRun: function (experimentId, data) {
      return client().post(
        v1("/experiments/" + encodeURIComponent(experimentId) + "/runs"), data || {}
      );
    },
    // GET /api/v1/experiment-runs/{id} (UNKNOWN — path unconfirmed)
    getExperimentRun: function (id) {
      return client().get(v1("/experiment-runs/" + encodeURIComponent(id)));
    },
    // GET /api/v1/experiment-runs/{id}/metrics (UNKNOWN — shape unconfirmed)
    getExperimentMetrics: function (runId) {
      return client().get(v1("/experiment-runs/" + encodeURIComponent(runId) + "/metrics"));
    }
  };
})();
