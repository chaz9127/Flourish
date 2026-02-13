import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const isPositive = score >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';
  const icon = isPositive ? '📈' : '📉';

  return (
    <div className="score-display">
      <div className="score-label">Current Score</div>
      <div className="score-value" style={{ color }}>
        <span className="score-icon">{icon}</span>
        <span className="score-number">{score}</span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
