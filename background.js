chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    openOnboarding();
  }
});

function openOnboarding() {
  chrome.tabs.create({
    url: "onboarding.html",
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    chrome.tabs.sendMessage(tab.id, {
      type: "page-loaded",
      url: tab.url,
    });
  }
});
