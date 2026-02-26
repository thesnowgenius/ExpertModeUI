// Stable-4 like JS with per-resort checkboxes, 3-letter typeahead, logo hook
document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_multi_pass";
  const ALLOWED_REMOTE_API_HOSTS = new Set(["pass-picker-expert-mode-multi.onrender.com"]);
  const REQUEST_TIMEOUT_MS = 20000;
  const API_URL = resolveApiUrl(window.API_URL, DEFAULT_API_URL);

  function isLocalDevHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  }

  function isAllowedApiUrl(url) {
    if (!url || (url.protocol !== "https:" && url.protocol !== "http:")) return false;
    if (url.origin === window.location.origin) return true;
    if (isLocalDevHost(url.hostname)) return true;
    return url.protocol === "https:" && ALLOWED_REMOTE_API_HOSTS.has(url.hostname);
  }

  function resolveApiUrl(candidate, fallback) {
    const fallbackUrl = new URL(fallback, window.location.href);
    const rawCandidate = typeof candidate === "string" ? candidate.trim() : "";
    if (!rawCandidate) return fallbackUrl.toString();
    try {
      const parsed = new URL(rawCandidate, window.location.href);
      if (!isAllowedApiUrl(parsed)) throw new Error("endpoint is not in the allowlist");
      return parsed.toString();
    } catch (error) {
      console.warn("Ignoring unsafe API_URL override", error);
      return fallbackUrl.toString();
    }
  }

  const resortInputTemplate = () => {
    const div = document.createElement("div");
    div.className = "resort-row";
    div.innerHTML = `
      <input type="text" class="resort-name" placeholder="Resort"/>
      <input type="number" class="resort-days" placeholder="Days" min="1"/>
      <label><input type="checkbox" class="resort-no-weekends"/> No weekends</label>
      <label><input type="checkbox" class="resort-no-blackouts"/> No blackout dates</label>
      <button type="button" class="remove-resort">Remove</button>
    `;
    return div;
  };

  const riderInputTemplate = () => {
    const div = document.createElement("div");
    div.className = "rider-row";
    div.innerHTML = `
      <input type="number" class="rider-age" placeholder="Age" min="0"/>
      <select class="rider-category">
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="nurse-doc">Nurse/Doc</option>
      </select>
      <button type="button" class="remove-rider">Remove</button>
    `;
    return div;
  };

  const resortsContainer = document.getElementById("resorts");
  const ridersContainer = document.getElementById("riders");

  // default rows
  resortsContainer.appendChild(resortInputTemplate());
  ridersContainer.appendChild(riderInputTemplate());

  document.getElementById("add-resort").addEventListener("click", () => {
    resortsContainer.appendChild(resortInputTemplate());
  });

  document.getElementById("add-rider").addEventListener("click", () => {
    ridersContainer.appendChild(riderInputTemplate());
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-resort")) {
      e.target.closest(".resort-row").remove();
    }
    if (e.target.classList.contains("remove-rider")) {
      e.target.closest(".rider-row").remove();
    }
  });

  // typeahead logic: requires at least 3 chars
  async function loadResorts() {
    const resp = await fetch("resorts.json", {
      credentials: "same-origin",
      redirect: "error",
    });
    if (!resp.ok) throw new Error(`Failed to load resorts (${resp.status})`);
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  }
  let resortsData = [];
  loadResorts().then(d => { resortsData = d; }).catch(err => {
    console.error("Failed to load resorts", err);
    resortsData = [];
  });

  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("resort-name")) {
      const val = e.target.value.toLowerCase();
      let dropdown = e.target.nextElementSibling;
      if (!dropdown || !dropdown.classList.contains("typeahead-list")) {
        dropdown = document.createElement("div");
        dropdown.className = "typeahead-list";
        e.target.parentNode.insertBefore(dropdown, e.target.nextSibling);
      }
      dropdown.innerHTML = "";
      if (val.length >= 3) {
        const matches = resortsData.filter((r) => String(r?.name || "").toLowerCase().includes(val));
        matches.slice(0, 5).forEach(r => {
          const item = document.createElement("div");
          item.className = "typeahead-item";
          item.textContent = String(r?.name || "");
          item.dataset.id = String(r?.id ?? r?.resort_id ?? "");
          item.addEventListener("click", () => {
            e.target.value = String(r?.name || "");
            e.target.dataset.id = String(r?.id ?? r?.resort_id ?? "");
            dropdown.innerHTML = "";
          });
          dropdown.appendChild(item);
        });
      }
    }
  });

  // Logo fix
  const logoImg = document.querySelector("#brand-logo, #logo, header img");
  if (logoImg && !logoImg.src) {
    logoImg.src = "static/logo.png";
  }

  // submit
  document.getElementById("submit").addEventListener("click", async () => {
    const riders = Array.from(ridersContainer.querySelectorAll(".rider-row")).map(r => ({
      age: parseInt(r.querySelector(".rider-age").value) || 0,
      category: r.querySelector(".rider-category").value || null
    }));

    const resorts = Array.from(resortsContainer.querySelectorAll(".resort-row")).map(r => ({
      id: r.querySelector(".resort-name").dataset.id || null,
      name: r.querySelector(".resort-name").value,
      days: parseInt(r.querySelector(".resort-days").value) || 0,
      no_weekends: r.querySelector(".resort-no-weekends").checked,
      no_blackouts: r.querySelector(".resort-no-blackouts").checked
    }));

    const payload = { riders, resorts, mode: "auto" };

    document.getElementById("raw-request").textContent = JSON.stringify(payload, null, 2);

    try {
      let timeoutId = null;
      try {
        const controller = new AbortController();
        timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          credentials: "omit",
          redirect: "error",
          referrerPolicy: "no-referrer",
          cache: "no-store",
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        if (!resp.ok) {
          throw new Error(`Request failed (${resp.status})`);
        }
        const data = await resp.json();
        document.getElementById("raw-response").textContent = JSON.stringify(data, null, 2);
      } finally {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      }
    } catch (err) {
      const message = err && err.name === "AbortError"
        ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
        : err.message;
      document.getElementById("raw-response").textContent = JSON.stringify({error: message});
    }
  });
});
