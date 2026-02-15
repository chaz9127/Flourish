import { MessageType, STORAGE_KEYS } from './constants';

// Storage schema
export interface StorageSchema {
  [STORAGE_KEYS.SCORE]: number;
  [STORAGE_KEYS.LAST_UPDATED]: number;
  [STORAGE_KEYS.LAST_RESET_DATE]: string;
  [STORAGE_KEYS.PRODUCTIVE_SITES]: string[];
  [STORAGE_KEYS.UNPRODUCTIVE_SITES]: string[];
  [STORAGE_KEYS.OVERLAY_ENABLED]: boolean;
  [STORAGE_KEYS.PLANT_EMOJIS]: string[];
}

// Default storage values
export const DEFAULT_STORAGE: StorageSchema = {
  [STORAGE_KEYS.SCORE]: 0,
  [STORAGE_KEYS.LAST_UPDATED]: Date.now(),
  [STORAGE_KEYS.LAST_RESET_DATE]: new Date().toISOString().split('T')[0],
  [STORAGE_KEYS.PRODUCTIVE_SITES]: [],
  [STORAGE_KEYS.UNPRODUCTIVE_SITES]: [],
  [STORAGE_KEYS.OVERLAY_ENABLED]: true,
  [STORAGE_KEYS.PLANT_EMOJIS]: [],
};

// Message payloads
export interface MessagePayload {
  [MessageType.GET_STATE]: undefined;
  [MessageType.ADD_PRODUCTIVE_SITE]: { domain: string };
  [MessageType.REMOVE_PRODUCTIVE_SITE]: { domain: string };
  [MessageType.ADD_UNPRODUCTIVE_SITE]: { domain: string };
  [MessageType.REMOVE_UNPRODUCTIVE_SITE]: { domain: string };
  [MessageType.TOGGLE_OVERLAY]: { enabled: boolean };
  [MessageType.RESET_SCORE]: undefined;
  [MessageType.SCORE_UPDATE]: { score: number };
  [MessageType.OVERLAY_VISIBILITY_CHANGED]: { enabled: boolean };
}

// Message structure
export interface Message<T extends MessageType = MessageType> {
  type: T;
  payload?: MessagePayload[T];
}

// Response from GET_STATE
export type GetStateResponse = StorageSchema;
