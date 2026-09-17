// Messages API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
// No agent execution here; backend runs the agent, frontend only sends/reads.
(function () {
  "use strict";

  function v1(path) {
    var prefix = (window.AgentApiConfig && window.AgentApiConfig.API_V1_PREFIX) || "/api/v1";
    return prefix + path;
  }

  function client() {
    return window.AgentApiClient;
  }

  function convoPath(conversationId, suffix) {
    return v1("/conversations/" + encodeURIComponent(conversationId) + (suffix || ""));
  }

  window.AgentApi = window.AgentApi || {};
  window.AgentApi.messages = {
    // GET /api/v1/conversations/{id}/messages{?page,page_size,order}
    getMessages: function (conversationId, params) {
      return client().get(convoPath(conversationId, "/messages"), params);
    },
    // POST /api/v1/conversations/{id}/messages { content, agent_id?, model? }
    sendMessage: function (conversationId, data, options) {
      return client().post(convoPath(conversationId, "/messages"), data, options);
    }
  };
})();
