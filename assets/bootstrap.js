(() => {
  const params = new URLSearchParams(window.location.search || "");
  const emptyKeyValue = (params.get("") || "").toLowerCase();
  const modeValue = (params.get("mode") || "").toLowerCase();
  const devMode =
    params.has("devmode") ||
    modeValue === "devmode" ||
    emptyKeyValue === "devmode" ||
    /(?:^|[?&=])devmode(?:[=&]|$)/i.test(window.location.search || "");

  window.__SNOW_GENIUS_DEV_MODE__ = devMode;
  if (devMode) {
    document.documentElement.classList.add("dev-mode");
  }
})();
