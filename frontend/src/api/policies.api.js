// Policies API — CONTRACT-READY (no backend endpoints exist yet).
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
  window.AgentApi.policies = {
    // GET /api/v1/policies{?page,page_size,search,category,status}
    getPolicies: function (params) {
      return client().get(v1("/policies"), params);
    },
    // GET /api/v1/policies/{id}
    getPolicy: function (id) {
      return client().get(v1("/policies/" + encodeURIComponent(id)));
    },
    // POST /api/v1/policies { name, category, description?, status?, priority?, scope?, rules?, resources? }
    createPolicy: function (data) {
      return client().post(v1("/policies"), data);
    },
    // PATCH /api/v1/policies/{id} { name?, category?, description?, status?, priority?, scope?, rules?, resources? }
    updatePolicy: function (id, data) {
      return client().patch(v1("/policies/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/policies/{id}
    deletePolicy: function (id) {
      return client().delete(v1("/policies/" + encodeURIComponent(id)));
    },
    // POST /api/v1/policies/{id}/duplicate
    duplicatePolicy: function (id) {
      return client().post(v1("/policies/" + encodeURIComponent(id) + "/duplicate"), {});
    },
    // POST /api/v1/policies/{id}/disable
    disablePolicy: function (id) {
      return client().post(v1("/policies/" + encodeURIComponent(id) + "/disable"), {});
    },
    // POST /api/v1/policies/{id}/enable
    enablePolicy: function (id) {
      return client().post(v1("/policies/" + encodeURIComponent(id) + "/enable"), {});
    }
  };
})();
