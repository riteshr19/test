import React, { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  startLocation: LatLngTuple | null;
  endLocation: LatLngTuple | null;
  onStartLocationSelect: (lat: number, lng: number) => void;
  onEndLocationSelect: (lat: number, lng: number) => void;
  predictions?: {
    duration: number;
    price: number;
    distance: number;
  };
}

const LocationSelector: React.FC<{
  onStartLocationSelect: (lat: number, lng: number) => void;
  onEndLocationSelect: (lat: number, lng: number) => void;
}> = ({ onStartLocationSelect, onEndLocationSelect }) => {
  const [selectingStart, setSelectingStart] = useState(true);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (selectingStart) {
        onStartLocationSelect(lat, lng);
      } else {
        onEndLocationSelect(lat, lng);
      }
      setSelectingStart(!selectingStart);
    },
  });

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar bg-white p-3 m-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium mb-2">Click on the map to select:</p>
        <p className="text-sm text-blue-600">
          {selectingStart ? 'Pickup Location' : 'Drop-off Location'}
        </p>
      </div>
    </div>
  );
};

const Map: React.FC<MapProps> = ({
  startLocation,
  endLocation,
  onStartLocationSelect,
  onEndLocationSelect,
  predictions,
}) => {
  const defaultCenter: LatLngTuple = [40.7128, -74.0060]; // New York City
  const startIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const endIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={startLocation || defaultCenter}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationSelector
          onStartLocationSelect={onStartLocationSelect}
          onEndLocationSelect={onEndLocationSelect}
        />
        {startLocation && (
          <Marker position={startLocation} icon={startIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}
        {endLocation && (
          <Marker position={endLocation} icon={endIcon}>
            <Popup>Drop-off Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;