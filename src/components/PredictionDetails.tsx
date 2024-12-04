import React from 'react';
import { Clock, DollarSign, Navigation2 } from 'lucide-react';
import type { TripPrediction } from '../types/predictions';

interface PredictionDetailsProps {
  predictions: TripPrediction;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ predictions }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Trip Predictions</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{Math.round(predictions.duration)} mins</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DollarSign className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Estimated Price</p>
            <p className="font-semibold">${predictions.price.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Navigation2 className="w-6 h-6 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Distance</p>
            <p className="font-semibold">{predictions.distance.toFixed(1)} km</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetails;