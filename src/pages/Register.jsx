import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    no_telepon: '',
    alamat: '',
    rt: '',
    rw: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    if (formData.nik.length !== 16) {
      toast.error('NIK harus 16 digit');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
          <p className="mt-2 text-sm text-gray-600">Isi data diri Anda dengan lengkap</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NIK */}
              <div className="md:col-span-2">
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">
                  NIK <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    required
                    maxLength="16"
                    value={formData.nik}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="16 digit NIK"
                  />
                </div>
              </div>

              {/* Nama */}
              <div className="md:col-span-2">
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    required
                    value={formData.nama}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Nama lengkap"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              {/* No Telepon */}
              <div>
                <label htmlFor="no_telepon" className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="no_telepon"
                    name="no_telepon"
                    type="tel"
                    value={formData.no_telepon}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="md:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="alamat"
                    name="alamat"
                    rows="2"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Alamat lengkap"
                  />
                </div>
              </div>

              {/* RT */}
              <div>
                <label htmlFor="rt" className="block text-sm font-medium text-gray-700 mb-1">
                  RT
                </label>
                <input
                  id="rt"
                  name="rt"
                  type="text"
                  maxLength="3"
                  value={formData.rt}
                  onChange={handleChange}
                  className="input"
                  placeholder="001"
                />
              </div>

              {/* RW */}
              <div>
                <label htmlFor="rw" className="block text-sm font-medium text-gray-700 mb-1">
                  RW
                </label>
                <input
                  id="rw"
                  name="rw"
                  type="text"
                  maxLength="3"
                  value={formData.rw}
                  onChange={handleChange}
                  className="input"
                  placeholder="001"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary"
              >
                {loading ? 'Loading...' : 'Daftar'}
              </button>
              <Link to="/login" className="flex-1 btn btn-secondary text-center">
                Batal
              </Link>
            </div>

            <div className="text-sm text-center">
              <span className="text-gray-600">Sudah punya akun? </span>
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Login di sini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

