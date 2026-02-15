import React, { useEffect, useState } from 'react';
import { MessageType, STORAGE_KEYS } from '../shared/constants';
import { getStorage, setStorage } from '../shared/storage';
import { getRandomPlantEmoji } from '../shared/utils';
import type { Message } from '../shared/types';
import '../styles/overlay.css';

const Overlay: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [plantEmojis, setPlantEmojis] = useState<string[]>([]);
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
        const savedPlantEmojis = await getStorage(STORAGE_KEYS.PLANT_EMOJIS);

        setScore(initialScore);
        setVisible(overlayEnabled);
        setPlantEmojis(savedPlantEmojis);
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

  // Sync plant emojis when score changes
  useEffect(() => {
    const syncPlantEmojis = async () => {
      const boxCount = Math.min(Math.floor(score / 10) + 1, 10);
      const currentEmojiCount = plantEmojis.length;

      if (boxCount > currentEmojiCount) {
        // Add new random emojis
        const newEmojis = [...plantEmojis];
        for (let i = currentEmojiCount; i < boxCount; i++) {
          newEmojis.push(getRandomPlantEmoji());
        }
        setPlantEmojis(newEmojis);
        await setStorage(STORAGE_KEYS.PLANT_EMOJIS, newEmojis);
      } else if (boxCount < currentEmojiCount) {
        // Remove emojis from end
        const newEmojis = plantEmojis.slice(0, boxCount);
        setPlantEmojis(newEmojis);
        await setStorage(STORAGE_KEYS.PLANT_EMOJIS, newEmojis);
      }
    };

    syncPlantEmojis();
  }, [score, plantEmojis]);

  if (!visible) {
    return null;
  }

  const boxCount = Math.min(Math.floor(score / 10) + 1, 10);

  const boxes = Array.from({ length: boxCount }, (_, index) => ({
    id: index,
    emoji: plantEmojis[index] || '🌱', // Fallback to seedling
    rightOffset: 20 + (index * 65), // 65px spacing between boxes
    zIndex: 2147483647 - index, // Stack rightmost on top
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
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '32px',
            fontWeight: 'bold',
            userSelect: 'none',
            cursor: 'default',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
          }}
        >
          {box.emoji}
        </div>
      ))}
    </>
  );
};

export default Overlay;
