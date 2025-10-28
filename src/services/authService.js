import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    console.log('🔐 AuthService - Login response:', response.data);
    
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      
      console.log('💾 Saving to localStorage - Token:', token ? 'EXISTS' : 'NULL');
      console.log('💾 Saving to localStorage - User:', user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ LocalStorage saved successfully');
    }
    
    return response; // Return full response, not response.data
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/auth/password', { oldPassword, newPassword });
    return response.data;
  },
};

export default authService;
