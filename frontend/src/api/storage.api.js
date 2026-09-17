// Storage API — CONTRACT-READY (no backend endpoints exist yet).
// Classic script. No fetch, no DOM, no UI. Upload uses FormData.
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
  window.AgentApi.storage = {
    // GET /api/v1/storage/files{?page,page_size,search,type,source,folder,sort,order}
    getFiles: function (params) {
      return client().get(v1("/storage/files"), params);
    },
    // GET /api/v1/storage/files/{id}
    getFile: function (id) {
      return client().get(v1("/storage/files/" + encodeURIComponent(id)));
    },
    // POST /api/v1/storage/upload (multipart: files[] + folder?)
    uploadFiles: function (fileList, folder) {
      var form = new FormData();
      for (var i = 0; i < fileList.length; i++) {
        form.append("files", fileList[i]);
      }
      if (folder) form.append("folder", folder);
      return client().post(v1("/storage/upload"), form, { timeout: uploadTimeout() });
    },
    // PATCH /api/v1/storage/files/{id} { name?, folder? }
    updateFile: function (id, data) {
      return client().patch(v1("/storage/files/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/storage/files/{id}
    deleteFile: function (id) {
      return client().delete(v1("/storage/files/" + encodeURIComponent(id)));
    },
    // POST /api/v1/storage/bulk-delete { ids: [] }
    bulkDeleteFiles: function (ids) {
      return client().post(v1("/storage/bulk-delete"), { ids: ids });
    },
    // GET /api/v1/storage/folders
    getFolders: function () {
      return client().get(v1("/storage/folders"));
    },
    // POST /api/v1/storage/folders { name }
    createFolder: function (data) {
      return client().post(v1("/storage/folders"), data);
    },
    // PATCH /api/v1/storage/folders/{id} { name? }
    renameFolder: function (id, data) {
      return client().patch(v1("/storage/folders/" + encodeURIComponent(id)), data);
    },
    // DELETE /api/v1/storage/folders/{id}
    deleteFolder: function (id) {
      return client().delete(v1("/storage/folders/" + encodeURIComponent(id)));
    }
  };
})();
