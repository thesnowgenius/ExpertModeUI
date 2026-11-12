(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SnowGeniusReviewDeployment = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  function productionHost(host) {
    host = host.toLowerCase().replace(/\.$/, "");
    return host === "snow-genius.com" || host.endsWith(".snow-genius.com") ||
      host === "pass-picker-expert-mode-multi.onrender.com";
  }
  function validate(config, expectedOrigin, expectedMode = "review") {
    if (!["review", "pilot"].includes(expectedMode) || !config || config.mode !== expectedMode || typeof config.apiOrigin !== "string") {
      throw new Error("Missing preview configuration");
    }
    const url = new URL(config.apiOrigin);
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (config.apiOrigin !== url.origin || config.apiOrigin !== expectedOrigin ||
        url.username || url.password || productionHost(url.hostname) ||
        (loopback ? config.localTest !== true || url.protocol !== "http:" : url.protocol !== "https:") ||
        url.hostname.includes("*") || url.hostname.endsWith(".invalid")) {
      throw new Error("Invalid preview API origin");
    }
    if (expectedMode === "pilot" && (typeof config.pilotNotice !== "string" ||
        !config.pilotNotice.trim() || config.pilotNotice !== config.pilotNotice.trim() || config.pilotNotice.length > 2000)) {
      throw new Error("Missing pilot disclosure configuration");
    }
    return Object.freeze({ apiOrigin: url.origin, apiUrl: url.origin + "/score_pass",
      mode: expectedMode, pilotNotice: config.pilotNotice });
  }
  function validateCatalog(config, bootstrap) {
    if (config.mode === "review" && bootstrap.review_scope?.mode !== "limited_preview") {
      throw new Error("Preview API must disclose its review catalog.");
    }
    if (config.mode === "pilot" && (bootstrap.review_scope !== undefined ||
        bootstrap.pilot_scope?.mode !== "limited_catalog" || bootstrap.pilot_scope.notice !== config.pilotNotice)) {
      throw new Error("Pilot API must disclose the configured pilot catalog.");
    }
  }
  function providerUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || productionHost(url.hostname)) return "";
      return url.toString();
    } catch (_error) { return ""; }
  }
  return Object.freeze({ validate, validateCatalog, providerUrl });
});
