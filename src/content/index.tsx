import { createRoot } from 'react-dom/client';
import Overlay from './overlay';
import { PORT_NAMES, SCORE_INTERVAL } from '../shared/constants';

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
    // Check if extension context is still valid before attempting connection
    if (!chrome.runtime?.id) {
      console.warn('Extension context invalidated. Please reload the page to reconnect.');
      return;
    }

    port = chrome.runtime.connect({ name: PORT_NAMES.KEEP_ALIVE });

    port.onDisconnect.addListener(() => {
      // Check if disconnection is due to extension context invalidation
      if (chrome.runtime.lastError) {
        const errorMessage = chrome.runtime.lastError.message || '';
        if (errorMessage.includes('Extension context invalidated')) {
          console.warn('Extension context invalidated. Please reload the page to reconnect.');
          port = null;
          return;
        }
      }

      console.log(`Disconnected from background, reconnecting in ${SCORE_INTERVAL}ms...`);
      port = null;

      // Reconnect after the SCORE_INTERVAL
      setTimeout(connectToBackground, SCORE_INTERVAL);
    });

    console.log('Connected to background service worker');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Don't retry if extension context is invalidated
    if (errorMessage.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated. Please reload the page to reconnect.');
      return;
    }

    console.error('Failed to connect to background:', error);

    // Retry after the SCORE_INTERVAL for other errors
    setTimeout(connectToBackground, SCORE_INTERVAL);
  }
}

// Initial connection
connectToBackground();

console.log('Flourish content script loaded');
