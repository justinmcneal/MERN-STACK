import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken } from './authToken'; // helper to get current in-memory access token

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // necessary for httpOnly cookies
});

// Attach in-memory access token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;