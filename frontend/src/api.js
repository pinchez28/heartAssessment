import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5050/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
