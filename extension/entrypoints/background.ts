export default defineBackground(() => {
  browser.contextMenus.create({
    id: "save-to-memoire",
    title: "Save to memoire",
    contexts: ["page", "link"]
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-memoire") {
      const url = info.linkUrl || info.pageUrl;
      const { apiToken } = await browser.storage.local.get("apiToken");
      if (url && apiToken) {
        saveBookmark(url, apiToken);
      } else {
        console.error("Missing URL or API token");
      }
    }
  });
});

async function saveBookmark(url: string, token: string) {
  try {
    const res = await fetch("http://localhost:3000/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ url })
    });
    if (res.ok) {
      console.log("Successfully saved bookmark");
    } else {
      console.error("Failed to save bookmark", await res.text());
    }
  } catch (e) {
    console.error("Error saving bookmark", e);
  }
}
