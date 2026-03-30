// src/api/video.api.js
import API from './axios';

export const uploadVideo = (formData) => {
  // ✅ DO NOT set headers manually. 
  // Let Axios and the Browser handle the boundary.
  return API.post('/videos/upload', formData);
};

export const fetchFeed = () => API.get('/videos/feed');