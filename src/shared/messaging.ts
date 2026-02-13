import { MessageType } from './constants';
import { Message, MessagePayload } from './types';

// Send a message to the background script
export function sendMessage<T extends MessageType>(
  type: T,
  payload?: MessagePayload[T]
): Promise<any> {
  return new Promise((resolve, reject) => {
    const message: Message<T> = { type, payload };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Send a message to a specific tab
export async function sendMessageToTab<T extends MessageType>(
  tabId: number,
  type: T,
  payload?: MessagePayload[T]
): Promise<void> {
  const message: Message<T> = { type, payload };
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // Ignore errors (tab might not have content script)
    console.debug(`Failed to send message to tab ${tabId}:`, error);
  }
}

// Broadcast a message to all tabs
export async function broadcastMessage<T extends MessageType>(
  type: T,
  payload?: MessagePayload[T]
): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const message: Message<T> = { type, payload };

  await Promise.allSettled(
    tabs.map((tab) => {
      if (tab.id) {
        return chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors
        });
      }
    })
  );
}

// Type guard for messages
export function isMessage<T extends MessageType>(
  message: any,
  type: T
): message is Message<T> {
  return message && message.type === type;
}
