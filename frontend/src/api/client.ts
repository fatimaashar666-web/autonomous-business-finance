import axios from 'axios';

/**
 * Pre-configured Axios instance for all API communication.
 *
 * In development, Vite proxies /api requests to the NestJS backend.
 * In production, set VITE_API_BASE_URL to the backend's origin.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Response interceptor for centralized error handling ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status code
      console.error(
        `[API Error] ${error.response.status}: ${error.response.data?.message || error.message}`,
      );
    } else if (error.request) {
      // Request was sent but no response received
      console.error('[API Error] No response received from server.');
    } else {
      // Error in setting up the request
      console.error(`[API Error] ${error.message}`);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
