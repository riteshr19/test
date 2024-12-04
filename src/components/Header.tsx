import React from 'react';
import { Brain } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      <Brain className="w-10 h-10 text-blue-500" />
      <h1 className="text-3xl font-bold text-gray-800">Uber Trip Analyzer</h1>
    </div>
  );
};

export default Header;