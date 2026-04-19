import axios from 'axios';

// 🎯 THE ONLY LINE YOU CHANGE FOR PRODUCTION
// For Local: "http://localhost:5000"
// For Production: "https://kids-social-media-backend.onrender.com"
export const BASE_URL = import.meta.env.VITE_APP_URL || "http://localhost:5000";

const API = axios.create({
  // This adds /api to your requests automatically
  baseURL: `${BASE_URL}/api`, 
});

// Automatically add the JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;