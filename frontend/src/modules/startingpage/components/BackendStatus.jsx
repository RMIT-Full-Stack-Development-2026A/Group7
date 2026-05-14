import React, { useState, useEffect } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';

const API_BASE_URL = getApiBaseUrl();

const BackendStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (String(data.status).toLowerCase() === 'ok') {
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
    <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-2 shadow-sm transition-shadow hover:shadow-md">
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
        className="ml-2 rounded-xl border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  );
};

export default BackendStatus;
