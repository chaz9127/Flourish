import React from 'react';
import WebsiteListEditor from './WebsiteListEditor';

interface WebsiteManagerProps {
  productiveSites: string[];
  unproductiveSites: string[];
  onAddProductiveSite: (domain: string) => void;
  onRemoveProductiveSite: (domain: string) => void;
  onAddUnproductiveSite: (domain: string) => void;
  onRemoveUnproductiveSite: (domain: string) => void;
}

const WebsiteManager: React.FC<WebsiteManagerProps> = ({
  productiveSites,
  unproductiveSites,
  onAddProductiveSite,
  onRemoveProductiveSite,
  onAddUnproductiveSite,
  onRemoveUnproductiveSite,
}) => {
  return (
    <div className="website-manager">
      <h2>Website Categories</h2>

      <WebsiteListEditor
        title="Productive Sites"
        sites={productiveSites}
        onAdd={onAddProductiveSite}
        onRemove={onRemoveProductiveSite}
        color="green"
        placeholder="e.g., github.com"
      />

      <WebsiteListEditor
        title="Unproductive Sites"
        sites={unproductiveSites}
        onAdd={onAddUnproductiveSite}
        onRemove={onRemoveUnproductiveSite}
        color="red"
        placeholder="e.g., facebook.com"
      />
    </div>
  );
};

export default WebsiteManager;
