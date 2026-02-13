// Storage keys
export const STORAGE_KEYS = {
  SCORE: 'score',
  LAST_UPDATED: 'lastUpdated',
  LAST_RESET_DATE: 'lastResetDate',
  PRODUCTIVE_SITES: 'productiveSites',
  UNPRODUCTIVE_SITES: 'unproductiveSites',
  OVERLAY_ENABLED: 'overlayEnabled',
} as const;

// Message types
export enum MessageType {
  // Queries (expect response)
  GET_STATE = 'GET_STATE',

  // Commands (no response)
  ADD_PRODUCTIVE_SITE = 'ADD_PRODUCTIVE_SITE',
  REMOVE_PRODUCTIVE_SITE = 'REMOVE_PRODUCTIVE_SITE',
  ADD_UNPRODUCTIVE_SITE = 'ADD_UNPRODUCTIVE_SITE',
  REMOVE_UNPRODUCTIVE_SITE = 'REMOVE_UNPRODUCTIVE_SITE',
  TOGGLE_OVERLAY = 'TOGGLE_OVERLAY',
  RESET_SCORE = 'RESET_SCORE',

  // Broadcasts
  SCORE_UPDATE = 'SCORE_UPDATE',
  OVERLAY_VISIBILITY_CHANGED = 'OVERLAY_VISIBILITY_CHANGED',
}

// Connection port names
export const PORT_NAMES = {
  KEEP_ALIVE: 'keep-alive',
} as const;
