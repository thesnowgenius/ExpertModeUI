(() => {
  const API_URL = window.API_URL || "https://pass-picker-expert-mode-multi.onrender.com/score_pass";
  const IKON_LOGO_SRC = "assets/ikon-pass-inc-logo-vector.svg";
  const MIN_TYPEAHEAD_CHARS = 3;
  const MAX_SUGGESTIONS = 10;
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
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
      els.results.innerHTML = "";
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
        const id = row.resort_id ?? row.id ?? row.ResortID ?? row.ResortId ?? row.slug ?? "";
        const name = row.resort_name ?? row.name ?? row.ResortName ?? row.title ?? "";
        const state = row.state ?? row.State ?? "";
        if (!id || !name) return null;
        const result = {
          id: String(id).trim(),
          name: String(name).trim(),
          state: String(state || "").trim(),
        };
        result.label = resortLabel(result);
        result.searchText = normalizeText(`${result.name} ${result.label} ${result.id}`);
        return result;
      })
      .filter(Boolean);
  }

  function loadResorts() {
    return fetch("resorts.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load resorts (${response.status})`);
        }
        return response.json();
      })
      .then((json) => {
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
      <input type="number" min="0" placeholder="Age" class="input rider-age" aria-label="Rider age" />
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
        <input type="text" class="input resort-input" placeholder="Start typing a resort…" autocomplete="off" aria-label="Resort" />
        <ul class="suggestions" role="listbox"></ul>
      </div>
      <input type="number" min="1" class="input days-input" placeholder="Days" aria-label="Days requested" />
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

    let suggestions = [];
    let activeIndex = -1;
    let closeTimer = null;

    function closeSuggestions() {
      list.innerHTML = "";
      list.style.display = "none";
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
      list.innerHTML = "";
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

      list.style.display = "block";
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
      const hasOpenList = suggestions.length > 0 && list.style.display !== "none";
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
    els.ridersWrap.innerHTML = "";
    els.resortsWrap.innerHTML = "";
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

    const riders = Array.from(els.ridersWrap.querySelectorAll(".rider-row")).map((row, index) => {
      const ageInput = row.querySelector(".rider-age");
      const categorySelect = row.querySelector(".rider-category");
      const ageText = String(ageInput?.value || "").trim();
      const age = ageText === "" ? NaN : Number(ageText);
      if (!Number.isInteger(age) || age < 0) {
        errors.push(`Rider ${index + 1}: age is required and must be 0 or greater.`);
      }
      return {
        age: Number.isInteger(age) && age >= 0 ? age : 0,
        category: canonicalizeCategory(categorySelect?.value) || null,
      };
    });

    if (!riders.length) {
      errors.push("Add at least one rider.");
    }

    const resorts = [];
    Array.from(els.resortsWrap.querySelectorAll(".resort-row")).forEach((row, index) => {
      const resortInput = row.querySelector(".resort-input");
      const daysInput = row.querySelector(".days-input");
      const rawName = String(resortInput?.value || "").trim();
      const daysValue = String(daysInput?.value || "").trim();

      const isBlank = !rawName && !daysValue;
      if (isBlank) {
        return;
      }

      if (!rawName) {
        errors.push(`Resort ${index + 1}: resort name is required.`);
      }

      const days = Number(daysValue);
      if (!Number.isInteger(days) || days < 1) {
        errors.push(`Resort ${index + 1}: days must be a whole number of 1 or greater.`);
      }

      const exact = findExactResortMatch(rawName);
      if (exact && resortInput && !resortInput.dataset.resortId) {
        applySelectedResort(resortInput, exact);
      }

      const selectedId = resortInput?.dataset.resortId || exact?.id || rawName;
      const selectedName = resortInput?.dataset.resortName || exact?.name || rawName;

      resorts.push({
        id: selectedId,
        name: selectedName,
        days: Number.isInteger(days) && days > 0 ? days : 0,
        no_weekends: Boolean(row.querySelector(".no-weekends")?.checked),
        no_blackouts: Boolean(row.querySelector(".no-blackouts")?.checked),
      });
    });

    if (!resorts.length) {
      errors.push("Add at least one resort.");
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

  function renderPassList(passes) {
    const wrapper = document.createElement("div");
    wrapper.className = "pass-list";

    const grouped = new Map();
    (Array.isArray(passes) ? passes : []).forEach((passItem) => {
      const riderIndex = Number.isInteger(passItem.rider_index) ? passItem.rider_index : 0;
      if (!grouped.has(riderIndex)) {
        grouped.set(riderIndex, []);
      }
      grouped.get(riderIndex).push(passItem);
    });

    Array.from(grouped.keys())
      .sort((a, b) => a - b)
      .forEach((riderIndex) => {
        const items = grouped.get(riderIndex) || [];
        const section = document.createElement("div");
        section.className = "pass-group";

        const heading = document.createElement("div");
        heading.className = "pass-group-title";
        const first = items[0] || {};
        const cat = first.rider_category ? ` (${first.rider_category})` : "";
        heading.textContent = `Rider ${riderIndex + 1}${cat}`;
        section.appendChild(heading);

        items.forEach((passItem) => {
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
          section.appendChild(row);
        });

        wrapper.appendChild(section);
      });

    return wrapper;
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
        : `Recommendation ${index + 1}`;

      const price = document.createElement("div");
      price.className = "result-price";
      price.textContent = toCurrency(result.price || 0);

      head.appendChild(title);
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

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const message = error instanceof Error ? error.message : "Request failed";
      showError(message);
      if (!els.rawResponse.textContent || els.rawResponse.textContent === "{}") {
        els.rawResponse.textContent = JSON.stringify({ error: message }, null, 2);
      }
      clearResults();
      setStatus("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  function bindEvents() {
    els.addRider?.addEventListener("click", () => {
      els.ridersWrap.appendChild(createRiderRow());
    });

    els.addResort?.addEventListener("click", () => {
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
