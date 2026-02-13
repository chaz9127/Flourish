import React from 'react';

interface OverlayToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const OverlayToggle: React.FC<OverlayToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="overlay-toggle">
      <label className="toggle-label">
        <span>Show Floating Overlay</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="toggle-checkbox"
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

export default OverlayToggle;
