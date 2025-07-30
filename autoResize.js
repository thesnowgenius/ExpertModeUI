function sendHeight() {
  const height = document.documentElement.scrollHeight;
  parent.postMessage({ type: "setHeight", height }, "*");
}

window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);

const observer = new MutationObserver(() => {
  sendHeight();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});
