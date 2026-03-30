import API from './axios';

// --- Auth API ---

export const register = (userData) => {
  return API.post('/auth/register', userData);
};

export const login = (loginData) => {
  return API.post('/auth/login', loginData);
};

export const verifyOtp = (otpData) => {
  return API.post('/auth/verify-otp', otpData);
};
export const resendOtp = (data) => API.post('/auth/resend-otp', data);

// ✅ ADDED: Fetches user profile using a specific token
// This solves the "export named getProfile" error
export const getProfile = (token) => {
  return API.get('/auth/profile', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

// --- Password Recovery ---

export const sendForgotPassword = (email) => {
  return API.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
  return API.post(`/auth/reset-password/${token}`, { newPassword });
};

export default API;