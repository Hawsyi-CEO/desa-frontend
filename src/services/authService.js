import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    // CLEAR SEMUA DATA LAMA SEBELUM LOGIN BARU
    sessionStorage.clear();
    
    const response = await api.post('/auth/login', { email, password });
    console.log('🔐 AuthService - Login response:', response.data);
    
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      
      console.log('💾 Saving to sessionStorage - Token:', token ? 'EXISTS' : 'NULL');
      console.log('💾 Saving to sessionStorage - User:', user);
      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ SessionStorage saved successfully (will be cleared when browser closes)');
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
    // Clear SEMUA sessionStorage
    sessionStorage.clear();
    
    // Atau lebih spesifik:
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    console.log('🚪 Logout - sessionStorage cleared');
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
