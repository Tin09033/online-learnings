import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data)
};

export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/courses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateStatus: (id, status) => api.put(`/courses/${id}/status`, { status }),
  delete: (id) => api.delete(`/courses/${id}`)
};

export const lessonsAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  create: (courseId, data) => {
    return api.post(`/courses/${courseId}/lessons`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    return api.put(`/lessons/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/lessons/${id}`)
};

export const enrollmentsAPI = {
  getAll: () => api.get('/enrollments/all')
};

export const handoutAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/handouts`),
  add: (courseId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });
    return api.post(`/courses/${courseId}/handouts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (handoutId, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });
    return api.put(`/handouts/${handoutId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (handoutId) => api.delete(`/handouts/${handoutId}`)
};

export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getStudentAnalytics: (studentId) => api.get(`/analytics/students/${studentId}`)
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
  getDashboard: () => api.get('/users/dashboard')
};

export const paymentsAPI = {
  getAll: () => api.get('/payments/all'),
  getPending: () => api.get('/payments/pending'),
  verify: (id, data) => api.put(`/payments/${id}/verify`, data),
  getBankDetails: () => api.get('/payments/settings'),
  updatePaymentSettings: (formData) => {
    return api.put('/payments/settings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const studentGroupAPI = {
  getAll: () => api.get('/student-groups/all'),
  getById: (id) => api.get(`/student-groups/${id}`),
  create: (data) => api.post('/student-groups', data),
  update: (id, data) => api.put(`/student-groups/${id}`, data),
  delete: (id) => api.delete(`/student-groups/${id}`),
  addMembers: (id, userIds) => api.post(`/student-groups/${id}/members`, { user_ids: userIds }),
  removeMember: (id, userId) => api.delete(`/student-groups/${id}/members/${userId}`),
  getStudentsNotInGroup: (id) => api.get(`/student-groups/${id}/students/not-in-group`),
  getAllStudents: () => api.get('/student-groups/students/all')
};

export default api;
