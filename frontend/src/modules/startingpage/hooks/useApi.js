import { useState, useCallback } from 'react';

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

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
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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
