// Get current YouTube video URL and send to Gemini for summarization

const summarizeBtn = document.getElementById('summarizeBtn');
const summaryContainer = document.getElementById('summaryContainer');
const summary = document.getElementById('summary');
const error = document.getElementById('error');
const status = document.getElementById('status');
const settingsBtn = document.getElementById('settingsBtn');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authInfo = document.getElementById('authInfo');
const userEmail = document.getElementById('userEmail');
const apiKeyInfo = document.getElementById('apiKeyInfo');
const refreshBtn = document.getElementById('refreshBtn');
const copyBtn = document.getElementById('copyBtn');
const fontSizeSlider = document.getElementById('fontSizeSlider');

let accessToken = null;
let currentSummaryRaw = ''; // To store text without HTML for copying

// Open settings page
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Refresh button
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    console.log('Manual refresh triggered');
    checkAuthStatus();
  });
}

// Font size slider
if (fontSizeSlider) {
  fontSizeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    const sizes = {
      '1': '12px',
      '2': '14px',
      '3': '16px',
      '4': '18px',
      '5': '20px'
    };
    document.documentElement.style.setProperty('--summary-font-size', sizes[value]);
    
    // Save preference
    chrome.storage.sync.set({ summaryFontSize: value });
  });
}

// Check authentication status on load
function init() {
  console.log('Sidepanel loaded');
  console.log('Elements found:', {
    signInBtn: !!signInBtn,
    summarizeBtn: !!summarizeBtn,
    apiKeyInfo: !!apiKeyInfo
  });
  
  // Load theme preference
  chrome.storage.sync.get(['theme'], (result) => {
    const themeId = result.theme || 'midnight';
    applyTheme(themeId);
  });
  
  // Load font size preference
  chrome.storage.sync.get(['summaryFontSize'], (result) => {
    if (result.summaryFontSize) {
      fontSizeSlider.value = result.summaryFontSize;
    } else {
      // Default to medium (3)
      fontSizeSlider.value = '3';
    }
    
    const sizes = {
      '1': '12px',
      '2': '14px',
      '3': '16px',
      '4': '18px',
      '5': '20px'
    };
    document.documentElement.style.setProperty('--summary-font-size', sizes[fontSizeSlider.value]);
  });
  
  // Initial check
  checkAuthStatus();
  
  // Listen for storage changes (e.g., when API key or theme is saved)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('Storage changed:', changes, areaName);
    if (areaName === 'sync') {
      if (changes.geminiApiKey) {
        console.log('API key updated, refreshing auth status');
        checkAuthStatus();
      }
      if (changes.theme) {
        console.log('Theme updated, applying new theme');
        applyTheme(changes.theme.newValue || 'midnight');
      }
    }
  });
  
  // Also check periodically in case storage sync is delayed
  setTimeout(() => {
    console.log('Rechecking auth status after delay');
    checkAuthStatus();
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Sign in with Google
signInBtn.addEventListener('click', async () => {
  try {
    showStatus('Signing in...');
    signInBtn.disabled = true;
    
    const token = await signIn();
    if (token) {
      accessToken = token;
      await checkAuthStatus();
      hideStatus();
    } else {
      throw new Error('No token received');
    }
  } catch (err) {
    console.error('Sign in error:', err);
    const errorMsg = err.message || 'Failed to sign in. Please try again.';
    showError(errorMsg);
    hideStatus();
    // Show API key option if OAuth fails
    const result = await chrome.storage.sync.get(['geminiApiKey']);
    if (!result.geminiApiKey) {
      showError(errorMsg + ' You can also use an API key in settings.');
    }
  } finally {
    signInBtn.disabled = false;
  }
});

// Sign out
signOutBtn.addEventListener('click', async () => {
  try {
    if (accessToken) {
      await chrome.identity.removeCachedAuthToken({ token: accessToken });
    }
    accessToken = null;
    await checkAuthStatus();
  } catch (err) {
    console.error('Sign out error:', err);
  }
});

// Sign in using Chrome identity API
async function signIn() {
  // Request OAuth token
  // Note: Chrome identity API may require OAuth client ID configuration
  // If this doesn't work, users should use API key method instead
  console.log('Attempting to sign in...');
  
  try {
    // Check if identity API is available
    if (!chrome.identity || !chrome.identity.getAuthToken) {
      throw new Error('Chrome identity API not available');
    }
    
    const token = await chrome.identity.getAuthToken({
      interactive: true
    });
    
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      throw new Error('No authentication token received from Chrome');
    }
    
    return token;
  } catch (err) {
    console.error('OAuth error details:', err);
    
    // Provide helpful error message based on error type
    if (err.message && (err.message.includes('OAuth2') || err.message.includes('client_id'))) {
      throw new Error('OAuth requires setup. Please use API key in settings (⚙️ button) instead.');
    }
    
    if (err.message && err.message.includes('user_cancelled') || err.message.includes('canceled')) {
      throw new Error('Sign in was cancelled');
    }
    
    throw new Error(`Sign in failed: ${err.message || 'Unknown error. Try using API key in settings instead.'}`);
  }
}

// Check if user is authenticated or has API key
async function checkAuthStatus() {
  console.log('Checking auth status...');
  
  // First check for API key (primary method)
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  const apiKey = result.geminiApiKey;
  console.log('API key check:', apiKey ? `Found (length: ${apiKey.length})` : 'Not found');
  console.log('API key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
  
  if (apiKey && apiKey.trim().length > 0) {
    // User has API key, enable summarize button
    console.log('API key found, enabling summarize button');
    authInfo.classList.add('hidden');
    signInBtn.classList.add('hidden');
    if (apiKeyInfo) apiKeyInfo.classList.add('hidden');
    summarizeBtn.disabled = false;
    console.log('UI updated - summarize button should be enabled');
    return;
  }
  
  // If no API key, show the info message and try OAuth (experimental)
  apiKeyInfo.classList.remove('hidden');
  
  try {
    // Try to get cached token first
    try {
      accessToken = await chrome.identity.getAuthToken({
        interactive: false
      });
    } catch (err) {
      // No cached token
      accessToken = null;
    }
    
    if (accessToken) {
      // Get user info to display email
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (userInfo.ok) {
          const data = await userInfo.json();
          userEmail.textContent = `Signed in as ${data.email}`;
        } else {
          userEmail.textContent = 'Signed in';
        }
      } catch (err) {
        console.log('Could not fetch user info:', err);
        userEmail.textContent = 'Signed in';
      }
      
      authInfo.classList.remove('hidden');
      signInBtn.classList.add('hidden');
      summarizeBtn.disabled = false;
    } else {
      // No token, show sign in button
      authInfo.classList.add('hidden');
      signInBtn.classList.remove('hidden');
      summarizeBtn.disabled = true;
    }
  } catch (err) {
    // Error checking auth, show sign in button
    console.log('Error checking auth:', err);
    authInfo.classList.add('hidden');
    signInBtn.classList.remove('hidden');
    summarizeBtn.disabled = true;
    accessToken = null;
  }
}

// Get current YouTube video details from the content script
async function getVideoDetails() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || !tab.url.includes('youtube.com/watch')) {
    throw new Error('Please navigate to a YouTube video page');
  }

  try {
    // Try to get details from content script
    // Note: Content script may not be ready on all YouTube pages, so we have a fallback
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getVideoDetails' });
    if (response) {
      return response;
    }
  } catch (err) {
    // Content script not available - this is normal and we have a fallback
    // Silently use tab metadata instead
  }

  // Fallback to tab metadata
  let title = tab.title.replace(/^\(\d+,?\d*\+?\)\s*/, '').replace(/\s*-\s*YouTube$/, '');
  
  return {
    title: title,
    url: tab.url,
    description: ''
  };
}

