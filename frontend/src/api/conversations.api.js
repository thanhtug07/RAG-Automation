// Conversations API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.conversations = {
    // GET /api/v1/conversations{?page,page_size,search,workspace_id}
    getConversations: function (params) {
      return client().get(v1("/conversations"), params);
    },
    // GET /api/v1/conversations/{id}
    getConversation: function (id) {
      return client().get(v1("/conversations/" + encodeURIComponent(id)));
    },
    // POST /api/v1/conversations { title?, agent_id?, workspace_id? }
    createConversation: function (data) {
      return client().post(v1("/conversations"), data);
    },
    // PATCH /api/v1/conversations/{id} { title? }
    updateConversation: function (id, data) {
      return client().patch(v1("/conversations/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/conversations/{id}
    deleteConversation: function (id) {
      return client().delete(v1("/conversations/" + encodeURIComponent(id)));
    }
  };
})();
