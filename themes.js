// Theme definitions for YouTube Summarizer

const themes = {
  midnight: {
    name: 'Midnight',
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
  ocean: {
    name: 'Ocean',
    colors: {
      bg: '#0a1929',
      card: '#132f4c',
      cardSecondary: '#1e4976',
      text: '#ffffff',
      textSecondary: '#b2d4ff',
      textMuted: '#8bb4e8',
      border: 'rgba(100, 181, 246, 0.2)',
      header: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      primary: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
      primaryText: '#ffffff',
      primaryHover: 'linear-gradient(135deg, #5bb5f5 0%, #2e96e5 100%)',
      accent: '#64b5f6',
      error: '#ef5350',
      success: '#66bb6a',
      sliderBg: '#1e4976',
      sliderThumb: '#42a5f5',
      radioSelected: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
      shadow: 'rgba(25, 118, 210, 0.3)'
    }
  },
  crimson: {
    name: 'Crimson',
    colors: {
      bg: '#1a0000',
      card: '#2d1b1b',
      cardSecondary: '#3d2525',
      text: '#ffffff',
      textSecondary: '#ffb3b3',
      textMuted: '#ff9999',
      border: 'rgba(255, 82, 82, 0.2)',
      header: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
      primary: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
      primaryText: '#ffffff',
      primaryHover: 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)',
      accent: '#ff6b6b',
      error: '#ff5252',
      success: '#66bb6a',
      sliderBg: '#3d2525',
      sliderThumb: '#f44336',
      radioSelected: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
      shadow: 'rgba(211, 47, 47, 0.3)'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      bg: '#0d1b0d',
      card: '#1b2e1b',
      cardSecondary: '#2d3e2d',
      text: '#ffffff',
      textSecondary: '#b8e6b8',
      textMuted: '#9dd19d',
      border: 'rgba(76, 175, 80, 0.2)',
      header: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
      primary: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      primaryText: '#ffffff',
      primaryHover: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
      accent: '#81c784',
      error: '#ef5350',
      success: '#66bb6a',
      sliderBg: '#2d3e2d',
      sliderThumb: '#4caf50',
      radioSelected: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      shadow: 'rgba(56, 142, 60, 0.3)'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      bg: '#1a0d1a',
      card: '#2d1b2d',
      cardSecondary: '#3d2a3d',
      text: '#ffffff',
      textSecondary: '#ffb3e6',
      textMuted: '#ff99d9',
      border: 'rgba(156, 39, 176, 0.2)',
      header: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      primary: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
      primaryText: '#ffffff',
      primaryHover: 'linear-gradient(135deg, #ba68c8 0%, #ab47bc 100%)',
      accent: '#ce93d8',
      error: '#ef5350',
      success: '#66bb6a',
      sliderBg: '#3d2a3d',
      sliderThumb: '#ab47bc',
      radioSelected: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
      shadow: 'rgba(156, 39, 176, 0.3)'
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
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-primary-text', c.primaryText);
  root.style.setProperty('--theme-primary-hover', c.primaryHover);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-error', c.error);
  root.style.setProperty('--theme-success', c.success);
  root.style.setProperty('--theme-slider-bg', c.sliderBg);
  root.style.setProperty('--theme-slider-thumb', c.sliderThumb);
  root.style.setProperty('--theme-radio-selected', c.radioSelected);
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

