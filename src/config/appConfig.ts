import { API_CONSTANTS } from '../lib/api/config';

/**
 * Application configuration
 *
 * This file uses the centralized API configuration from src/lib/api/config.ts
 */
export const appConfig = {
  useMockData: false,
  apiBaseUrl: API_CONSTANTS.URL, // Using centralized API URL configuration
  apiFullUrl: API_CONSTANTS.FULL_URL, // Full URL with API prefix
  defaultPaginationLimit: 10,
};