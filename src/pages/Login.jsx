import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiFileText, FiUser, FiShield, FiCheck } from 'react-icons/fi';
import logoKabupaten from '../assets/Lambang_Kabupaten_Bogor.png';

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
      console.log('👤 User data:', response.data.data.user);
      console.log('🎯 User role:', response.data.data.user.role);
      
      // Trigger redirect setelah 200ms untuk ensure state updated
      setTimeout(() => {
        const userRole = response.data.data.user.role;
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
      let toastType = 'error';
      
      if (error.response) {
        console.error('📛 Error response:', error.response);
        console.error('📛 Error data:', error.response.data);
        console.error('📛 Error status:', error.response.status);
        
        const status = error.response.status;
        const serverMessage = error.response.data?.message || '';
        
        // Customize message based on status code
        if (status === 401) {
          errorMessage = '❌ Email/NIK atau Password salah!';
        } else if (status === 404) {
          errorMessage = '❌ Akun tidak ditemukan. Periksa NIK/Email Anda.';
        } else if (status === 403) {
          errorMessage = '🚫 Akses ditolak. Hubungi administrator.';
        } else if (status === 500) {
          errorMessage = '⚠️ Server error. Silakan coba lagi nanti.';
        } else {
          errorMessage = serverMessage || errorMessage;
        }
        
      } else if (error.request) {
        console.error('📛 No response from server:', error.request);
        errorMessage = '🌐 Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        console.error('📛 Error:', error.message);
        errorMessage = error.message;
      }
      
      console.error('📛 Final error message:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden relative">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Animated orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full lg:h-auto">
          
          {/* Left Side - Hero Section (Hidden on Mobile) */}
          <div className="hidden lg:block text-white space-y-8 animate-fadeInLeft">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
                <img 
                  src={logoKabupaten} 
                  alt="Logo Kabupaten Bogor"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Surat Muliya
                </h1>
                <p className="text-sm text-blue-200 mt-1">Desa Cibadak</p>
                <p className="text-sm text-blue-200 mt-1">Kecamatan Ciampea</p>
                <p className="text-sm text-blue-200 mt-1">Kabupaten Bogor</p>

              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-xl lg:text-2xl font-semibold text-white/90">
                Sistem Pengelolaan Surat Digital
              </p>
              <p className="text-base text-white/70 leading-relaxed">
                Platform modern untuk pengelolaan administrasi desa yang cepat, efisien, dan transparan untuk melayani masyarakat dengan lebih baik.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FiCheck className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Cepat & Efisien</h3>
                  <p className="text-sm text-white/60 mt-1">Proses pengajuan surat dalam hitungan menit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <FiShield className="w-5 h-5 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Aman & Terpercaya</h3>
                  <p className="text-sm text-white/60 mt-1">Data terenkripsi dengan sistem keamanan terbaik</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <FiUser className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mudah Digunakan</h3>
                  <p className="text-sm text-white/60 mt-1">Interface yang user-friendly untuk semua kalangan</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <FiFileText className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Tanpa Kertas</h3>
                  <p className="text-sm text-white/60 mt-1">Go green dengan sistem digital paperless</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-white/60 mt-1">Akses Kapan Saja</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-white/60 mt-1">Digital</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-sm text-white/60 mt-1">Surat Tersedia</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card with Glass Morphism */}
          <div className="w-full max-w-md mx-auto animate-fadeInRight h-full lg:h-auto flex items-center">
            {/* Mobile Header - Show only on mobile */}
            <div className="w-full">
              <div className="lg:hidden text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-2xl">
                    <img 
                      src={logoKabupaten} 
                      alt="Logo Kabupaten Bogor"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Surat Muliya
                    </h1>
                    <p className="text-xs text-blue-200">Desa Cibadak</p>
                    <p className="text-xs text-blue-200">Kecamatan Ciampea</p>
                    <p className="text-xs text-blue-200">Kabupaten Bogor</p>

                  </div>
                </div>
              </div>

              {/* Glass Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 p-6 lg:p-10">
                {/* Header */}
                <div className="text-center mb-6 lg:mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl lg:rounded-2xl mb-3 lg:mb-4 shadow-lg">
                    <FiLock className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Selamat Datang</h2>
                  <p className="text-sm lg:text-base text-gray-600">Silakan masuk ke akun Anda</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs lg:text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
                  {/* Email/NIK Input */}
                  <div className="group">
                    <label htmlFor="email" className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                      Email / NIK
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                        <FiMail className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3.5 text-sm lg:text-base text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none placeholder:text-gray-400"
                        placeholder="Masukkan NIK atau Email"
                      />
                    </div>
                    <p className="mt-1.5 lg:mt-2 text-[10px] lg:text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        Warga: NIK 16 digit | Staff: Email khusus
                      </span>
                    </p>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label htmlFor="password" className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                        <FiLock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3.5 text-sm lg:text-base text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg lg:rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none placeholder:text-gray-400"
                        placeholder="••••••••••"
                      />
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 lg:py-4 px-6 rounded-lg lg:rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2 lg:gap-3">
                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm lg:text-base">Memproses...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FiLock className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-sm lg:text-base">Masuk Sekarang</span>
                      </span>
                    )}
                  </button>

                  {/* Info Text */}
                  <div className="text-xs lg:text-sm text-center pt-1 lg:pt-2">
                    <p className="text-gray-600">
                      Belum punya akun? <span className="text-blue-600 font-semibold">Hubungi Staff Desa</span>
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer - Only on mobile */}
              <p className="lg:hidden text-center text-white/70 text-[10px] mt-4">
                © 2025 Desa Cibadak. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
