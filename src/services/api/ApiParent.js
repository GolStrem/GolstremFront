import axios from 'axios';

// ✅ Utilisation de import.meta.env à la place de process.env
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const getApiBaseUrl = () => {
  if (window.location.protocol === 'https:') {
    return import.meta.env.VITE_API_ENDPOINT_SECURE;
  }
  return import.meta.env.VITE_API_ENDPOINT;
};

export const API_BASE_URL = getApiBaseUrl() || 'http://localhost:3000/';

export const TOKEN_KEY = 'token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => token && localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const logout = () => {
  // @todo
};

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) clearToken();
    return error;
  }
);

export const mockWait = (ms = 500) => new Promise((res) => setTimeout(res, ms));
