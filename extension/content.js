chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message) return;
    if (message.type === "GET_SELECTION") {
        const selection = window.getSelection();
        const text = selection ? selection.toString() : "";
        sendResponse({ text });
        return;
    }
});
