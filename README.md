# Flourish - Productivity Tracker Chrome Extension

Track your productivity while browsing with real-time scoring based on website categorization.

## Features

- 📊 **Real-time Score Tracking**: Score updates every second based on active browser tab
- ✅ **Website Categorization**: Mark websites as productive (+1/sec) or unproductive (-1/sec)
- 🎯 **Floating Overlay**: Live score display in bottom-right corner (toggleable)
- 🔄 **Daily Reset**: Score automatically resets at midnight
- 💾 **Persistent Storage**: All data stored locally using chrome.storage.local
- ⚛️ **Modern Stack**: Built with React 19, TypeScript, and Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Chrome browser

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the extension**:

   For development (with hot reload):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm run build
   ```

3. **Load extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Creating Icons

The extension requires icons in three sizes: 16x16, 48x48, and 128x128 pixels.

**Temporary Solution**: For testing, you can create simple placeholder icons:
1. Create PNG files with the required dimensions
2. Use a solid color or simple design
3. Name them `icon16.png`, `icon48.png`, and `icon128.png`
4. Place them in `public/icons/`

**Recommended Tools**:
- [Figma](https://figma.com) - Free design tool
- [Inkscape](https://inkscape.org) - Free vector graphics editor
- [GIMP](https://gimp.org) - Free image editor

**Icon Design Tips**:
- Use a simple, recognizable symbol (e.g., graph, chart, productivity symbol)
- Ensure good contrast for visibility
- Keep design consistent across all sizes

## Usage

### Popup Interface

Click the extension icon to open the popup where you can:
- View your current score
- Toggle the floating overlay on/off
- Add websites to productive/unproductive lists
- Remove websites from lists

### Website Categorization

**Productive Sites** (+1 point per second):
- Sites that help you work or learn
- Examples: github.com, stackoverflow.com, docs.google.com

**Unproductive Sites** (-1 point per second):
- Sites that distract you
- Examples: facebook.com, reddit.com, youtube.com

**Neutral Sites** (no points):
- Any site not in either list

### Score Tracking

- Score updates every second based on the active browser tab
- Only the currently active tab affects your score
- Score persists throughout the day
- Automatically resets to 0 at midnight (local time)

### Floating Overlay

- Shows live score in bottom-right corner
- Updates in real-time
- Green background for positive scores, red for negative
- Can be toggled on/off from the popup

## Development

### Project Structure

```
flourish/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons
├── src/
│   ├── background/
│   │   └── service-worker.ts  # Background scoring logic
│   ├── content/
│   │   ├── index.tsx          # Content script entry
│   │   └── overlay.tsx        # Floating overlay component
│   ├── popup/
│   │   ├── popup.html         # Popup HTML
│   │   ├── index.tsx          # Popup entry
│   │   ├── Popup.tsx          # Main popup component
│   │   └── components/        # Popup sub-components
│   ├── shared/
│   │   ├── constants.ts       # Constants (storage keys, etc.)
│   │   ├── types.ts           # TypeScript types
│   │   ├── storage.ts         # Storage utilities
│   │   ├── messaging.ts       # Message passing utilities
│   │   └── utils.ts           # Utility functions
│   └── styles/
│       ├── popup.css          # Popup styles
│       └── overlay.css        # Overlay styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Technology Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **@crxjs/vite-plugin**: Chrome extension bundling
- **Chrome Manifest V3**: Latest extension API

### Key Architecture Decisions

1. **Persistent Port Connection**: Used to keep background service worker alive for 1-second score updates (Chrome alarms have 1-minute minimum)
2. **Constants for String Literals**: All storage keys and message types defined as constants to prevent typos
3. **Message Passing**: Communication between background, content scripts, and popup using Chrome messaging API
4. **React Hooks**: State management using useState and useEffect
5. **Type Safety**: Full TypeScript coverage with strict mode

## Testing

### Manual Testing Checklist

**Background Worker**:
- [ ] Service worker loads without errors
- [ ] Score updates every second on categorized sites
- [ ] Active tab tracking works correctly

**Scoring Logic**:
- [ ] Productive sites increase score (+1/sec)
- [ ] Unproductive sites decrease score (-1/sec)
- [ ] Neutral sites don't change score
- [ ] Score persists within the same day

**Day Reset**:
- [ ] Score resets at midnight
- [ ] Scoring continues normally after reset

**Popup UI**:
- [ ] Displays current score
- [ ] Can add/remove websites
- [ ] Overlay toggle works
- [ ] UI updates in real-time

**Floating Overlay**:
- [ ] Shows correct score
- [ ] Updates every second
- [ ] Color changes based on score
- [ ] Can be toggled on/off

### Debugging

**Background Service Worker**:
1. Open `chrome://extensions/`
2. Click "service worker" under your extension
3. View console logs and debug

**Popup**:
1. Right-click the extension icon
2. Select "Inspect"
3. Debug in DevTools

**Content Script**:
1. Open DevTools on any page (F12)
2. Check Console for content script logs

**Storage**:
```javascript
// View storage in console
chrome.storage.local.get(null, console.log);

// Clear storage
chrome.storage.local.clear();
```

## Known Limitations

- Chrome alarms have a 1-minute minimum interval in production, so we use persistent port connections for 1-second updates
- Extension requires active connection to keep background worker alive
- Doesn't track time when browser is closed

## Future Enhancements

- Draggable overlay
- Statistics page (daily/weekly/monthly trends)
- Goals and streaks
- Custom categories
- Time tracking
- Data export (CSV)
- Notifications
- Keyboard shortcuts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
