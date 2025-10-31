import { useState, useEffect } from 'react';
import { FiHome, FiFileText, FiUser, FiBell, FiMenu } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logoBogor from '../assets/Lambang_Kabupaten_Bogor.png';

const WargaLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const bottomNavItems = [
    { icon: FiHome, label: 'Beranda', path: '/warga/dashboard', active: location.pathname === '/warga/dashboard' },
    { icon: FiFileText, label: 'Ajukan', path: '/warga/surat', active: location.pathname === '/warga/surat' },
    { icon: FiFileText, label: 'Riwayat', path: '/warga/history', active: location.pathname === '/warga/history' },
    { icon: FiUser, label: 'Profil', path: '/warga/profile', active: location.pathname === '/warga/profile' }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top App Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <img 
                src={logoBogor} 
                alt="Logo Kabupaten Bogor" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg">Surat Muliya</h1>
                <p className="text-xs text-slate-200">Desa Cibadak,Ciampea,Bogor</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-slate-600 rounded-full transition-colors"
              >
                <FiBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center font-bold text-sm">
                  {user?.nama?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50">
            <div className="bg-slate-700 px-4 py-3 text-white font-semibold">
              Notifikasi
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Surat Disetujui</p>
                    <p className="text-xs text-gray-600 mt-1">Surat Keterangan Domisili Anda telah disetujui</p>
                    <p className="text-xs text-gray-400 mt-1">2 jam yang lalu</p>
                  </div>
                </div>
              </div>
              <div className="p-4 text-center text-gray-500 text-sm">
                Tidak ada notifikasi baru
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - with top padding for fixed header */}
      <div className="pt-16">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="grid grid-cols-4 gap-1">
          {bottomNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-2 transition-all ${
                  item.active
                    ? 'text-slate-700'
                    : 'text-gray-400 hover:text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  item.active ? 'bg-slate-100' : ''
                }`}>
                  <Icon size={22} strokeWidth={item.active ? 2.5 : 2} />
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  item.active ? 'text-slate-800' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay when notifications open */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
};

export default WargaLayout;

