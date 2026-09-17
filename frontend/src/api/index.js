// AgentOS API namespace — load LAST (after config, client, domain modules).
// Exposes window.AgentApi.{auth,users,...,system,client}. Classic script.
(function () {
  "use strict";

  window.AgentApi = window.AgentApi || {};
  window.AgentApi.client = window.AgentApiClient || null;
  window.AgentApi.config = window.AgentApiConfig || null;
  window.AgentApi.version = "0.1.0";
})();
