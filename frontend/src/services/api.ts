import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getEvents: () => api.get('/dashboard/events'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

export const servicesAPI = {
  list: (params?: Record<string, string>) => api.get('/services', { params }),
  get: (id: number) => api.get(`/services/${id}`),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
};

export const modelsAPI = {
  list: (params?: Record<string, string>) => api.get('/models', { params }),
  get: (id: number) => api.get(`/models/${id}`),
  create: (data: any) => api.post('/models', data),
  delete: (id: number) => api.delete(`/models/${id}`),
};

export const clusterAPI = {
  listClusters: () => api.get('/clusters'),
  getCluster: (id: number) => api.get(`/clusters/${id}`),
  listNodes: (params?: Record<string, string>) => api.get('/nodes', { params }),
  getNode: (id: number) => api.get(`/nodes/${id}`),
};

export const eventsAPI = {
  list: (params?: Record<string, string>) => api.get('/events', { params }),
};

export const policiesAPI = {
  list: (params?: Record<string, string>) => api.get('/policies', { params }),
  create: (data: any) => api.post('/policies', data),
  update: (id: number, data: any) => api.put(`/policies/${id}`, data),
  delete: (id: number) => api.delete(`/policies/${id}`),
};

export default api;