// Get authentication (OAuth token or API key)
async function getAuth() {
  // First try API key (preferred method)
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  if (result.geminiApiKey) {
    return { type: 'apiKey', value: result.geminiApiKey };
  }
  
  // Fallback to OAuth token
  if (!accessToken) {
    // Try to get token interactively
    try {
      accessToken = await chrome.identity.getAuthToken({
        interactive: true
      });
    } catch (err) {
      throw new Error('Please configure an API key in settings (⚙️ button) or sign in with Google');
    }
  }
  
  if (!accessToken) {
    throw new Error('Please configure an API key in settings (⚙️ button)');
  }
  
  return { type: 'oauth', value: accessToken };
}

// Helper to generate the Gemini prompt based on video details and user options
function generatePrompt(videoDetails) {
  const detailInstruction = {
    'Short': 'Provide a very concise summary (1-2 paragraphs max) focusing only on the most critical takeaway.',
    'Medium': 'Provide a comprehensive summary with key points and main topics discussed.',
    'Long': 'Provide a very detailed summary, breaking down the video into sections, including specific examples, and capturing all important nuances.'
  }[videoDetails.detailLevel] || 'Provide a comprehensive summary.';

  return `Please provide a ${videoDetails.detailLevel} summary of this YouTube video. 
${detailInstruction}

Title: ${videoDetails.title}
URL: ${videoDetails.url}
${videoDetails.description ? `Description: ${videoDetails.description.substring(0, 1000)}` : ''}

Format the summary in a clear, readable way with appropriate headings and structure.`;
}

