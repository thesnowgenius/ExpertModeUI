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
  function validate(config, expectedOrigin) {
    if (!config || config.mode !== "review" || typeof config.apiOrigin !== "string") {
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
    return Object.freeze({ apiOrigin: url.origin, apiUrl: url.origin + "/score_pass" });
  }
  function providerUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || productionHost(url.hostname)) return "";
      return url.toString();
    } catch (_error) { return ""; }
  }
  return Object.freeze({ validate, providerUrl });
});
