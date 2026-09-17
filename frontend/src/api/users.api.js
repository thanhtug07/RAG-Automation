// Users API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.users = {
    // GET /api/v1/users/me
    getMe: function () {
      return client().get(v1("/users/me"));
    },
    // PATCH /api/v1/users/me { name?, email?, avatar? }
    updateMe: function (data) {
      return client().patch(v1("/users/me"), data);
    },
    // GET /api/v1/users/{id}
    getUser: function (id) {
      return client().get(v1("/users/" + encodeURIComponent(id)));
    }
  };
})();
