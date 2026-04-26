import * as axios from 'axios';

// Create axios instance
export const api = axios.default.create({
  baseURL: '/api',
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  login: '/users/login/',
  register: '/users/users/',
  
  // Products
  products: '/products/',
  categories: '/products/categories/',
  productsByCategory: '/products/categories/',
  banners: '/products/banners/', 
  siteSettings: '/products/site-settings/',
  
  // Orders
  orders: '/orders/',
  createOrder: '/orders/',
  
  // Admin
  adminProducts: '/admin/products/',
  adminCategories: '/admin/categories/',
  adminOrders: '/admin/orders/',
  adminUsers: '/admin/users/',

  // Notifications
  notifications: '/notifications/',
  deviceTokens: '/notifications/device-tokens/',
};

export default api;
