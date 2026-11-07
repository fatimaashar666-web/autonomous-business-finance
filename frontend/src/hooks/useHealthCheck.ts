import { useEffect, useState } from 'react';
import { apiClient } from '../api';
import type { HealthCheckResponse } from '../types';

/**
 * Fetches the backend health status on mount.
 * Returns { data, loading, error } for easy consumption.
 */
export function useHealthCheck() {
  const [data, setData] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<HealthCheckResponse>('/health')
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || 'Unable to reach the server.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