// Call Gemini API to summarize video using OAuth token
async function summarizeVideo(videoDetails, token) {
  const prompt = generatePrompt(videoDetails);

  const modelConfigs = [
    { version: 'v1beta', model: 'gemini-3-flash' },
    { version: 'v1', model: 'gemini-3-flash' },
    { version: 'v1beta', model: 'gemini-3-flash-preview' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-1.5-flash' }
  ];

  let lastError = null;

  for (const config of modelConfigs) {
    try {
      console.log(`Trying model (OAuth): ${config.model} (${config.version})...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.candidates[0].content.parts[0].text,
          model: config.model
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        // If OAuth doesn't work, try with API key as fallback
        if (response.status === 401 || response.status === 403) {
          const result = await chrome.storage.sync.get(['geminiApiKey']);
          if (result.geminiApiKey) {
            return summarizeVideoWithApiKey(videoDetails, result.geminiApiKey);
          }
        }
        
        lastError = errorData.error?.message || `API error: ${response.statusText}`;
        // Log to console for debugging but don't use warn/error to avoid cluttering extension management page
        console.log(`Model ${config.model} (${config.version}) not available: ${lastError}`);
        continue;
      }
    } catch (err) {
      lastError = err.message;
      console.log(`Fetch failed for ${config.model}: ${lastError}`);
      continue;
    }
  }

  // If all models failed, try API key fallback
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  if (result.geminiApiKey) {
    return summarizeVideoWithApiKey(videoDetails, result.geminiApiKey);
  }

  throw new Error(`Failed to find a working model. Last error: ${lastError}`);
}

// Fallback: Call Gemini API with API key
async function summarizeVideoWithApiKey(videoDetails, apiKey) {
  const prompt = generatePrompt(videoDetails);

  // Try different model names and API versions for Gemini 3 and 2
  const modelConfigs = [
    { version: 'v1beta', model: 'gemini-3-flash' },
    { version: 'v1', model: 'gemini-3-flash' },
    { version: 'v1beta', model: 'gemini-3-flash-preview' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-1.5-flash' }
  ];

  let lastError = null;
  
  for (const config of modelConfigs) {
    try {
      console.log(`Trying model: ${config.model} (${config.version})...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Success with model: ${config.model}`);
        return {
          text: data.candidates[0].content.parts[0].text,
          model: config.model
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `API error: ${response.statusText}`;
        // Use console.log instead of warn/error to avoid cluttering the Chrome Extension Errors page
        console.log(`Model ${config.model} (${config.version}) skipped: ${lastError}`);
        continue;
      }
    } catch (err) {
      lastError = err.message;
      console.log(`Fetch failed for ${config.model}: ${lastError}`);
      continue;
    }
  }

  throw new Error(`Failed to find a working model. Last error: ${lastError}. Please ensure Gemini 3 is enabled in your Google AI Studio project.`);
}

// Show error message
function showError(message) {
  error.textContent = message;
  error.classList.add('active');
  summaryContainer.classList.add('hidden');
  setTimeout(() => {
    error.classList.remove('active');
  }, 5000);
}

// Show status message
function showStatus(message) {
  status.textContent = message;
  status.classList.add('active');
}

function hideStatus() {
  status.classList.remove('active');
}

// Copy to clipboard
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    if (!currentSummaryRaw) return;
    
    try {
      // Create HTML and Plain Text blobs for the clipboard
      // This allows rich text editors like Google Docs to preserve formatting
      const htmlContent = summary.innerHTML;
      const plainTextContent = currentSummaryRaw;
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainTextContent], { type: 'text/plain' });
      
      const data = [new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })];
      
      await navigator.clipboard.write(data);
      
      // Visual feedback
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✅ Copied!';
      copyBtn.classList.add('success');
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('success');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback to plain text if ClipboardItem fails (some browsers/situations)
      try {
        await navigator.clipboard.writeText(currentSummaryRaw);
        showStatus('Copied (plain text only)');
      } catch (fallbackErr) {
        showError('Failed to copy to clipboard');
      }
    }
  });
}

// Simple markdown parser to convert Gemini's output to HTML
function parseMarkdown(text) {
  // Links: [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Headings (e.g., ### Heading)
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Handle numbered section titles (e.g., "3. Communication") as headings if they aren't already
  text = text.replace(/^(\d+\.\s+[A-Z].*$)/gm, '<h3>$1</h3>');

  // Horizontal Rule
  text = text.replace(/^---$/gim, '<hr>');
  
  // Split into lines to handle lists and paragraphs more carefully
  const lines = text.split('\n');
  let inList = false;
  let html = '';

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Check for list items
    const listMatch = trimmed.match(/^[\-\*]\s+(.*)$/);
    
    if (listMatch) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${listMatch[1]}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      
      if (trimmed) {
        // If it's not a tag already, wrap in a paragraph
        if (!trimmed.startsWith('<h') && !trimmed.startsWith('<hr') && !trimmed.startsWith('<ul') && !trimmed.startsWith('<li')) {
          html += `<p>${trimmed}</p>`;
        } else {
          html += trimmed;
        }
      }
    }
  }
  
  if (inList) html += '</ul>';
  
  return html;
}

// Handle summarize button click
summarizeBtn.addEventListener('click', async () => {
  summarizeBtn.disabled = true;
  summaryContainer.classList.add('hidden');
  error.classList.remove('active');
  
  // Get selected detail level
  const detailLevel = document.querySelector('input[name="detailLevel"]:checked').value;
  
  try {
    showStatus('Getting video details...');
    const videoDetails = await getVideoDetails();
    
    // Add detail level to videoDetails
    videoDetails.detailLevel = detailLevel;
    
    showStatus('Authenticating...');
    const auth = await getAuth();
    
    showStatus('Summarizing video... This may take a moment.');
    let result;
    if (auth.type === 'apiKey') {
      result = await summarizeVideoWithApiKey(videoDetails, auth.value);
    } else {
      result = await summarizeVideo(videoDetails, auth.value);
    }
    
    const { text: summaryText, model: modelUsed } = result;
    
    // Prepend the metadata as requested
    const labeledSummary = `# ${videoDetails.title}\n[YouTube Link](${videoDetails.url}) | **Detail Level:** ${detailLevel}\n**Summarized with:** ${modelUsed}\n\n---\n\n${summaryText}`;
    
    currentSummaryRaw = labeledSummary; // Save for copying
    summary.innerHTML = parseMarkdown(labeledSummary);
    summaryContainer.classList.remove('hidden');
    hideStatus();
  } catch (err) {
    console.error('Error:', err);
    showError(err.message || 'An error occurred while summarizing the video.');
    hideStatus();
  } finally {
    summarizeBtn.disabled = false;
  }
});

