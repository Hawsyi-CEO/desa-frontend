import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  console.log('PrivateRoute - user:', user, 'loading:', loading, 'required roles:', roles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    console.log('User role not authorized:', user.role, 'required:', roles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
