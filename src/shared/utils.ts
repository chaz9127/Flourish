import { PLANT_TYPES, MAX_PLANT_LEVEL, MAX_PLANT_COUNT } from './constants';
import type { Plant, PlantType, PlantLevel } from './types';

// Generate unique ID for plant
export function generatePlantId(): string {
  return `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get random plant type
export function getRandomPlantType(): PlantType {
  const randomIndex = Math.floor(Math.random() * PLANT_TYPES.length);
  return PLANT_TYPES[randomIndex] as PlantType;
}

// Create new plant at level 1
export function createNewPlant(): Plant {
  return {
    id: generatePlantId(),
    type: getRandomPlantType(),
    level: 1,
  };
}

// Check if any plants can be leveled up
export function canLevelUpAny(plants: Plant[]): boolean {
  return plants.some(plant => plant.level < MAX_PLANT_LEVEL);
}

// Check if new plants can be added
export function canAddNewPlant(plants: Plant[]): boolean {
  return plants.length < MAX_PLANT_COUNT;
}

// Get plants that aren't at max level
export function getLevelablePlants(plants: Plant[]): Plant[] {
  return plants.filter(plant => plant.level < MAX_PLANT_LEVEL);
}

// Level up a specific plant by ID
export function levelUpPlant(plants: Plant[], plantId: string): Plant[] {
  return plants.map(plant => {
    if (plant.id === plantId && plant.level < MAX_PLANT_LEVEL) {
      return { ...plant, level: (plant.level + 1) as PlantLevel };
    }
    return plant;
  });
}

// Get random plant from list
export function getRandomPlant(plants: Plant[]): Plant | null {
  if (plants.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * plants.length);
  return plants[randomIndex];
}

// Build image URL for plant
export function getPlantImageUrl(plant: Plant): string {
  return chrome.runtime.getURL(`plants/${plant.type}_${plant.level}.png`);
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

// Normalize domain (remove www., lowercase)
export function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, '').toLowerCase();
}

// Check if current domain matches a pattern domain
// Supports subdomain matching: sub.example.com matches example.com
export function domainMatches(currentDomain: string, patternDomain: string): boolean {
  const normalizedCurrent = normalizeDomain(currentDomain);
  const normalizedPattern = normalizeDomain(patternDomain);

  // Exact match
  if (normalizedCurrent === normalizedPattern) {
    return true;
  }

  // Subdomain match
  if (normalizedCurrent.endsWith('.' + normalizedPattern)) {
    return true;
  }

  return false;
}

// Validate if a string is a valid domain
export function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  const normalizedDomain = normalizeDomain(domain);

  return domainRegex.test(normalizedDomain);
}

// Extract domain from user input (handles URLs or plain domains)
export function extractDomainFromInput(input: string): string | null {
  const trimmedInput = input.trim();

  // If it looks like a URL, extract the domain
  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    const domain = extractDomain(trimmedInput);
    return domain ? normalizeDomain(domain) : null;
  }

  // Otherwise, treat it as a domain
  const normalizedDomain = normalizeDomain(trimmedInput);

  // Validate the domain
  if (isValidDomain(normalizedDomain)) {
    return normalizedDomain;
  }

  return null;
}
