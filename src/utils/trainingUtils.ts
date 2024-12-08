import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

interface DataPoint {
  [key: string]: string | number;
}

// Detect Outliers
function detectOutliers(features: number[][]): number[] {
  const thresholds = { zScore: 3 }; // Customize threshold
  const columnStats = features[0].map((_, colIndex) => {
    const col = features.map(row => row[colIndex]);
    const mean = col.reduce((sum, value) => sum + value, 0) / col.length;
    const stdDev = Math.sqrt(
      col.reduce((sum, value) => sum + (value - mean) ** 2, 0) / col.length
    );
    return { mean, stdDev };
  });

  return features
    .map((row, rowIndex) => {
      const isOutlier = row.some((value, colIndex) => {
        const { mean, stdDev } = columnStats[colIndex];
        const zScore = Math.abs((value - mean) / stdDev);
        return zScore > thresholds.zScore;
      });
      return isOutlier ? rowIndex : -1;
    })
    .filter(index => index !== -1);
}

function removeOutliers(
  features: number[][],
  labels: number[][]
): { cleanedFeatures: number[][]; cleanedLabels: number[][] } {
  const outlierIndices = detectOutliers(features);
  const cleanedFeatures = features.filter((_, index) => !outlierIndices.includes(index));
  const cleanedLabels = labels.filter((_, index) => !outlierIndices.includes(index));
  return { cleanedFeatures, cleanedLabels };
}

// Segment Rides by Cab Type
function segmentRidesByCabType(data: DataPoint[]) {
  const segments = data.reduce((acc, ride) => {
    const cabType = String(ride.cabType || 'Unknown');
    const distance = Number(ride.distance || 0);
    const price = Number(ride.price || 0);
    const duration = Number(ride.duration || 0);

    if (!acc[cabType]) {
      acc[cabType] = {
        totalRides: 0,
        totalDistance: 0,
        totalPrice: 0,
        totalDuration: 0,
        averagePricePerKm: 0,
        averageDuration: 0,
      };
    }

    acc[cabType].totalRides += 1;
    acc[cabType].totalDistance += distance;
    acc[cabType].totalPrice += price;
    acc[cabType].totalDuration += duration;

    return acc;
  }, {} as Record<string, any>);

  // Compute averages
  Object.keys(segments).forEach(cabType => {
    const segment = segments[cabType];
    segment.averagePricePerKm = segment.totalPrice / segment.totalDistance || 0;
    segment.averageDuration = segment.totalDuration / segment.totalRides || 0;
  });

  return segments;
}

export async function trainModel(
  datasetFile: File,
  onProgress: (progress: number) => void
): Promise<{ model: tf.LayersModel; segments: Record<string, any> }> {
  try {
    const data = await parseDataset(datasetFile);

    // Preprocess Data
    const features = data.map(row => [
      Number(row.latitude),
      Number(row.longitude),
      Number(row.temperature),
      Number(row.humidity),
      Number(row.windSpeed),
      Number(row.precipProbability),
    ]);

    const labels = data.map(row => [Number(row.price), Number(row.distance)]);

    // Remove Outliers
    const { cleanedFeatures, cleanedLabels } = removeOutliers(features, labels);

    // Segment Rides
    const rideSegments = segmentRidesByCabType(data);

    // Normalize Features and Labels
    const featureNormalizer = {
      min: cleanedFeatures.reduce((min, row) => row.map((val, i) => Math.min(val, min[i])), cleanedFeatures[0]),
      max: cleanedFeatures.reduce((max, row) => row.map((val, i) => Math.max(val, max[i])), cleanedFeatures[0]),
    };

    const normalizedFeatures = cleanedFeatures.map(row =>
      row.map((val, i) => (val - featureNormalizer.min[i]) / (featureNormalizer.max[i] - featureNormalizer.min[i]))
    );

    const normalizedLabels = cleanedLabels.map(row =>
      row.map((val, i) => (val - featureNormalizer.min[i]) / (featureNormalizer.max[i] - featureNormalizer.min[i]))
    );

    const model = createModel();
    await trainModelWithData(model, tf.tensor2d(normalizedFeatures), tf.tensor2d(normalizedLabels), onProgress);

    return { model, segments: rideSegments };
  } catch (error) {
    console.error('Training error:', error);
    throw error;
  }
}

async function parseDataset(file: File): Promise<DataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: results => resolve(results.data as DataPoint[]),
      error: error => reject(error),
    });
  });
}

function createModel(): tf.LayersModel {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [6], units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 2, activation: 'linear' }));
  model.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });
  return model;
}

async function trainModelWithData(
  model: tf.LayersModel,
  features: tf.Tensor2D,
  labels: tf.Tensor2D,
  onProgress: (progress: number) => void
): Promise<void> {
  const BATCH_SIZE = 32;
  const EPOCHS = 50;

  const dataset = tf.data
    .zip({ xs: tf.data.array(features), ys: tf.data.array(labels) })
    .shuffle(features.shape[0])
    .batch(BATCH_SIZE);

  await model.fitDataset(dataset, {
    epochs: EPOCHS,
    callbacks: {
      onBatchEnd: (batch, logs) => {
        const progress = ((batch + 1) / (features.shape[0] / BATCH_SIZE)) * 100;
        onProgress(progress);
      },
    },
  });
}
