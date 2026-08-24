import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    // Determine which token to use based on the path
    const isAdminPath = window.location.pathname.startsWith('/admin') || config.url.includes('/bookings/all');
    const tokenKey = isAdminPath ? 'admin_token' : 'user_token';
    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
