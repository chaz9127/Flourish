import React, { useEffect, useState } from 'react';
import ScoreDisplay from './components/ScoreDisplay';
import WebsiteManager from './components/WebsiteManager';
import OverlayToggle from './components/OverlayToggle';
import { sendMessage } from '../shared/messaging';
import { MessageType, STORAGE_KEYS } from '../shared/constants';
import type { GetStateResponse } from '../shared/types';

const Popup: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [productiveSites, setProductiveSites] = useState<string[]>([]);
  const [unproductiveSites, setUnproductiveSites] = useState<string[]>([]);
  const [overlayEnabled, setOverlayEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const state: GetStateResponse = await sendMessage(MessageType.GET_STATE);
        setScore(state[STORAGE_KEYS.SCORE]);
        setProductiveSites(state[STORAGE_KEYS.PRODUCTIVE_SITES]);
        setUnproductiveSites(state[STORAGE_KEYS.UNPRODUCTIVE_SITES]);
        setOverlayEnabled(state[STORAGE_KEYS.OVERLAY_ENABLED]);
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadState();

    // Listen for storage changes to update UI in real-time
    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        if (changes[STORAGE_KEYS.SCORE]) {
          setScore(changes[STORAGE_KEYS.SCORE].newValue);
        }
        if (changes[STORAGE_KEYS.PRODUCTIVE_SITES]) {
          setProductiveSites(changes[STORAGE_KEYS.PRODUCTIVE_SITES].newValue);
        }
        if (changes[STORAGE_KEYS.UNPRODUCTIVE_SITES]) {
          setUnproductiveSites(changes[STORAGE_KEYS.UNPRODUCTIVE_SITES].newValue);
        }
        if (changes[STORAGE_KEYS.OVERLAY_ENABLED]) {
          setOverlayEnabled(changes[STORAGE_KEYS.OVERLAY_ENABLED].newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const handleAddProductiveSite = async (domain: string) => {
    await sendMessage(MessageType.ADD_PRODUCTIVE_SITE, { domain });
  };

  const handleRemoveProductiveSite = async (domain: string) => {
    await sendMessage(MessageType.REMOVE_PRODUCTIVE_SITE, { domain });
  };

  const handleAddUnproductiveSite = async (domain: string) => {
    await sendMessage(MessageType.ADD_UNPRODUCTIVE_SITE, { domain });
  };

  const handleRemoveUnproductiveSite = async (domain: string) => {
    await sendMessage(MessageType.REMOVE_UNPRODUCTIVE_SITE, { domain });
  };

  const handleToggleOverlay = async (enabled: boolean) => {
    await sendMessage(MessageType.TOGGLE_OVERLAY, { enabled });
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Flourish</h1>
        <p className="popup-subtitle">Productivity Tracker</p>
      </header>

      <ScoreDisplay score={score} />

      <OverlayToggle enabled={overlayEnabled} onToggle={handleToggleOverlay} />

      <WebsiteManager
        productiveSites={productiveSites}
        unproductiveSites={unproductiveSites}
        onAddProductiveSite={handleAddProductiveSite}
        onRemoveProductiveSite={handleRemoveProductiveSite}
        onAddUnproductiveSite={handleAddUnproductiveSite}
        onRemoveUnproductiveSite={handleRemoveUnproductiveSite}
      />

      <footer className="popup-footer">
        <p>Score resets daily at midnight</p>
      </footer>
    </div>
  );
};

export default Popup;
