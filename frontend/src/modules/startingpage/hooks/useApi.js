import { useState, useCallback } from 'react';
import { getApiBaseUrl } from '../../../config/api/baseUrl.js';

const API_BASE_URL = getApiBaseUrl();
const normalizeEndpoint = (endpoint = '') => `/${String(endpoint).replace(/^\/+/, '').replace(/^api\/?/, '')}`;

/**
 * Custom hook for making API calls to the backend
 * Handles loading state, errors, and timeout
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `API Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      console.error('API Call Error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
};

export default useApi;
