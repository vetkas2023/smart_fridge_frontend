import axios from 'axios';
import { URL } from './config.js';

// Create an Axios instance with a base URL
const apiClient = axios.create({
  baseURL: URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor (e.g., for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Or use AsyncStorage in React Native
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor (e.g., for handling global errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized: Redirect to login');
          break;
        case 404:
          console.error('Not Found');
          break;
        case 500:
          console.error('Server Error');
          break;
        default:
          console.error('An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// API methods based on openapi.json
const apiService = {
  // Auth endpoints
  login: (data, userAgent) =>
    apiClient.post('/api/v1/auth/login', data, {
      headers: { 'User-Agent': userAgent },
    }),
  refreshTokens: (refreshToken, userAgent) =>
    apiClient.post(
      '/api/v1/auth/refresh_tokens',
      {},
      {
        headers: { 'User-Agent': userAgent },
        withCredentials: true,
      }
    ),
  logout: () => apiClient.delete('/api/v1/auth/logout'),

  // User endpoints
  createUser: (data) => apiClient.post('/api/v1/users/', data),
  getUser: () => apiClient.get('/api/v1/users/me'),
  deleteUser: () => apiClient.delete('/api/v1/users/me'),

  // Product Types endpoints
  getProductTypes: () => apiClient.get('/api/v1/product_types/'),
  createProductType: (data) => apiClient.post('/api/v1/product_types/', data),
  getProductType: (id) => apiClient.get(`/api/v1/product_types/${id}`),
  patchProductType: (id, data) =>
    apiClient.patch(`/api/v1/product_types/${id}`, data),
  updateProductType: (id, data) =>
    apiClient.put(`/api/v1/product_types/${id}`, data),
  deleteProductType: (id) => apiClient.delete(`/api/v1/product_types/${id}`),

  // Products endpoints
  getProducts: () => apiClient.get('/api/v1/products/'),
  createProduct: (data) => apiClient.post('/api/v1/products/', data),
  setProductOpened: (id) => apiClient.post(`/api/v1/products/open/${id}`),
  setProductClosed: (id) => apiClient.post(`/api/v1/products/close/${id}`),
  getProduct: (id) => apiClient.get(`/api/v1/products/${id}`),
  patchProduct: (id, data) => apiClient.patch(`/api/v1/products/${id}`, data),
  updateProduct: (id, data) => apiClient.put(`/api/v1/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/api/v1/products/${id}`),

  // Fridge Products endpoints
  createFridgeProduct: (data) => apiClient.post('/api/v1/fridge_products/', data),
  getFridgeProducts: (params) => apiClient.get('/api/v1/fridge_products/', { params }),
  getFridgeProduct: (id) => apiClient.get(`/api/v1/fridge_products/${id}`),
  patchFridgeProduct: (id, data) =>
    apiClient.patch(`/api/v1/fridge_products/${id}`, data),
  updateFridgeProduct: (id, data) =>
    apiClient.put(`/api/v1/fridge_products/${id}`, data),
  deleteFridgeProduct: (id) => apiClient.delete(`/api/v1/fridge_products/${id}`),

  // Fridges endpoints
  getFridges: () => apiClient.get('/api/v1/fridges/'),
  createFridge: (data) => apiClient.post('/api/v1/fridges/', data),
  getFridge: (fridgeId) => apiClient.get(`/api/v1/fridges/${fridgeId}`),
  patchFridge: (fridgeId, data) =>
    apiClient.patch(`/api/v1/fridges/${fridgeId}`, data),
  updateFridge: (fridgeId, data) =>
    apiClient.put(`/api/v1/fridges/${fridgeId}`, data),
  deleteFridge: (fridgeId) => apiClient.delete(`/api/v1/fridges/${fridgeId}`),

  // Cart Products endpoints
  getCartProducts: () => apiClient.get('/api/v1/cart_products/'),
  createCartProduct: (data) => apiClient.post('/api/v1/cart_products/', data),
  getCartProduct: (cartProductId) =>
    apiClient.get(`/api/v1/cart_products/${cartProductId}`),
  patchCartProduct: (cartProductId, data) =>
    apiClient.patch(`/api/v1/cart_products/${cartProductId}`, data),
  updateCartProduct: (cartProductId, data) =>
    apiClient.put(`/api/v1/cart_products/${cartProductId}`, data),
  deleteCartProduct: (cartProductId) =>
    apiClient.delete(`/api/v1/cart_products/${cartProductId}`),
};

export default apiService;
