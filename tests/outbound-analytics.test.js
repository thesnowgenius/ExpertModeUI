"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const analytics = require("../assets/outbound-analytics.js");

function testLink(overrides = {}) {
  return {
    href: "https://passes.example/buy",
    textContent: " Buy this pass ",
    dataset: {
      passFamily: "Ikon",
      passName: "Ikon Base Pass",
      destinationUrl: "https://passes.example/buy",
      recommendedRank: "1",
      estimatedCost: "969",
      estimatedSavings: "125.5",
      tripCount: "8",
      recommendationId: "recommendation-123",
      solverVersion: "expert-mode-v1",
      ...overrides,
    },
  };
}

test("one outbound click sends one complete message to the exact parent origin", () => {
  const calls = [];
  const parentWindow = {
    postMessage(message, origin) {
      calls.push({ message, origin });
    },
  };

  analytics.handleOutboundPassClick({}, testLink(), {
    currentWindow: {},
    parentWindow,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].origin, "https://www.snow-genius.com");
  assert.deepEqual(calls[0].message, {
    type: "snow_genius_outbound_click",
    tool: "expert_mode",
    environment: "production",
    pass_family: "Ikon",
    pass_name: "Ikon Base Pass",
    destination_url: "https://passes.example/buy",
    link_text: "Buy this pass",
    recommended_rank: 1,
    estimated_cost: 969,
    estimated_savings: 125.5,
    trip_count: 8,
    recommendation_id: "recommendation-123",
    solver_version: "expert-mode-v1",
  });
});

test("numeric analytics fields are finite numbers or null", () => {
  const message = analytics.buildOutboundPassClickMessage({
    recommendedRank: "2",
    estimatedCost: "$969",
    estimatedSavings: "",
    tripCount: Number.POSITIVE_INFINITY,
  });

  assert.equal(message.recommended_rank, 2);
  assert.equal(message.estimated_cost, null);
  assert.equal(message.estimated_savings, null);
  assert.equal(message.trip_count, null);
});

test("postMessage failures never prevent normal navigation behavior", () => {
  let preventDefaultCalls = 0;
  const event = {
    preventDefault() {
      preventDefaultCalls += 1;
    },
  };
  const warnings = [];
  const parentWindow = {
    postMessage() {
      throw new Error("blocked");
    },
  };

  assert.doesNotThrow(() => {
    analytics.handleOutboundPassClick(event, testLink(), {
      currentWindow: {},
      isDevMode: true,
      logger: { warn: (...args) => warnings.push(args) },
      parentWindow,
    });
  });
  assert.equal(preventDefaultCalls, 0);
  assert.equal(warnings.length, 1);
});

test("production failures stay quiet while navigation remains fail-open", () => {
  const warnings = [];
  analytics.handleOutboundPassClick({}, testLink(), {
    currentWindow: {},
    isDevMode: false,
    logger: { warn: (...args) => warnings.push(args) },
    parentWindow: { postMessage: () => { throw new Error("blocked"); } },
  });
  assert.equal(warnings.length, 0);
});

test("each completed recommendation can receive a new recommendation id", () => {
  const ids = [
    analytics.createRecommendationId(),
    analytics.createRecommendationId(),
  ];
  assert.notEqual(ids[0], ids[1]);

  const fallbackId = analytics.createRecommendationId({
    cryptoApi: null,
    now: () => 12345,
    random: (() => {
      const values = [0.25, 0.75];
      return () => values.shift();
    })(),
  });
  assert.match(fallbackId, /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/);
});
