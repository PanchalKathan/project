import axios from 'axios';

// Create a new Axios instance specifically for the admin panel
const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Use an interceptor to automatically add the admin's token to every request
adminApi.interceptors.request.use(
  (config) => {
    // This client looks for 'adminToken' in localStorage, NOT 'token'
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminApi;