
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useDemoMode } from '@/context/DemoModeContext';

const DemoModeBanner: React.FC = () => {
  const { isDemoMode, isSeeding, seedingError } = useDemoMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center font-medium flex items-center justify-center">
      <AlertCircle className="mr-2 h-4 w-4" />
      {isSeeding ? (
        <span>Loading demo data...</span>
      ) : seedingError ? (
        <span>Demo Mode - Error: {seedingError}</span>
      ) : (
        <span>Demo Mode - Using sample data for demonstration purposes</span>
      )}
    </div>
  );
};

export default DemoModeBanner;
