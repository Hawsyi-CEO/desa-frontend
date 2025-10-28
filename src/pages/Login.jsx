import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiFileText } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (hanya saat component mount atau user berubah)
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting...', user.role);
      
      const redirectPath = 
        user.role === 'super_admin' ? '/admin/dashboard' :
        user.role === 'admin' ? '/verifikator/dashboard' :
        user.role === 'verifikator' ? '/verifikator/dashboard' :
        user.role === 'warga_universal' ? '/warga-universal/dashboard' :
        '/warga/dashboard';
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous error

    try {
      console.log('🔐 Attempting login with:', formData.email);
      const response = await login(formData.email, formData.password);
      console.log('✅ Login SUCCESS:', response);
      console.log('👤 User data:', response.data.user);
      console.log('🎯 User role:', response.data.user.role);
      
      // Show success message
      toast.success('Login berhasil!', {
        autoClose: 1500
      });
      
      // Trigger redirect setelah 200ms untuk ensure state updated
      setTimeout(() => {
        const userRole = response.data.user.role;
        console.log('🔄 Triggering redirect for role:', userRole);
        
        const redirectPath = 
          userRole === 'super_admin' ? '/admin/dashboard' :
          userRole === 'admin' ? '/verifikator/dashboard' :
          userRole === 'verifikator' ? '/verifikator/dashboard' :
          userRole === 'warga_universal' ? '/warga-universal/dashboard' :
          '/warga/dashboard';
        
        console.log('➡️ Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      }, 200);
      
    } catch (error) {
      console.error('❌ Login FAILED:', error);
      
      let errorMessage = 'Login gagal. Periksa NIK/Email dan password Anda.';
      
      if (error.response) {
        console.error('📛 Error response:', error.response);
        console.error('📛 Error data:', error.response.data);
        console.error('📛 Error status:', error.response.status);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('📛 No response from server:', error.request);
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
      } else {
        console.error('📛 Error:', error.message);
        errorMessage = error.message;
      }
      
      console.error('📛 Final error message:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
              <img 
                src="/assets/Lambang_Kabupaten_Bogor.png" 
                alt="Logo Kabupaten Bogor"
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                onError={(e) => {
                  e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                }}
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Surat Digital Desa</h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Kabupaten Bogor</p>
          <p className="mt-1 text-xs text-gray-500">Silakan login untuk melanjutkan</p>
        </div>

        <div className="bg-white py-6 sm:py-8 px-5 sm:px-6 shadow-xl rounded-xl sm:rounded-2xl border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email / NIK
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all duration-200 outline-none"
                  placeholder="contoh@email.com atau 3201234567890123"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Warga: gunakan NIK 16 digit | Staff: gunakan NIK khusus
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all duration-200 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Memproses...</span>
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            <div className="text-xs sm:text-sm text-center">
              <span className="text-gray-600">Belum punya akun? </span>
              <Link to="/register" className="font-medium text-slate-800 hover:text-slate-900 underline">
                Daftar sekarang
              </Link>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 sm:mb-3 text-center font-semibold uppercase tracking-wide">Akun Demo</p>
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs font-medium text-slate-900">Super Admin</p>
                <p className="text-xs text-slate-600 break-all">superadmin@desa.com / admin123</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs font-medium text-slate-900">Admin RT/RW</p>
                <p className="text-xs text-slate-600 break-all">admin@desa.com / admin123</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs font-medium text-emerald-900">Admin RT (Verifikator)</p>
                <p className="text-xs text-emerald-700 break-all">rt01.rw01@verifikator.desa / verifikator123</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs font-medium text-blue-900">Admin RW (Verifikator)</p>
                <p className="text-xs text-blue-700 break-all">rw01@verifikator.desa / verifikator123</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 sm:p-2.5">
                <p className="text-xs font-medium text-slate-900">Warga</p>
                <p className="text-xs text-slate-600 break-all">warga@desa.com / warga123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
