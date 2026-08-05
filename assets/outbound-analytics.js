(function initializeOutboundAnalytics(root, factory) {
  const analytics = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = analytics;
  }

  if (root && typeof root === "object") {
    root.SnowGeniusOutboundAnalytics = analytics;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createOutboundAnalytics(root) {
  "use strict";

  const PARENT_ORIGIN = "https://www.snow-genius.com";

  function finiteNumberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function createRecommendationId(options = {}) {
    const cryptoApi = options.cryptoApi === undefined ? root?.crypto : options.cryptoApi;
    if (typeof cryptoApi?.randomUUID === "function") {
      return cryptoApi.randomUUID();
    }

    const now = typeof options.now === "function" ? options.now : Date.now;
    const random = typeof options.random === "function" ? options.random : Math.random;
    return [
      now().toString(36),
      random().toString(36).slice(2),
      random().toString(36).slice(2),
    ].join("-");
  }

  function buildOutboundPassClickMessage(details = {}) {
    return {
      type: "snow_genius_outbound_click",
      tool: "expert_mode",
      environment: "production",
      pass_family: details.passFamily || "unknown",
      pass_name: details.passName || "unknown",
      destination_url: details.destinationUrl || "",
      link_text: details.linkText || "",
      recommended_rank: finiteNumberOrNull(details.recommendedRank),
      estimated_cost: finiteNumberOrNull(details.estimatedCost),
      estimated_savings: finiteNumberOrNull(details.estimatedSavings),
      trip_count: finiteNumberOrNull(details.tripCount),
      recommendation_id: details.recommendationId || "unknown",
      solver_version: details.solverVersion || "unknown",
    };
  }

  function sendOutboundPassClick(details = {}, options = {}) {
    const message = buildOutboundPassClickMessage(details);
    const currentWindow = options.currentWindow || root;
    const parentWindow = options.parentWindow || root?.parent;

    if (!parentWindow || parentWindow === currentWindow || typeof parentWindow.postMessage !== "function") {
      return { sent: false, message };
    }

    try {
      parentWindow.postMessage(message, PARENT_ORIGIN);
      return { sent: true, message };
    } catch (error) {
      const logger = options.logger || root?.console;
      if (options.isDevMode && typeof logger?.warn === "function") {
        logger.warn("Snow Genius outbound click analytics message failed.", error);
      }
      return { sent: false, message };
    }
  }

  function handleOutboundPassClick(event, link, options = {}) {
    const anchor = link || event?.currentTarget;
    const dataset = anchor?.dataset || {};
    const linkText = String(anchor?.textContent || "").trim();

    return sendOutboundPassClick(
      {
        passFamily: dataset.passFamily,
        passName: dataset.passName || linkText,
        destinationUrl: dataset.destinationUrl || anchor?.href || "",
        linkText,
        recommendedRank: dataset.recommendedRank,
        estimatedCost: dataset.estimatedCost,
        estimatedSavings: dataset.estimatedSavings,
        tripCount: dataset.tripCount,
        recommendationId: dataset.recommendationId,
        solverVersion: dataset.solverVersion,
      },
      options,
    );
  }

  return Object.freeze({
    PARENT_ORIGIN,
    buildOutboundPassClickMessage,
    createRecommendationId,
    finiteNumberOrNull,
    handleOutboundPassClick,
    sendOutboundPassClick,
  });
});
