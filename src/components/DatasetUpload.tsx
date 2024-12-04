import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet } from 'lucide-react';

interface DatasetUploadProps {
  onDatasetUpload: (file: File) => void;
}

const DatasetUpload: React.FC<DatasetUploadProps> = ({ onDatasetUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDatasetUpload(acceptedFiles[0]);
    }
  }, [onDatasetUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
    >
      <input {...getInputProps()} />
      <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-gray-400" />
      <p className="text-base font-medium text-gray-700">
        {isDragActive ? 'Drop the dataset here' : 'Drag & drop your dataset, or click to select'}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Supports CSV and JSON formats
      </p>
    </div>
  );
};

export default DatasetUpload;