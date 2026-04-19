import axios from 'axios';

export const BASE_URL = "https://kids-social-media-backend.onrender.com";

const API = axios.create({
  baseURL: `${BASE_URL}/api`, 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // DEBUG: Check your console in the browser to see if this prints
  console.log("Interceptor Token:", token ? "Found ✅" : "NOT FOUND ❌");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;