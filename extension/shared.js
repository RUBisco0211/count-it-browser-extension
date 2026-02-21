function computeStats(text) {
    const totalChars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const hanChars = (text.match(/[\p{Script=Han}]/gu) || []).length;
    const latinChars = (text.match(/[A-Za-z]/g) || []).length;
    const digitCount = (text.match(/[0-9]/g) || []).length;
    const punctCount = (
        text.match(/[.,!?;:'"“”‘’、，。！？；：…—（）【】《》·]/g) || []
    ).length;
    const nonChineseWords = (
        text.match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g) || []
    ).filter(Boolean).length;

    return {
        charsNoSpace,
        charsWithSpace: totalChars,
        latinChars,
        digitCount,
        punctCount,
        nonChineseWords,
        hanChars,
        text,
    };
}

function getSelectionFromTabMessage(tabId) {
    return new Promise((resolve) => {
        if (!tabId) {
            resolve("");
            return;
        }
        chrome.tabs.sendMessage(
            tabId,
            { type: "GET_SELECTION" },
            (response) => {
                if (chrome.runtime.lastError) {
                    resolve("");
                    return;
                }
                resolve((response && response.text) || "");
            },
        );
    });
}
