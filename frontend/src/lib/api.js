import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Don't automatically redirect - let the context handle auth state
      console.log('Unauthorized request - letting context handle auth state');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  signup: (userData) => axiosInstance.post('/api/auth/signup', userData),
  logout: () => axiosInstance.post('/api/auth/logout'),
  checkAuth: () => axiosInstance.get('/api/auth/check'),
  updateProfile: (data) => axiosInstance.put('/api/auth/update-profile', data),
};

// Messages API
export const messagesAPI = {
  getUsers: () => axiosInstance.get('/api/messages/users'),
  getMessages: (userId) => axiosInstance.get(`/api/messages/chat/${userId}`),
  sendMessage: (receiverId, messageData) =>
    axiosInstance.post(`/api/messages/send/${receiverId}`, messageData),
};

// Health check API
export const healthAPI = {
  check: () => axiosInstance.get('/health'),
};

// Groups API
export const groupsAPI = {
  createGroup: (data) => axiosInstance.post('/api/groups/create', data),
  getUserGroups: () => axiosInstance.get('/api/groups/my-groups'),
  getGroupMessages: (groupId) => axiosInstance.get(`/api/groups/${groupId}/messages`),
  sendGroupMessage: (groupId, messageData) =>
    axiosInstance.post(`/api/groups/${groupId}/send-message`, messageData),
  addGroupMember: (groupId, userIds) =>
    axiosInstance.post(`/api/groups/${groupId}/add-members`, { userIds }),
  removeGroupMember: (groupId, userId) =>
    axiosInstance.delete(`/api/groups/${groupId}/members/${userId}`),
  leaveGroup: (groupId) => axiosInstance.post(`/api/groups/${groupId}/leave`),
  deleteGroup: (groupId) => axiosInstance.delete(`/api/groups/${groupId}`),
  updateGroupSettings: (groupId, data) =>
    axiosInstance.put(`/api/groups/${groupId}/settings`, data),
};

// Export default instance for custom requests
export default axiosInstance;
