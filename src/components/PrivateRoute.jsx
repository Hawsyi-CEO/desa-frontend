import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  // Validate session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    
    if (!token || !savedUser) {
      console.warn('⚠️ PrivateRoute - No valid session found, clearing data');
      sessionStorage.clear();
    }
  }, []);

  console.log('PrivateRoute - user:', user?.email, user?.role, 'loading:', loading, 'required roles:', roles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user, redirecting to login');
    sessionStorage.clear(); // Clear stale data
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('❌ User role not authorized:', user.role, 'required:', roles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted to:', user.email, '- Role:', user.role);
  return children;
};

export default PrivateRoute;

