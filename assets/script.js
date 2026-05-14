(() => {
  const DEFAULT_API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_pass";
  const ALLOWED_REMOTE_API_HOSTS = new Set(["pass-picker-expert-mode-multi.onrender.com"]);
  const PASS_FAMILY_ICON_CONFIG = [
    { key: "alta_bird", alt: "Alta-Bird Pass", src: "assets/pass-family-icons/alta_bird.svg", aliases: ["alta bird pass"] },
    { key: "aspen_snowmass", alt: "Aspen Snowmass", src: "assets/pass-family-icons/aspen_snowmass.svg", aliases: ["aspen snowmass"] },
    { key: "berkshire_summit", alt: "Berkshire Summit", src: "assets/pass-family-icons/berkshire_summit.svg", aliases: ["berkshire summit"] },
    { key: "cali_pass", alt: "Cali Pass", src: "assets/pass-family-icons/cali_pass_logo.png", aliases: ["cali pass"] },
    {
      key: "combo_49n_silver",
      alt: "49 North + Silver Mountain",
      src: "assets/pass-family-icons/combo_49n_silver.svg",
      aliases: ["49 north + silver mountain", "49 north silver mountain", "combo 49n silver"],
    },
    { key: "epic", alt: "Epic Pass", src: "assets/epic-pass-logo.svg", aliases: ["epic pass"] },
    { key: "ikon", alt: "Ikon Pass", src: "assets/ikon-pass-inc-logo-vector.svg", aliases: ["ikon pass"] },
    { key: "indy", alt: "Indy Pass", src: "assets/indy-pass-logo.svg", aliases: ["indy pass"] },
    {
      key: "labrador_song",
      alt: "Labrador / Song Pass",
      src: "assets/pass-family-icons/labrador_song.svg",
      aliases: ["labrador song pass", "labrador song individual pass", "labrador_song_individual_pass"],
    },
    { key: "legendary_pass", alt: "Legendary Pass", src: "assets/pass-family-icons/legendary_pass.svg", aliases: ["legendary pass"] },
    { key: "michigan_pass", alt: "Michigan Pass", src: "assets/pass-family-icons/michigan_pass.svg", aliases: ["michigan pass"] },
    {
      key: "michigan_white_gold",
      alt: "Michigan White Gold",
      src: "assets/pass-family-icons/michigan_white_gold.svg",
      aliases: ["michigan white gold pass"],
    },
    {
      key: "mountain_collective",
      alt: "Mountain Collective",
      src: "assets/mountain-collective-logo.svg",
      aliases: ["mountain collective", "mountain collective pass"],
    },
    { key: "mt_hood_fusion", alt: "Mt. Hood Fusion Pass", src: "assets/pass-family-icons/mt_hood_fusion.svg", aliases: ["mt hood fusion", "mt hood fusion pass"] },
    { key: "new_england_pass", alt: "New England Pass", src: "assets/pass-family-icons/new_england_pass.svg", aliases: ["new england pass"] },
    { key: "no_boundaries", alt: "No Boundaries Pass", src: "assets/pass-family-icons/no_boundaries.svg", aliases: ["no boundaries pass"] },
    { key: "ny_ski3", alt: "NY Ski3 Pass", src: "assets/pass-family-icons/ny_ski3.svg", aliases: ["ny ski3 pass", "ski3"] },
    {
      key: "peak_to_peak_pocono",
      alt: "Peak-to-Peak Poconos",
      src: "assets/pass-family-icons/peak_to_peak_pocono.svg",
      aliases: ["peak to peak poconos", "peak-to-peak poconos"],
    },
    { key: "perfect_season", alt: "Perfect Season Pass", src: "assets/pass-family-icons/perfect_season.svg", aliases: ["perfect season pass"] },
    { key: "power_pass", alt: "Power Pass", src: "assets/pass-family-icons/power_pass_logo.png", aliases: ["power pass"] },
    {
      key: "ski_brule_bohemia",
      alt: "Ski Brule / Bohemia Pass",
      src: "assets/pass-family-icons/ski_brule_bohemia.svg",
      aliases: ["ski brule bohemia pass", "ski brule / bohemia pass"],
    },
    { key: "ski_vermont_4", alt: "Ski Vermont 4 Pass", src: "assets/pass-family-icons/ski_vermont_4.svg", aliases: ["ski vermont 4 pass"] },
    {
      key: "skiing_wisconsin_pass",
      alt: "Skiing Wisconsin Pass",
      src: "assets/pass-family-icons/skiwisconsin_logo.png",
      aliases: ["skiing wisconsin pass", "skiing wisconsin passport", "skiing_wisconsin_passport"],
    },
    {
      key: "uphill_new_england",
      alt: "Uphill New England Pass",
      src: "assets/pass-family-icons/uphill_new_england.svg",
      aliases: ["uphill new england"],
    },
    {
      key: "white_mountain_sup",
      alt: "White Mountain Super Pass",
      src: "assets/pass-family-icons/white_mountain_sup.svg",
      aliases: ["white mountain super pass", "white mountain super", "white_mountain_super"],
    },
    {
      key: "wisconsin_multi_resort",
      alt: "Wisconsin Multi Resort",
      src: "assets/pass-family-icons/skiwisconsin_logo.png",
      aliases: ["wisconsin multi resort", "wisconsin resorts multi pass"],
    },
    { key: "wnep_ski_card", alt: "WNEP Ski Card", src: "assets/pass-family-icons/wnep_ski_card.svg", aliases: ["wnep ski card"] },
  ];
  const MULTI_MOUNTAIN_PASS_FAMILIES = new Set([
    "combo_49n_silver",
    "epic",
    "ikon",
    "indy",
    "mountain_collective",
    "mt_hood_fusion",
    "new_england_pass",
    "ny_ski3",
    "peak_to_peak_pocono",
    "power_pass",
    "ski_vermont_4",
    "skiing_wisconsin_pass",
    "uphill_new_england",
    "wisconsin_multi_resort",
  ]);
  const PASS_PROVIDER_ICON_CONFIG = [
    { key: "stratton", alt: "Stratton", src: "assets/pass-family-icons/stratton_logo.jpg", aliases: ["stratton mountain"] },
  ];
  const PASS_FAMILY_ICON_BY_KEY = (() => {
    const map = new Map();
    PASS_FAMILY_ICON_CONFIG.forEach((icon) => {
      map.set(icon.key, icon);
      (icon.aliases || []).forEach((alias) => {
        map.set(normalizePassFamilyKey(alias), icon);
      });
    });
    return map;
  })();
  const PASS_PROVIDER_ICON_BY_KEY = (() => {
    const map = new Map();
    PASS_PROVIDER_ICON_CONFIG.forEach((icon) => {
      map.set(icon.key, icon);
      (icon.aliases || []).forEach((alias) => {
        map.set(normalizePassFamilyKey(alias), icon);
      });
    });
    return map;
  })();
  const PASS_BRAND_LOGOS = [
    { key: "IKON", src: "assets/ikon-pass-inc-logo-vector.svg", match: /\bikon\b/i },
    { key: "Epic", src: "assets/epic-pass-logo.svg", match: /\bepic\b/i },
    { key: "Mountain Collective", src: "assets/mountain-collective-logo.svg", match: /\bmountain\s+collective\b/i },
    { key: "Indy", src: "assets/indy-pass-logo.svg", match: /\bindy\b/i },
  ];
  const GENERATED_PASS_FAMILY_BADGES = new Map();
  const MIN_TYPEAHEAD_CHARS = 1;
  const MAX_SUGGESTIONS = 100;
  const REQUEST_TIMEOUT_MS = 20000;
  const MAX_RIDERS = 12;
  const MAX_RESORTS = 20;
  const MAX_AGE = 120;
  const MAX_DAYS_PER_RESORT = 60;
  const MAX_TOTAL_REQUESTED_DAYS = 365;
  const MAX_RESORT_INPUT_LENGTH = 120;
  const MAX_RESORT_ID_LENGTH = 80;
  const MAX_RESORT_CATALOG_ROWS = 20000;
  const MAX_SHARE_STATE_LENGTH = 12000;
  const SHARE_STATE_PARAM = "sg";
  const SHARE_AUTO_RUN_PARAM = "run";
  const SHARE_STATE_VERSION = 1;
  const SHARE_COPY_FEEDBACK_MS = 2200;
  const TOP_COMPARISON_LIMIT = 3;
  const VALID_RIDER_CATEGORIES = new Set(["military", "student", "first_responder", "medical"]);
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
    share: document.querySelector("#share"),
    submit: document.querySelector("#submit"),
    rawRequest: document.querySelector("#raw-request"),
    rawResponse: document.querySelector("#raw-response"),
    results: document.querySelector("#results"),
    formNotice: document.querySelector("#form-notice"),
    formError: document.querySelector("#form-error"),
    formStatus: document.querySelector("#form-status"),
  };

  let lastPostedHeight = 0;
  let postHeightRafId = 0;
  let resortCatalog = [];
  let resortById = new Map();
  let resortByNormalizedName = new Map();
  let typeaheadCounter = 0;
  let sharedItineraryHandled = false;
  let lastSubmittedPayload = null;
  let shareFeedbackTimeoutId = 0;

  function postHeight() {
    const body = document.body;
    const root = document.documentElement;
    const height = Math.max(
      body ? body.scrollHeight : 0,
      root ? root.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      root ? root.offsetHeight : 0
    );

    if (!Number.isFinite(height) || height <= 0) {
      return;
    }

    if (height === lastPostedHeight) {
      return;
    }

    lastPostedHeight = height;
    window.parent.postMessage({ type: "setHeight", height }, "*");
  }

  function queueHeightPost() {
    if (postHeightRafId) {
      return;
    }

    postHeightRafId = window.requestAnimationFrame(() => {
      postHeightRafId = 0;
      postHeight();
    });
  }

  function scrollToResults() {
    if (!els.results) return;
    const reduceMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const targetTop = Math.max(0, window.scrollY + els.results.getBoundingClientRect().top - 18);
    window.scrollTo({
      top: targetTop,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function scrollToPlanner() {
    if (!els.appMain) return;
    const reduceMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const targetTop = Math.max(0, window.scrollY + els.appMain.getBoundingClientRect().top - 18);
    window.scrollTo({
      top: targetTop,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function revealResults() {
    if (!els.results) return;
    els.results.classList.remove("results-visible");
    window.requestAnimationFrame(() => {
      els.results.classList.add("results-visible");
      queueHeightPost();
    });
  }

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

  function normalizePassFamilyKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/\+/g, " plus ")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_");
  }

  function toBadgeLabel(value) {
    const parts = String(value || "").toUpperCase().match(/[A-Z0-9]+/g) || [];
    const trimmed = parts.filter((part) => !["PASS", "FAMILY", "CARD", "THE"].includes(part));
    const source = trimmed.length ? trimmed : parts;
    if (!source.length) return "PASS";
    if (source.length === 1) {
      return source[0].slice(0, 4) || "PASS";
    }
    const compact = source.map((part) => part[0]).join("");
    return (compact || source.join("")).slice(0, 4);
  }

  function getGeneratedPassFamilyBadge(familyName) {
    const normalized = normalizePassFamilyKey(familyName);
    if (!normalized) return null;
    if (GENERATED_PASS_FAMILY_BADGES.has(normalized)) {
      return GENERATED_PASS_FAMILY_BADGES.get(normalized);
    }
    const hue = Array.from(normalized).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;
    const label = toBadgeLabel(familyName);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="28" viewBox="0 0 72 28"><rect x="1" y="1" width="70" height="26" rx="5" fill="hsl(${hue} 58% 36%)" stroke="rgba(255,255,255,0.35)"/><text x="36" y="18" text-anchor="middle" font-size="12" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#fff">${label}</text></svg>`;
    const badge = {
      key: normalized,
      alt: String(familyName || "Pass family").trim() || "Pass family",
      src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    };
    GENERATED_PASS_FAMILY_BADGES.set(normalized, badge);
    return badge;
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

  function startsWithQuery(value, query) {
    return normalizeText(value).startsWith(query);
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
    queueHeightPost();
  }

  function showError(message) {
    if (!els.formError) return;
    if (!message) {
      els.formError.hidden = true;
      els.formError.textContent = "";
      queueHeightPost();
      return;
    }
    els.formError.hidden = false;
    els.formError.textContent = message;
    queueHeightPost();
  }

  function showNotice(message) {
    if (!els.formNotice) return;
    if (!message) {
      els.formNotice.hidden = true;
      els.formNotice.textContent = "";
      queueHeightPost();
      return;
    }
    els.formNotice.hidden = false;
    els.formNotice.textContent = message;
    queueHeightPost();
  }

  function resetShareButtonFeedback() {
    if (shareFeedbackTimeoutId) {
      window.clearTimeout(shareFeedbackTimeoutId);
      shareFeedbackTimeoutId = 0;
    }
    if (!els.share) return;
    els.share.classList.remove("copy-confirmed");
    els.share.textContent = "Share Link";
  }

  function showShareCopiedFeedback() {
    showNotice("Share link copied to clipboard.");
    setStatus("Share link copied.");
    if (!els.share) return;
    els.share.classList.add("copy-confirmed");
    els.share.textContent = "Copied!";
    shareFeedbackTimeoutId = window.setTimeout(() => {
      resetShareButtonFeedback();
    }, SHARE_COPY_FEEDBACK_MS);
  }

  function initializeModeUi() {
    document.body.classList.toggle("dev-mode", isDevMode);
    if (els.hero) els.hero.hidden = false;
    if (els.appMain) els.appMain.hidden = false;
    if (els.footer) els.footer.hidden = false;
    if (els.devShell) els.devShell.hidden = !isDevMode;
    queueHeightPost();
  }

  function clearResults() {
    if (els.results) {
      els.results.replaceChildren();
      els.results.classList.remove("results-visible");
    }
    queueHeightPost();
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
    if (
      raw.includes("first responder") ||
      raw.includes("responder") ||
      raw.includes("emt") ||
      raw.includes("paramedic") ||
      raw.includes("police") ||
      raw.includes("firefighter")
    ) return "first_responder";
    if (raw.includes("nurse") || raw.includes("doctor") || raw.includes("doc") || raw.includes("medical")) return "medical";
    return raw;
  }

  function formatCategoryLabel(value) {
    const category = canonicalizeCategory(value);
    if (category === "military") return "Military";
    if (category === "student") return "Student";
    if (category === "first_responder") return "First Responder";
    if (category === "medical") return "Medical";
    return cleanShortText(value || "", 40);
  }

  function hasPublicAccess(row) {
    const rawPublicAccess = row?.public_access ?? row?.publicAccess ?? row?.PublicAccess ?? "";
    return normalizeText(rawPublicAccess) === "yes";
  }

  function parseResortRows(list) {
    return (Array.isArray(list) ? list : [])
      .filter((row) => hasPublicAccess(row))
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
        <option value="first_responder">First Responder</option>
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

    function updateSuggestions({ forceBrowse = false } = {}) {
      const rawValue = input.value.trim();
      const query = normalizeText(rawValue);
      if (rawValue !== (input.dataset.selectedLabel || "")) {
        clearSelectedResort(input);
      }

      if (!resortCatalog.length) {
        closeSuggestions();
        return;
      }

      if (!forceBrowse && query.length > 0 && query.length < MIN_TYPEAHEAD_CHARS) {
        closeSuggestions();
        return;
      }

      const matches = (query.length >= MIN_TYPEAHEAD_CHARS)
        ? resortCatalog
          .filter((resort) =>
            startsWithQuery(resort.name, query) ||
            startsWithQuery(resort.label, query) ||
            startsWithQuery(resort.id, query)
          )
          .slice(0, MAX_SUGGESTIONS)
        : resortCatalog.slice(0, MAX_SUGGESTIONS);
      renderSuggestions(matches);
    }

    input.addEventListener("input", () => updateSuggestions());
    input.addEventListener("click", () => {
      updateSuggestions({ forceBrowse: true });
    });
    input.addEventListener("keydown", (event) => {
      const hasOpenList = suggestions.length > 0 && !list.hidden;
      if (event.key === "ArrowDown" && !hasOpenList) {
        event.preventDefault();
        updateSuggestions({ forceBrowse: true });
        return;
      }
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
      updateSuggestions({ forceBrowse: true });
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
    resetShareButtonFeedback();
    els.ridersWrap.replaceChildren();
    els.resortsWrap.replaceChildren();
    els.ridersWrap.appendChild(createRiderRow());
    els.resortsWrap.appendChild(createResortRow());
    els.rawRequest.textContent = "{}";
    els.rawResponse.textContent = "{}";
    showNotice("");
    showError("");
    clearResults();
    clearShareParamsFromUrl();
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
      if (category && !VALID_RIDER_CATEGORIES.has(category)) {
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

  function setRiderCategory(select, value) {
    if (!select) return;
    const category = canonicalizeCategory(value);
    select.value = category && VALID_RIDER_CATEGORIES.has(category) ? category : "";
  }

  function validIntegerValue(value, min, max) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? String(number) : "";
  }

  function collectShareState() {
    const riders = Array.from(els.ridersWrap.querySelectorAll(".rider-row"))
      .slice(0, MAX_RIDERS)
      .map((row) => {
        const age = validIntegerValue(row.querySelector(".rider-age")?.value, 0, MAX_AGE);
        const category = canonicalizeCategory(row.querySelector(".rider-category")?.value) || "";
        return {
          age,
          category: VALID_RIDER_CATEGORIES.has(category) ? category : "",
        };
      })
      .filter((rider) => rider.age || rider.category);

    const resorts = Array.from(els.resortsWrap.querySelectorAll(".resort-row"))
      .slice(0, MAX_RESORTS)
      .map((row) => {
        const input = row.querySelector(".resort-input");
        const exact = findExactResortMatch(input?.value || "");
        const selected = resortById.get(input?.dataset.resortId || "") || exact || null;
        const label = selected?.label || cleanShortText(input?.value || "", MAX_RESORT_INPUT_LENGTH);
        const days = validIntegerValue(row.querySelector(".days-input")?.value, 1, MAX_DAYS_PER_RESORT);
        return {
          id: selected?.id || cleanShortText(input?.dataset.resortId || "", MAX_RESORT_ID_LENGTH),
          name: selected?.name || cleanShortText(input?.dataset.resortName || label, MAX_RESORT_INPUT_LENGTH),
          label,
          days,
          no_weekends: Boolean(row.querySelector(".no-weekends")?.checked),
          no_blackouts: Boolean(row.querySelector(".no-blackouts")?.checked),
        };
      })
      .filter((resort) =>
        resort.id ||
        resort.name ||
        resort.label ||
        resort.days ||
        resort.no_weekends ||
        resort.no_blackouts
      );

    return {
      version: SHARE_STATE_VERSION,
      riders,
      resorts,
    };
  }

  function encodeShareState(state) {
    const json = JSON.stringify(state);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  }

  function decodeShareState(value) {
    const raw = String(value || "");
    if (!raw || raw.length > MAX_SHARE_STATE_LENGTH) {
      throw new Error("Shared itinerary is missing or too large.");
    }
    const padded = raw.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(raw.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function sharedStateFromUrl() {
    const params = new URLSearchParams(window.location.search || "");
    const encoded = params.get(SHARE_STATE_PARAM);
    if (!encoded) return null;
    const runMode = String(params.get(SHARE_AUTO_RUN_PARAM) || "").toLowerCase();
    return {
      state: decodeShareState(encoded),
      autoRun: runMode !== "0" && runMode !== "false",
    };
  }

  function shareUrl() {
    const { errors } = buildRequest();
    if (errors.length) {
      throw new Error(errors[0]);
    }
    const url = new URL(window.location.href);
    url.searchParams.set(SHARE_STATE_PARAM, encodeShareState(collectShareState()));
    url.searchParams.set(SHARE_AUTO_RUN_PARAM, "1");
    url.hash = "";
    return url.toString();
  }

  function clearShareParamsFromUrl() {
    try {
      const url = new URL(window.location.href);
      const hadShareParams = url.searchParams.has(SHARE_STATE_PARAM) || url.searchParams.has(SHARE_AUTO_RUN_PARAM);
      if (!hadShareParams || !window.history?.replaceState) return;
      url.searchParams.delete(SHARE_STATE_PARAM);
      url.searchParams.delete(SHARE_AUTO_RUN_PARAM);
      window.history.replaceState({}, "", url.toString());
    } catch (_error) {
      // URL state cleanup is best-effort only.
    }
  }

  function applyShareState(state, options = {}) {
    if (!state || typeof state !== "object") {
      throw new Error("Shared itinerary format is invalid.");
    }
    const shouldAutoRun = Boolean(options.autoRun);

    const riders = Array.isArray(state.riders) ? state.riders.slice(0, MAX_RIDERS) : [];
    const resorts = Array.isArray(state.resorts) ? state.resorts.slice(0, MAX_RESORTS) : [];

    els.ridersWrap.replaceChildren();
    (riders.length ? riders : [{}]).forEach((rider) => {
      const row = createRiderRow();
      row.querySelector(".rider-age").value = validIntegerValue(rider?.age, 0, MAX_AGE);
      setRiderCategory(row.querySelector(".rider-category"), rider?.category);
      els.ridersWrap.appendChild(row);
    });

    els.resortsWrap.replaceChildren();
    (resorts.length ? resorts : [{}]).forEach((item) => {
      const row = createResortRow();
      const input = row.querySelector(".resort-input");
      const days = row.querySelector(".days-input");
      const id = cleanShortText(item?.id || "", MAX_RESORT_ID_LENGTH);
      const resort =
        resortById.get(id) ||
        findExactResortMatch(item?.label || "") ||
        findExactResortMatch(item?.name || "");
      if (resort) {
        applySelectedResort(input, resort);
      } else if (input) {
        input.value = cleanShortText(item?.label || item?.name || id, MAX_RESORT_INPUT_LENGTH);
        clearSelectedResort(input);
      }
      if (days) {
        days.value = validIntegerValue(item?.days, 1, MAX_DAYS_PER_RESORT);
      }
      const noWeekends = row.querySelector(".no-weekends");
      const noBlackouts = row.querySelector(".no-blackouts");
      if (noWeekends) noWeekends.checked = Boolean(item?.no_weekends);
      if (noBlackouts) noBlackouts.checked = Boolean(item?.no_blackouts);
      els.resortsWrap.appendChild(row);
    });

    els.rawRequest.textContent = "{}";
    els.rawResponse.textContent = "{}";
    showError("");
    showNotice(
      shouldAutoRun
        ? "Shared itinerary loaded. Running recommendations now..."
        : "Shared itinerary loaded. Review the trip and press Submit to see recommendations."
    );
    clearResults();
    setStatus("Shared itinerary loaded.");
    queueHeightPost();
  }

  async function copyShareLink() {
    resetShareButtonFeedback();
    showNotice("");
    showError("");
    let url;
    try {
      url = shareUrl();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to build share link.");
      setStatus("Share link needs a valid itinerary.");
      return;
    }

    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch (_error) {
        copied = false;
      }
    }

    if (!copied) {
      copied = copyTextWithSelection(url);
    }

    if (!copied) {
      showShareLinkFallback(url);
      setStatus("Share link ready. Select and copy it from the field.");
      return;
    }

    showShareCopiedFeedback();
  }

  function copyTextWithSelection(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_error) {
      copied = false;
    } finally {
      textarea.remove();
    }

    return copied;
  }

  function showShareLinkFallback(url) {
    if (!els.formError) return;
    els.formError.hidden = false;
    els.formError.replaceChildren();

    const message = document.createElement("div");
    message.textContent = "Copy blocked by this page's permissions policy. Select the link below to copy it manually.";

    const input = document.createElement("input");
    input.className = "input share-link-fallback";
    input.type = "text";
    input.value = url;
    input.setAttribute("readonly", "");
    input.setAttribute("aria-label", "Share link");
    input.addEventListener("focus", () => input.select());
    input.addEventListener("click", () => input.select());

    els.formError.appendChild(message);
    els.formError.appendChild(input);
    window.requestAnimationFrame(() => {
      input.focus();
      input.select();
      queueHeightPost();
    });
  }

  function initializeSharedItinerary() {
    if (sharedItineraryHandled) return;
    sharedItineraryHandled = true;

    let shared = null;
    try {
      shared = sharedStateFromUrl();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to read shared itinerary.");
      setStatus("Shared itinerary failed to load.");
      return;
    }

    if (!shared) return;

    try {
      applyShareState(shared.state, { autoRun: shared.autoRun });
      window.requestAnimationFrame(scrollToPlanner);
      if (shared.autoRun) {
        submitRequest({ fromSharedLink: true }).catch((error) => {
          showError(error instanceof Error ? error.message : "Shared itinerary failed to run.");
          setStatus("Shared itinerary failed to run.");
        });
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "Unable to apply shared itinerary.");
      setStatus("Shared itinerary failed to load.");
    }
  }

  function getRiderIndex(passItem) {
    const parsed = Number(passItem?.rider_index);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  function getPassItemUrl(passItem) {
    const raw =
      passItem?.url ??
      passItem?.pass_url ??
      passItem?.purchase_url ??
      passItem?.buy_url ??
      passItem?.product_url ??
      passItem?.link ??
      "";
    const text = String(raw || "").trim();
    if (!text) return "";
    try {
      const parsed = new URL(text);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.toString();
      }
    } catch (_error) {
      return "";
    }
    return "";
  }

  function resolvePassFamilyIcon(passItem, passSearchText) {
    function findFamilyIconByCandidate(candidate) {
      const normalized = normalizePassFamilyKey(candidate);
      if (!normalized) return null;

      const exact = PASS_FAMILY_ICON_BY_KEY.get(normalized);
      if (exact) return exact;

      // Handle variant ids/names like "labrador_song_individual_pass" from API results.
      for (const [key, icon] of PASS_FAMILY_ICON_BY_KEY.entries()) {
        if (normalized.startsWith(`${key}_`) || key.startsWith(`${normalized}_`)) {
          return icon;
        }
      }
      return null;
    }

    const familyCandidates = [
      passItem?.pass_family,
      passItem?.pass_family_name,
      passItem?.family,
      passItem?.family_name,
      passItem?.passFamily,
      getPassFamily(passItem),
    ];

    let familyIcon = null;
    let familyKey = "";
    for (const candidate of familyCandidates) {
      const icon = findFamilyIconByCandidate(candidate);
      if (icon) {
        const normalized = normalizePassFamilyKey(candidate);
        familyIcon = icon;
        familyKey = icon.key || normalized;
        break;
      }
    }

    if (familyIcon && MULTI_MOUNTAIN_PASS_FAMILIES.has(familyKey)) {
      return familyIcon;
    }

    const providerCandidates = [
      passItem?.provider,
      passItem?.provider_name,
      passItem?.pass_provider,
      passItem?.mountain,
      passItem?.mountain_name,
      passItem?.resort,
      passItem?.resort_name,
      passItem?.operator,
      passItem?.brand,
    ];
    for (const candidate of providerCandidates) {
      const normalized = normalizePassFamilyKey(candidate);
      if (!normalized) continue;
      const icon = PASS_PROVIDER_ICON_BY_KEY.get(normalized);
      if (icon) return icon;
    }

    if (familyIcon) return familyIcon;

    const brandMatch = PASS_BRAND_LOGOS.find((brand) => brand.match.test(passSearchText));
    if (brandMatch) {
      return { key: brandMatch.key, alt: brandMatch.key, src: brandMatch.src };
    }

    const fallbackFamily = familyCandidates.find((candidate) => String(candidate || "").trim()) || passSearchText;
    return getGeneratedPassFamilyBadge(fallbackFamily);
  }

  function appendPassBrandLogo(container, passItem, passSearchText) {
    const icon = resolvePassFamilyIcon(passItem, passSearchText);
    if (!icon) return;
    const logo = document.createElement("img");
    logo.className = "pass-brand-logo";
    logo.src = icon.src;
    logo.alt = icon.alt || icon.key || "Pass family";
    logo.loading = "lazy";
    logo.onerror = () => {
      const fallback = getGeneratedPassFamilyBadge(getPassFamily(passItem) || passSearchText);
      if (!fallback) {
        logo.remove();
        return;
      }
      if (logo.src !== fallback.src) {
        logo.src = fallback.src;
        logo.alt = fallback.alt || logo.alt;
        logo.onerror = null;
      } else {
        logo.remove();
      }
    };
    container.appendChild(logo);
  }

  function appendPassRow(container, passItem) {
    const row = document.createElement("div");
    row.className = "pass-item";

    const left = document.createElement("span");
    left.className = "pass-name";
    const passName = passItem.name || passItem.pass_id || "Unknown pass";
    const passSearchText = `${passItem.name || ""} ${passItem.pass_id || ""}`;
    appendPassBrandLogo(left, passItem, passSearchText);
    const label = document.createElement("span");
    const passUrl = getPassItemUrl(passItem);
    if (passUrl) {
      const link = document.createElement("a");
      link.href = passUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "pass-name-link";
      link.textContent = passName;
      label.appendChild(link);
    } else {
      label.textContent = passName;
    }
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
        const cat = first.rider_category ? ` (${formatCategoryLabel(first.rider_category)})` : "";
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

  function getResultPasses(result) {
    return Array.isArray(result?.passes) ? result.passes : [];
  }

  function getResultPrice(result) {
    return Number(result?.price ?? result?.total_cost ?? 0);
  }

  function getResultPassCount(result) {
    const count = Number(result?.pass_count);
    if (Number.isInteger(count) && count >= 0) return count;
    return getResultPasses(result).length;
  }

  function getResultUnmet(result) {
    return result?.unmet && typeof result.unmet === "object" ? result.unmet : {};
  }

  function normalizeResultOptions(data) {
    const legacyResults = Array.isArray(data?.results) ? data.results : [];
    if (legacyResults.length) {
      return legacyResults.map((result, index) => ({
        ...result,
        __rank: index + 1,
        __source: "legacy",
      }));
    }

    const rankedPasses = Array.isArray(data?.ranked_passes) ? data.ranked_passes : [];
    return rankedPasses.slice(0, TOP_COMPARISON_LIMIT).map((item, index) => ({
      strategy: item.rank ? `rank ${item.rank}` : `rank ${index + 1}`,
      pass_count: 1,
      price: item.total_cost,
      passes: [
        {
          pass_id: item.pass_id,
          name: item.pass_name,
          url: item.url,
          price: item.total_cost,
          total_days: item.total_days_covered,
        },
      ],
      unmet: {},
      explanation: item.explanation,
      total_score: item.total_score,
      cost_per_weighted_day: item.cost_per_weighted_day,
      total_weighted_pass_days: item.total_weighted_pass_days,
      __rank: item.rank || index + 1,
      __source: "ranked_passes",
    }));
  }

  function resultTitle(result, index, totalCount) {
    if (result?.__source === "ranked_passes") {
      return `#${result.__rank || index + 1} Recommendation`;
    }
    const strategy = String(result?.strategy || "").trim();
    if (strategy) {
      return `${strategy.toUpperCase()} Recommendation`;
    }
    return totalCount > 1 ? `Option ${index + 1}` : "Recommendation";
  }

  function coverageLabel(result) {
    return Object.keys(getResultUnmet(result)).length ? "Closest coverage" : "Exact coverage";
  }

  function appendTextList(container, items) {
    const list = document.createElement("ul");
    list.className = "why-list";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    container.appendChild(list);
  }

  function uniqueReasons(reasons) {
    const seen = new Set();
    return reasons
      .map((reason) => cleanShortText(reason, 240))
      .filter(Boolean)
      .filter((reason) => {
        const key = normalizeText(reason);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 7);
  }

  function requestedDayCount(payload) {
    const resorts = Array.isArray(payload?.resorts) ? payload.resorts : [];
    return resorts.reduce((sum, resort) => sum + (Number(resort.days) || 0), 0);
  }

  function constrainedResortCount(payload) {
    const resorts = Array.isArray(payload?.resorts) ? payload.resorts : [];
    return resorts.filter((resort) => resort.no_weekends || resort.no_blackouts).length;
  }

  function pricingDetailsForResult(result) {
    const details = [];
    getResultPasses(result).forEach((passItem) => {
      const labels = [];
      if (passItem.price_variant) labels.push(passItem.price_variant);
      if (passItem.price_category) labels.push(formatCategoryLabel(passItem.price_category));
      if (Array.isArray(passItem.price_categories) && passItem.price_categories.length) {
        const categoryLabels = passItem.price_categories.map(formatCategoryLabel).filter(Boolean);
        if (categoryLabels.length) labels.push(categoryLabels.join(", "));
      }
      if (labels.length) {
        details.push(`${passItem.name || passItem.pass_id || "Pass"} used ${labels.join(" / ")} pricing.`);
      }
    });
    return details;
  }

  function buildRecommendationReasons(result, index, allResults, payload) {
    const reasons = [];
    const nativeExplanation = result?.explanation || {};
    const nativeReasons =
      index === 0 && Array.isArray(nativeExplanation.why_this_pass_won) && nativeExplanation.why_this_pass_won.length
        ? nativeExplanation.why_this_pass_won
        : nativeExplanation.why_this_pass_ranked;

    if (nativeExplanation.summary) {
      reasons.push(nativeExplanation.summary);
    }
    if (Array.isArray(nativeReasons)) {
      reasons.push(...nativeReasons);
    }

    const requestedDays = requestedDayCount(payload);
    const riderCount = Array.isArray(payload?.riders) ? payload.riders.length : 0;
    const passCount = getResultPassCount(result);
    const strategy = String(result?.strategy || "").trim().toLowerCase();
    const price = getResultPrice(result);
    const unmet = getResultUnmet(result);
    const passNames = getResultPasses(result)
      .slice(0, 3)
      .map((passItem) => passItem.name || passItem.pass_id)
      .filter(Boolean);

    if (!Object.keys(unmet).length) {
      reasons.push(`Covers ${requestedDays || "the requested"} day(s) across the selected resort plan.`);
    } else if (unmet.reason) {
      reasons.push(String(unmet.reason));
    } else {
      reasons.push("This is the closest returned option, with some requested days still uncovered.");
    }

    if (strategy === "single") {
      reasons.push("A single-pass strategy satisfied the itinerary, keeping the pass count low.");
    } else if (strategy === "multi") {
      reasons.push("A multi-pass combination was selected because it covered the itinerary at a lower total cost or broader coverage.");
    } else if (strategy === "closest") {
      reasons.push("Exact coverage was not available within the pass-combo limit, so the solver returned the best partial coverage.");
    }

    if (riderCount) {
      reasons.push(`Matched pricing for ${riderCount} rider(s).`);
    }
    if (passCount) {
      reasons.push(`Uses ${passCount} pass(es) for ${toCurrency(price)} total.`);
    }
    if (constrainedResortCount(payload)) {
      reasons.push("Applied weekday and blackout constraints on the resort rows that requested them.");
    }
    if (passNames.length) {
      reasons.push(`Main pass choice: ${passNames.join(", ")}.`);
    }
    reasons.push(...pricingDetailsForResult(result));

    if (index > 0 && allResults[0]) {
      const delta = getResultPrice(result) - getResultPrice(allResults[0]);
      if (delta > 0) {
        reasons.push(`${toCurrency(delta)} more than the top returned option.`);
      } else if (delta < 0) {
        reasons.push(`${toCurrency(Math.abs(delta))} less than the first returned option, with different coverage or ranking tradeoffs.`);
      }
    }

    return uniqueReasons(reasons);
  }

  function renderRecommendationExplanation(result, index, allResults, payload) {
    const reasons = buildRecommendationReasons(result, index, allResults, payload);
    if (!reasons.length) return null;

    const details = document.createElement("details");
    details.className = "why-pass";
    details.open = index === 0;

    const summary = document.createElement("summary");
    summary.textContent = "Why this pass?";
    details.appendChild(summary);
    appendTextList(details, reasons);
    return details;
  }

  function renderComparison(results) {
    if (!results.length) return null;

    const panel = document.createElement("section");
    panel.className = "comparison-panel";

    const heading = document.createElement("div");
    heading.className = "comparison-head";
    const title = document.createElement("h3");
    title.textContent = "Compare Options";
    const note = document.createElement("p");
    const visibleCount = Math.min(results.length, TOP_COMPARISON_LIMIT);
    note.textContent = visibleCount > 1 ? `Top ${visibleCount} returned options` : "Top returned option";
    heading.appendChild(title);
    heading.appendChild(note);
    panel.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "comparison-grid";
    results.slice(0, TOP_COMPARISON_LIMIT).forEach((result, index) => {
      const card = document.createElement("article");
      card.className = "comparison-card";
      if (index === 0) {
        card.classList.add("best");
      }

      const label = document.createElement("div");
      label.className = "comparison-label";
      label.textContent = index === 0 ? "Top returned" : `Option ${index + 1}`;

      const price = document.createElement("strong");
      price.className = "comparison-price";
      price.textContent = toCurrency(getResultPrice(result));

      const meta = document.createElement("div");
      meta.className = "comparison-meta";
      const strategy = String(result.strategy || "recommendation");
      meta.textContent = `${getResultPassCount(result)} pass(es) • ${strategy} • ${coverageLabel(result)}`;

      const passNames = document.createElement("div");
      passNames.className = "comparison-passes";
      passNames.textContent = getResultPasses(result)
        .slice(0, 3)
        .map((passItem) => passItem.name || passItem.pass_id || "Pass")
        .join(", ") || "No pass details";

      card.appendChild(label);
      card.appendChild(price);
      card.appendChild(meta);
      card.appendChild(passNames);
      grid.appendChild(card);
    });
    panel.appendChild(grid);
    return panel;
  }

  function renderResults(data, payload = lastSubmittedPayload) {
    clearResults();
    const resultOptions = normalizeResultOptions(data);
    if (!data || !resultOptions.length) {
      const empty = document.createElement("div");
      empty.className = "result-card";
      empty.textContent = "No results returned.";
      els.results.appendChild(empty);
      revealResults();
      return;
    }

    const comparison = renderComparison(resultOptions);
    if (comparison) {
      els.results.appendChild(comparison);
    }

    resultOptions.forEach((result, index) => {
      const card = document.createElement("section");
      card.className = "result-card";

      const head = document.createElement("div");
      head.className = "result-head";

      const title = document.createElement("h3");
      title.className = "result-title";
      title.textContent = resultTitle(result, index, resultOptions.length);

      const price = document.createElement("div");
      price.className = "result-price";
      price.textContent = toCurrency(getResultPrice(result));

      if (isDevMode || resultOptions.length > 1 || result.__source === "ranked_passes") {
        head.appendChild(title);
      }
      head.appendChild(price);

      const summary = document.createElement("div");
      summary.className = "result-summary";
      const summaryParts = [`${getResultPassCount(result)} pass(es)`, coverageLabel(result)];
      if (isDevMode && result.strategy) {
        summaryParts.push(`Strategy: ${String(result.strategy)}`);
      }
      summary.textContent = summaryParts.join(" • ");

      card.appendChild(head);
      card.appendChild(summary);
      card.appendChild(renderPassList(getResultPasses(result)));

      const explanation = renderRecommendationExplanation(result, index, resultOptions, payload);
      if (explanation) {
        card.appendChild(explanation);
      }

      const unmet = renderUnmet(getResultUnmet(result));
      if (unmet) {
        card.appendChild(unmet);
      }

      els.results.appendChild(card);
    });

    revealResults();
  }

  async function submitRequest(options = {}) {
    const fromSharedLink = Boolean(options.fromSharedLink);
    showError("");
    if (!fromSharedLink) {
      showNotice("");
    }
    setStatus("");

    const { payload, errors } = buildRequest();
    lastSubmittedPayload = payload;
    els.rawRequest.textContent = JSON.stringify(payload, null, 2);

    if (errors.length) {
      showError(errors[0]);
      clearResults();
      setStatus("Validation failed.");
      if (fromSharedLink) {
        showNotice("Shared itinerary loaded, but it needs a valid trip before recommendations can run.");
        scrollToPlanner();
      }
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

      renderResults(data, payload);
      showNotice("");
      setStatus("Results updated.");
      scrollToResults();
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
      if (fromSharedLink) {
        showNotice("Shared itinerary loaded, but recommendations could not run automatically. Press Submit to try again.");
        scrollToPlanner();
      }
      setStatus(fromSharedLink ? "Shared itinerary loaded. Automatic recommendations failed." : "Request failed.");
    } finally {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      setBusy(false);
      queueHeightPost();
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
      showNotice("");
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
      showNotice("");
      els.resortsWrap.appendChild(createResortRow());
    });

    els.clear?.addEventListener("click", resetForm);
    els.share?.addEventListener("click", () => {
      copyShareLink().catch((error) => {
        showError(error instanceof Error ? error.message : "Unable to copy share link.");
        setStatus("Share link failed.");
      });
    });
    els.submit?.addEventListener("click", () => submitRequest());
  }

  initializeExistingRows();
  initializeModeUi();
  bindEvents();
  loadResorts().then(() => initializeSharedItinerary());

  window.addEventListener("load", postHeight);
  window.addEventListener("resize", queueHeightPost);

  const resizeObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => queueHeightPost())
    : null;
  if (resizeObserver) {
    if (document.body) resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);
  }

  window.addEventListener("message", (event) => {
    if (event.data?.type === "requestHeight") {
      postHeight();
    }
  });

  queueHeightPost();
})();
