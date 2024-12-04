import React, { useState } from 'react';
import { Brain, Loader } from 'lucide-react';
import DatasetUpload from './DatasetUpload';
import { trainModel } from '../utils/trainingUtils';

interface TrainingPanelProps {
  onModelTrained: (model: any) => void;
}

const TrainingPanel: React.FC<TrainingPanelProps> = ({ onModelTrained }) => {
  const [dataset, setDataset] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDatasetUpload = (file: File) => {
    setDataset(file);
  };

  const handleStartTraining = async () => {
    if (!dataset) return;

    setIsTraining(true);
    try {
      const trainedModel = await trainModel(dataset, (progress) => {
        setProgress(progress);
      });
      onModelTrained(trainedModel);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Train New Model</h2>
      
      <div className="space-y-4">
        <DatasetUpload onDatasetUpload={handleDatasetUpload} />
        
        {dataset && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Dataset loaded: {dataset.name}
            </p>
            
            {isTraining ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Training in progress...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartTraining}
                className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Brain className="w-5 h-5" />
                <span>Start Training</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPanel;