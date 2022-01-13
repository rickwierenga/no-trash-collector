document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("open-onboarding")
    .addEventListener("click", openOnboarding);

  load();
});

function openOnboarding() {
  chrome.tabs.create({
    url: "onboarding.html",
  });
}
