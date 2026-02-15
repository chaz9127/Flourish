import { MessageType, STORAGE_KEYS, PORT_NAMES, SCORE_INTERVAL, MAX_SCORE } from '../shared/constants';
import { getStorage, setStorage, getFullState, initializeStorage } from '../shared/storage';
import { broadcastMessage } from '../shared/messaging';
import { extractDomain, normalizeDomain, domainMatches } from '../shared/utils';
import type { Message } from '../shared/types';

// Track the interval ID
let intervalId: number | null = null;

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Flourish extension installed');
  await initializeStorage();
});

// Handle connections from content scripts to keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_NAMES.KEEP_ALIVE) {
    console.log('Content script connected, starting score tracker');

    // Start interval if not already running
    if (!intervalId) {
      intervalId = setInterval(updateScore, SCORE_INTERVAL) as unknown as number;
    }

    // Clean up when port disconnects
    port.onDisconnect.addListener(() => {
      console.log('Content script disconnected');
      // Note: We don't stop the interval immediately since other tabs might still be connected
      // The interval will continue running until the service worker is terminated
    });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    });

  // Return true to indicate we'll respond asynchronously
  return true;
});

// Main message handler
async function handleMessage(message: Message): Promise<any> {
  switch (message.type) {
    case MessageType.GET_STATE:
      return await getFullState();

    case MessageType.ADD_PRODUCTIVE_SITE:
      if (message.payload && 'domain' in message.payload) {
        await addSiteToList(STORAGE_KEYS.PRODUCTIVE_SITES, message.payload.domain);
      }
      break;

    case MessageType.REMOVE_PRODUCTIVE_SITE:
      if (message.payload && 'domain' in message.payload) {
        await removeSiteFromList(STORAGE_KEYS.PRODUCTIVE_SITES, message.payload.domain);
      }
      break;

    case MessageType.ADD_UNPRODUCTIVE_SITE:
      if (message.payload && 'domain' in message.payload) {
        await addSiteToList(STORAGE_KEYS.UNPRODUCTIVE_SITES, message.payload.domain);
      }
      break;

    case MessageType.REMOVE_UNPRODUCTIVE_SITE:
      if (message.payload && 'domain' in message.payload) {
        await removeSiteFromList(STORAGE_KEYS.UNPRODUCTIVE_SITES, message.payload.domain);
      }
      break;

    case MessageType.TOGGLE_OVERLAY:
      if (message.payload && 'enabled' in message.payload) {
        await setStorage(STORAGE_KEYS.OVERLAY_ENABLED, message.payload.enabled);
        await broadcastMessage(MessageType.OVERLAY_VISIBILITY_CHANGED, {
          enabled: message.payload.enabled,
        });
      }
      break;

    case MessageType.RESET_SCORE:
      await setStorage(STORAGE_KEYS.SCORE, 0);
      await setStorage(STORAGE_KEYS.PLANTS, []); // Clear plants on manual reset
      await setStorage(STORAGE_KEYS.LAST_UPDATED, Date.now());
      await broadcastScoreUpdate(0);
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
}

// Add a site to a list (productive or unproductive)
async function addSiteToList(
  listKey: typeof STORAGE_KEYS.PRODUCTIVE_SITES | typeof STORAGE_KEYS.UNPRODUCTIVE_SITES,
  domain: string
): Promise<void> {
  const normalizedDomain = normalizeDomain(domain);
  const currentList = await getStorage(listKey);

  // Check if already exists
  if (!currentList.includes(normalizedDomain)) {
    const updatedList = [...currentList, normalizedDomain];
    await setStorage(listKey, updatedList);
  }
}

// Remove a site from a list
async function removeSiteFromList(
  listKey: typeof STORAGE_KEYS.PRODUCTIVE_SITES | typeof STORAGE_KEYS.UNPRODUCTIVE_SITES,
  domain: string
): Promise<void> {
  const normalizedDomain = normalizeDomain(domain);
  const currentList = await getStorage(listKey);

  const updatedList = currentList.filter((site) => site !== normalizedDomain);
  await setStorage(listKey, updatedList);
}

// Main scoring update function (called every second)
async function updateScore(): Promise<void> {
  try {
    // 1. Check if it's a new day (reset if needed)
    await checkAndResetIfNewDay();

    // 2. Get active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.url) {
      return;
    }

    // Skip chrome:// and other internal pages
    if (
      activeTab.url.startsWith('chrome://') ||
      activeTab.url.startsWith('chrome-extension://') ||
      activeTab.url.startsWith('about:')
    ) {
      return;
    }

    // 3. Extract domain and determine score delta
    const domain = extractDomain(activeTab.url);
    if (!domain) {
      return;
    }

    const delta = await calculateScoreDelta(domain);

    if (delta === 0) {
      return; // Neutral site, no change
    }

    // 4. Update score with clamping (0-MAX_SCORE)
    const currentScore = await getStorage(STORAGE_KEYS.SCORE);
    const uncappedScore = currentScore + delta;
    const newScore = Math.max(0, Math.min(MAX_SCORE, uncappedScore)); // Clamp between 0 and MAX_SCORE

    await setStorage(STORAGE_KEYS.SCORE, newScore);
    await setStorage(STORAGE_KEYS.LAST_UPDATED, Date.now());

    // 5. Broadcast to all tabs
    await broadcastScoreUpdate(newScore);
  } catch (error) {
    console.error('Error updating score:', error);
  }
}

// Check if it's a new day and reset score if needed
async function checkAndResetIfNewDay(): Promise<void> {
  const lastResetDate = await getStorage(STORAGE_KEYS.LAST_RESET_DATE);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (lastResetDate !== today) {
    console.log(`New day detected. Resetting score. Last reset: ${lastResetDate}, Today: ${today}`);

    await setStorage(STORAGE_KEYS.SCORE, 0);
    await setStorage(STORAGE_KEYS.PLANTS, []); // Clear plants on new day
    await setStorage(STORAGE_KEYS.LAST_RESET_DATE, today);
    await setStorage(STORAGE_KEYS.LAST_UPDATED, Date.now());

    await broadcastScoreUpdate(0);
  }
}

// Calculate score delta based on domain categorization
async function calculateScoreDelta(domain: string): Promise<number> {
  const productiveSites = await getStorage(STORAGE_KEYS.PRODUCTIVE_SITES);
  const unproductiveSites = await getStorage(STORAGE_KEYS.UNPRODUCTIVE_SITES);

  const normalizedDomain = normalizeDomain(domain);

  // Check if domain matches any productive site
  if (productiveSites.some((site) => domainMatches(normalizedDomain, site))) {
    return 1; // Productive
  }

  // Check if domain matches any unproductive site
  if (unproductiveSites.some((site) => domainMatches(normalizedDomain, site))) {
    return -1; // Unproductive
  }

  return 0; // Neutral
}

// Broadcast score update to all tabs
async function broadcastScoreUpdate(score: number): Promise<void> {
  await broadcastMessage(MessageType.SCORE_UPDATE, { score });
}

console.log('Flourish background service worker loaded');
