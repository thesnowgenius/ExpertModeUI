(function initializeFunnelAnalytics(root, factory) {
  const analytics = factory(root);

  if (typeof module === "object" && module.exports) {
    module.exports = analytics;
  }

  if (root && typeof root === "object") {
    root.SnowGeniusFunnelAnalytics = analytics;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createFunnelAnalytics(root) {
  "use strict";

  const PARENT_ORIGIN = "https://www.snow-genius.com";
  const MESSAGE_TYPE = "snow_genius_funnel_event";
  const EVENT_NAME = "expert_mode_start";
  const ENTRY_METHODS = new Set(["manual", "shared_link"]);

  function normalizeEntryMethod(value) {
    return ENTRY_METHODS.has(value) ? value : "manual";
  }

  function buildExpertModeStartMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
    };
  }

  function sendExpertModeStart(details = {}, options = {}) {
    const message = buildExpertModeStartMessage(details);
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
        logger.warn("Snow Genius funnel analytics message failed.", error);
      }
      return { sent: false, message };
    }
  }

  function createExpertModeStartTracker(options = {}) {
    let tracked = false;

    return function trackExpertModeStart(entryMethod = "manual") {
      const details = {
        entryMethod,
        solverVersion: options.solverVersion,
      };
      const message = buildExpertModeStartMessage(details);
      if (tracked) {
        return { sent: false, skipped: true, message };
      }

      tracked = true;
      return sendExpertModeStart(details, options);
    };
  }

  return Object.freeze({
    EVENT_NAME,
    MESSAGE_TYPE,
    PARENT_ORIGIN,
    buildExpertModeStartMessage,
    createExpertModeStartTracker,
    normalizeEntryMethod,
    sendExpertModeStart,
  });
});
