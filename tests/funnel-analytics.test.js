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
