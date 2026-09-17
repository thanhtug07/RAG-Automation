// AgentOS shared HTTP client — the ONLY place fetch() lives in the API layer.
// Load AFTER config.js. Classic script, no imports. No DOM, no UI.
(function () {
  "use strict";

  function cfg() {
    return window.AgentApiConfig || {
      API_BASE_URL: "",
      TIMEOUT_DEFAULT: 15000,
      TIMEOUT_UPLOAD: 120000,
      TOKEN_KEY: "agentos.token"
    };
  }

  // Unified error type: { status, code, message, details?, requestId? }.
  function ApiError(status, code, message, details) {
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.message = message;
    if (details !== undefined) this.details = details;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ApiError);
    }
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  // Bearer hook (Phase 17): attach only when a token was stored.
  function getToken() {
    try {
      return window.localStorage ? window.localStorage.getItem(cfg().TOKEN_KEY) : null;
    } catch (err) {
      return null;
    }
  }

  function getAuthHeaders() {
    var token = getToken();
    return token ? { Authorization: "Bearer " + token } : {};
  }

  function buildQuery(params) {
    if (!params) return "";
    var parts = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach(function (item) {
          if (item !== undefined && item !== null && item !== "") {
            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(item));
          }
        });
        return;
      }
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return parts.length ? "?" + parts.join("&") : "";
  }

  function buildUrl(path, params) {
    var base = cfg().API_BASE_URL || "";
    return base + path + buildQuery(params);
  }

  function statusCode(status) {
    if (status === 400) return "BAD_REQUEST";
    if (status === 401) return "UNAUTHORIZED";
    if (status === 403) return "FORBIDDEN";
    if (status === 404) return "NOT_FOUND";
    if (status === 409) return "CONFLICT";
    if (status === 422) return "VALIDATION_ERROR";
    if (status === 429) return "RATE_LIMITED";
    if (status >= 500) return "SERVER_ERROR";
    return "HTTP_ERROR";
  }

  function request(method, path, options) {
    options = options || {};
    var timeout = options.timeout != null ? options.timeout : cfg().TIMEOUT_DEFAULT;
    var controller = null;
    var timer = null;
    try {
      if (typeof AbortController !== "undefined") {
        controller = new AbortController();
        timer = setTimeout(function () { controller.abort(); }, timeout);
      }
    } catch (err) {
      controller = null;
    }

    var headers = {};
    var body;
    if (options.body !== undefined && options.body !== null) {
      if (typeof FormData !== "undefined" && options.body instanceof FormData) {
        body = options.body; // browser sets multipart boundary itself
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
      }
    }
    var authHeaders = getAuthHeaders();
    Object.keys(authHeaders).forEach(function (k) { headers[k] = authHeaders[k]; });
    if (options.headers) {
      Object.keys(options.headers).forEach(function (k) { headers[k] = options.headers[k]; });
    }

    var fetchOptions = { method: method, headers: headers };
    if (body !== undefined) fetchOptions.body = body;
    if (controller) fetchOptions.signal = controller.signal;

    return window.fetch(buildUrl(path, options.params), fetchOptions).then(
      function (res) {
        if (timer) clearTimeout(timer);
        var requestId = null;
        try { requestId = res.headers.get("x-request-id"); } catch (err) {}
        return res.text().then(function (text) {
          var data = null;
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (err) {
              data = text; // non-JSON response passes through as-is
            }
          }
          if (res.ok) return data;
          var message = "Request failed";
          var code = statusCode(res.status);
          var details;
          if (data && typeof data === "object") {
            if (typeof data.message === "string") message = data.message;
            else if (typeof data.error === "string") message = data.error;
            else if (typeof data.detail === "string") message = data.detail;
            if (typeof data.code === "string") code = data.code;
            details = data;
          } else if (typeof data === "string" && data) {
            message = data;
          }
          var error = new ApiError(res.status, code, message, details);
          if (requestId) error.requestId = requestId;
          throw error;
        });
      },
      function (err) {
        if (timer) clearTimeout(timer);
        if (err && err.name === "AbortError") {
          throw new ApiError(0, "TIMEOUT", "Request timed out after " + timeout + "ms");
        }
        throw new ApiError(0, "NETWORK_ERROR", (err && err.message) || "Network error");
      }
    );
  }

  window.ApiError = ApiError;
  window.AgentApiClient = {
    get: function (path, params, options) {
      return request("GET", path, Object.assign({}, options, { params: params }));
    },
    post: function (path, body, options) {
      return request("POST", path, Object.assign({}, options, { body: body }));
    },
    put: function (path, body, options) {
      return request("PUT", path, Object.assign({}, options, { body: body }));
    },
    patch: function (path, body, options) {
      return request("PATCH", path, Object.assign({}, options, { body: body }));
    },
    delete: function (path, params, options) {
      return request("DELETE", path, Object.assign({}, options, { params: params }));
    },
    getToken: getToken,
    getAuthHeaders: getAuthHeaders
  };
})();
