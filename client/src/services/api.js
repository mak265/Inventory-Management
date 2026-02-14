import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth
  register(user) {
    return apiClient.post('/auth/register', user);
  },
  verifyOtp(data) {
    return apiClient.post('/auth/verify-otp', data);
  },
  resendOtp(data) {
    return apiClient.post('/auth/resend-otp', data);
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  activateAccount(data) {
    return apiClient.post('/auth/activate', data);
  },
  getMe() {
    return apiClient.get('/auth/me');
  },
  forgotPassword(data) {
    return apiClient.post('/auth/forgot-password', data);
  },
  resetPassword(data) {
    return apiClient.post('/auth/reset-password', data);
  },

  // Items
  getItems() {
    return apiClient.get('/items');
  },
  getItem(id) {
    return apiClient.get(`/items/${id}`);
  },
  createItem(item) {
    return apiClient.post('/items', item);
  },
  updateItem(id, item) {
    return apiClient.put(`/items/${id}`, item);
  },
  deleteItem(id) {
    return apiClient.delete(`/items/${id}`);
  },

  // Sales
  createSale(saleData) {
    return apiClient.post('/sales', saleData);
  },
  getSales(params) {
    return apiClient.get('/sales', { params });
  },
  getSalesCsv(params) {
    return apiClient.get('/sales', { params: { ...params, format: 'csv' }, responseType: 'blob' });
  },
  getSalesStats(params) {
    return apiClient.get('/sales/stats', { params });
  },
  getDashboard() {
    return apiClient.get('/dashboard');
  },
  getInventoryReport(params) {
    return apiClient.get('/reports/inventory', { params });
  },
  getStockInReport(params) {
    return apiClient.get('/reports/stock-in', { params });
  },
  getStockOutReport(params) {
    return apiClient.get('/reports/stock-out', { params });
  },
  getLowStockReport(params) {
    return apiClient.get('/reports/low-stock', { params });
  },
  getUsageByProject(params) {
    return apiClient.get('/reports/usage-by-project', { params });
  },

  // Categories
  getCategories() {
    return apiClient.get('/categories');
  },
  createCategory(category) {
    return apiClient.post('/categories', category);
  },
  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`);
  },

  // Projects
  getProjects() {
    return apiClient.get('/projects');
  },
  getProject(id) {
    return apiClient.get(`/projects/${id}`);
  },
  createProject(project) {
    return apiClient.post('/projects', project);
  },
  
  // Users
  getUsers() {
    return apiClient.get('/users');
  },
  getEngineers() {
    return apiClient.get('/users', { params: { role: 'site_engineer' } });
  },
  createUser(user) {
    return apiClient.post('/users', user);
  },
  updateUserRole(id, role) {
    return apiClient.put(`/users/${id}/role`, { role });
  },
  deleteUser(id) {
    return apiClient.delete(`/users/${id}`);
  },
  updateProject(id, project) {
    return apiClient.put(`/projects/${id}`, project);
  },
  deleteProject(id) {
    return apiClient.delete(`/projects/${id}`);
  },

  // Transactions
  getTransactions(params) {
    return apiClient.get('/transactions', { params });
  },
  updateTransactionPayment(id, data) {
    return apiClient.put(`/transactions/${id}/payment`, data);
  },
  stockIn(data) {
    return apiClient.post('/transactions/in', data);
  },
  stockOut(data) {
    return apiClient.post('/transactions/out', data);
  },
  adjustStock(data) {
    return apiClient.post('/transactions/adjust', data);
  },

  // Orders
  getOrders(params) {
    return apiClient.get('/orders', { params });
  },
  getMyOrders() {
    return apiClient.get('/orders', { params: { view: 'mine' } });
  },
  getOrder(id) {
    return apiClient.get(`/orders/${id}`);
  },
  createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },
  updateOrderStatus(id, status, assignedTo = null) {
    return apiClient.put(`/orders/${id}/status`, { status, assignedTo });
  },

  // Activity Logs
  getActivityLogs(params) {
    return apiClient.get('/activity-logs', { params });
  }
};
