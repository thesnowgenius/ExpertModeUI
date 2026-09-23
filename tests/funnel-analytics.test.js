"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const analytics = require("../assets/funnel-analytics.js");

test("expert mode start uses the fixed parent origin and approved payload", () => {
  const calls = [];
  const parentWindow = {
    postMessage(message, origin) {
      calls.push({ message, origin });
    },
  };

  analytics.sendExpertModeStart(
    { entryMethod: "shared_link", solverVersion: "expert-mode-v1" },
    { currentWindow: {}, parentWindow },
  );

  assert.deepEqual(calls, [{
    origin: "https://www.snow-genius.com",
    message: {
      type: "snow_genius_funnel_event",
      event_name: "expert_mode_start",
      tool: "expert_mode",
      environment: "production",
      solver_version: "expert-mode-v1",
      entry_method: "shared_link",
    },
  }]);
});

test("unknown entry methods normalize to manual", () => {
  const message = analytics.buildExpertModeStartMessage({ entryMethod: "unexpected" });
  assert.equal(message.entry_method, "manual");
});

test("expert mode submit uses the fixed parent origin and aggregate-only payload", () => {
  const calls = [];
  const parentWindow = {
    postMessage(message, origin) {
      calls.push({ message, origin });
    },
  };

  analytics.sendExpertModeSubmit(
    {
      entryMethod: "shared_link",
      resortCount: 3,
      riderCount: 2,
      requestedDays: 8,
      solverVersion: "expert-mode-v1",
    },
    { currentWindow: {}, parentWindow },
  );

  assert.deepEqual(calls, [{
    origin: "https://www.snow-genius.com",
    message: {
      type: "snow_genius_funnel_event",
      event_name: "expert_mode_submit",
      tool: "expert_mode",
      environment: "production",
      solver_version: "expert-mode-v1",
      entry_method: "shared_link",
      rider_count: 2,
      resort_count: 3,
      requested_days: 8,
    },
  }]);
});

test("submit aggregate counts reject invalid or identifying values", () => {
  const message = analytics.buildExpertModeSubmitMessage({
    riderCount: null,
    resortCount: "not-a-count",
    requestedDays: 2.5,
    ages: [34],
    resorts: ["example-resort"],
  });

  assert.equal(message.rider_count, null);
  assert.equal(message.resort_count, null);
  assert.equal(message.requested_days, null);
  assert.equal("ages" in message, false);
  assert.equal("resorts" in message, false);
});

test("expert mode result links rendered recommendations to outbound clicks", () => {
  const calls = [];
  const parentWindow = {
    postMessage(message, origin) {
      calls.push({ message, origin });
    },
  };

  analytics.sendExpertModeResult(
    {
      entryMethod: "manual",
      recommendationId: "recommendation-123",
      recommendedPassCount: 2,
      resultCount: 3,
      solverVersion: "expert-mode-v1",
    },
    { currentWindow: {}, parentWindow },
  );

  assert.deepEqual(calls, [{
    origin: "https://www.snow-genius.com",
    message: {
      type: "snow_genius_funnel_event",
      event_name: "expert_mode_result",
      tool: "expert_mode",
      environment: "production",
      solver_version: "expert-mode-v1",
      entry_method: "manual",
      recommendation_id: "recommendation-123",
      result_count: 3,
      recommended_pass_count: 2,
    },
  }]);
});

test("result messages reject invalid aggregate counts and omit result details", () => {
  const message = analytics.buildExpertModeResultMessage({
    recommendationId: "recommendation-456",
    recommendedPassCount: -1,
    resultCount: 1.5,
    passNames: ["Example Pass"],
    response: { internal: true },
  });

  assert.equal(message.recommended_pass_count, null);
  assert.equal(message.result_count, null);
  assert.equal("passNames" in message, false);
  assert.equal("response" in message, false);
});

test("expert mode no-result uses the existing aggregate metric parameters", () => {
  const calls = [];
  const parentWindow = {
    postMessage(message, origin) {
      calls.push({ message, origin });
    },
  };

  analytics.sendExpertModeNoResult(
    {
      entryMethod: "shared_link",
      resortCount: 2,
      riderCount: 1,
      requestedDays: 5,
      solverVersion: "expert-mode-v1",
    },
    { currentWindow: {}, parentWindow },
  );

  assert.deepEqual(calls, [{
    origin: "https://www.snow-genius.com",
    message: {
      type: "snow_genius_funnel_event",
      event_name: "expert_mode_no_result",
      tool: "expert_mode",
      environment: "production",
      solver_version: "expert-mode-v1",
      entry_method: "shared_link",
      rider_count: 1,
      resort_count: 2,
      requested_days: 5,
    },
  }]);
});

test("no-result messages omit itinerary and response details", () => {
  const message = analytics.buildExpertModeNoResultMessage({
    riderCount: null,
    resortCount: "invalid",
    requestedDays: Number.POSITIVE_INFINITY,
    riders: [{ age: 34 }],
    resorts: [{ id: "example-resort" }],
    response: { internal: true },
  });

  assert.equal(message.rider_count, null);
  assert.equal(message.resort_count, null);
  assert.equal(message.requested_days, null);
  assert.equal("riders" in message, false);
  assert.equal("resorts" in message, false);
  assert.equal("response" in message, false);
});

test("a zero-pass fallback is classified as no result", () => {
  assert.equal(analytics.hasRecommendedResult([{
    pass_count: 0,
    passes: [],
    explanation: "No priced pass or pass combo available",
  }]), false);
});

test("a positive recommended pass count is classified as a result", () => {
  assert.equal(analytics.hasRecommendedResult([{
    pass_count: 1,
    passes: [{ pass_id: "example-pass" }],
  }]), true);
});

test("recommended passes are detected when an explicit count is absent", () => {
  assert.equal(analytics.hasRecommendedResult([{
    passes: [{ pass_id: "example-pass" }],
  }]), true);
});

test("the start tracker emits at most once per page load", () => {
  const calls = [];
  const tracker = analytics.createExpertModeStartTracker({
    currentWindow: {},
    parentWindow: {
      postMessage(message, origin) {
        calls.push({ message, origin });
      },
    },
    solverVersion: "expert-mode-v1",
  });

  const first = tracker("manual");
  const second = tracker("shared_link");

  assert.equal(first.sent, true);
  assert.equal(second.sent, false);
  assert.equal(second.skipped, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].message.entry_method, "manual");
});

test("messaging failures stay fail-open and warn only in dev mode", () => {
  const warnings = [];
  const result = analytics.sendExpertModeStart(
    { entryMethod: "manual", solverVersion: "expert-mode-v1" },
    {
      currentWindow: {},
      isDevMode: true,
      logger: { warn: (...args) => warnings.push(args) },
      parentWindow: { postMessage: () => { throw new Error("blocked"); } },
    },
  );

  assert.equal(result.sent, false);
  assert.equal(warnings.length, 1);
});
