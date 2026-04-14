import React, { useState, useEffect } from 'react';
import { Check, X, Loader } from 'lucide-react';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = 'http://localhost:3000';

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK') {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setStatus('checking');
    checkBackendConnection();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <>
            <Loader size={16} className="text-yellow-500 animate-spin" />
            <span className="text-sm font-medium text-gray-600">Connecting...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <Check size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-600">Backend Connected</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <X size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-600">Backend Disconnected</span>
          </>
        )}
      </div>

      <button
        onClick={handleRetry}
        disabled={loading}
        className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );
};

export default BackendStatus;
