import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

interface DataPoint {
  [key: string]: string | number;
}

export async function trainModel(
  datasetFile: File,
  onProgress: (progress: number) => void
): Promise<tf.LayersModel> {
  try {
    console.log('Parsing dataset...');
    const data = await parseDataset(datasetFile);
    console.log('Dataset parsed:', data);

    console.log('Preprocessing data...');
    const {
      features,
      labels,
      featureNormalizer,
      labelNormalizer
    } = preprocessData(data);
    console.log('Data preprocessed:', { features, labels });

    console.log('Creating model...');
    const model = createModel();
    console.log('Model created:', model);

    console.log('Training model...');
    await trainModelWithData(model, features, labels, onProgress);
    console.log('Model trained successfully');

    console.log('Saving model...');
    const modelArtifacts = await model.save(tf.io.withSaveHandler(async (artifacts) => {
      if (artifacts.modelTopology && typeof artifacts.modelTopology === 'object') {
        (artifacts.modelTopology as any).userDefinedMetadata = {
          featureNormalizer,
          labelNormalizer
        };
      }
      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
          modelTopologyBytes: artifacts.modelTopology ? JSON.stringify(artifacts.modelTopology).length : 0,
          weightSpecsBytes: artifacts.weightSpecs ? JSON.stringify(artifacts.weightSpecs).length : 0,
          weightDataBytes: artifacts.weightData instanceof ArrayBuffer ? artifacts.weightData.byteLength : 0,
        },
        ...artifacts
      };
    }));
    console.log('Model saved:', modelArtifacts);

    return model;
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
      complete: (results) => resolve(results.data as DataPoint[]),
      error: (error) => reject(error)
    });
  });
}

function preprocessData(data: DataPoint[]) {
  const features = data.map(row => [
    Number(row.latitude),
    Number(row.longitude),
    Number(row.temperature),
    Number(row.humidity),
    Number(row.windSpeed),
    Number(row.precipProbability)
  ]);

  const labels = data.map(row => [
    Number(row.price),
    Number(row.distance)
  ]);

  const featureNormalizer = {
    min: features.reduce((min, row) => row.map((val, i) => Math.min(val, min[i])), features[0]),
    max: features.reduce((max, row) => row.map((val, i) => Math.max(val, max[i])), features[0])
  };

  const labelNormalizer = {
    min: labels.reduce((min, row) => row.map((val, i) => Math.min(val, min[i])), labels[0]),
    max: labels.reduce((max, row) => row.map((val, i) => Math.max(val, max[i])), labels[0])
  };

  const normalizedFeatures = features.map(row =>
    row.map((val, i) => (val - featureNormalizer.min[i]) / (featureNormalizer.max[i] - featureNormalizer.min[i]))
  );

  const normalizedLabels = labels.map(row =>
    row.map((val, i) => (val - labelNormalizer.min[i]) / (labelNormalizer.max[i] - labelNormalizer.min[i]))
  );

  return {
    features: tf.tensor2d(normalizedFeatures),
    labels: tf.tensor2d(normalizedLabels),
    featureNormalizer,
    labelNormalizer
  };
}

function createModel(): tf.LayersModel {
  const model = tf.sequential();

  model.add(tf.layers.dense({
    inputShape: [6],
    units: 64,
    activation: 'relu'
  }));

  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));

  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));

  model.add(tf.layers.dense({
    units: 2,
    activation: 'linear'
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });

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

  try {
    console.log('Starting model training...');

    const featureDataset = tf.data.array(features);
    const labelDataset = tf.data.array(labels);
    const dataset = tf.data.zip({ xs: featureDataset, ys: labelDataset })
      .shuffle(features.shape[0])
      .batch(BATCH_SIZE);

    const totalBatches = Math.ceil(features.shape[0] / BATCH_SIZE) * EPOCHS;

    await model.fitDataset(dataset, {
      epochs: EPOCHS,
      callbacks: {
        onBatchEnd: (batch, logs) => {
          const progress = ((batch + 1) / totalBatches) * 100;
          console.log(`Batch ${batch + 1} completed. Loss: ${logs?.loss}`);
          onProgress(progress);
        },
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1} completed. Loss: ${logs?.loss}`);
        },
        onTrainEnd: () => {
          console.log('Training completed.');
        }
      }
    });
  } catch (error) {
    console.error('Error during model training:', error);
    throw error;
  }
}