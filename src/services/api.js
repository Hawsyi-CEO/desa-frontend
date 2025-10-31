import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Base URL for uploads and static files (without /api)
// Prioritas: VITE_BASE_URL → derive dari VITE_API_URL → hardcoded production → localhost
export const BASE_URL = import.meta.env.VITE_BASE_URL 
  || (import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : (import.meta.env.MODE === 'production' 
          ? 'https://api.suratmuliya.id' 
          : 'http://localhost:5000'));

// Log untuk debugging (selalu tampilkan di console untuk debugging production)
console.log('🌐 Environment:', import.meta.env.MODE);
console.log('🔗 API URL:', API_URL);
console.log('📦 BASE URL:', BASE_URL);
console.log('📁 Upload URL example:', `${BASE_URL}/uploads/surat-pengantar/`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', error.message);
      console.error('Error details:', error.response?.status, error.response?.data);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - FORCE LOGOUT
      console.error('❌ 401 Unauthorized - Clearing session and redirecting to login');
      sessionStorage.clear(); // Clear semua data
      
      // Redirect ke login dengan query parameter
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    if (error.response?.status === 403) {
      // Forbidden - wrong role
      console.error('❌ 403 Forbidden - User tidak punya akses');
      if (!window.location.pathname.includes('/unauthorized')) {
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
