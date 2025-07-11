import axios from 'axios';

export const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
export const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3000/';
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