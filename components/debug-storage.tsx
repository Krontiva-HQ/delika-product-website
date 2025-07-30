'use client';

import { useState, useEffect } from 'react';
import { getLocalStorageStatus, clearLocalStorageWithFeedback } from '@/lib/utils';

export function DebugStorage() {
  const [status, setStatus] = useState(getLocalStorageStatus());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStatus = () => setStatus(getLocalStorageStatus());
    updateStatus();
    
    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearStorage = () => {
    const result = clearLocalStorageWithFeedback();
    alert(result.message);
    setStatus(getLocalStorageStatus());
  };

  if (!status.isAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
        localStorage not available
      </div>
    );
  }

  const isHighUsage = status.usage.percentage > 80;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Storage Status</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Usage</span>
          <span>{status.usage.percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isHighUsage ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(status.usage.percentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {(status.usage.used / 1024 / 1024).toFixed(2)} MB / {(status.usage.available / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>

      {isHighUsage && (
        <div className="mb-3 p-2 bg-yellow-100 border border-yellow-400 rounded text-xs text-yellow-800">
          ⚠️ High storage usage detected. Consider clearing cache.
        </div>
      )}

      {showDetails && (
        <div className="mb-3 text-xs">
          <div className="mb-2">
            <strong>Items stored:</strong> {status.totalItems}
          </div>
          <div className="mb-2">
            <strong>Keys:</strong>
            <div className="max-h-20 overflow-y-auto bg-gray-50 p-1 rounded text-xs">
              {status.keys.map(key => (
                <div key={key} className="truncate">{key}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleClearStorage}
        className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
      >
        Clear Storage
      </button>
    </div>
  );
} 