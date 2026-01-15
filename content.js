// Content script for YouTube pages
console.log('YouTube Summarizer content script active');

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVideoDetails') {
    // Get the title from the page H1, or fallback to document title
    let title = document.querySelector('h1.ytd-video-primary-info-renderer, h1.style-scope.ytd-watch-metadata')?.innerText || document.title;
    
    // Clean the title: remove notification counts like (1,595) and the " - YouTube" suffix
    title = title.replace(/^\(\d+,?\d*\+?\)\s*/, '').replace(/\s*-\s*YouTube$/, '');

    const videoDetails = {
      title: title,
      description: document.querySelector('#description-inner')?.innerText || '',
      url: window.location.href,
      transcript: null
    };

    // Note: Scaping transcripts directly from the UI is more reliable if the transcript panel is open,
    // but we'll start by encouraging the AI to be honest and using metadata.
    // To truly get the transcript word-for-word, we would ideally use a transcript API.
    
    sendResponse(videoDetails);
  }
  return true;
});
