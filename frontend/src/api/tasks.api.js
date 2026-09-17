// Tasks API — CONTRACT-READY (steps endpoint UNKNOWN).
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
  window.AgentApi.tasks = {
    // GET /api/v1/tasks{?page,page_size,search,status,workspace_id}
    getTasks: function (params) {
      return client().get(v1("/tasks"), params);
    },
    // GET /api/v1/tasks/{id}
    getTask: function (id) {
      return client().get(v1("/tasks/" + encodeURIComponent(id)));
    },
    // POST /api/v1/tasks { title, agent_id?, conversation_id? }
    createTask: function (data) {
      return client().post(v1("/tasks"), data);
    },
    // PATCH /api/v1/tasks/{id} { title?, status? }
    updateTask: function (id, data) {
      return client().patch(v1("/tasks/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/tasks/{id}
    deleteTask: function (id) {
      return client().delete(v1("/tasks/" + encodeURIComponent(id)));
    },
    // POST /api/v1/tasks/{id}/cancel
    cancelTask: function (id) {
      return client().post(v1("/tasks/" + encodeURIComponent(id) + "/cancel"), {});
    },
    // POST /api/v1/tasks/{id}/retry
    retryTask: function (id) {
      return client().post(v1("/tasks/" + encodeURIComponent(id) + "/retry"), {});
    },
    // GET /api/v1/tasks/{id}/steps (UNKNOWN — shape unconfirmed)
    getTaskSteps: function (id) {
      return client().get(v1("/tasks/" + encodeURIComponent(id) + "/steps"));
    }
  };
})();
