(() => {
  const DEFAULT_API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_pass";
  const ALLOWED_REMOTE_API_HOSTS = new Set(["pass-picker-expert-mode-multi.onrender.com"]);
  const IKON_LOGO_SRC = "assets/ikon-pass-inc-logo-vector.svg";
  const MIN_TYPEAHEAD_CHARS = 3;
  const MAX_SUGGESTIONS = 10;
  const REQUEST_TIMEOUT_MS = 20000;
  const MAX_RIDERS = 12;
  const MAX_RESORTS = 20;
  const MAX_AGE = 120;
  const MAX_DAYS_PER_RESORT = 60;
  const MAX_TOTAL_REQUESTED_DAYS = 365;
  const MAX_RESORT_INPUT_LENGTH = 120;
  const MAX_RESORT_ID_LENGTH = 80;
  const MAX_RESORT_CATALOG_ROWS = 20000;
  const API_URL = resolveApiUrl(window.API_URL, DEFAULT_API_URL);
  const isDevMode = (() => {
    if (typeof window.__SNOW_GENIUS_DEV_MODE__ === "boolean") {
      return window.__SNOW_GENIUS_DEV_MODE__;
    }
    const params = new URLSearchParams(window.location.search || "");
    return (
      params.has("devmode") ||
      (params.get("mode") || "").toLowerCase() === "devmode" ||
      (params.get("") || "").toLowerCase() === "devmode" ||
      /(?:^|[?&=])devmode(?:[=&]|$)/i.test(window.location.search || "")
    );
  })();

  const els = {
    hero: document.querySelector(".hero"),
    appMain: document.querySelector("#app-main"),
    devShell: document.querySelector("#dev-shell"),
    footer: document.querySelector(".footer"),
    ridersWrap: document.querySelector("#riders"),
    resortsWrap: document.querySelector("#resorts"),
    addRider: document.querySelector("#add-rider"),
    addResort: document.querySelector("#add-resort"),
    clear: document.querySelector("#clear"),
    submit: document.querySelector("#submit"),
    rawRequest: document.querySelector("#raw-request"),
    rawResponse: document.querySelector("#raw-response"),
    results: document.querySelector("#results"),
    formError: document.querySelector("#form-error"),
    formStatus: document.querySelector("#form-status"),
  };

  let resortCatalog = [];
  let resortById = new Map();
  let resortByNormalizedName = new Map();
  let typeaheadCounter = 0;

  function isLocalDevHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  }

  function isAllowedApiUrl(url) {
    if (!url || (url.protocol !== "https:" && url.protocol !== "http:")) {
      return false;
    }

    if (url.origin === window.location.origin) {
      return true;
    }

    if (isLocalDevHost(url.hostname)) {
      return true;
    }

    return url.protocol === "https:" && ALLOWED_REMOTE_API_HOSTS.has(url.hostname);
  }

  function resolveApiUrl(candidate, fallback) {
    const fallbackUrl = new URL(fallback, window.location.href);
    const rawCandidate = typeof candidate === "string" ? candidate.trim() : "";
    if (!rawCandidate) {
      return fallbackUrl.toString();
    }

    try {
      const parsed = new URL(rawCandidate, window.location.href);
      if (!isAllowedApiUrl(parsed)) {
        throw new Error("endpoint is not in the allowlist");
      }
      return parsed.toString();
    } catch (error) {
      const message = error instanceof Error ? error.message : "invalid URL";
      console.warn(`Ignoring unsafe API_URL override (${message})`);
      return fallbackUrl.toString();
    }
  }

  function stripControlChars(value) {
    return String(value || "").replace(/[\u0000-\u001F\u007F]/g, "");
  }

  function cleanShortText(value, maxLength) {
    const text = stripControlChars(value).trim();
    if (!maxLength || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function formatState(state) {
    const raw = String(state || "").trim();
    if (!raw) return "";
    if (/^[A-Za-z]{2}$/.test(raw)) {
      return `${raw[0].toUpperCase()}.${raw[1].toUpperCase()}.`;
    }
    return raw;
  }

  function resortLabel(resort) {
    const state = formatState(resort.state);
    return state ? `${resort.name}, ${state}` : resort.name;
  }

  function toCurrency(value) {
    const amount = Number(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  }

  function setStatus(message) {
    if (els.formStatus) {
      els.formStatus.textContent = message || "";
    }
  }

  function showError(message) {
    if (!els.formError) return;
    if (!message) {
      els.formError.hidden = true;
      els.formError.textContent = "";
      return;
    }
    els.formError.hidden = false;
    els.formError.textContent = message;
  }

  function initializeModeUi() {
    document.body.classList.toggle("dev-mode", isDevMode);
    if (els.hero) els.hero.hidden = isDevMode;
    if (els.appMain) els.appMain.hidden = isDevMode;
    if (els.footer) els.footer.hidden = isDevMode;
    if (els.devShell) els.devShell.hidden = !isDevMode;
  }

  function clearResults() {
    if (els.results) {
      els.results.replaceChildren();
    }
  }

  function setBusy(isBusy) {
    if (els.submit) {
      els.submit.disabled = isBusy;
      els.submit.textContent = isBusy ? "Submitting..." : "Submit";
    }
    if (els.results) {
      els.results.setAttribute("aria-busy", isBusy ? "true" : "false");
    }
  }

  function canonicalizeCategory(value) {
    const raw = normalizeText(value);
    if (!raw || raw === "none") return null;
    if (raw.includes("military") || raw.includes("veteran")) return "military";
    if (raw.includes("student")) return "student";
    if (raw.includes("nurse") || raw.includes("doctor") || raw.includes("doc") || raw.includes("medical")) return "medical";
    return raw;
  }

  function parseResortRows(list) {
    return (Array.isArray(list) ? list : [])
      .map((row) => {
        const rawId = row.resort_id ?? row.id ?? row.ResortID ?? row.ResortId ?? row.slug ?? "";
        const rawName = row.resort_name ?? row.name ?? row.ResortName ?? row.title ?? "";
        const rawState = row.state ?? row.State ?? "";
        const id = cleanShortText(rawId, MAX_RESORT_ID_LENGTH);
        const name = cleanShortText(rawName, MAX_RESORT_INPUT_LENGTH);
        const state = cleanShortText(rawState, 32);
        if (!id || !name) return null;
        const result = {
          id,
          name,
          state,
        };
        result.label = resortLabel(result);
        result.searchText = normalizeText(`${result.name} ${result.label} ${result.id}`);
        return result;
      })
      .filter(Boolean);
  }

  function loadResorts() {
    return fetch("resorts.json", {
      credentials: "same-origin",
      redirect: "error",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load resorts (${response.status})`);
        }
        return response.json();
      })
      .then((json) => {
        if (!Array.isArray(json)) {
          throw new Error("Resort list format is invalid");
        }
        if (json.length > MAX_RESORT_CATALOG_ROWS) {
          throw new Error("Resort list is unexpectedly large");
        }
        resortCatalog = parseResortRows(json);
        resortCatalog.sort((a, b) => a.name.localeCompare(b.name));
        resortById = new Map();
        resortByNormalizedName = new Map();
        for (const resort of resortCatalog) {
          resortById.set(resort.id, resort);
          resortByNormalizedName.set(normalizeText(resort.name), resort);
          resortByNormalizedName.set(normalizeText(resort.label), resort);
        }
        document.querySelectorAll(".resort-row").forEach((row) => wireResortRow(row));
      })
      .catch((error) => {
        showError(`Resort list failed to load: ${error.message}`);
      });
  }

  function createRiderRow() {
    const row = document.createElement("div");
    row.className = "row rider-row";
    row.innerHTML = `
      <input type="number" min="0" max="${MAX_AGE}" placeholder="Age" class="input rider-age" aria-label="Rider age" />
      <select class="select rider-category" aria-label="Rider category">
        <option value="">None</option>
        <option value="military">Military</option>
        <option value="student">Student</option>
        <option value="medical">Nurse/Doc</option>
      </select>
      <button type="button" class="btn subtle remove-rider">Remove</button>
    `;
    wireRiderRow(row);
    return row;
  }

  function createResortRow() {
    const row = document.createElement("div");
    row.className = "row resort-row";
    row.innerHTML = `
      <div class="typeahead">
        <input type="text" class="input resort-input" placeholder="Start typing a resort…" autocomplete="off" maxlength="${MAX_RESORT_INPUT_LENGTH}" aria-label="Resort" />
        <ul class="suggestions" role="listbox" hidden></ul>
      </div>
      <input type="number" min="1" max="${MAX_DAYS_PER_RESORT}" class="input days-input" placeholder="Days" aria-label="Days requested" />
      <label class="chk"><input type="checkbox" class="no-weekends" /> Only Weekdays</label>
      <label class="chk"><input type="checkbox" class="no-blackouts" /> No blackout dates</label>
      <button type="button" class="btn subtle remove-resort">Remove</button>
    `;
    wireResortRow(row);
    return row;
  }

  function removeOrResetRow(row, container, factory) {
    const rows = container.querySelectorAll(row.classList.contains("rider-row") ? ".rider-row" : ".resort-row");
    if (rows.length <= 1) {
      const replacement = factory();
      row.replaceWith(replacement);
      return;
    }
    row.remove();
  }

  function wireRiderRow(row) {
    const removeButton = row.querySelector(".remove-rider");
    if (removeButton) {
      removeButton.onclick = () => removeOrResetRow(row, els.ridersWrap, createRiderRow);
    }
  }

  function applySelectedResort(input, resort) {
    if (!input || !resort) return;
    input.value = resort.label;
    input.dataset.resortId = resort.id;
    input.dataset.resortName = resort.name;
    input.dataset.selectedLabel = resort.label;
  }

  function clearSelectedResort(input) {
    if (!input) return;
    delete input.dataset.resortId;
    delete input.dataset.resortName;
    delete input.dataset.selectedLabel;
  }

  function findExactResortMatch(text) {
    if (!text) return null;
    const direct = resortByNormalizedName.get(normalizeText(text));
    if (direct) return direct;
    const normalized = normalizeText(text.replace(/,\s*[A-Za-z. ]+$/, ""));
    return resortByNormalizedName.get(normalized) || null;
  }

  function wireResortRow(row) {
    const input = row.querySelector(".resort-input");
    const list = row.querySelector(".suggestions");
    const removeButton = row.querySelector(".remove-resort");
    if (!input || !list) return;

    if (input.dataset.typeaheadBound === "true") {
      return;
    }
    input.dataset.typeaheadBound = "true";

    const listId = `resort-suggestions-${++typeaheadCounter}`;
    list.id = listId;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-haspopup", "listbox");
    list.hidden = true;

    let suggestions = [];
    let activeIndex = -1;
    let closeTimer = null;

    function closeSuggestions() {
      list.replaceChildren();
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      suggestions = [];
      activeIndex = -1;
    }

    function setActiveIndex(nextIndex) {
      activeIndex = nextIndex;
      const items = Array.from(list.querySelectorAll("li"));
      items.forEach((item, idx) => {
        const active = idx === activeIndex;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
        if (active) {
          input.setAttribute("aria-activedescendant", item.id);
          item.scrollIntoView({ block: "nearest" });
        }
      });
      if (activeIndex < 0) {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function renderSuggestions(items) {
      suggestions = items;
      list.replaceChildren();
      if (!items.length) {
        closeSuggestions();
        return;
      }

      items.forEach((resort, index) => {
        const li = document.createElement("li");
        li.id = `${listId}-option-${index}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.dataset.id = resort.id;
        li.textContent = resort.label;
        li.addEventListener("mousedown", (event) => {
          event.preventDefault();
          applySelectedResort(input, resort);
          closeSuggestions();
        });
        list.appendChild(li);
      });

      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      setActiveIndex(0);
    }

    function updateSuggestions() {
      const rawValue = input.value.trim();
      const query = normalizeText(rawValue);
      if (rawValue !== (input.dataset.selectedLabel || "")) {
        clearSelectedResort(input);
      }
      if (query.length < MIN_TYPEAHEAD_CHARS) {
        closeSuggestions();
        return;
      }

      const matches = resortCatalog
        .filter((resort) => resort.searchText.includes(query))
        .slice(0, MAX_SUGGESTIONS);
      renderSuggestions(matches);
    }

    input.addEventListener("input", updateSuggestions);
    input.addEventListener("keydown", (event) => {
      const hasOpenList = suggestions.length > 0 && !list.hidden;
      if (event.key === "ArrowDown" && hasOpenList) {
        event.preventDefault();
        setActiveIndex((activeIndex + 1) % suggestions.length);
        return;
      }
      if (event.key === "ArrowUp" && hasOpenList) {
        event.preventDefault();
        setActiveIndex((activeIndex - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === "Enter" && hasOpenList && activeIndex >= 0) {
        event.preventDefault();
        applySelectedResort(input, suggestions[activeIndex]);
        closeSuggestions();
        return;
      }
      if (event.key === "Escape") {
        closeSuggestions();
      }
    });

    input.addEventListener("focus", () => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (normalizeText(input.value).length >= MIN_TYPEAHEAD_CHARS) {
        updateSuggestions();
      }
    });

    input.addEventListener("blur", () => {
      closeTimer = window.setTimeout(() => {
        const exact = findExactResortMatch(input.value);
        if (exact) {
          applySelectedResort(input, exact);
        }
        closeSuggestions();
      }, 100);
    });

    if (removeButton) {
      removeButton.onclick = () => removeOrResetRow(row, els.resortsWrap, createResortRow);
    }
  }

  function initializeExistingRows() {
    document.querySelectorAll(".rider-row").forEach((row) => wireRiderRow(row));
    document.querySelectorAll(".resort-row").forEach((row) => wireResortRow(row));
  }

  function resetForm() {
    els.ridersWrap.replaceChildren();
    els.resortsWrap.replaceChildren();
    els.ridersWrap.appendChild(createRiderRow());
    els.resortsWrap.appendChild(createResortRow());
    els.rawRequest.textContent = "{}";
    els.rawResponse.textContent = "{}";
    showError("");
    clearResults();
    setStatus("Form cleared.");
  }

  function buildRequest() {
    const errors = [];
    let totalRequestedDays = 0;

    const riderRows = Array.from(els.ridersWrap.querySelectorAll(".rider-row"));
    if (riderRows.length > MAX_RIDERS) {
      errors.push(`Maximum ${MAX_RIDERS} riders allowed.`);
    }

    const riders = riderRows.map((row, index) => {
      const ageInput = row.querySelector(".rider-age");
      const categorySelect = row.querySelector(".rider-category");
      const ageText = String(ageInput?.value || "").trim();
      const age = ageText === "" ? NaN : Number(ageText);
      if (!Number.isInteger(age) || age < 0 || age > MAX_AGE) {
        errors.push(`Rider ${index + 1}: age is required and must be between 0 and ${MAX_AGE}.`);
      }

      const category = canonicalizeCategory(categorySelect?.value) || null;
      if (category && !["military", "student", "medical"].includes(category)) {
        errors.push(`Rider ${index + 1}: category is invalid.`);
      }
      return {
        age: Number.isInteger(age) && age >= 0 && age <= MAX_AGE ? age : 0,
        category,
      };
    });

    if (!riders.length) {
      errors.push("Add at least one rider.");
    }

    const resortRows = Array.from(els.resortsWrap.querySelectorAll(".resort-row"));
    if (resortRows.length > MAX_RESORTS) {
      errors.push(`Maximum ${MAX_RESORTS} resort rows allowed.`);
    }

    const resorts = [];
    resortRows.forEach((row, index) => {
      const resortInput = row.querySelector(".resort-input");
      const daysInput = row.querySelector(".days-input");
      const rawName = cleanShortText(resortInput?.value || "", MAX_RESORT_INPUT_LENGTH);
      const daysValue = String(daysInput?.value || "").trim();

      const isBlank = !rawName && !daysValue;
      if (isBlank) {
        return;
      }

      if (!rawName) {
        errors.push(`Resort ${index + 1}: resort name is required.`);
      }
      if (String(resortInput?.value || "").trim().length > MAX_RESORT_INPUT_LENGTH) {
        errors.push(`Resort ${index + 1}: resort name is too long.`);
      }

      const days = Number(daysValue);
      if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS_PER_RESORT) {
        errors.push(`Resort ${index + 1}: days must be a whole number between 1 and ${MAX_DAYS_PER_RESORT}.`);
      }

      const exact = findExactResortMatch(rawName);
      if (exact && resortInput && !resortInput.dataset.resortId) {
        applySelectedResort(resortInput, exact);
      }

      const selectedById = resortById.get(resortInput?.dataset.resortId || "");
      const selectedResort = selectedById || exact || null;
      if (rawName && !selectedResort) {
        errors.push(`Resort ${index + 1}: choose a resort from the suggestions list.`);
      }

      if (selectedResort && Number.isInteger(days) && days >= 1 && days <= MAX_DAYS_PER_RESORT) {
        totalRequestedDays += days;
        resorts.push({
          id: selectedResort.id,
          name: selectedResort.name,
          days,
          no_weekends: Boolean(row.querySelector(".no-weekends")?.checked),
          no_blackouts: Boolean(row.querySelector(".no-blackouts")?.checked),
        });
      }
    });

    if (!resorts.length) {
      errors.push("Add at least one resort.");
    }
    if (totalRequestedDays > MAX_TOTAL_REQUESTED_DAYS) {
      errors.push(`Total requested days cannot exceed ${MAX_TOTAL_REQUESTED_DAYS}.`);
    }

    return {
      payload: {
        riders,
        resorts,
        mode: "auto",
      },
      errors,
    };
  }

  function getRiderIndex(passItem) {
    const parsed = Number(passItem?.rider_index);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  function appendPassRow(container, passItem) {
    const row = document.createElement("div");
    row.className = "pass-item";

    const left = document.createElement("span");
    left.className = "pass-name";
    const passName = passItem.name || passItem.pass_id || "Unknown pass";
    const passSearchText = `${passItem.name || ""} ${passItem.pass_id || ""}`;
    if (/\bikon\b/i.test(passSearchText)) {
      const logo = document.createElement("img");
      logo.className = "pass-brand-logo";
      logo.src = IKON_LOGO_SRC;
      logo.alt = "IKON";
      logo.loading = "lazy";
      left.appendChild(logo);
    }
    const label = document.createElement("span");
    label.textContent = passName;
    left.appendChild(label);

    const right = document.createElement("span");
    right.textContent = toCurrency(passItem.price || 0);

    row.appendChild(left);
    row.appendChild(right);
    container.appendChild(row);
  }

  function renderPassList(passes) {
    const wrapper = document.createElement("div");
    wrapper.className = "pass-list";

    const byRider = new Map();
    (Array.isArray(passes) ? passes : []).forEach((passItem) => {
      const riderIndex = getRiderIndex(passItem);
      if (!byRider.has(riderIndex)) {
        byRider.set(riderIndex, []);
      }
      byRider.get(riderIndex).push(passItem);
    });

    Array.from(byRider.keys())
      .sort((a, b) => a - b)
      .forEach((riderIndex) => {
        const riderItems = byRider.get(riderIndex) || [];
        const section = document.createElement("div");
        section.className = "pass-group pass-rider-subgroup";

        const heading = document.createElement("div");
        heading.className = "pass-rider-title";
        const first = riderItems[0] || {};
        const cat = first.rider_category ? ` (${first.rider_category})` : "";
        heading.textContent = `Rider ${riderIndex + 1}${cat}`;
        section.appendChild(heading);

        if (isDevMode) {
          const byFamily = new Map();
          riderItems.forEach((passItem) => {
            const family = getPassFamily(passItem);
            if (!byFamily.has(family)) {
              byFamily.set(family, []);
            }
            byFamily.get(family).push(passItem);
          });

          Array.from(byFamily.keys()).forEach((familyName) => {
            const familySection = document.createElement("div");
            familySection.className = "pass-family-section";

            const familyHeading = document.createElement("div");
            familyHeading.className = "pass-group-title pass-family-title";
            familyHeading.textContent = familyName;
            familySection.appendChild(familyHeading);

            (byFamily.get(familyName) || []).forEach((passItem) => {
              appendPassRow(familySection, passItem);
            });

            section.appendChild(familySection);
          });
        } else {
          riderItems.forEach((passItem) => appendPassRow(section, passItem));
        }

        wrapper.appendChild(section);
      });

    return wrapper;
  }

  function getPassFamily(passItem) {
    const explicit =
      passItem?.pass_family ??
      passItem?.pass_family_name ??
      passItem?.family ??
      passItem?.family_name ??
      passItem?.passFamily ??
      "";
    const explicitText = String(explicit || "").trim();
    if (explicitText) return explicitText;

    const raw = String(passItem?.name || passItem?.pass_id || "").trim();
    const lower = raw.toLowerCase();
    if (!raw) return "Other Passes";
    if (/\bikon\b/.test(lower)) return "Ikon Pass Family";
    if (/\bindy\b/.test(lower)) return "Indy Pass Family";
    if (/\bepic\b/.test(lower)) return "Epic Pass Family";
    if (/\bmountain collective\b/.test(lower)) return "Mountain Collective";
    if (/\bpowder alliance\b/.test(lower)) return "Powder Alliance";

    const cleaned = raw
      .replace(/\b(session|day|days)\b.*$/i, "")
      .replace(/\s+\d+\b.*$/, "")
      .trim();
    return cleaned || raw;
  }

  function renderUnmet(unmet) {
    const keys = Object.keys(unmet || {});
    if (!keys.length) return null;

    const container = document.createElement("div");
    container.className = "unmet";

    const reason = unmet.reason;
    if (reason) {
      const reasonEl = document.createElement("div");
      reasonEl.className = "muted";
      reasonEl.textContent = String(reason);
      container.appendChild(reasonEl);
    }

    const deficitKeys = keys.filter((key) => key !== "reason");
    if (!deficitKeys.length) return container;

    const list = document.createElement("ul");
    list.className = "unmet-list";
    deficitKeys.sort().forEach((key) => {
      const li = document.createElement("li");
      li.textContent = `${key}: ${unmet[key]} day(s) still uncovered`;
      list.appendChild(li);
    });
    container.appendChild(list);
    return container;
  }

  function renderResults(data) {
    clearResults();
    if (!data || !Array.isArray(data.results) || !data.results.length) {
      const empty = document.createElement("div");
      empty.className = "result-card";
      empty.textContent = "No results returned.";
      els.results.appendChild(empty);
      return;
    }

    data.results.forEach((result, index) => {
      const card = document.createElement("section");
      card.className = "result-card";

      const head = document.createElement("div");
      head.className = "result-head";

      const title = document.createElement("h3");
      title.className = "result-title";
      title.textContent = isDevMode
        ? `${String(result.strategy || "result").toUpperCase()} Recommendation`
        : "";

      const price = document.createElement("div");
      price.className = "result-price";
      price.textContent = toCurrency(result.price || 0);

      if (isDevMode) {
        head.appendChild(title);
      }
      head.appendChild(price);

      const summary = document.createElement("div");
      summary.className = "result-summary";
      const summaryParts = [`${result.pass_count || 0} pass(es)`];
      if (isDevMode && result.strategy) {
        summaryParts.push(`Strategy: ${String(result.strategy)}`);
      }
      summary.textContent = summaryParts.join(" • ");

      card.appendChild(head);
      card.appendChild(summary);
      card.appendChild(renderPassList(result.passes || []));

      const unmet = renderUnmet(result.unmet || {});
      if (unmet) {
        card.appendChild(unmet);
      }

      els.results.appendChild(card);
    });
  }

  async function submitRequest() {
    showError("");
    setStatus("");

    const { payload, errors } = buildRequest();
    els.rawRequest.textContent = JSON.stringify(payload, null, 2);

    if (errors.length) {
      showError(errors[0]);
      clearResults();
      setStatus("Validation failed.");
      return;
    }

    setBusy(true);
    setStatus("Submitting request...");

    let timeoutId = null;
    try {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_error) {
        data = { error: "Invalid JSON response", raw: text };
      }

      els.rawResponse.textContent = JSON.stringify(data, null, 2);

      if (!response.ok) {
        const detail = data?.detail || data?.error || `Request failed (${response.status})`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }

      renderResults(data);
      setStatus("Results updated.");
    } catch (error) {
      const message =
        error && typeof error === "object" && "name" in error && error.name === "AbortError"
          ? `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s`
          : error instanceof Error
            ? error.message
            : "Request failed";
      showError(message);
      if (!els.rawResponse.textContent || els.rawResponse.textContent === "{}") {
        els.rawResponse.textContent = JSON.stringify({ error: message }, null, 2);
      }
      clearResults();
      setStatus("Request failed.");
    } finally {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      setBusy(false);
    }
  }

  function bindEvents() {
    els.addRider?.addEventListener("click", () => {
      const count = els.ridersWrap.querySelectorAll(".rider-row").length;
      if (count >= MAX_RIDERS) {
        showError(`Maximum ${MAX_RIDERS} riders allowed.`);
        setStatus("Add rider blocked.");
        return;
      }
      showError("");
      els.ridersWrap.appendChild(createRiderRow());
    });

    els.addResort?.addEventListener("click", () => {
      const count = els.resortsWrap.querySelectorAll(".resort-row").length;
      if (count >= MAX_RESORTS) {
        showError(`Maximum ${MAX_RESORTS} resort rows allowed.`);
        setStatus("Add resort blocked.");
        return;
      }
      showError("");
      els.resortsWrap.appendChild(createResortRow());
    });

    els.clear?.addEventListener("click", resetForm);
    els.submit?.addEventListener("click", submitRequest);
  }

  initializeExistingRows();
  initializeModeUi();
  bindEvents();
  loadResorts();
})();
