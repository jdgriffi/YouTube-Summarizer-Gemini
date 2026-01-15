// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Set side panel for YouTube tabs
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    chrome.sidePanel.setOptions({
      tabId: tabId,
      path: 'sidepanel.html',
      enabled: true
    });
  }
});

// Listen for API key saved message and notify sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'apiKeySaved') {
    // The storage.onChanged listener in sidepanel.js should handle this
    // But we can also send a message to refresh
    console.log('API key saved, sidepanel should refresh');
  }
  return true;
});

