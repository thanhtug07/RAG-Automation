// Auth API — CONTRACT-READY (no backend auth endpoints exist yet).
// Classic script. No fetch, no DOM, no UI. Token flows only via client hook.
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
  window.AgentApi.auth = {
    // POST /api/v1/auth/register { name, email, password }
    register: function (data) {
      return client().post(v1("/auth/register"), data);
    },
    // POST /api/v1/auth/login { email, password, remember? } -> { token, user }
    // NOTE: caller persists data.token under config TOKEN_KEY when issued.
    login: function (data) {
      return client().post(v1("/auth/login"), data);
    },
    // POST /api/v1/auth/logout
    logout: function () {
      return client().post(v1("/auth/logout"), {});
    },
    // POST /api/v1/auth/refresh { refresh_token? } -> { token }
    refresh: function (data) {
      return client().post(v1("/auth/refresh"), data || {});
    },
    // GET /api/v1/auth/me (Bearer)
    getMe: function () {
      return client().get(v1("/auth/me"));
    },
    // POST /api/v1/auth/change-password { current_password, new_password }
    changePassword: function (data) {
      return client().post(v1("/auth/change-password"), data);
    }
  };
})();
