import axios from 'axios';
import { API_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
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

// Clients API
export const clientsApi = {
  list: (params) => api.get('/clients', { params }),
  get: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Orders API
export const ordersApi = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  assignTechnician: (id, technician_id) => api.patch(`/orders/${id}/assign`, { technician_id }),
};

// Quotes API
export const quotesApi = {
  list: (params) => api.get('/quotes', { params }),
  get: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  approve: (id) => api.patch(`/quotes/${id}/approve`),
  reject: (id, reason) => api.patch(`/quotes/${id}/reject`, { rejection_reason: reason }),
  send: (id) => api.post(`/quotes/${id}/send`),
};

// Users API
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  listTechnicians: () => api.get('/users/technicians'),
};

// WhatsApp API
export const whatsappApi = {
  getStatus: () => api.get('/whatsapp/status'),
  getQR: () => api.get('/whatsapp/qr'),
  sendMessage: (phone_number, message) => api.post('/whatsapp/send', { phone_number, message }),
  disconnect: () => api.post('/whatsapp/disconnect'),
  getLogs: () => api.get('/whatsapp/logs'),
};

export default api;
