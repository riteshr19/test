import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ModelUploadProps {
  onModelUpload: (model: File) => void;
}

const ModelUpload: React.FC<ModelUploadProps> = ({ onModelUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onModelUpload(acceptedFiles[0]);
    }
  }, [onModelUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'application/octet-stream': ['.pb', '.h5', '.pkl', '.onnx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="text-lg font-medium text-gray-700">
        {isDragActive
          ? 'Drop the ML model here'
          : 'Drag & drop your ML model, or click to select'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Supports TensorFlow.js (.json, .pb, .h5) and ONNX (.onnx) models
      </p>
      <p className="mt-1 text-sm text-gray-500">
        For .pkl files, please convert to ONNX format first
      </p>
    </div>
  );
};

export default ModelUpload;