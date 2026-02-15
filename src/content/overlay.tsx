import React, { useEffect, useState } from 'react';
import { MessageType, STORAGE_KEYS, POINTS_PER_PLANT_CHANGE, CHANCE_PLANT_LEVELS_UP } from '../shared/constants';
import { getStorage, setStorage } from '../shared/storage';
import {
  createNewPlant,
  canLevelUpAny,
  canAddNewPlant,
  getLevelablePlants,
  getRandomPlant,
  levelUpPlant,
  getPlantImageUrl
} from '../shared/utils';
import type { Message, Plant, PlantLevel } from '../shared/types';
import '../styles/overlay.css';

const Overlay: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      try {
        // Check if extension context is valid
        if (!chrome.runtime?.id) {
          console.warn('Extension context invalidated. Please reload the page.');
          return;
        }

        const initialScore = await getStorage(STORAGE_KEYS.SCORE);
        const overlayEnabled = await getStorage(STORAGE_KEYS.OVERLAY_ENABLED);
        const savedPlants = await getStorage(STORAGE_KEYS.PLANTS);

        setScore(initialScore);
        setVisible(overlayEnabled);
        setPlants(savedPlants);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('Extension context invalidated')) {
          console.error('Failed to load initial state:', error);
        }
      }
    };

    loadInitialState();

    // Listen for messages from background
    const messageListener = (message: Message) => {
      if (message.type === MessageType.SCORE_UPDATE && message.payload && 'score' in message.payload) {
        setScore(message.payload.score);
      } else if (
        message.type === MessageType.OVERLAY_VISIBILITY_CHANGED &&
        message.payload &&
        'enabled' in message.payload
      ) {
        setVisible(message.payload.enabled);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Helper: Make a random plant change (50/50 level up vs add new)
  const makeRandomPlantChange = (currentPlants: Plant[]): Plant[] => {
    const canLevel = canLevelUpAny(currentPlants);
    const canAdd = canAddNewPlant(currentPlants);

    // Edge cases
    if (!canLevel && !canAdd) return currentPlants;
    if (canLevel && !canAdd) return performLevelUp(currentPlants);
    if (!canLevel && canAdd) return performAddNew(currentPlants);

    // Normal case: 50/50 choice
    return Math.random() < CHANCE_PLANT_LEVELS_UP ? performLevelUp(currentPlants) : performAddNew(currentPlants);
  };

  // Helper: Level up a random plant
  const performLevelUp = (currentPlants: Plant[]): Plant[] => {
    const levelablePlants = getLevelablePlants(currentPlants);
    const plantToLevel = getRandomPlant(levelablePlants);
    if (!plantToLevel) return currentPlants;
    return levelUpPlant(currentPlants, plantToLevel.id);
  };

  // Helper: Add a new plant at level 1
  const performAddNew = (currentPlants: Plant[]): Plant[] => {
    return [...currentPlants, createNewPlant()];
  };

  // Helper: Remove last change (newest plant or level down)
  const removeLastChange = (currentPlants: Plant[]): Plant[] => {
    if (currentPlants.length === 0) return currentPlants;

    // Find newest plant (highest ID)
    const sorted = [...currentPlants].sort((a, b) => b.id.localeCompare(a.id));
    const newestPlant = sorted[0];

    // If level 1, remove entirely
    if (newestPlant.level === 1) {
      return currentPlants.filter(plant => plant.id !== newestPlant.id);
    }

    // Otherwise, level down
    return currentPlants.map(plant => {
      if (plant.id === newestPlant.id) {
        return { ...plant, level: (plant.level - 1) as PlantLevel };
      }
      return plant;
    });
  };

  // Sync plants when score changes
  useEffect(() => {
    const syncPlants = async () => {
      // Calculate changes: every 10 points = 1 change
      const targetChangeCount = Math.floor(score / POINTS_PER_PLANT_CHANGE);

      // Current changes = sum of all plant levels
      const currentChangeCount = plants.reduce((sum, plant) => sum + plant.level, 0);

      if (targetChangeCount > currentChangeCount) {
        // Need to add changes
        let updatedPlants = [...plants];
        const changesToMake = targetChangeCount - currentChangeCount;

        for (let i = 0; i < changesToMake; i++) {
          updatedPlants = makeRandomPlantChange(updatedPlants);
        }

        setPlants(updatedPlants);
        await setStorage(STORAGE_KEYS.PLANTS, updatedPlants);

      } else if (targetChangeCount < currentChangeCount) {
        // Need to remove changes
        let updatedPlants = [...plants];
        const changesToRemove = currentChangeCount - targetChangeCount;

        for (let i = 0; i < changesToRemove; i++) {
          updatedPlants = removeLastChange(updatedPlants);
        }

        setPlants(updatedPlants);
        await setStorage(STORAGE_KEYS.PLANTS, updatedPlants);
      }
    };

    syncPlants();
  }, [score, plants]);

  if (!visible) {
    return null;
  }

  // Each plant = one box
  const boxes = plants.map((plant, index) => ({
    id: plant.id,
    plant: plant,
    imageUrl: getPlantImageUrl(plant),
    rightOffset: 20 + (index * 40),
    zIndex: 2147483647 - index,
  }));

  return (
    <>
      {boxes.map((box) => (
        <div
          key={box.id}
          className="flourish-overlay-box"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: `${box.rightOffset}px`,
            zIndex: box.zIndex,
            backgroundColor: 'none',
            color: 'white',
            padding: '2px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            userSelect: 'none',
            cursor: 'default',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '66px',
            overflow: 'hidden',
          }}
        >
          <img
            src={box.imageUrl}
            alt={`${box.plant.type} level ${box.plant.level}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
            onError={(e) => {
              // Fallback if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span style="font-size: 10px; text-align: center;">${box.plant.type.replace(/_/g, ' ')}<br/>L${box.plant.level}</span>`;
              }
            }}
          />
        </div>
      ))}
    </>
  );
};

export default Overlay;
