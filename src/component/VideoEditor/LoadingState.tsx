import React from 'react';
import ClimbingBoxLoader  from "react-spinners/ClipLoader";

export const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-gray-50 rounded-lg">
    <ClimbingBoxLoader  className="w-8 h-8 animate-spin text-blue-500" />
    <p className="text-gray-600">Loading clips...</p>
  </div>
);