import React, { useEffect, useState } from 'react';
import { MessageType, STORAGE_KEYS } from '../shared/constants';
import { getStorage } from '../shared/storage';
import type { Message } from '../shared/types';
import '../styles/overlay.css';

const Overlay: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    // Load initial state
    const loadInitialState = async () => {
      try {
        const initialScore = await getStorage(STORAGE_KEYS.SCORE);
        const overlayEnabled = await getStorage(STORAGE_KEYS.OVERLAY_ENABLED);

        setScore(initialScore);
        setVisible(overlayEnabled);
      } catch (error) {
        console.error('Failed to load initial state:', error);
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

  if (!visible) {
    return null;
  }

  const isPositive = score >= 0;
  const backgroundColor = isPositive ? '#10b981' : '#ef4444';
  const icon = isPositive ? '📈' : '📉';

  return (
    <div
      className="flourish-overlay"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 2147483647,
        backgroundColor,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '18px',
        fontWeight: 'bold',
        userSelect: 'none',
        cursor: 'default',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>{icon}</span>
      <span>{score}</span>
    </div>
  );
};

export default Overlay;
