import React, { useState } from 'react';
import { LatLngTuple } from 'leaflet';
import * as tf from '@tensorflow/tfjs';
import * as ort from 'onnxruntime-web';
import Map from './components/Map';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { loadModel, runPrediction } from './utils/mlUtils';
import type { TripPrediction } from './types/predictions';

function App() {
  const [model, setModel] = useState<tf.LayersModel | ort.InferenceSession | null>(null);
  const [startLocation, setStartLocation] = useState<LatLngTuple | null>(null);
  const [endLocation, setEndLocation] = useState<LatLngTuple | null>(null);
  const [predictions, setPredictions] = useState<TripPrediction | null>(null);

  const handleModelUpload = async (modelFile: File) => {
    try {
      const loadedModel = await loadModel(modelFile);
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const handleStartLocationSelect = (lat: number, lng: number) => {
    setStartLocation([lat, lng]);
    makePrediction([lat, lng], endLocation);
  };

  const handleEndLocationSelect = (lat: number, lng: number) => {
    setEndLocation([lat, lng]);
    makePrediction(startLocation, [lat, lng]);
  };

  const makePrediction = async (start: LatLngTuple | null, end: LatLngTuple | null) => {
    if (!model || !start || !end) return;

    try {
      const [duration, price, distance] = await runPrediction(model, {
        startLat: start[0],
        startLng: start[1],
        endLat: end[0],
        endLng: end[1]
      });

      setPredictions({
        duration,
        price,
        distance,
      });
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Sidebar
              onModelUpload={handleModelUpload}
              onStartLocationSelect={handleStartLocationSelect}
              onEndLocationSelect={handleEndLocationSelect}
              predictions={predictions}
            />
          </div>

          <div className="md:col-span-2">
            <Map
              startLocation={startLocation}
              endLocation={endLocation}
              onStartLocationSelect={handleStartLocationSelect}
              onEndLocationSelect={handleEndLocationSelect}
              predictions={predictions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;