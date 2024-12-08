import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  outliers?: LatLngTuple[]; // Array of outlier locations
  segments?: Record<string, any>; // Segmented insights
  onStartLocationSelect: (lat: number, lng: number) => void;
  onEndLocationSelect: (lat: number, lng: number) => void;
  predictions?: {
    duration: number;
    price: number;
    distance: number;
  };
}

const Map: React.FC<MapProps> = ({
  startLocation,
  endLocation,
  outliers,
  segments,
  onStartLocationSelect,
  onEndLocationSelect,
  predictions,
}) => {
  const defaultCenter: LatLngTuple = [40.7128, -74.0060]; // Default center: New York City

  const outlierIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const startIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const endIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
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

        {outliers?.map((location, index) => (
          <Marker key={index} position={location} icon={outlierIcon}>
            <Popup>Outlier Location</Popup>
          </Marker>
        ))}

        {segments && (
          <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar bg-white p-3 m-3 rounded-lg shadow-lg">
              <h3 className="font-semibold text-sm">Segment Insights</h3>
              <ul className="text-xs">
                {Object.keys(segments).map(cabType => (
                  <li key={cabType}>
                    <strong>{cabType}</strong>: {segments[cabType].totalRides} rides
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
