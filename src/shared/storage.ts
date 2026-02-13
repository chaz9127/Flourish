import { STORAGE_KEYS } from './constants';
import { StorageSchema, DEFAULT_STORAGE } from './types';

// Get a single value from storage
export async function getStorage<K extends keyof StorageSchema>(
  key: K
): Promise<StorageSchema[K]> {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? DEFAULT_STORAGE[key];
}

// Set a single value in storage
export async function setStorage<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

// Get full state from storage
export async function getFullState(): Promise<StorageSchema> {
  const result = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  return { ...DEFAULT_STORAGE, ...result } as StorageSchema;
}

// Initialize storage with default values (only if not already set)
export async function initializeStorage(): Promise<void> {
  const currentState = await chrome.storage.local.get(Object.values(STORAGE_KEYS));

  // Only set defaults for keys that don't exist
  const updates: Partial<StorageSchema> = {};
  for (const [key, value] of Object.entries(DEFAULT_STORAGE)) {
    if (!(key in currentState)) {
      updates[key as keyof StorageSchema] = value;
    }
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}
