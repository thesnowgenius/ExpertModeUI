(() => {
  const DEFAULT_API_URL = "https://pass-picker-expert-mode-multi.onrender.com/score_pass";
  const ALLOWED_REMOTE_API_HOSTS = new Set(["pass-picker-expert-mode-multi.onrender.com"]);
  const PASS_FAMILY_ICON_CONFIG = [
    {
      key: "combo_49n_silver",
      alt: "49 North + Silver Mountain",
      src: "assets/pass-family-icons/combo_49n_silver_logo.png",
      aliases: ["49 north + silver combo pass", "49 north + silver mountain", "49 north silver mountain", "combo 49n silver"],
    },
    { key: "alta_bird", alt: "Alta-Bird Pass", src: "assets/pass-family-icons/alta_bird_logo.svg", aliases: ["alta bird pass"] },
    { key: "angel_fire_resort", alt: "Angel Fire Resort", src: "assets/pass-family-icons/angel_fire_resort_logo.png", aliases: ["angel fire resort season pass"] },
    { key: "aspen_snowmass", alt: "Aspen Snowmass", src: "assets/pass-family-icons/aspen_snowmass_logo.png", aliases: ["aspen snowmass"] },
    { key: "berkshire_summit", alt: "Berkshire Summit", src: "assets/pass-family-icons/berkshire_summit_logo.png", aliases: ["berkshire summit pass"] },
    { key: "bogus_basin", alt: "Bogus Basin", src: "assets/pass-family-icons/bogus_basin_logo.png", aliases: ["bogus basin season pass"] },
    { key: "bridger_bowl", alt: "Bridger Bowl", src: "assets/pass-family-icons/bridger_bowl_logo.ico", aliases: ["bridger bowl season pass"] },
    { key: "bristol_mountain", alt: "Bristol Mountain", src: "assets/pass-family-icons/bristol_mountain_logo.png", aliases: ["bristol mountain season pass"] },
    { key: "cali_pass", alt: "Cali Pass", src: "assets/pass-family-icons/cali_pass_logo.png", aliases: ["cali pass"] },
    { key: "diamond_peak", alt: "Diamond Peak", src: "assets/pass-family-icons/diamond_peak_logo.png", aliases: ["diamond peak season pass"] },
    { key: "discovery_ski_area", alt: "Discovery Ski Area", src: "assets/pass-family-icons/discovery_ski_area_logo.png", aliases: ["discovery ski area season pass"] },
    { key: "epic", alt: "Epic Pass", src: "assets/epic-pass-logo.svg", aliases: ["epic pass"] },
    { key: "great_divide", alt: "Great Divide", src: "assets/pass-family-icons/great_divide_logo.png", aliases: ["great divide season pass"] },
    { key: "gunstock", alt: "Gunstock", src: "assets/pass-family-icons/gunstock_logo.svg", aliases: ["gunstock season pass"] },
    { key: "ikon", alt: "Ikon Pass", src: "assets/ikon-pass-inc-logo-vector.svg", aliases: ["ikon pass"] },
    { key: "indy", alt: "Indy Pass", src: "assets/indy-pass-logo.svg", aliases: ["indy pass"] },
    {
      key: "labrador_song",
      alt: "Labrador / Song Pass",
      src: "assets/pass-family-icons/labrador_song_logo.png",
      aliases: ["labrador song pass", "labrador / song pass", "labrador song individual pass", "labrador_song_individual_pass"],
    },
    { key: "legendary_pass", alt: "Legendary Pass", src: "assets/pass-family-icons/legendary_pass_logo.png", aliases: ["legendary pass"] },
    { key: "lookout_pass", alt: "Lookout Pass", src: "assets/pass-family-icons/lookout_pass_logo.png", aliases: ["lookout pass season pass"] },
    { key: "loveland", alt: "Loveland Ski Area", src: "assets/pass-family-icons/loveland_logo.png", aliases: ["loveland ski area season pass"] },
    { key: "mad_river_glen", alt: "Mad River Glen", src: "assets/pass-family-icons/mad_river_glen_logo.png", aliases: ["mad river glen season pass"] },
    { key: "maverick_mountain", alt: "Maverick Mountain", src: "assets/pass-family-icons/maverick_mountain_logo.jpg", aliases: ["maverick mountain season pass"] },
    { key: "michigan_pass", alt: "Michigan Pass", src: "assets/pass-family-icons/michigan_pass_logo.png", aliases: ["michigan pass"] },
    {
      key: "michigan_white_gold",
      alt: "Michigan White Gold",
      src: "assets/pass-family-icons/michigan_white_gold_logo.png",
      aliases: ["michigan white gold card", "michigan white gold pass"],
    },
    { key: "monarch_mountain", alt: "Monarch Mountain", src: "assets/pass-family-icons/monarch_mountain_logo.png", aliases: ["monarch mountain season pass"] },
    {
      key: "mountain_collective",
      alt: "Mountain Collective",
      src: "assets/mountain-collective-logo.svg",
      aliases: ["mountain collective", "mountain collective pass"],
    },
    { key: "mountain_creek", alt: "Mountain Creek", src: "assets/pass-family-icons/mountain_creek_logo.png", aliases: ["mountain creek season pass"] },
    { key: "mt_ashland", alt: "Mt. Ashland", src: "assets/pass-family-icons/mt_ashland_logo.gif", aliases: ["mt ashland season pass", "mount ashland season pass"] },
    { key: "mt_baker", alt: "Mt. Baker", src: "assets/pass-family-icons/mt_baker_logo.png", aliases: ["mt baker season pass", "mount baker season pass"] },
    { key: "mt_hood_fusion", alt: "Mt. Hood Fusion Pass", src: "assets/pass-family-icons/mt_hood_fusion_logo.svg", aliases: ["mt hood fusion", "mt hood fusion pass"] },
    { key: "mt_rose", alt: "Mt. Rose", src: "assets/pass-family-icons/mt_rose_logo.jpg", aliases: ["mt rose season pass", "mount rose season pass"] },
    { key: "mt_spokane", alt: "Mt. Spokane", src: "assets/pass-family-icons/mt_spokane_logo.png", aliases: ["mt spokane season pass", "mount spokane season pass"] },
    { key: "new_england_pass", alt: "New England Pass", src: "assets/pass-family-icons/new_england_pass.svg", aliases: ["new england pass"] },
    { key: "no_boundaries", alt: "No Boundaries Pass", src: "assets/pass-family-icons/no_boundaries_logo.webp", aliases: ["no boundaries pass"] },
    { key: "ny_ski3", alt: "NY Ski3 Pass", src: "assets/pass-family-icons/ny_ski3_logo.png", aliases: ["ny ski3 pass", "ski3"] },
    {
      key: "peak_to_peak_pocono",
      alt: "Peak-to-Peak Poconos",
      src: "assets/pass-family-icons/peak_to_peak_pocono_logo.svg",
      aliases: ["peak to peak poconos", "peak-to-peak poconos", "peak-to-peak poconos pass"],
    },
    { key: "pebble_creek", alt: "Pebble Creek", src: "assets/pass-family-icons/pebble_creek_logo.png", aliases: ["pebble creek season pass"] },
    { key: "perfect_season", alt: "Perfect Season Pass", src: "assets/pass-family-icons/perfect_season_logo.jpg", aliases: ["perfect season pass"] },
    { key: "pico_mountain", alt: "Pico Mountain", src: "assets/pass-family-icons/pico_mountain_logo.png", aliases: ["pico mountain season pass"] },
    { key: "pine_creek", alt: "Pine Creek Ski Resort", src: "assets/pass-family-icons/pine_creek_logo.png", aliases: ["pine creek ski resort season pass"] },
    { key: "plattekill", alt: "Plattekill", src: "assets/pass-family-icons/plattekill_logo.png", aliases: ["plattekill season pass"] },
    { key: "power_pass", alt: "Power Pass", src: "assets/pass-family-icons/power_pass_logo.png", aliases: ["power pass", "power pass family"] },
    { key: "red_river", alt: "Red River Ski Area", src: "assets/pass-family-icons/red_river_logo.png", aliases: ["red river ski area season pass"] },
    { key: "showdown_montana", alt: "Showdown Montana", src: "assets/pass-family-icons/showdown_montana_logo.png", aliases: ["showdown montana season pass"] },
    { key: "silverton_mountain", alt: "Silverton Mountain", src: "assets/pass-family-icons/silverton_mountain_logo.png", aliases: ["silverton mountain season pass"] },
    {
      key: "ski_brule_bohemia",
      alt: "Ski Brule / Bohemia Pass",
      src: "assets/pass-family-icons/ski_brule_bohemia_logo.png",
      aliases: ["ski brule bohemia pass", "ski brule / bohemia pass"],
    },
    { key: "ski_butternut", alt: "Ski Butternut", src: "assets/pass-family-icons/ski_butternut_logo.png", aliases: ["ski butternut season pass"] },
    { key: "ski_cooper", alt: "Ski Cooper", src: "assets/pass-family-icons/ski_cooper_logo.png", aliases: ["ski cooper season pass"] },
    { key: "ski_santa_fe", alt: "Ski Santa Fe", src: "assets/pass-family-icons/ski_santa_fe_logo.svg", aliases: ["ski santa fe season pass"] },
    { key: "ski_vermont_4", alt: "Ski Vermont 4 Pass", src: "assets/pass-family-icons/ski_vermont_4_logo.png", aliases: ["ski vermont 4 pass"] },
    {
      key: "skiing_wisconsin_pass",
      alt: "Skiing Wisconsin Pass",
      src: "assets/pass-family-icons/skiwisconsin_logo.png",
      aliases: ["skiing wisconsin pass", "skiing wisconsin passport", "skiing_wisconsin_passport"],
    },
    { key: "smugglers_notch", alt: "Smugglers' Notch", src: "assets/pass-family-icons/smugglers_notch_logo.ico", aliases: ["smugglers notch season pass"] },
    { key: "sugar_mountain", alt: "Sugar Mountain", src: "assets/pass-family-icons/sugar_mountain_logo.png", aliases: ["sugar mountain season pass"] },
    { key: "sundance", alt: "Sundance Mountain Resort", src: "assets/pass-family-icons/sundance_logo.png", aliases: ["sundance mountain resort season pass"] },
    {
      key: "the_summit_at_snoqualmie_alpental",
      alt: "The Summit at Snoqualmie / Alpental",
      src: "assets/pass-family-icons/summit_at_snoqualmie_logo.png",
      aliases: ["the summit at snoqualmie / alpental season pass", "summit at snoqualmie alpental season pass"],
    },
    { key: "teton_pass", alt: "Teton Pass Ski Area", src: "assets/pass-family-icons/teton_pass_logo.png", aliases: ["teton pass ski area season pass"] },
    { key: "turner_mountain", alt: "Turner Mountain", src: "assets/pass-family-icons/turner_mountain_logo.jpg", aliases: ["turner mountain season pass"] },
    {
      key: "uphill_new_england",
      alt: "Uphill New England Pass",
      src: "assets/pass-family-icons/uphill_new_england_logo.png",
      aliases: ["uphill new england"],
    },
    { key: "wachusett_mountain", alt: "Wachusett Mountain", src: "assets/pass-family-icons/wachusett_mountain_logo.png", aliases: ["wachusett mountain season pass"] },
    { key: "warner_canyon", alt: "Warner Canyon", src: "assets/pass-family-icons/warner_canyon_logo.png", aliases: ["warner canyon season pass"] },
    {
      key: "white_mountain_sup",
      alt: "White Mountain Super Pass",
      src: "assets/pass-family-icons/white_mountain_super_pass_logo.png",
      aliases: ["white mountain super pass", "white mountain super", "white_mountain_super"],
    },
    { key: "whitefish_mountain", alt: "Whitefish Mountain Resort", src: "assets/pass-family-icons/whitefish_mountain_logo.png", aliases: ["whitefish mountain resort season pass"] },
    { key: "windham_mountain_club", alt: "Windham Mountain Club", src: "assets/pass-family-icons/windham_mountain_club_logo.png", aliases: ["windham mountain club season pass"] },
    {
      key: "wisconsin_multi_resort",
      alt: "Wisconsin Multi Resort",
      src: "assets/pass-family-icons/skiwisconsin_logo.png",
      aliases: ["wisconsin multi resort", "wisconsin resorts multi pass", "wisconsin resorts multi-mountain pass"],
    },
    { key: "wnep_ski_card", alt: "WNEP Ski Card", src: "assets/pass-family-icons/wnep_ski_card_logo.png", aliases: ["wnep ski card"] },
    { key: "wolf_creek", alt: "Wolf Creek Ski Area", src: "assets/pass-family-icons/wolf_creek_logo.png", aliases: ["wolf creek ski area season pass"] },
  ];
  const MULTI_MOUNTAIN_PASS_FAMILIES = new Set([
    "alta_bird",
    "aspen_snowmass",
    "combo_49n_silver",
    "epic",
    "ikon",
    "indy",
    "labrador_song",
    "michigan_pass",
    "michigan_white_gold",
    "mountain_collective",
    "mt_hood_fusion",
    "new_england_pass",
    "no_boundaries",
    "ny_ski3",
    "peak_to_peak_pocono",
    "power_pass",
    "ski_brule_bohemia",
    "ski_vermont_4",
    "skiing_wisconsin_pass",
    "uphill_new_england",
    "white_mountain_sup",
    "wisconsin_multi_resort",
    "wnep_ski_card",
  ]);
  const PASS_PROVIDER_ICON_CONFIG = [
    { key: "stratton", alt: "Stratton", src: "assets/pass-family-icons/stratton_logo.svg", aliases: ["stratton mountain"] },
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
  const PASS_FAMILY_ICON_BY_COMPACT_KEY = (() => {
    const map = new Map();
    PASS_FAMILY_ICON_CONFIG.forEach((icon) => {
      [icon.key, ...(icon.aliases || [])].forEach((value) => {
        const compact = compactPassFamilyKey(value);
        if (compact && !map.has(compact)) {
          map.set(compact, icon);
        }
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
  const TYPEAHEAD_DEBOUNCE_MS = 90;
  const MAX_SUGGESTIONS = 100;
  const REQUEST_TIMEOUT_MS = 20000;
  const DEV_API_STORAGE_KEY = "snowGeniusExpertApiUrl";
  const TRACKING_SESSION_STORAGE_KEY = "snowGeniusAnonymousSessionId";
  const DEV_LOCAL_API_URL = "http://127.0.0.1:8000/score_pass";
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
  const VALID_RIDER_CATEGORIES = new Set(["military", "student", "first_responder", "medical", "uphill"]);
  const RESORT_ALIAS_LEADING_WORDS = new Set(["mount", "mt", "ski", "the"]);
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
  const DEFAULT_RESOLVED_API_URL = resolveApiUrl(window.API_URL, DEFAULT_API_URL);
  let currentApiUrl = loadStoredApiUrl(DEFAULT_RESOLVED_API_URL);

  const els = {
    hero: document.querySelector(".hero"),
    appMain: document.querySelector("#app-main"),
    devShell: document.querySelector("#dev-shell"),
    devShellCard: document.querySelector(".dev-shell-card"),
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
  let resortByNormalizedSearchPhrase = new Map();
  let typeaheadCounter = 0;
  let sharedItineraryHandled = false;
  let lastSubmittedPayload = null;
  let shareFeedbackTimeoutId = 0;
  let inMemoryTrackingSessionId = "";

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

  function loadStoredApiUrl(fallback) {
    if (!isDevMode) return fallback;
    try {
      const saved = window.localStorage?.getItem(DEV_API_STORAGE_KEY) || "";
      return resolveApiUrl(saved, fallback);
    } catch (_error) {
      return fallback;
    }
  }

  function storeApiUrl(url) {
    try {
      window.localStorage?.setItem(DEV_API_STORAGE_KEY, url);
    } catch (_error) {
      // Local storage can be blocked in embedded contexts; endpoint still works for this page load.
    }
  }

  function clearStoredApiUrl() {
    try {
      window.localStorage?.removeItem(DEV_API_STORAGE_KEY);
    } catch (_error) {
      // Local storage can be blocked in embedded contexts; the in-memory reset still applies.
    }
  }

  function apiSiblingUrl(path) {
    const url = new URL(currentApiUrl, window.location.href);
    url.pathname = path;
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  function stripControlChars(value) {
    return String(value || "").replace(/[\u0000-\u001F\u007F]/g, "");
  }

  function cleanShortText(value, maxLength) {
    const text = stripControlChars(value).trim();
    if (!maxLength || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  }

  function createTrackingSessionId() {
    if (typeof window.crypto?.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    const bytes = new Uint8Array(24);
    window.crypto?.getRandomValues?.(bytes);
    const randomPart = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return randomPart || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function getTrackingSessionId() {
    if (inMemoryTrackingSessionId) return inMemoryTrackingSessionId;
    try {
      const stored = String(window.localStorage?.getItem(TRACKING_SESSION_STORAGE_KEY) || "").trim();
      if (/^[a-zA-Z0-9_-]{16,128}$/.test(stored)) {
        inMemoryTrackingSessionId = stored;
        return stored;
      }
    } catch (_error) {
      // Embedded browsers can block local storage; the page-scoped ID still supports click attribution.
    }

    inMemoryTrackingSessionId = createTrackingSessionId();
    try {
      window.localStorage?.setItem(TRACKING_SESSION_STORAGE_KEY, inMemoryTrackingSessionId);
    } catch (_error) {
      // Keep the in-memory identifier when storage is unavailable.
    }
    return inMemoryTrackingSessionId;
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function normalizeResortSearchText(value) {
    return String(value || "")
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
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

  function compactPassFamilyKey(value) {
    const ignored = new Set(["area", "club", "family", "mountain", "mtn", "pass", "passes", "resort", "resorts", "season", "ski", "the"]);
    return normalizePassFamilyKey(value)
      .split("_")
      .filter((part) => part && !ignored.has(part))
      .join("_");
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
    const messages = Array.isArray(message) ? message.filter(Boolean) : message ? [message] : [];
    if (!messages.length) {
      els.formError.hidden = true;
      els.formError.replaceChildren();
      queueHeightPost();
      return;
    }
    els.formError.hidden = false;
    els.formError.replaceChildren();
    if (messages.length === 1) {
      els.formError.textContent = messages[0];
    } else {
      const heading = document.createElement("strong");
      heading.textContent = `Fix ${messages.length} items before submitting:`;
      const list = document.createElement("ul");
      list.className = "error-list";
      messages.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      els.formError.appendChild(heading);
      els.formError.appendChild(list);
    }
    queueHeightPost();
  }

  function clearInvalidFields() {
    document.querySelectorAll(".input.invalid, .select.invalid, [aria-invalid='true']").forEach((control) => {
      control.classList.remove("invalid");
      control.removeAttribute("aria-invalid");
    });
  }

  function markInvalid(control) {
    if (!control) return;
    control.classList.add("invalid");
    control.setAttribute("aria-invalid", "true");
  }

  function focusFirstInvalidField() {
    const firstInvalid = document.querySelector("[aria-invalid='true']");
    firstInvalid?.focus({ preventScroll: true });
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    initializeDevApiPanel();
    queueHeightPost();
  }

  function setCatalogStatus(panel, data) {
    const output = panel.querySelector(".dev-api-status");
    if (!output) return;
    if (!data) {
      output.textContent = "Catalog status has not been loaded.";
      return;
    }
    const counts = data.counts || {};
    const pricing = data.pricing || {};
    output.textContent = [
      `Status: ${data.status || "unknown"}`,
      `Loaded: ${data.loaded_at || "unknown"}`,
      `Pricing source: ${pricing.pricing_source || "unknown"}`,
      `Season: ${pricing.season || "default"}`,
      `JSON pricing updated: ${pricing.json_pricing_updated_at || "unknown"}`,
      `Variants: ${counts.variants ?? "unknown"}`,
      `Pricing rows: ${counts.pricing_rows ?? "unknown"}`,
      `Unavailable/unpriced passes: ${counts.unavailable_or_unpriced_passes ?? "unknown"}`,
    ].join("\n");
  }

  async function refreshCatalogStatus(panel) {
    const output = panel.querySelector(".dev-api-status");
    if (output) output.textContent = "Loading catalog status...";
    try {
      const response = await fetch(apiSiblingUrl("/catalog_status"), {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
      });
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_error) {
        throw new Error(`Catalog status returned a non-JSON response (${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(data?.detail || `Catalog status failed (${response.status})`);
      }
      setCatalogStatus(panel, data);
    } catch (error) {
      if (output) {
        output.textContent = error instanceof Error ? error.message : "Catalog status failed.";
      }
    } finally {
      queueHeightPost();
    }
  }

  function initializeDevApiPanel() {
    if (!isDevMode || !els.devShellCard || els.devShellCard.querySelector(".dev-api-panel")) return;

    const panel = document.createElement("section");
    panel.className = "dev-api-panel dev-debug";

    const title = document.createElement("h3");
    title.textContent = "API Endpoint";

    const controls = document.createElement("div");
    controls.className = "dev-api-controls";

    const select = document.createElement("select");
    select.className = "select dev-api-preset";
    select.setAttribute("aria-label", "API endpoint preset");
    [
      ["render", DEFAULT_RESOLVED_API_URL, "Render"],
      ["local", DEV_LOCAL_API_URL, "Local"],
      ["custom", currentApiUrl, "Custom"],
    ].forEach(([value, url, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.dataset.url = url;
      option.textContent = label;
      select.appendChild(option);
    });

    const input = document.createElement("input");
    input.className = "input dev-api-url";
    input.type = "url";
    input.value = currentApiUrl;
    input.setAttribute("aria-label", "API endpoint URL");

    const apply = document.createElement("button");
    apply.className = "btn subtle";
    apply.type = "button";
    apply.textContent = "Use Endpoint";

    const refresh = document.createElement("button");
    refresh.className = "btn subtle";
    refresh.type = "button";
    refresh.textContent = "Refresh Status";

    const reset = document.createElement("button");
    reset.className = "btn subtle";
    reset.type = "button";
    reset.textContent = "Reset to Render";

    const status = document.createElement("pre");
    status.className = "dev-api-status";
    status.textContent = "Catalog status has not been loaded.";

    function syncInputFromPreset() {
      const selected = select.selectedOptions[0];
      if (selected?.dataset.url) {
        input.value = selected.dataset.url;
      }
    }

    function syncPresetFromUrl(url) {
      if (url === DEFAULT_RESOLVED_API_URL) {
        select.value = "render";
      } else if (url === DEV_LOCAL_API_URL) {
        select.value = "local";
      } else {
        select.value = "custom";
      }
    }

    syncPresetFromUrl(currentApiUrl);
    select.addEventListener("change", syncInputFromPreset);
    apply.addEventListener("click", () => {
      const nextUrl = resolveApiUrl(input.value, DEFAULT_RESOLVED_API_URL);
      currentApiUrl = nextUrl;
      input.value = nextUrl;
      syncPresetFromUrl(nextUrl);
      storeApiUrl(nextUrl);
      setStatus("Developer API endpoint updated.");
      refreshCatalogStatus(panel);
    });
    refresh.addEventListener("click", () => refreshCatalogStatus(panel));
    reset.addEventListener("click", () => {
      currentApiUrl = DEFAULT_RESOLVED_API_URL;
      input.value = currentApiUrl;
      syncPresetFromUrl(currentApiUrl);
      clearStoredApiUrl();
      setStatus("Developer API endpoint reset to Render.");
      refreshCatalogStatus(panel);
    });

    controls.appendChild(select);
    controls.appendChild(input);
    controls.appendChild(apply);
    controls.appendChild(refresh);
    controls.appendChild(reset);
    panel.appendChild(title);
    panel.appendChild(controls);
    panel.appendChild(status);
    els.devShellCard.insertBefore(panel, els.devShellCard.firstChild);
    refreshCatalogStatus(panel);
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
    if (raw.includes("uphill") || raw.includes("skinning")) return "uphill";
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
    if (category === "uphill") return "Uphill/Skinning";
    return cleanShortText(value || "", 40);
  }

  function hasPublicAccess(row) {
    const rawPublicAccess = row?.public_access ?? row?.publicAccess ?? row?.PublicAccess ?? "";
    return normalizeText(rawPublicAccess) === "yes";
  }

  function addResortSearchPhrase(phrases, value) {
    const normalized = normalizeResortSearchText(value);
    if (!normalized) return;
    phrases.add(normalized);

    const words = normalized.split(" ").filter(Boolean);
    if (words.length > 1 && RESORT_ALIAS_LEADING_WORDS.has(words[0])) {
      const rest = words.slice(1).join(" ");
      phrases.add(rest);
      if (words[0] === "mount") {
        phrases.add(`mt ${rest}`);
      } else if (words[0] === "mt") {
        phrases.add(`mount ${rest}`);
      }
    }
  }

  function buildResortSearchPhrases(resort) {
    const phrases = new Set();
    addResortSearchPhrase(phrases, resort.name);
    addResortSearchPhrase(phrases, resort.label);
    addResortSearchPhrase(phrases, resort.id);
    addResortSearchPhrase(phrases, String(resort.id || "").replace(/[_-]+/g, " "));
    return Array.from(phrases);
  }

  function setUniqueSearchPhrase(map, phrase, resort) {
    if (!phrase) return;
    if (!map.has(phrase)) {
      map.set(phrase, resort);
      return;
    }
    const existing = map.get(phrase);
    if (existing && existing.id !== resort.id) {
      map.set(phrase, null);
    }
  }

  function resortSearchScore(resort, query) {
    const normalizedQuery = normalizeResortSearchText(query);
    if (!normalizedQuery) return 0;
    const phrases = Array.isArray(resort.searchPhrases) && resort.searchPhrases.length
      ? resort.searchPhrases
      : [normalizeResortSearchText(`${resort.name} ${resort.label} ${resort.id}`)];

    let best = Infinity;
    phrases.forEach((phrase) => {
      if (!phrase) return;
      if (phrase === normalizedQuery) {
        best = Math.min(best, 0);
      } else if (phrase.startsWith(normalizedQuery)) {
        best = Math.min(best, 1);
      } else if (phrase.split(" ").some((word) => word.startsWith(normalizedQuery))) {
        best = Math.min(best, 2);
      } else if (phrase.includes(` ${normalizedQuery}`)) {
        best = Math.min(best, 3);
      } else if (phrase.includes(normalizedQuery)) {
        best = Math.min(best, 4);
      }
    });
    return best;
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
        result.searchPhrases = buildResortSearchPhrases(result);
        result.searchText = result.searchPhrases.join(" ");
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
        const searchPhrases = new Map();
        for (const resort of resortCatalog) {
          resortById.set(resort.id, resort);
          resortByNormalizedName.set(normalizeText(resort.name), resort);
          resortByNormalizedName.set(normalizeText(resort.label), resort);
          resort.searchPhrases.forEach((phrase) => setUniqueSearchPhrase(searchPhrases, phrase, resort));
        }
        resortByNormalizedSearchPhrase = new Map(
          Array.from(searchPhrases.entries()).filter((entry) => entry[1])
        );
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
      <label class="field rider-age-field">
        <span class="field-label">Age</span>
        <input type="number" min="0" max="${MAX_AGE}" inputmode="numeric" placeholder="Age" class="input rider-age" aria-label="Rider age" />
      </label>
      <label class="field rider-category-field">
        <span class="field-label">Discount or activity</span>
        <select class="select rider-category" aria-label="Rider discount or activity">
          <option value="">None</option>
          <option value="military">Military</option>
          <option value="student">Student</option>
          <option value="first_responder">First Responder</option>
          <option value="medical">Medical Professional</option>
          <option value="uphill">Uphill/Skinning</option>
        </select>
      </label>
      <button type="button" class="btn subtle remove-rider">Remove rider</button>
    `;
    wireRiderRow(row);
    return row;
  }

  function createResortRow() {
    const row = document.createElement("div");
    row.className = "row resort-row";
    row.innerHTML = `
      <div class="field typeahead">
        <label class="field-label">Resort</label>
        <input type="text" class="input resort-input" placeholder="Start typing a resort…" autocomplete="off" maxlength="${MAX_RESORT_INPUT_LENGTH}" aria-label="Resort" />
        <ul class="suggestions" role="listbox" hidden></ul>
      </div>
      <label class="field days-field">
        <span class="field-label">Days</span>
        <input type="number" min="1" max="${MAX_DAYS_PER_RESORT}" inputmode="numeric" class="input days-input" placeholder="Days" aria-label="Days requested" />
      </label>
      <div class="constraint-control">
        <label class="chk"><input type="checkbox" class="no-weekends" /> Only Weekdays</label>
        <button
          type="button"
          class="tooltip-trigger"
          aria-label="About Only Weekdays: Use this when you will ski this resort only Monday through Friday. Recommendations may include passes that are not valid on Saturdays or Sundays."
        >?</button>
        <span class="tooltip-content" role="tooltip">Use this when you will ski this resort only Monday through Friday. Recommendations may include passes that are not valid on Saturdays or Sundays.</span>
      </div>
      <div class="constraint-control">
        <label class="chk"><input type="checkbox" class="no-blackouts" /> No blackout dates</label>
        <button
          type="button"
          class="tooltip-trigger"
          aria-label="About No blackout dates: Blackout dates are excluded dates, often holidays, when a pass cannot be used. Select this to show only options without blackout dates."
        >?</button>
        <span class="tooltip-content" role="tooltip">Blackout dates are excluded dates, often holidays, when a pass cannot be used. Select this to show only options without blackout dates.</span>
      </div>
      <button type="button" class="btn subtle remove-resort">Remove resort</button>
    `;
    wireResortRow(row);
    return row;
  }

  function updateRowControls(container, rowSelector, buttonSelector) {
    if (!container) return;
    const rows = Array.from(container.querySelectorAll(rowSelector));
    rows.forEach((row) => {
      const button = row.querySelector(buttonSelector);
      if (button) {
        button.hidden = rows.length <= 1;
      }
    });
  }

  function updateAllRowControls() {
    updateRowControls(els.ridersWrap, ".rider-row", ".remove-rider");
    updateRowControls(els.resortsWrap, ".resort-row", ".remove-resort");
  }

  function removeOrResetRow(row, container, factory) {
    const rows = container.querySelectorAll(row.classList.contains("rider-row") ? ".rider-row" : ".resort-row");
    if (rows.length <= 1) {
      const replacement = factory();
      row.replaceWith(replacement);
    } else {
      row.remove();
    }
    updateAllRowControls();
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
    const normalizedName = normalizeText(text);
    const direct = resortByNormalizedName.get(normalizedName);
    if (direct) return direct;
    const directPhrase = resortByNormalizedSearchPhrase.get(normalizeResortSearchText(text));
    if (directPhrase) return directPhrase;

    const withoutState = text.replace(/,\s*[A-Za-z. ]+$/, "");
    const normalizedWithoutState = normalizeText(withoutState);
    return (
      resortByNormalizedName.get(normalizedWithoutState) ||
      resortByNormalizedSearchPhrase.get(normalizeResortSearchText(withoutState)) ||
      null
    );
  }

  function resortDisplayLabel(value) {
    const raw = cleanShortText(value || "", MAX_RESORT_INPUT_LENGTH);
    if (!raw) return "resort";
    const resort = resortById.get(raw) || resortByNormalizedName.get(normalizeText(raw));
    if (resort) return resort.label;
    return raw
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
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
    const inputId = `resort-input-${typeaheadCounter}`;
    const label = row.querySelector(".field-label");
    list.id = listId;
    input.id = inputId;
    if (label) {
      label.htmlFor = inputId;
    }
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listId);
    input.setAttribute("aria-haspopup", "listbox");
    list.hidden = true;

    let suggestions = [];
    let activeIndex = -1;
    let closeTimer = null;
    let typeaheadTimer = null;

    function closeSuggestions() {
      if (typeaheadTimer) {
        window.clearTimeout(typeaheadTimer);
        typeaheadTimer = null;
      }
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
      const query = normalizeResortSearchText(rawValue);
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
          .map((resort) => ({
            resort,
            score: resortSearchScore(resort, query),
          }))
          .filter((item) => Number.isFinite(item.score))
          .sort((a, b) => a.score - b.score || a.resort.name.localeCompare(b.resort.name))
          .map((item) => item.resort)
          .slice(0, MAX_SUGGESTIONS)
        : resortCatalog.slice(0, MAX_SUGGESTIONS);
      renderSuggestions(matches);
    }

    function scheduleSuggestions() {
      if (typeaheadTimer) {
        window.clearTimeout(typeaheadTimer);
      }
      typeaheadTimer = window.setTimeout(() => {
        typeaheadTimer = null;
        updateSuggestions();
      }, TYPEAHEAD_DEBOUNCE_MS);
    }

    input.addEventListener("input", scheduleSuggestions);
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
    updateAllRowControls();
  }

  function resetForm() {
    resetShareButtonFeedback();
    els.ridersWrap.replaceChildren();
    els.resortsWrap.replaceChildren();
    els.ridersWrap.appendChild(createRiderRow());
    els.resortsWrap.appendChild(createResortRow());
    updateAllRowControls();
    els.rawRequest.textContent = "{}";
    els.rawResponse.textContent = "{}";
    showNotice("");
    showError("");
    clearResults();
    clearShareParamsFromUrl();
    setStatus("Form cleared.");
  }

  function buildRequest() {
    clearInvalidFields();
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
        markInvalid(ageInput);
      }

      const category = canonicalizeCategory(categorySelect?.value) || null;
      if (category && !VALID_RIDER_CATEGORIES.has(category)) {
        errors.push(`Rider ${index + 1}: category is invalid.`);
        markInvalid(categorySelect);
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
    let hasResortInput = false;
    resortRows.forEach((row, index) => {
      const resortInput = row.querySelector(".resort-input");
      const daysInput = row.querySelector(".days-input");
      const rawName = cleanShortText(resortInput?.value || "", MAX_RESORT_INPUT_LENGTH);
      const daysValue = String(daysInput?.value || "").trim();

      const isBlank = !rawName && !daysValue;
      if (isBlank) {
        return;
      }
      hasResortInput = true;

      if (!rawName) {
        errors.push(`Resort ${index + 1}: resort name is required.`);
        markInvalid(resortInput);
      }
      if (String(resortInput?.value || "").trim().length > MAX_RESORT_INPUT_LENGTH) {
        errors.push(`Resort ${index + 1}: resort name is too long.`);
        markInvalid(resortInput);
      }

      const days = Number(daysValue);
      if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS_PER_RESORT) {
        errors.push(`Resort ${index + 1}: days must be a whole number between 1 and ${MAX_DAYS_PER_RESORT}.`);
        markInvalid(daysInput);
      }

      const exact = findExactResortMatch(rawName);
      if (exact && resortInput && !resortInput.dataset.resortId) {
        applySelectedResort(resortInput, exact);
      }

      const selectedById = resortById.get(resortInput?.dataset.resortId || "");
      const selectedResort = selectedById || exact || null;
      if (rawName && !selectedResort) {
        errors.push(`Resort ${index + 1}: choose a resort from the suggestions list.`);
        markInvalid(resortInput);
      }

      if (selectedResort && Number.isInteger(days) && days >= 1 && days <= MAX_DAYS_PER_RESORT) {
        totalRequestedDays += days;
        resorts.push({
          id: selectedResort.id,
          days,
          no_weekends: Boolean(row.querySelector(".no-weekends")?.checked),
          no_blackouts: Boolean(row.querySelector(".no-blackouts")?.checked),
        });
      }
    });

    if (!resorts.length && !hasResortInput) {
      errors.push("Add at least one resort.");
      const firstResortRow = resortRows[0];
      markInvalid(firstResortRow?.querySelector(".resort-input"));
      markInvalid(firstResortRow?.querySelector(".days-input"));
    }
    if (totalRequestedDays > MAX_TOTAL_REQUESTED_DAYS) {
      errors.push(`Total requested days cannot exceed ${MAX_TOTAL_REQUESTED_DAYS}.`);
      resortRows.forEach((row) => markInvalid(row.querySelector(".days-input")));
    }

    return {
      payload: {
        riders,
        resorts,
        tracking_session_id: getTrackingSessionId(),
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
      passItem?.tracking_url ??
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

      const compact = compactPassFamilyKey(candidate);
      if (compact) {
        const compactExact = PASS_FAMILY_ICON_BY_COMPACT_KEY.get(compact);
        if (compactExact) return compactExact;

        for (const [key, icon] of PASS_FAMILY_ICON_BY_COMPACT_KEY.entries()) {
          if (compact.startsWith(`${key}_`) || key.startsWith(`${compact}_`)) {
            return icon;
          }
        }
      }
      return null;
    }

    const familyCandidates = [
      passItem?.pass_family,
      passItem?.pass_family_id,
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
    deficitKeys
      .sort((a, b) => resortDisplayLabel(a).localeCompare(resortDisplayLabel(b)))
      .forEach((key) => {
        const li = document.createElement("li");
        li.textContent = `${resortDisplayLabel(key)}: ${unmet[key]} day(s) still uncovered`;
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

  function getResultCoverage(result) {
    return Array.isArray(result?.coverage) ? result.coverage : [];
  }

  function getResultUnmetByRider(result) {
    return Array.isArray(result?.unmet_by_rider) ? result.unmet_by_rider : [];
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
          pass_family: item.pass_family,
          pass_family_id: item.pass_family,
          tracking_url: item.tracking_url,
          destination_url: item.destination_url,
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
    const alternativeLabel = cleanShortText(result?.alternative_label || "", 80);
    if (alternativeLabel) {
      return alternativeLabel;
    }
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

  function coverageMetrics(row) {
    const requested = Number(row?.requested_days) || 0;
    const covered = Number(row?.covered_days) || 0;
    const rawUncovered = row?.uncovered_days;
    const parsedUncovered = Number(rawUncovered);
    const hasExplicitUncovered =
      rawUncovered !== undefined &&
      rawUncovered !== null &&
      String(rawUncovered).trim() !== "" &&
      Number.isFinite(parsedUncovered);
    const uncovered = Math.max(0, hasExplicitUncovered ? parsedUncovered : requested - covered);
    return { requested, covered, uncovered };
  }

  function coverageAgeContext(row) {
    const direct =
      row?.age_bracket ??
      row?.age_group ??
      row?.rider_age_bracket ??
      row?.price_category ??
      row?.category ??
      "";
    const label = cleanShortText(direct, 40);
    if (label) return label;

    const age = Number(row?.rider_age ?? row?.age);
    if (Number.isFinite(age)) return `age ${age}`;

    const minAge = Number(row?.min_age ?? row?.age_min);
    const maxAge = Number(row?.max_age ?? row?.age_max);
    if (Number.isFinite(minAge) && Number.isFinite(maxAge)) return `ages ${minAge}-${maxAge}`;
    if (Number.isFinite(minAge)) return `age ${minAge}+`;
    if (Number.isFinite(maxAge)) return `age ${maxAge} and under`;
    return "";
  }

  function coverageRiderLabel(row) {
    const rawIndex = row?.rider_index;
    const index = Number(rawIndex);
    const hasIndex =
      rawIndex !== undefined &&
      rawIndex !== null &&
      String(rawIndex).trim() !== "" &&
      Number.isInteger(index) &&
      index >= 0;
    const base = hasIndex ? `Rider ${index + 1}` : "Rider";
    const ageContext = coverageAgeContext(row);
    return ageContext ? `${base} (${ageContext})` : base;
  }

  function summarizeCoverageRows(coverage) {
    const summaries = [];
    const fullCoverageByKey = new Map();

    coverage
      .filter((row) => Number(row?.requested_days) > 0)
      .forEach((row) => {
        const metrics = coverageMetrics(row);
        const hasMiss = metrics.uncovered > 0;
        const riderLabel = coverageRiderLabel(row);
        if (hasMiss) {
          summaries.push({ row, ...metrics, riderLabels: new Set([riderLabel]), hasMiss });
          return;
        }

        const key = [
          cleanShortText(row?.resort_id || "", MAX_RESORT_ID_LENGTH),
          metrics.requested,
          metrics.covered,
          metrics.uncovered,
        ].join("|");
        const existing = fullCoverageByKey.get(key);
        if (existing) {
          existing.riderLabels.add(riderLabel);
          return;
        }

        const summary = { row, ...metrics, riderLabels: new Set([riderLabel]), hasMiss };
        fullCoverageByKey.set(key, summary);
        summaries.push(summary);
      });

    return summaries.slice(0, 80);
  }

  function coverageSummaryText(summary) {
    const resort = resortDisplayLabel(summary.row?.resort_id);
    const riderCount = summary.riderLabels.size;
    const subject = !summary.hasMiss && riderCount > 1
      ? `${riderCount} riders`
      : coverageRiderLabel(summary.row);
    return `${subject} at ${resort}: ${summary.covered}/${summary.requested} day(s) covered${
      summary.uncovered ? `, ${summary.uncovered} uncovered` : ""
    }.`;
  }

  function renderCoverageDetails(result) {
    const coverage = getResultCoverage(result);
    const unmetByRider = getResultUnmetByRider(result);
    if (!coverage.length && !unmetByRider.length) return null;

    const details = document.createElement("details");
    details.className = "why-pass coverage-details";
    details.open = Boolean(unmetByRider.length);

    const summary = document.createElement("summary");
    summary.textContent = unmetByRider.length ? "Coverage gaps" : "Coverage details";
    details.appendChild(summary);

    const list = document.createElement("ul");
    list.className = "why-list";
    summarizeCoverageRows(coverage)
      .forEach((summary) => {
        const li = document.createElement("li");
        li.textContent = coverageSummaryText(summary);
        list.appendChild(li);
      });
    details.appendChild(list);
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
    note.textContent = visibleCount > 1
      ? `Top ${visibleCount} options ranked by fit; alternative prices may not be ascending.`
      : "Top recommendation returned by the solver.";
    heading.appendChild(title);
    heading.appendChild(note);
    panel.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "comparison-grid";
    results.slice(0, TOP_COMPARISON_LIMIT).forEach((result, index) => {
      const card = document.createElement("a");
      card.className = "comparison-card";
      const targetId = `recommendation-option-${index + 1}`;
      card.href = `#${targetId}`;
      card.setAttribute("aria-controls", targetId);
      card.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const target = document.getElementById(targetId);
        if (!target) return;

        event.preventDefault();
        if (target instanceof HTMLDetailsElement) {
          target.open = true;
        }

        if (window.history?.pushState && window.location.hash !== card.hash) {
          window.history.pushState(null, "", card.hash);
        }

        const reduceMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
      if (index === 0) {
        card.classList.add("best");
      }

      const label = document.createElement("div");
      label.className = "comparison-label";
      label.textContent = index === 0 ? "Recommended" : `Alternative ${index}`;

      const price = document.createElement("strong");
      price.className = "comparison-price";
      price.textContent = toCurrency(getResultPrice(result));

      const meta = document.createElement("div");
      meta.className = "comparison-meta";
      const strategy = String(result.strategy || "recommendation");
      const kind = cleanShortText(result?.alternative_label || strategy, 80);
      meta.textContent = `${getResultPassCount(result)} pass(es) • ${kind} • ${coverageLabel(result)}`;

      const passNames = document.createElement("div");
      passNames.className = "comparison-passes";
      passNames.textContent = getResultPasses(result)
        .slice(0, 3)
        .map((passItem) => passItem.name || passItem.pass_id || "Pass")
        .join(", ") || "No pass details";

      const jump = document.createElement("span");
      jump.className = "comparison-jump";
      jump.textContent = index === 0 ? "View recommendation" : "View alternative";

      card.appendChild(label);
      card.appendChild(price);
      card.appendChild(meta);
      card.appendChild(passNames);
      card.appendChild(jump);
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
      const isRecommended = index === 0;
      const card = document.createElement(isRecommended ? "section" : "details");
      card.className = isRecommended ? "result-card recommended-result" : "result-card alternative-result";
      card.id = `recommendation-option-${index + 1}`;

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

      const content = document.createElement("div");
      content.className = "result-content";

      if (isRecommended) {
        card.appendChild(head);
        card.appendChild(summary);
      } else {
        const disclosure = document.createElement("summary");
        disclosure.className = "result-option-summary";
        disclosure.appendChild(head);
        disclosure.appendChild(summary);
        card.appendChild(disclosure);
      }

      content.appendChild(renderPassList(getResultPasses(result)));

      const explanation = renderRecommendationExplanation(result, index, resultOptions, payload);
      if (explanation) {
        content.appendChild(explanation);
      }

      const coverageDetails = renderCoverageDetails(result);
      if (coverageDetails) {
        content.appendChild(coverageDetails);
      }

      const unmet = renderUnmet(getResultUnmet(result));
      if (unmet) {
        content.appendChild(unmet);
      }

      card.appendChild(content);

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
      showError(errors);
      clearResults();
      setStatus("Validation failed.");
      focusFirstInvalidField();
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
      const response = await fetch(currentApiUrl, {
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
      updateAllRowControls();
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
      updateAllRowControls();
    });

    els.clear?.addEventListener("click", resetForm);
    els.share?.addEventListener("click", () => {
      copyShareLink().catch((error) => {
        showError(error instanceof Error ? error.message : "Unable to copy share link.");
        setStatus("Share link failed.");
      });
    });
    els.submit?.addEventListener("click", () => submitRequest());
    els.appMain?.addEventListener("input", (event) => {
      const control = event.target;
      if (control instanceof HTMLElement && control.matches(".input, .select")) {
        control.classList.remove("invalid");
        control.removeAttribute("aria-invalid");
      }
    });
    els.appMain?.addEventListener("change", (event) => {
      const control = event.target;
      if (control instanceof HTMLElement && control.matches(".input, .select")) {
        control.classList.remove("invalid");
        control.removeAttribute("aria-invalid");
      }
    });
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
