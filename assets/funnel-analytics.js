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
  const START_EVENT_NAME = "expert_mode_start";
  const SUBMIT_EVENT_NAME = "expert_mode_submit";
  const RESULT_EVENT_NAME = "expert_mode_result";
  const NO_RESULT_EVENT_NAME = "expert_mode_no_result";
  const EVENT_NAME = START_EVENT_NAME;
  const ENTRY_METHODS = new Set(["manual", "shared_link"]);

  function normalizeEntryMethod(value) {
    return ENTRY_METHODS.has(value) ? value : "manual";
  }

  function normalizeAggregateCount(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : null;
  }

  function buildExpertModeStartMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: START_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
    };
  }

  function buildExpertModeSubmitMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: SUBMIT_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
      rider_count: normalizeAggregateCount(details.riderCount),
      resort_count: normalizeAggregateCount(details.resortCount),
      requested_days: normalizeAggregateCount(details.requestedDays),
    };
  }

  function buildExpertModeResultMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: RESULT_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
      recommendation_id: details.recommendationId || "unknown",
      result_count: normalizeAggregateCount(details.resultCount),
      recommended_pass_count: normalizeAggregateCount(details.recommendedPassCount),
    };
  }

  function buildExpertModeNoResultMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: NO_RESULT_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
      rider_count: normalizeAggregateCount(details.riderCount),
      resort_count: normalizeAggregateCount(details.resortCount),
      requested_days: normalizeAggregateCount(details.requestedDays),
    };
  }

  function sendMessage(message, options = {}) {
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

  function sendExpertModeStart(details = {}, options = {}) {
    return sendMessage(buildExpertModeStartMessage(details), options);
  }

  function sendExpertModeSubmit(details = {}, options = {}) {
    return sendMessage(buildExpertModeSubmitMessage(details), options);
  }

  function sendExpertModeResult(details = {}, options = {}) {
    return sendMessage(buildExpertModeResultMessage(details), options);
  }

  function sendExpertModeNoResult(details = {}, options = {}) {
    return sendMessage(buildExpertModeNoResultMessage(details), options);
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
    NO_RESULT_EVENT_NAME,
    PARENT_ORIGIN,
    RESULT_EVENT_NAME,
    START_EVENT_NAME,
    SUBMIT_EVENT_NAME,
    buildExpertModeNoResultMessage,
    buildExpertModeStartMessage,
    buildExpertModeResultMessage,
    buildExpertModeSubmitMessage,
    createExpertModeStartTracker,
    normalizeAggregateCount,
    normalizeEntryMethod,
    sendExpertModeNoResult,
    sendExpertModeStart,
    sendExpertModeResult,
    sendExpertModeSubmit,
  });
});
