// Workspaces API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.workspaces = {
    // GET /api/v1/workspaces{?page,page_size,search}
    getWorkspaces: function (params) {
      return client().get(v1("/workspaces"), params);
    },
    // GET /api/v1/workspaces/{id}
    getWorkspace: function (id) {
      return client().get(v1("/workspaces/" + encodeURIComponent(id)));
    },
    // POST /api/v1/workspaces { name, plan? }
    createWorkspace: function (data) {
      return client().post(v1("/workspaces"), data);
    },
    // PATCH /api/v1/workspaces/{id} { name?, plan? }
    updateWorkspace: function (id, data) {
      return client().patch(v1("/workspaces/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/workspaces/{id}
    deleteWorkspace: function (id) {
      return client().delete(v1("/workspaces/" + encodeURIComponent(id)));
    },
    // GET /api/v1/workspaces/{id}/members
    getMembers: function (workspaceId, params) {
      return client().get(v1("/workspaces/" + encodeURIComponent(workspaceId) + "/members"), params);
    },
    // POST /api/v1/workspaces/{id}/members { email, role }
    addMember: function (workspaceId, data) {
      return client().post(v1("/workspaces/" + encodeURIComponent(workspaceId) + "/members"), data);
    },
    // PATCH /api/v1/workspaces/{id}/members/{memberId} { role }
    updateMember: function (workspaceId, memberId, data) {
      return client().patch(
        v1("/workspaces/" + encodeURIComponent(workspaceId) + "/members/" + encodeURIComponent(memberId)),
        data
      );
    },
    // DELETE /api/v1/workspaces/{id}/members/{memberId}
    removeMember: function (workspaceId, memberId) {
      return client().delete(
        v1("/workspaces/" + encodeURIComponent(workspaceId) + "/members/" + encodeURIComponent(memberId))
      );
    }
  };
})();
