import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationSearchProps {
  onStartLocationSelect: (lat: number, lng: number) => void;
  onEndLocationSelect: (lat: number, lng: number) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onStartLocationSelect,
  onEndLocationSelect,
}) => {
  const handleStartLocationDemo = () => {
    // Demo coordinates for NYC locations
    onStartLocationSelect(40.7128, -74.0060);
  };

  const handleEndLocationDemo = () => {
    onEndLocationSelect(40.7589, -73.9851);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Enter pickup location"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={() => handleStartLocationDemo()}
        />
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Enter drop-off location"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={() => handleEndLocationDemo()}
        />
      </div>
    </div>
  );
};

export default LocationSearch;