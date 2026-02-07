importScripts("shared.js");

const MENU_ID = "count-it-count";
let lastStats = null;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: MENU_ID,
        title: "字数统计",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId !== MENU_ID) return;
    let selectionText = info.selectionText || "";
    if (!selectionText && info.tabId) {
        selectionText = await getSelectionFromTabMessage(info.tabId);
    }
    const stats = computeStats(selectionText);

    lastStats = stats;

    if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup();
    }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message) return;
    if (message.type === "POPUP_GET_STATS") {
        const payload = lastStats;
        lastStats = null;
        sendResponse({ stats: payload });
        return;
    }
});
