/* Snow Genius UI Compatibility Patch
 * Purpose: normalize payloads sent to single + multi endpoints so both backends
 * receive the field names they expect, and add both `resort` (slug) and
 * `resort_name` (display) to each resort item.
 *
 * Drop this <script> BEFORE your main scripts so it can wrap window.fetch.
 */
(function () {
  const SINGLE_URL_HINT = "/expert_mode/calculate";
  const MULTI_URL_HINT  = "/score_multi_pass";
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function(input, init) {
    try {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const isPost = init && String(init.method || "GET").toUpperCase() === "POST";
      const isTarget = url.includes(SINGLE_URL_HINT) || url.includes(MULTI_URL_HINT);

      if (isPost && isTarget && init && typeof init.body === "string" && init.headers) {
        try {
          const payload = JSON.parse(init.body);
          const normalized = normalizeForEndpoint(url, payload);
          init.body = JSON.stringify(normalized, null, 2);

          if (window.SG && typeof window.SG.renderRawRequest === "function") {
            window.SG.renderRawRequest({ url, payload: normalized });
          }
        } catch (e) {
          console.warn("[SG compat] failed to normalize request body:", e);
        }
      }

      const res = await nativeFetch(input, init);

      // Try to render raw response if the page exposes helpers
      try {
        const clone = res.clone();
        const json = await clone.json();
        if (window.SG && typeof window.SG.renderRawResponse === "function") {
          window.SG.renderRawResponse(json);
        }
      } catch (e) {
        // not JSON or render helpers not present
      }

      return res;
    } catch (e) {
      console.warn("[SG compat] fetch wrapper error:", e);
      return nativeFetch(input, init);
    }
  };

  function normalizeForEndpoint(url, payload) {
    const isSingle = url.includes(SINGLE_URL_HINT);
    const isMulti = url.includes(MULTI_URL_HINT);
    payload = payload || {};

    // Normalize category on first rider (backends read this today)
    if (Array.isArray(payload.riders) && payload.riders.length > 0) {
      const r0 = payload.riders[0] || {};
      r0.category = normalizeCategory(r0.category);
      if (isSingle && typeof r0.quantity !== "number") r0.quantity = 1; // historical shape
      payload.riders[0] = r0;
    }

    // Make resort arrays compatible
    if (isSingle) {
      if (!Array.isArray(payload.resort_plan) && Array.isArray(payload.resort_days)) {
        payload.resort_plan = payload.resort_days;
        delete payload.resort_days;
      }
      payload.resort_plan = (payload.resort_plan || []).map(normalizeResortItem);
    } else if (isMulti) {
      if (!Array.isArray(payload.resort_days) && Array.isArray(payload.resort_plan)) {
        payload.resort_days = payload.resort_plan;
        delete payload.resort_plan;
      }
      payload.resort_days = (payload.resort_days || []).map(normalizeResortItem);
    }

    return payload;
  }

  function normalizeResortItem(item) {
    const out = Object.assign({}, item);
    const label = out.resort_name || out.resort_display || out.resort || "";
    if (!out.resort) out.resort = toSlug(label);
    if (!out.resort_name) out.resort_name = label || out.resort;
    out.blackout_ok = !!out.blackout_ok;
    if (out.days != null) out.days = parseInt(out.days, 10);
    return out;
  }

  function normalizeCategory(cat) {
    const s = String(cat || "None").trim().toLowerCase();
    if (s === "military" || s === "mil") return "Military";
    if (!s || s === "none" || s === "no" || s === "n/a" || s === "na") return "None";
    // pass other categories through with first-letter uppercased
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function toSlug(name) {
    if (!name) return "";
    let s = String(name).toLowerCase();
    s = s.replace(/\(.*?\)/g, "");      // remove (...) annotations
    s = s.split(",")[0];                  // drop state/country suffix
    s = s.replace(/[^a-z0-9\s-]/g, " "); // keep alnum, spaces, hyphens
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/[\s-]+/g, " ");
    s = s.replace(/\s+/g, "-");
    // Most of your slugs are single tokens (e.g., okemo, loon). Remove hyphens.
    return s.replace(/-/g, "");
  }
})();
