import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'mm_access_token';
const REFRESH_KEY = 'mm_refresh_token';

export const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.user_id };
    } catch {
      return null;
    }
  },
};

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = Auth.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      Auth.clear();
      window.location.href = '/auth';
    }
    const detail = err.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail) || err.message;
    return Promise.reject(new Error(message));
  }
);

export const mediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export const API = {
  categories: {
    list: () => api.get('/category/catgory'),
    get: (id) => api.get(`/category/category/${id}`),
  },
  listings: {
    list: () => api.get('/listing/list'),
    get: (id) => api.get(`/listing/get/${id}`),
    filter: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.set(k, v);
      });
      return api.get(`/listing/filter/?${q.toString()}`);
    },
    mine: () => api.get('/listing/user/'),
    create: (payload) => api.post('/listing/create', payload),
    update: (id, payload) => api.put(`/listing/update/${id}`, payload),
    remove: (id) => api.delete(`/listing/delete/${id}`),
    uploadMedia: (file, { listingId, sortOrder = 0, isCover = false }) => {
      const fd = new FormData();
      fd.append('file', file);
      const q = new URLSearchParams({ listing_id: listingId, sort_order: sortOrder, is_cover: isCover });
      return api.post(`/listing/media?${q.toString()}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
  saved: {
    list: () => api.get('/saved/list'),
    create: (listingId) => api.post('/saved/create', { listing_id: listingId }),
  },
  chat: {
    list: () => api.get('/conversation/list'),
    create: (payload) => api.post('/conversation/create', payload),
    getDetails: (id) => api.get(`/conversation/${id}`),
    sendMessage: (id, payload) => api.post(`/conversation/${id}/message`, payload),
    getMessages: (id, page = 1) => api.get(`/conversation/${id}/messages?page=${page}`),
  },
  user: {
    register: (email, password) => api.post('/user/register', { email, password }),
    confirm: (code) => api.post(`/user/confirm/${code}`),
    login: (email, password) => api.post('/user/login', { email, password }),
    refresh: (refresh_token) => api.post(`/user/refresh?refresh_token=${encodeURIComponent(refresh_token)}`),
    profile: () => api.get('/user/profile'),
    updateProfile: (payload) => api.put('/user/profile/update', payload),
    changePassword: (password) => api.put(`/user/change/password?password=${encodeURIComponent(password)}`),
  },
};

export default api;
