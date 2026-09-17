// Agents API — BACKEND-AVAILABLE for CRUD (exact legacy paths).
// Tool attach/detach is UNKNOWN (no backend route confirmed).
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
  window.AgentApi.agents = {
    // GET /api/agents{?page,page_size,search,status} (BACKEND-AVAILABLE)
    getAgents: function (params) {
      return client().get("/api/agents", params);
    },
    // GET /api/agents/{id} (UNKNOWN — backend currently returns the full list)
    getAgent: function (id) {
      return client().get("/api/agents/" + encodeURIComponent(id));
    },
    // POST /api/agents { id, role, goal, backstory?, llm? } (BACKEND-AVAILABLE)
    createAgent: function (data) {
      return client().post("/api/agents", data);
    },
    // PUT /api/agents/{id} { role?, goal?, backstory?, llm? } (BACKEND-AVAILABLE)
    updateAgent: function (id, data) {
      return client().put("/api/agents/" + encodeURIComponent(id), data);
    },
    // DELETE /api/agents/{id} (BACKEND-AVAILABLE)
    deleteAgent: function (id) {
      return client().delete("/api/agents/" + encodeURIComponent(id));
    },
    // UNKNOWN — no backend route confirmed yet.
    getAgentTools: function (agentId, params) {
      return client().get(
        v1("/agents/" + encodeURIComponent(agentId) + "/tools"), params
      );
    },
    // UNKNOWN — no backend route confirmed yet.
    addAgentTool: function (agentId, toolId) {
      return client().post(
        v1("/agents/" + encodeURIComponent(agentId) + "/tools"),
        { tool_id: toolId }
      );
    },
    // UNKNOWN — no backend route confirmed yet.
    removeAgentTool: function (agentId, toolId) {
      return client().delete(
        v1("/agents/" + encodeURIComponent(agentId) + "/tools/" + encodeURIComponent(toolId))
      );
    }
  };
})();
