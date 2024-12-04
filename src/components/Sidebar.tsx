import React from 'react';
import ModelUpload from './ModelUpload';
import LocationSearch from './LocationSearch';
import PredictionDetails from './PredictionDetails';
import TrainingPanel from './TrainingPanel';
import type { TripPrediction } from '../types/predictions';

interface SidebarProps {
  onModelUpload: (model: File) => void;
  onStartLocationSelect: (lat: number, lng: number) => void;
  onEndLocationSelect: (lat: number, lng: number) => void;
  predictions: TripPrediction | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  onModelUpload,
  onStartLocationSelect,
  onEndLocationSelect,
  predictions,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Upload ML Model</h2>
        <ModelUpload onModelUpload={onModelUpload} />
      </div>

      <TrainingPanel onModelTrained={onModelUpload} />

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Location Selection</h2>
        <LocationSearch
          onStartLocationSelect={onStartLocationSelect}
          onEndLocationSelect={onEndLocationSelect}
        />
      </div>

      {predictions && <PredictionDetails predictions={predictions} />}
    </div>
  );
};

export default Sidebar;