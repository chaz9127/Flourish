import { createRoot } from 'react-dom/client';
import Overlay from './overlay';
import { PORT_NAMES } from '../shared/constants';

// Create overlay container
const overlayContainer = document.createElement('div');
overlayContainer.id = 'flourish-overlay-root';
document.body.appendChild(overlayContainer);

// Render React component
const root = createRoot(overlayContainer);
root.render(<Overlay />);

// Maintain connection to keep background worker alive
let port: chrome.runtime.Port | null = null;

function connectToBackground() {
  try {
    port = chrome.runtime.connect({ name: PORT_NAMES.KEEP_ALIVE });

    port.onDisconnect.addListener(() => {
      console.log('Disconnected from background, reconnecting in 1 second...');
      port = null;

      // Reconnect after 1 second
      setTimeout(connectToBackground, 1000);
    });

    console.log('Connected to background service worker');
  } catch (error) {
    console.error('Failed to connect to background:', error);

    // Retry after 1 second
    setTimeout(connectToBackground, 1000);
  }
}

// Initial connection
connectToBackground();

console.log('Flourish content script loaded');
