import React from 'react';
import { MAX_SCORE } from '../../shared/constants';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const boxCount = Math.min(Math.floor(score / 10) + 1, 10);
  const color = '#10b981'; // Always green (score is now 0-MAX_SCORE)

  return (
    <div className="score-display">
      <div className="score-label">Current Score</div>
      <div className="score-value" style={{ color }}>
        <span className="score-number">{score}</span>
        <span className="score-max" style={{ fontSize: '24px', opacity: 0.7 }}> / {MAX_SCORE}</span>
      </div>
      <div className="score-info" style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
        {boxCount} {boxCount === 1 ? 'plant' : 'plants'} growing 🌱
      </div>
    </div>
  );
};

export default ScoreDisplay;
