// Documents API — CONTRACT-READY. Classic script. No fetch, no DOM, no UI.
// Upload uses FormData (file + metadata fields). No base64.
(function () {
  "use strict";

  function v1(path) {
    var prefix = (window.AgentApiConfig && window.AgentApiConfig.API_V1_PREFIX) || "/api/v1";
    return prefix + path;
  }

  function client() {
    return window.AgentApiClient;
  }

  function uploadTimeout() {
    var cfg = window.AgentApiConfig || {};
    return cfg.TIMEOUT_UPLOAD || 120000;
  }

  window.AgentApi = window.AgentApi || {};
  window.AgentApi.documents = {
    // GET /api/v1/documents{?page,page_size,search,type,status,knowledge_base_id,sort,order}
    getDocuments: function (params) {
      return client().get(v1("/documents"), params);
    },
    // GET /api/v1/documents/{id}
    getDocument: function (id) {
      return client().get(v1("/documents/" + encodeURIComponent(id)));
    },
    // POST /api/v1/documents { name, knowledge_base_id?, tags?, description? }
    createDocument: function (data) {
      return client().post(v1("/documents"), data);
    },
    // PATCH /api/v1/documents/{id} { name?, knowledge_base_id?, tags?, description? }
    updateDocument: function (id, data) {
      return client().patch(v1("/documents/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/documents/{id}
    deleteDocument: function (id) {
      return client().delete(v1("/documents/" + encodeURIComponent(id)));
    },
    // POST /api/v1/documents/upload (multipart: file + knowledge_base_id + tags + description)
    uploadDocument: function (file, metadata) {
      var form = new FormData();
      form.append("file", file);
      metadata = metadata || {};
      Object.keys(metadata).forEach(function (key) {
        var value = metadata[key];
        if (value === undefined || value === null) return;
        form.append(key, Array.isArray(value) ? value.join(",") : value);
      });
      return client().post(v1("/documents/upload"), form, { timeout: uploadTimeout() });
    },
    // POST /api/v1/documents/{id}/reindex
    reindexDocument: function (id) {
      return client().post(v1("/documents/" + encodeURIComponent(id) + "/reindex"), {});
    },
    // POST /api/v1/documents/{id}/retry
    retryDocument: function (id) {
      return client().post(v1("/documents/" + encodeURIComponent(id) + "/retry"), {});
    },
    // GET /api/v1/documents/{id}/status
    getDocumentStatus: function (id) {
      return client().get(v1("/documents/" + encodeURIComponent(id) + "/status"));
    },
    // POST /api/v1/documents/bulk-delete { ids: [] }
    bulkDeleteDocuments: function (ids) {
      return client().post(v1("/documents/bulk-delete"), { ids: ids });
    },
    // POST /api/v1/documents/bulk-reindex { ids: [] }
    bulkReindexDocuments: function (ids) {
      return client().post(v1("/documents/bulk-reindex"), { ids: ids });
    }
  };
})();
