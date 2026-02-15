// Storage keys
export const STORAGE_KEYS = {
  SCORE: 'score',
  LAST_UPDATED: 'lastUpdated',
  LAST_RESET_DATE: 'lastResetDate',
  PRODUCTIVE_SITES: 'productiveSites',
  UNPRODUCTIVE_SITES: 'unproductiveSites',
  OVERLAY_ENABLED: 'overlayEnabled',
  PLANTS: 'plants',
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

// Plant types for the image-based leveling system
export const PLANT_TYPES = [
  'plum_tree',
  'lemon_tree',
  'apple_tree',
  'coconut_tree',
  'banana_tree',
] as const;

export const MAX_PLANT_LEVEL = 5;
export const MAX_PLANT_COUNT = 15;
export const POINTS_PER_PLANT_CHANGE = 10;
export const CHANCE_PLANT_LEVELS_UP = 0.7
export const MAX_SCORE = 1000

export const SCORE_INTERVAL = 1000