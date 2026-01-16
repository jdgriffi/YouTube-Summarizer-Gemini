// Theme definitions for YouTube Summarizer

const themes = {
  midnight: {
    name: 'Dark Mode',
    colors: {
      bg: '#000000',
      card: '#1c1c1e',
      cardSecondary: '#2c2c2e',
      text: '#ffffff',
      textSecondary: '#a1a1a6',
      textMuted: '#8e8e93',
      border: 'rgba(255,255,255,0.1)',
      header: 'linear-gradient(180deg, #1c1c1e 0%, #000000 100%)',
      primary: 'linear-gradient(180deg, #ffffff 0%, #f2f2f7 100%)',
      primaryText: '#000000',
      primaryHover: 'linear-gradient(180deg, #ffffff 0%, #e5e5ea 100%)',
      accent: '#64d2ff',
      error: '#ff453a',
      success: '#34c759',
      sliderBg: '#2c2c2e',
      sliderThumb: 'linear-gradient(180deg, #ffffff 0%, #d1d1d6 100%)',
      radioSelected: 'linear-gradient(180deg, #48484a 0%, #3a3a3c 100%)',
      shadow: 'rgba(0,0,0,0.5)'
    }
  },
  classic: {
    name: 'Classic',
    colors: {
      bg: '#F8F8F8',
      card: '#ffffff',
      cardSecondary: '#f0f0f0',
      text: '#1a1a1a',
      textSecondary: '#666666',
      textMuted: '#808080',
      border: '#d0d0d0',
      header: 'linear-gradient(180deg, #e8e8e8 0%, #F8F8F8 100%)',
      headerText: '#1a1a1a',
      primary: '#005FB8',
      primaryText: '#F7FFFF',
      primaryHover: '#0066cc',
      accent: '#005FB8',
      headingColor: '#005FB8',
      boldColor: '#ff8c00',
      error: '#d32f2f',
      success: '#388e3c',
      sliderBg: '#e0e0e0',
      sliderThumb: '#005FB8',
      radioSelected: '#005FB8',
      radioSelectedText: '#F7FFFF',
      shadow: 'rgba(0, 95, 184, 0.2)'
    }
  }
};

// Apply theme to page
function applyTheme(themeId) {
  const theme = themes[themeId] || themes.midnight;
  const root = document.documentElement;
  const c = theme.colors;
  
  root.style.setProperty('--theme-bg', c.bg);
  root.style.setProperty('--theme-card', c.card);
  root.style.setProperty('--theme-card-secondary', c.cardSecondary);
  root.style.setProperty('--theme-text', c.text);
  root.style.setProperty('--theme-text-secondary', c.textSecondary);
  root.style.setProperty('--theme-text-muted', c.textMuted);
  root.style.setProperty('--theme-border', c.border);
  root.style.setProperty('--theme-header', c.header);
  root.style.setProperty('--theme-header-text', c.headerText || c.text);
  root.style.setProperty('--theme-heading-color', c.headingColor || c.accent);
  root.style.setProperty('--theme-bold-color', c.boldColor || c.text);
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-primary-text', c.primaryText);
  root.style.setProperty('--theme-primary-hover', c.primaryHover);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-error', c.error);
  root.style.setProperty('--theme-success', c.success);
  root.style.setProperty('--theme-slider-bg', c.sliderBg);
  root.style.setProperty('--theme-slider-thumb', c.sliderThumb);
  root.style.setProperty('--theme-radio-selected', c.radioSelected);
  root.style.setProperty('--theme-radio-selected-text', c.radioSelectedText || c.text);
  root.style.setProperty('--theme-shadow', c.shadow);
  
  // Also apply to body for immediate effect
  document.body.style.backgroundColor = c.bg;
  document.body.style.color = c.text;
}

// Get current theme
async function getCurrentTheme() {
  const result = await chrome.storage.sync.get(['theme']);
  return result.theme || 'midnight';
}

// Set theme
async function setTheme(themeId) {
  await chrome.storage.sync.set({ theme: themeId });
  applyTheme(themeId);
}

