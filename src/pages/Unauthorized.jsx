import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-full">
            <FiAlertTriangle className="h-16 w-16" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-600 mb-8">
          Anda tidak memiliki akses ke halaman ini.
        </p>
        <Link to="/login" className="btn btn-primary">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

