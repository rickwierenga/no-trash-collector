function getNoTrashToken(callback) {
  chrome.storage.sync.get(["no-trash-token"], function (result) {
    callback(result["no-trash-token"]);
  });
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  fetch("https://beta.notrashsearch.com/auth/token", {
    method: "POST",
    body: JSON.stringify({ username: username, password: password }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => r.json())
    .then((r) => chrome.storage.sync.set({ "no-trash-token": r.token }))
    .then(() => load());
}

function load() {
  document.getElementById("account").style.display = "none";

  getNoTrashToken((token) => {
    if (token !== null && token !== undefined) {
      fetch("https://beta.notrashsearch.com/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.user !== undefined) {
            document.getElementById("login").style.display = "none";
            document.getElementById("account").style.display = "block";
            document.getElementById("login-message").style.display = "none";

            document.getElementById("username-holder").innerText =
              r.user.username;
            document
              .getElementById("username-holder")
              .setAttribute(
                "href",
                `https://beta.notrashsearch.com/u/${r.user.username}`
              );

            refresh();
          }
        })
        .catch((_) => {
          chrome.storage.sync.set({ "no-trash-token": null });
        });
    }
  });
}

function refresh() {
  getNoTrashToken((token) => {
    fetch("https://beta.notrashsearch.com/api/v1/whitelists", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((r) => {
        chrome.storage.sync.set({
          "no-trash-whitelists": r.whitelists,
        });

        let urls = [];
        for (var i = 0; i < r.whitelists.length; i++) {
          const whitelist = r.whitelists[i];
          urls = urls.concat(whitelist.items.map((wi) => wi.url));
        }

        // Change default popup.
        chrome.action.setPopup({ popup: "popup_logged_in.html" });

        chrome.storage.sync.set({
          "no-trash-URLs": urls,
        });
      });
  });
}

function logout() {
  chrome.storage.sync.set({ "no-trash-token": null }, load);
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("logout-btn").addEventListener("click", logout);

  load();
});
