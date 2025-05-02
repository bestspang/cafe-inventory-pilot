
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cafe-100 to-cafe-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-cafe-300 border-t-primary animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-cafe-800">Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;
