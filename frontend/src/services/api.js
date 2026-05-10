import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9092';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (userData) => publicApi.post('/api/auth/register', userData),
  login: (credentials) => publicApi.post('/api/auth/login', credentials),
  verifyOTP: (otpData) => publicApi.post('/api/auth/verify-otp', otpData),
  resendOTP: (email) => publicApi.post('/api/auth/resend-otp', { email }),
  forgotPassword: (email) => publicApi.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => publicApi.post('/api/auth/reset-password', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.put('/api/auth/change-password', data),
  getAddresses: () => api.get('/api/auth/addresses'),
  addAddress: (address) => api.post('/api/auth/addresses', address),
  getAllUsers: () => api.get('/api/auth/all-users'),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
  getWalletBalance: () => api.get('/api/auth/wallet'),
};

// Products
export const productAPI = {
  getAllProducts: () => publicApi.get('/api/products'),
  getProductsPaged: (params) => publicApi.get('/api/products/paged', { params }),
  getProductById: (id) => publicApi.get(`/api/products/${id}`),
  getProductsByBrand: (brand) => publicApi.get(`/api/products/brand/${brand}`),
  getProductsByCategory: (category) => publicApi.get(`/api/products/category/${category}`),
  getCategories: () => publicApi.get('/api/products/categories'),
  searchProducts: (name) => publicApi.get('/api/products/search', { params: { name } }),
  filterByPrice: (minPrice, maxPrice) => publicApi.get('/api/products/filter', { params: { minPrice, maxPrice } }),
  getRelatedProducts: (id) => publicApi.get(`/api/products/${id}/related`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  bulkDeleteProducts: (ids) => api.delete('/api/products/bulk', { data: ids }),
};

// Cart
export const cartAPI = {
  addToCart: (productData) => api.post('/api/cart/add', productData),
  getCart: () => api.get('/api/cart'),
  removeFromCart: (productId) => api.delete(`/api/cart/remove/${productId}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Orders
export const orderAPI = {
  placeOrder: (orderData) => api.post('/api/orders/place', orderData),
  getOrders: () => api.get('/api/orders'),
  getAllOrders: () => api.get('/api/orders/all'),
  getOrdersByUser: (email) => api.get(`/api/orders/user/${encodeURIComponent(email)}`),
  updateOrderStatus: (orderId, status) => api.put(`/api/orders/${orderId}/status`, null, { params: { status } }),
  updatePaymentStatus: (orderId, status) => api.put(`/api/orders/${orderId}/payment-status`, null, { params: { status } }),
  cancelOrder: (orderId) => api.put(`/api/orders/${orderId}/cancel`),
  requestRefund: (orderId, reason) => api.put(`/api/orders/${orderId}/refund-request`, { reason }),
  processRefund: (orderId, action) => api.put(`/api/orders/${orderId}/refund-process`, null, { params: { action } }),
  deleteOrder: (orderId) => api.delete(`/api/orders/${orderId}`),
  getAnalytics: () => api.get('/api/orders/analytics'),
};

// Wishlist
export const wishlistAPI = {
  addToWishlist: (productId) => api.post(`/api/wishlist/add/${productId}`),
  getWishlist: () => api.get('/api/wishlist/view'),
  removeFromWishlist: (productId) => api.delete(`/api/wishlist/remove/${productId}`),
};

// Reviews
export const reviewAPI = {
  getProductReviews: (productId) => publicApi.get(`/api/reviews/product/${productId}`),
  addReview: (reviewData) => api.post('/api/reviews', reviewData),
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
};

// Coupons
export const couponAPI = {
  validateCoupon: (code, orderTotal) => publicApi.post('/api/coupons/validate', null, { params: { code, orderTotal } }),
  createCoupon: (coupon) => api.post('/api/coupons', coupon),
  getAllCoupons: () => api.get('/api/coupons'),
  deleteCoupon: (id) => api.delete(`/api/coupons/${id}`),
};

export default api;
