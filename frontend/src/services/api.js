import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    // Production: append /api to the backend URL
    const baseUrl = import.meta.env.VITE_API_URL;
    // Remove trailing slash if present, then add /api
    return baseUrl.replace(/\/$/, '') + '/api';
  }
  // Development: use relative path (Vite proxy handles it)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops if refreshing itself fails
    if (originalRequest.url === '/auth/refresh-token') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh-token');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('user');
        // Dispatch a custom event instead of hard-redirecting.
        // Hard redirects (window.location.href) force-unmount framer-motion
        // animations mid-tween, crashing with "t() is undefined".
        // AuthContext listens for this event and uses React Router navigate().
        window.dispatchEvent(new CustomEvent('auth:logout-required'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  updateAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateNotifications: (data) => api.put('/auth/notifications', data),
  getLearningStats: () => api.get('/auth/learning-stats')
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
  create: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  createWithFiles: (courseId, formData) => api.post(`/courses/${courseId}/lessons`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  updateWithFiles: (id, formData) => api.put(`/lessons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/lessons/${id}`)
};

export const enrollmentsAPI = {
  enroll: (data) => api.post('/enrollments', data),
  getMy: () => api.get('/enrollments/my'),
  updateProgress: (id, data) => api.put(`/enrollments/${id}/progress`, data),
  getAll: () => api.get('/enrollments/all')
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data),
  getDashboard: () => api.get('/users/dashboard')
};

export const lessonProgressAPI = {
  markComplete: (lessonId) => api.post(`/lessons/${lessonId}/complete`),
  markIncomplete: (lessonId) => api.delete(`/lessons/${lessonId}/complete`),
  getLessonProgress: (lessonId) => api.get(`/lessons/${lessonId}/progress`),
  getCourseProgress: (courseId) => api.get(`/courses/${courseId}/lesson-progress`),
  getLastIncompleteLesson: (courseId) => api.get(`/courses/${courseId}/last-lesson`)
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
  delete: (handoutId) => api.delete(`/handouts/${handoutId}`),
  getStudent: (courseId) => api.get(`/courses/${courseId}/student-handouts`)
};

export const paymentsAPI = {
  upload: (formData) => {
    return api.post('/payments', formData);
  },
  getMy: () => api.get('/payments/my'),
  getByEnrollment: (enrollmentId) => api.get(`/payments/enrollment/${enrollmentId}`),
  getAll: () => api.get('/payments/all'),
  getPending: () => api.get('/payments/pending'),
  verify: (id, data) => api.put(`/payments/${id}/verify`, data),
  getBankDetails: () => api.get('/payments/settings')
};

export const classLinkAPI = {
  getMy: () => api.get('/class-links/my'),
  getByCourse: (courseId) => api.get(`/class-links/course/${courseId}`),
  getMyByCourse: (courseId) => api.get(`/class-links/course/${courseId}/my`),
  create: (data) => api.post('/class-links', data),
  delete: (id) => api.delete(`/class-links/${id}`)
};

export const notificationsAPI = {
  getMy: () => api.get('/notifications/my'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};

export const announcementAPI = {
  getAll: (params) => api.get('/announcements', { params }),
  getByCourse: (courseId) => api.get(`/announcements/courses/${courseId}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
  getStudent: (courseId) => api.get('/announcements/student', { params: { courseId } }),
  getStudentAnnouncements: () => api.get('/announcements/student/all')
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getStudentAnalytics: (studentId) => api.get(`/analytics/students/${studentId}`)
};

export const studentGroupsAPI = {
  getMy: () => api.get('/student-groups/my'),
  getAll: () => api.get('/student-groups/all'),
  getDetails: (id) => api.get(`/student-groups/${id}`),
  getMembers: (id) => api.get(`/student-groups/${id}/members`),
  create: (data) => api.post('/student-groups', data),
  join: (id) => api.post(`/student-groups/${id}/join`),
  leave: (id) => api.delete(`/student-groups/${id}/leave`),
  getStudentsNotInGroup: (id) => api.get(`/student-groups/${id}/students/not-in-group`)
};

export const studentTodosAPI = {
  getMy: () => api.get('/student-todos/my'),
  create: (data) => api.post('/student-todos', data),
  update: (id, data) => api.put(`/student-todos/${id}`, data),
  delete: (id) => api.delete(`/student-todos/${id}`),
  toggle: (id) => api.put(`/student-todos/${id}/toggle`)
};

export const studentEventsAPI = {
  getMy: () => api.get('/student-events/my'),
  create: (data) => api.post('/student-events', data),
  update: (id, data) => api.put(`/student-events/${id}`, data),
  delete: (id) => api.delete(`/student-events/${id}`)
};

export const learningPathsAPI = {
  getAll: () => api.get('/learning-paths/all'),
  getMy: () => api.get('/learning-paths/my'),
  getDetails: (id) => api.get(`/learning-paths/${id}`),
  enroll: (id) => api.post(`/learning-paths/${id}/enroll`),
  unenroll: (id) => api.delete(`/learning-paths/${id}/enroll`)
};

export const studentGoalsAPI = {
  getMy: () => api.get('/student-goals/my'),
  create: (data) => api.post('/student-goals', data),
  update: (id, data) => api.put(`/student-goals/${id}`, data),
  delete: (id) => api.delete(`/student-goals/${id}`),
  updateProgress: (id, data) => api.put(`/student-goals/${id}/progress`, data)
};

export const learningResourcesAPI = {
  getMy: () => api.get('/learning-resources/my'),
  getByCategory: (category) => api.get(`/learning-resources/category/${category}`),
  getById: (id) => api.get(`/learning-resources/${id}`),
  getCategories: () => api.get('/learning-resources/categories')
};

export default api;
