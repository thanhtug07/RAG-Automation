// Knowledge API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
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
  window.AgentApi.knowledge = {
    // GET /api/v1/knowledge-bases{?page,page_size,search}
    getKnowledgeBases: function (params) {
      return client().get(v1("/knowledge-bases"), params);
    },
    // GET /api/v1/knowledge-bases/{id}
    getKnowledgeBase: function (id) {
      return client().get(v1("/knowledge-bases/" + encodeURIComponent(id)));
    },
    // POST /api/v1/knowledge-bases { name, description? }
    createKnowledgeBase: function (data) {
      return client().post(v1("/knowledge-bases"), data);
    },
    // PATCH /api/v1/knowledge-bases/{id} { name?, description? }
    updateKnowledgeBase: function (id, data) {
      return client().patch(v1("/knowledge-bases/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/knowledge-bases/{id}
    deleteKnowledgeBase: function (id) {
      return client().delete(v1("/knowledge-bases/" + encodeURIComponent(id)));
    },
    // GET /api/v1/knowledge-bases/{id}/documents{?page,page_size,search}
    getKnowledgeDocuments: function (knowledgeBaseId, params) {
      return client().get(
        v1("/knowledge-bases/" + encodeURIComponent(knowledgeBaseId) + "/documents"),
        params
      );
    },
    // POST /api/v1/knowledge-bases/{id}/documents { document_id }
    addDocumentToKnowledge: function (knowledgeBaseId, documentId) {
      return client().post(
        v1("/knowledge-bases/" + encodeURIComponent(knowledgeBaseId) + "/documents"),
        { document_id: documentId }
      );
    },
    // DELETE /api/v1/knowledge-bases/{id}/documents/{documentId}
    removeDocumentFromKnowledge: function (knowledgeBaseId, documentId) {
      return client().delete(
        v1("/knowledge-bases/" + encodeURIComponent(knowledgeBaseId) +
          "/documents/" + encodeURIComponent(documentId))
      );
    },
    // POST /api/v1/knowledge-bases/{id}/search { query, top_k? }
    searchKnowledgeBase: function (knowledgeBaseId, data) {
      return client().post(
        v1("/knowledge-bases/" + encodeURIComponent(knowledgeBaseId) + "/search"),
        data
      );
    }
  };
})();
