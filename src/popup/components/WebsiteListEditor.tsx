import React, { useState } from 'react';
import { extractDomainFromInput } from '../../shared/utils';

interface WebsiteListEditorProps {
  title: string;
  sites: string[];
  onAdd: (domain: string) => void;
  onRemove: (domain: string) => void;
  color: 'green' | 'red';
  placeholder: string;
}

const WebsiteListEditor: React.FC<WebsiteListEditorProps> = ({
  title,
  sites,
  onAdd,
  onRemove,
  color,
  placeholder,
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      setError('Please enter a website');
      return;
    }

    const domain = extractDomainFromInput(trimmedInput);

    if (!domain) {
      setError('Invalid domain. Please enter a valid website like "example.com"');
      return;
    }

    if (sites.includes(domain)) {
      setError('This website is already in the list');
      return;
    }

    onAdd(domain);
    setInput('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className={`website-list-editor ${color}`}>
      <h3>{title}</h3>

      <div className="input-group">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="website-input"
        />
        <button onClick={handleAdd} className="add-button">
          Add
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ul className="website-list">
        {sites.length === 0 ? (
          <li className="empty-message">No sites added yet</li>
        ) : (
          sites.map((site) => (
            <li key={site} className="website-item">
              <span className="website-domain">{site}</span>
              <button onClick={() => onRemove(site)} className="remove-button">
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default WebsiteListEditor;
