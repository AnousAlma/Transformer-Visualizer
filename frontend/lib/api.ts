/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change NEXT_PUBLIC_API_BASE_URL in .env.local to update the API base URL.
 */

// Get the API base URL from environment variable, fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Get the full API endpoint URL
 * @param endpoint - The API endpoint path (e.g., '/v1/tokenize')
 * @returns Full URL for the API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Common API request headers
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Common fetch wrapper with error handling
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns Promise with the response
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...API_HEADERS,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
};
