import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    
    console.log('🔍 AuthContext - Checking stored credentials');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!savedUser);
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ User loaded from sessionStorage:', parsedUser.email, '- Role:', parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ Failed to parse saved user, clearing sessionStorage');
        sessionStorage.clear();
        setUser(null);
      }
    } else {
      console.log('⚠️ No valid credentials found');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext - Attempting login for:', email);
      const response = await authService.login(email, password);
      const userData = response.data.data.user;
      
      console.log('✅ Login successful - User:', userData.email, '- Role:', userData.role);
      setUser(userData);
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      // Clear any stale data
      sessionStorage.clear();
      setUser(null);
      // Re-throw error agar bisa di-catch di Login.jsx
      throw error;
    }
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    console.log('🚪 AuthContext - Logging out user:', user?.email);
    authService.logout();
    setUser(null);
    
    // Force reload untuk clear semua state
    window.location.href = '/login';
  };

  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin',
    isVerifikator: user?.role === 'verifikator',
    isWarga: user?.role === 'warga',
    isWargaUniversal: user?.role === 'warga_universal',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

