import axios from 'axios';

const API = axios.create({
  // Vite uses import.meta.env.VITE_APP_API_URL instead of process.env
  baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:5000/api',
});

// Automatically add the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Note: Some backends expect 'Authorization', others 'authorization' (lowercase)
    // Most Node.js/Express backends handle both.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default API;