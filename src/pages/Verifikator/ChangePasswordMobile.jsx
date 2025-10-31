import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import VerifikatorLayout from '../../components/VerifikatorLayout';
import axios from 'axios';

const ChangePasswordMobile = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validation, setValidation] = useState({
    minLength: false,
    hasNumber: false,
    hasLetter: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');

    // Validate new password
    if (name === 'newPassword') {
      setValidation({
        minLength: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasLetter: /[a-zA-Z]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password baru minimal 8 karakter');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (!validation.minLength || !validation.hasNumber || !validation.hasLetter) {
      setError('Password harus memenuhi semua kriteria keamanan');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/verifikator/change-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Password berhasil diubah! Silakan login ulang.');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Logout after 2 seconds
      setTimeout(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Change password error:', error);
      if (error.response?.status === 401) {
        setError('Password lama tidak sesuai');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerifikatorLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <FiArrowLeft size={20} />
            <span className="text-sm">Kembali</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <FiLock className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ganti Password</h1>
              <p className="text-sm text-gray-500 mt-0.5">Ubah password akun verifikator Anda</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password Lama
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Masukkan password lama"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Masukkan password baru"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicators */}
            {formData.newPassword && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    validation.minLength ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {validation.minLength && <FiCheck className="text-white" size={12} />}
                  </div>
                  <span className={`text-xs ${validation.minLength ? 'text-green-700' : 'text-gray-600'}`}>
                    Minimal 8 karakter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    validation.hasNumber ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {validation.hasNumber && <FiCheck className="text-white" size={12} />}
                  </div>
                  <span className={`text-xs ${validation.hasNumber ? 'text-green-700' : 'text-gray-600'}`}>
                    Mengandung angka
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    validation.hasLetter ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {validation.hasLetter && <FiCheck className="text-white" size={12} />}
                  </div>
                  <span className={`text-xs ${validation.hasLetter ? 'text-green-700' : 'text-gray-600'}`}>
                    Mengandung huruf
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ulangi password baru"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs mt-2 ${
                formData.newPassword === formData.confirmPassword
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formData.newPassword === formData.confirmPassword
                  ? '✓ Password cocok'
                  : '✗ Password tidak cocok'
                }
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            {loading ? 'Mengubah Password...' : 'Ubah Password'}
          </button>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips Keamanan</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
            <li>• Jangan gunakan informasi pribadi yang mudah ditebak</li>
            <li>• Ganti password secara berkala setiap 3-6 bulan</li>
            <li>• Jangan bagikan password kepada siapapun</li>
          </ul>
        </div>
      </div>
    </VerifikatorLayout>
  );
};

export default ChangePasswordMobile;

