// Tools API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.tools = {
    // GET /api/v1/tools{?page,page_size,search}
    getTools: function (params) {
      return client().get(v1("/tools"), params);
    },
    // GET /api/v1/tools/{id}
    getTool: function (id) {
      return client().get(v1("/tools/" + encodeURIComponent(id)));
    },
    // POST /api/v1/tools { name, type?, config? }
    createTool: function (data) {
      return client().post(v1("/tools"), data);
    },
    // PATCH /api/v1/tools/{id} { name?, config? }
    updateTool: function (id, data) {
      return client().patch(v1("/tools/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/tools/{id}
    deleteTool: function (id) {
      return client().delete(v1("/tools/" + encodeURIComponent(id)));
    }
  };
})();
