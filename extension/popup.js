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

async function loadStats() {
    const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "POPUP_GET_OR_COMPUTE_STATS" }, (res) =>
            resolve(res),
        );
    });
    render((response && response.stats) || computeStats(""));
}

loadStats();
