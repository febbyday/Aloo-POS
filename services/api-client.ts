import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONSTANTS } from '../src/lib/api/config';

// Create axios instance with default config using centralized API configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONSTANTS.PREFIX, // Use the centralized API prefix
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONSTANTS.TIMEOUT, // Use the centralized timeout value (30 seconds)
});

// Add request interceptor for handling requests
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling responses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

// API client with type-safe methods
export const apiClient = {
  async get<T>(url: string, config = {}) {
    // Log the request for debugging
    console.log('API Request:', {
      method: 'GET',
      url,
      ...config,
    });
    return axiosInstance.get<T>(url, config);
  },

  async post<T>(url: string, data = {}, config = {}) {
    // Log the request for debugging
    console.log('API Request:', {
      method: 'POST',
      url,
      data,
      ...config,
    });
    return axiosInstance.post<T>(url, data, config);
  },

  async put<T>(url: string, data = {}, config = {}) {
    // Log the request for debugging
    console.log('API Request:', {
      method: 'PUT',
      url,
      data,
      ...config,
    });
    return axiosInstance.put<T>(url, data, config);
  },

  async delete<T>(url: string, config = {}) {
    // Log the request for debugging
    console.log('API Request:', {
      method: 'DELETE',
      url,
      ...config,
    });
    return axiosInstance.delete<T>(url, config);
  },

  async patch<T>(url: string, data = {}, config = {}) {
    // Log the request for debugging
    console.log('API Request:', {
      method: 'PATCH',
      url,
      data,
      ...config,
    });
    return axiosInstance.patch<T>(url, data, config);
  },
};