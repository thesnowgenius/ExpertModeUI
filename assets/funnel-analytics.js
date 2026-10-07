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
  const ERROR_EVENT_NAME = "expert_mode_error";
  const FEEDBACK_EVENT_NAME = "expert_mode_feedback";
  const EVENT_NAME = START_EVENT_NAME;
  const ENTRY_METHODS = new Set(["manual", "shared_link"]);
  const ERROR_TYPES = new Set([
    "timeout",
    "http_4xx",
    "http_5xx",
    "invalid_response",
    "network_error",
    "unknown",
  ]);
  const FEEDBACK_TYPES = new Set(["positive", "negative"]);
  const NEGATIVE_FEEDBACK_REASONS = new Set([
    "expected_different_pass",
    "price_seems_wrong",
    "resort_access_seems_wrong",
    "blackout_or_weekend_issue",
    "other",
  ]);

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

  function normalizeErrorType(value) {
    return ERROR_TYPES.has(value) ? value : "unknown";
  }

  function normalizeFeedbackType(value) {
    return FEEDBACK_TYPES.has(value) ? value : "unknown";
  }

  function normalizeFeedbackReason(feedbackType, value) {
    if (feedbackType === "positive") return "not_applicable";
    return NEGATIVE_FEEDBACK_REASONS.has(value) ? value : "not_provided";
  }

  function classifyExpertModeError(details = {}) {
    if (details.isTimeout) return "timeout";

    const status = Number(details.status);
    if (Number.isInteger(status) && status >= 400 && status < 500) return "http_4xx";
    if (Number.isInteger(status) && status >= 500 && status < 600) return "http_5xx";
    if (details.invalidResponse) return "invalid_response";
    if (details.isNetworkError) return "network_error";
    return "unknown";
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

  function buildExpertModeErrorMessage(details = {}) {
    return {
      type: MESSAGE_TYPE,
      event_name: ERROR_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
      error_type: normalizeErrorType(details.errorType),
      rider_count: normalizeAggregateCount(details.riderCount),
      resort_count: normalizeAggregateCount(details.resortCount),
      requested_days: normalizeAggregateCount(details.requestedDays),
    };
  }

  function buildExpertModeFeedbackMessage(details = {}) {
    const feedbackType = normalizeFeedbackType(details.feedbackType);
    return {
      type: MESSAGE_TYPE,
      event_name: FEEDBACK_EVENT_NAME,
      tool: "expert_mode",
      environment: "production",
      solver_version: details.solverVersion || "unknown",
      entry_method: normalizeEntryMethod(details.entryMethod),
      feedback_type: feedbackType,
      feedback_reason: normalizeFeedbackReason(feedbackType, details.feedbackReason),
      recommendation_id: details.recommendationId || "unknown",
    };
  }

  function hasRecommendedResult(resultOptions) {
    if (!Array.isArray(resultOptions) || !resultOptions.length) return false;

    const recommendedResult = resultOptions[0];
    const explicitPassCount = Number(recommendedResult?.pass_count);
    if (Number.isInteger(explicitPassCount) && explicitPassCount >= 0) {
      return explicitPassCount > 0;
    }

    return Array.isArray(recommendedResult?.passes) && recommendedResult.passes.length > 0;
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

  function sendExpertModeError(details = {}, options = {}) {
    return sendMessage(buildExpertModeErrorMessage(details), options);
  }

  function sendExpertModeFeedback(details = {}, options = {}) {
    return sendMessage(buildExpertModeFeedbackMessage(details), options);
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
    ERROR_EVENT_NAME,
    FEEDBACK_EVENT_NAME,
    MESSAGE_TYPE,
    NO_RESULT_EVENT_NAME,
    PARENT_ORIGIN,
    RESULT_EVENT_NAME,
    START_EVENT_NAME,
    SUBMIT_EVENT_NAME,
    buildExpertModeErrorMessage,
    buildExpertModeFeedbackMessage,
    buildExpertModeNoResultMessage,
    buildExpertModeStartMessage,
    buildExpertModeResultMessage,
    buildExpertModeSubmitMessage,
    classifyExpertModeError,
    createExpertModeStartTracker,
    hasRecommendedResult,
    normalizeAggregateCount,
    normalizeEntryMethod,
    normalizeErrorType,
    normalizeFeedbackReason,
    normalizeFeedbackType,
    sendExpertModeError,
    sendExpertModeFeedback,
    sendExpertModeNoResult,
    sendExpertModeStart,
    sendExpertModeResult,
    sendExpertModeSubmit,
  });
});
