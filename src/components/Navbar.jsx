import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiFileText, FiUsers, FiLogOut, FiMenu, FiX, FiSettings, FiCheckSquare } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user.role === 'super_admin') {
      return [
        { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/admin/jenis-surat', icon: FiFileText, label: 'Jenis Surat' },
        { path: '/admin/konfigurasi', icon: FiSettings, label: 'Konfigurasi Surat' },
        { path: '/admin/surat', icon: FiCheckSquare, label: 'Verifikasi Surat' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
      ];
    } else if (user.role === 'admin') {
      return [
        { path: '/verifikator/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/verifikator/surat', icon: FiFileText, label: 'Verifikasi Surat' },
        { path: '/verifikator/riwayat', icon: FiCheckSquare, label: 'Riwayat' },
      ];
    } else if (user.role === 'warga_universal') {
      return [
        { path: '/warga-universal/dashboard', icon: FiFileText, label: 'Buat Surat' },
        { path: '/warga-universal/history', icon: FiCheckSquare, label: 'Riwayat' },
      ];
    } else {
      return [
        { path: '/warga/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/warga/surat', icon: FiFileText, label: 'Pengajuan Surat' },
        { path: '/warga/history', icon: FiCheckSquare, label: 'History' },
        { path: '/warga/profile', icon: FiSettings, label: 'Profile' },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="bg-white p-1.5 rounded-lg shadow-md">
                <img 
                  src="/assets/Lambang_Kabupaten_Bogor.png" 
                  alt="Logo Kabupaten Bogor"
                  className="h-9 w-9 object-contain"
                  onError={(e) => {
                    e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#00AA13] to-[#00CC16] bg-clip-text text-transparent">
                  Surat Muliya
                </span>
                <p className="text-xs text-gray-500">Kabupaten Bogor</p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.nama}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-3 mb-2">
                <p className="text-base font-medium text-gray-900">{user.nama}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

