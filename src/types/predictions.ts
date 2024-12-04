export interface TripPrediction {
  duration: number;  // in minutes
  price: number;     // in dollars
  distance: number;  // in kilometers
}

export interface ModelPredictionInput {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}