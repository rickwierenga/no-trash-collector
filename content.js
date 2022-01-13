function getNoTrashToken(callback) {
  chrome.storage.sync.get(["no-trash-token"], function (result) {
    callback(result["no-trash-token"]);
  });
}

chrome.runtime.onMessage.addListener(receiveMessage);

function receiveMessage(message, sender, sendResponse) {
  if (message.type === "page-loaded") {
    check(message.url);
  }
}

function check(url) {
  chrome.storage.sync.get(
    ["no-trash-URLs", "yes-trash-URLs"],
    function (result) {
      let domain = new URL(url).hostname.replace("www.", "");

      console.log(result);

      const noTrashURLs = result["no-trash-URLs"];
      for (var i = 0; i < noTrashURLs.length; i++) {
        if (noTrashURLs[i].includes(domain)) {
          return;
        }
      }

      const yesTrashURLs = result["yes-trash-URLs"] ?? [];
      for (var i = 0; i < yesTrashURLs.length; i++) {
        if (yesTrashURLs[i].includes(domain)) {
          return;
        }
      }

      showAskTrashAlert(domain);
    }
  );
}

function showAskTrashAlert(domain) {
  chrome.storage.sync.get(["no-trash-whitelists"], function (result) {
    const whitelists = result["no-trash-whitelists"];
    const div = document.createElement("div");
    document.body.appendChild(div);
    div.innerHTML = `
     <div id="no-trash-popup" class="no-trash-element">
      <h1>${domain} isn't in any of your whitelists!</h1>
      <p>
        Add to
        <select id="save-to-no-trash-whitelist-id">
        ${whitelists.map((w) => `{ <option value=${w.id}>${w.name}</option>}`)}
        </select>
      </p>
      <button id="no-trash-save-btn">Save</button>
      <button id="no-trash-close-btn" class="light">Ignore Domain</button>
    </div>
  `;

    document
      .getElementById("no-trash-save-btn")
      .addEventListener("click", function () {
        saveNoTrashDomain(domain);
      });
    document
      .getElementById("no-trash-close-btn")
      .addEventListener("click", function () {
        closeNoTrashAlert(domain, true);
      });
  });
}

function saveNoTrashDomain(domain) {
  const whitelistId = document.getElementById(
    "save-to-no-trash-whitelist-id"
  ).value;
  getNoTrashToken((token) => {
    fetch(
      `https://beta.notrashsearch.com/api/v1/whitelists/${whitelistId}/items`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify({ whitelistId: whitelistId, urls: [domain] }),
      }
    );
    closeNoTrashAlert(domain, false);
  });
}

function closeNoTrashAlert(url, trash) {
  document.getElementById("no-trash-popup").style.display = "none";
  const key = trash ? "yes-trash-URLs" : "no-trash-URLs";
  chrome.storage.sync.get([key], function (result) {
    let yesTrashURLs;
    if (Array.isArray(result[key])) {
      yesTrashURLs = result[key];
    } else {
      yesTrashURLs = [];
    }
    let value = {};
    value[key] = yesTrashURLs.concat([url]); // use variable `key` as key.
    chrome.storage.sync.set(value);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("no-trash-close-btn")
    .addEventListener("click", closeAlert);

  load();
});
