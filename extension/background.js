importScripts("shared.js");

const MENU_ID = "count-it-count";
const OPEN_POPUP_COMMAND = "open-count-popup";
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
    const stats = await computeStatsForTab(info.tabId, info.selectionText || "");
    lastStats = stats;
    if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup();
    }
});

chrome.commands.onCommand.addListener(async (command) => {
    if (command !== OPEN_POPUP_COMMAND) return;
    const activeTab = await getActiveTab();
    const stats = await computeStatsForTab(activeTab ? activeTab.id : null, "");
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
    if (message.type === "POPUP_GET_OR_COMPUTE_STATS") {
        const payload = lastStats;
        lastStats = null;
        if (payload) {
            sendResponse({ stats: payload });
            return;
        }
        getActiveTab()
            .then((tab) => computeStatsForTab(tab ? tab.id : null, ""))
            .then((stats) => sendResponse({ stats }))
            .catch(() => sendResponse({ stats: computeStats("") }));
        return true;
    }
});

function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs && tabs.length ? tabs[0] : null);
        });
    });
}

async function computeStatsForTab(tabId, fallbackText) {
    let text = fallbackText || "";
    if (!text && tabId) {
        text = await getSelectionText(tabId);
    }
    return computeStats(text);
}

async function getSelectionText(tabId) {
    const messageText = await getSelectionFromTabMessage(tabId);
    if (messageText) {
        return messageText;
    }

    return new Promise((resolve) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                func: () => {
                    const selection = window.getSelection();
                    const selectedText = selection ? selection.toString() : "";
                    if (selectedText) {
                        return selectedText;
                    }

                    const activeElement = document.activeElement;
                    if (
                        activeElement &&
                        (activeElement.tagName === "TEXTAREA" ||
                            (activeElement.tagName === "INPUT" &&
                                /^(?:text|search|url|tel|password)$/i.test(
                                    activeElement.type || "",
                                )))
                    ) {
                        const start = activeElement.selectionStart;
                        const end = activeElement.selectionEnd;
                        if (
                            typeof start === "number" &&
                            typeof end === "number" &&
                            end > start
                        ) {
                            return activeElement.value.slice(start, end);
                        }
                    }

                    return "";
                },
            },
            (results) => {
                if (chrome.runtime.lastError || !results || !results.length) {
                    resolve("");
                    return;
                }
                resolve(results[0].result || "");
            },
        );
    });
}
