import * as tf from '@tensorflow/tfjs';
import * as ort from 'onnxruntime-web';
import type { ModelPredictionInput } from '../types/predictions';

export async function loadModel(modelFile: File): Promise<tf.LayersModel | ort.InferenceSession> {
  try {
    const fileExtension = modelFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'onnx') {
      const arrayBuffer = await modelFile.arrayBuffer();
      const session = await ort.InferenceSession.create(arrayBuffer);
      return session;
    } else {
      const model = await tf.loadLayersModel(tf.io.browserFiles([modelFile]));
      return model;
    }
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load ML model');
  }
}

export async function runPrediction(
  model: tf.LayersModel | ort.InferenceSession,
  input: ModelPredictionInput
) {
  const preprocessedInput = preprocessInput(input);

  if (model instanceof tf.LayersModel) {
    const prediction = await model.predict(preprocessedInput) as tf.Tensor;
    return Array.from(await prediction.data());
  } else {
    // ONNX model
    const feeds = {
      input: new ort.Tensor(
        'float32',
        preprocessedInput.dataSync() as Float32Array,
        [1, 6]
      )
    };
    const results = await model.run(feeds);
    const output = results[model.outputNames[0]];
    return Array.from(output.data as Float32Array);
  }
}

export function preprocessInput({ startLat, startLng, endLat, endLng }: ModelPredictionInput) {
  // Calculate basic features
  const distance = calculateDistance(startLat, startLng, endLat, endLng);
  const bearing = calculateBearing(startLat, startLng, endLat, endLng);
  
  // Return normalized features
  return tf.tensor2d([[
    startLat / 90, // Normalize latitude
    startLng / 180, // Normalize longitude
    endLat / 90,
    endLng / 180,
    distance / 100, // Assume max distance is 100km
    bearing / 360
  ]]);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}