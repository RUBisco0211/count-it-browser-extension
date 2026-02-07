const elements = {
    stats: document.getElementById("stats"),
    subtitle: document.getElementById("subtitle"),
    hint: document.getElementById("hint"),
    charsNoSpace: document.getElementById("charsNoSpace"),
    charsWithSpace: document.getElementById("charsWithSpace"),
    latinChars: document.getElementById("latinChars"),
    digitCount: document.getElementById("digitCount"),
    punctCount: document.getElementById("punctCount"),
    nonChineseWords: document.getElementById("nonChineseWords"),
    hanChars: document.getElementById("hanChars"),
    previewText: document.getElementById("previewText"),
};

function render(stats) {
    const hasText = stats && stats.text && stats.text.length > 0;
    const safeStats = stats || {
        charsNoSpace: 0,
        charsWithSpace: 0,
        latinChars: 0,
        digitCount: 0,
        punctCount: 0,
        nonChineseWords: 0,
        hanChars: 0,
        text: "",
    };

    elements.charsNoSpace.textContent = safeStats.charsNoSpace ?? 0;
    elements.charsWithSpace.textContent = safeStats.charsWithSpace ?? 0;
    elements.latinChars.textContent = safeStats.latinChars ?? 0;
    elements.digitCount.textContent = safeStats.digitCount ?? 0;
    elements.punctCount.textContent = safeStats.punctCount ?? 0;
    elements.nonChineseWords.textContent = safeStats.nonChineseWords ?? 0;
    elements.hanChars.textContent = safeStats.hanChars ?? 0;
    elements.previewText.textContent = safeStats.text || "（无选中文本）";
    elements.hint.textContent = hasText
        ? "已获取当前选中文本。"
        : "未选中文字，以下为 0。";
    elements.subtitle.textContent = "选中文字后右键统计";
}

function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs && tabs.length ? tabs[0] : null);
        });
    });
}

function getSelectionFromTab(tabId) {
    return new Promise((resolve) => {
        if (!tabId) {
            resolve("");
            return;
        }
        getSelectionFromTabMessage(tabId).then((messageText) => {
            if (messageText) {
                resolve(messageText);
                return;
            }
            chrome.scripting.executeScript(
                {
                    target: { tabId },
                    func: () => {
                        const sel = window.getSelection();
                        return sel ? sel.toString() : "";
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
    });
}

async function loadStats() {
    const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "POPUP_GET_STATS" }, (res) =>
            resolve(res),
        );
    });

    if (response && response.stats && response.stats.text) {
        render(response.stats);
        return;
    }

    const tab = await getActiveTab();
    const selection = await getSelectionFromTab(tab ? tab.id : null);
    render(computeStats(selection));
}

loadStats();
