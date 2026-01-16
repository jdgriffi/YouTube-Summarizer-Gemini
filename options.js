// Load and save API key and theme

const apiKeyInput = document.getElementById('apiKey');
const themeSelect = document.getElementById('themeSelect');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');
const whatIsApiKey = document.getElementById('whatIsApiKey');
const apiKeyModal = document.getElementById('apiKeyModal');
const closeModal = document.getElementById('closeModal');

// Load saved settings on page load
chrome.storage.sync.get(['geminiApiKey', 'theme'], async (result) => {
  if (result.geminiApiKey) {
    apiKeyInput.value = result.geminiApiKey;
  }
  
  // Load and apply theme
  const themeId = result.theme || 'midnight';
  themeSelect.value = themeId;
  applyTheme(themeId);
});

// Theme selector change handler
themeSelect.addEventListener('change', (e) => {
  applyTheme(e.target.value);
});

// Save settings
saveBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const themeId = themeSelect.value;
  
  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({ 
      geminiApiKey: apiKey,
      theme: themeId
    });
    showStatus('Settings saved successfully!', 'success');
    
    // Apply theme immediately
    applyTheme(themeId);
    
    // Refresh the sidepanel if it's open
    chrome.runtime.sendMessage({ action: 'settingsSaved' });
  } catch (err) {
    console.error('Error saving settings:', err);
    showStatus('Error saving settings. Please try again.', 'error');
  }
});

// Modal handlers
if (whatIsApiKey) {
  whatIsApiKey.addEventListener('click', (e) => {
    e.preventDefault();
    if (apiKeyModal) {
      apiKeyModal.classList.remove('hidden');
    }
  });
}

if (closeModal) {
  closeModal.addEventListener('click', () => {
    if (apiKeyModal) {
      apiKeyModal.classList.add('hidden');
    }
  });
}

// Close modal when clicking outside
if (apiKeyModal) {
  apiKeyModal.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) {
      apiKeyModal.classList.add('hidden');
    }
  });
}

function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }
}

