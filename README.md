# YouTube Summarizer with Gemini

A Chrome extension that uses Google's Gemini AI to summarize YouTube videos.

## Features

- One-click video summarization
- Side panel interface for easy access
- Google OAuth authentication (no API key needed!)
- Clean, modern UI
- Optional API key fallback

## Setup

1. **Install the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select this folder

2. **Sign In**
   - Click the extension icon in the toolbar
   - Click "Sign in with Google"
   - Authorize the extension with your Google account

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in the toolbar
3. If not signed in, click "Sign in with Google"
4. Click "Summarize Video"
5. Wait for the summary to appear in the side panel

## Advanced: API Key (Optional)

If OAuth authentication doesn't work, you can use an API key as a fallback:

1. Get a Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the settings (⚙️) button in the sidebar
3. Enter your API key in the optional field
4. Click "Save"

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker for side panel management
- `sidepanel.html/css/js` - Main UI interface with OAuth
- `options.html/css/js` - Settings page (optional API key)
- `content.js` - Content script (for future enhancements)

## Notes

- The extension uses Chrome's identity API for OAuth authentication
- If OAuth fails, the extension will automatically fall back to API key (if configured)
- The extension requires an active internet connection
- API usage may be subject to Google's rate limits

