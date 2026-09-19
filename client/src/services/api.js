import axios from 'axios';

// Detect whether running in Vite dev server (port 5173) or unified production/Docker server
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Attach Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ucms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data && error.response.data.error?.includes('expired')) {
        localStorage.removeItem('ucms_token');
        localStorage.removeItem('ucms_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getDemoAccounts: () => api.get('/auth/demo-accounts'),
};

export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assignStaff: (id, data) => api.patch(`/complaints/${id}/assign`, data),
  addComment: (id, data) => api.post(`/complaints/${id}/comments`, data),
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
};

export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  getStaff: (id) => api.get(`/departments/${id}/staff`),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  triggerEscalation: () => api.post('/admin/escalate-now'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  reassign: (id, data) => api.patch(`/admin/reassign/${id}`, data),
};

export const statsAPI = {
  getAnalytics: () => api.get('/stats/analytics'),
};

export default api;
