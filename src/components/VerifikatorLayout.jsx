import { useState, useEffect } from 'react';
import { FiHome, FiInbox, FiClock, FiBell, FiAward, FiLogOut, FiUser, FiLock, FiChevronDown } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logoBogor from '../assets/Lambang_Kabupaten_Bogor.png';
import axios from 'axios';
import LogoutConfirmModal from './LogoutConfirmModal';

const VerifikatorLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [verifikatorInfo, setVerifikatorInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Get verifikator info from user data
    if (userData.role === 'verifikator_rt' || userData.role === 'verifikator_rw') {
      setVerifikatorInfo({
        level: userData.role === 'verifikator_rt' ? 'RT' : 'RW',
        rt: userData.rt,
        rw: userData.rw
      });
    }

    // Fetch notifications
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/verifikator/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      // Set empty notifications on error (graceful fallback)
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const bottomNavItems = [
    { 
      icon: FiHome, 
      label: 'Dashboard', 
      path: '/verifikator/dashboard', 
      active: location.pathname === '/verifikator/dashboard' 
    },
    { 
      icon: FiInbox, 
      label: 'Surat Masuk', 
      path: '/verifikator/surat', 
      active: location.pathname === '/verifikator/surat' || location.pathname.startsWith('/verifikator/surat/')
    },
    { 
      icon: FiClock, 
      label: 'Riwayat', 
      path: '/verifikator/riwayat', 
      active: location.pathname === '/verifikator/riwayat' 
    }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {/* Top App Bar - Navy/Slate Theme */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-lg z-40">
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
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg">Surat Muliya</h1>
                  {verifikatorInfo && (
                    <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 text-xs font-bold rounded">
                      {verifikatorInfo.level}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Verifikator {verifikatorInfo?.level} {verifikatorInfo?.rt && `${verifikatorInfo.rt}/`}{verifikatorInfo?.rw}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  if (!showNotifications) {
                    fetchNotifications(); // Refresh on open
                  }
                }}
                className="relative p-2 hover:bg-slate-600 rounded-full transition-colors"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar with Badge & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 hover:bg-slate-600 px-2 py-1 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm ring-2 ring-yellow-400">
                      {user?.username?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <FiAward className="text-slate-900" size={12} />
                    </div>
                  </div>
                  <FiChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                    {/* User Info */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 text-white">
                      <p className="font-bold text-sm">{user?.nama || user?.username || 'Verifikator'}</p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {verifikatorInfo?.level} {verifikatorInfo?.rt && `${verifikatorInfo.rt}/`}{verifikatorInfo?.rw}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/verifikator/profile');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Profil Saya</p>
                          <p className="text-xs text-gray-500">Lihat profil verifikator</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/verifikator/change-password');
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <FiLock className="text-green-600" size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Ganti Password</p>
                          <p className="text-xs text-gray-500">Ubah password akun</p>
                        </div>
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <FiLogOut className="text-red-600" size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-red-900">Keluar</p>
                          <p className="text-xs text-red-600">Logout dari aplikasi</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loadingNotifications ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Memuat notifikasi...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/verifikator/surat');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1 truncate">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tidak ada notifikasi baru
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content - with top padding for fixed header */}
      <div className="pt-16">
        {children}
      </div>

      {/* Bottom Navigation - Navy/Slate Theme - 3 Items Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-40">
        <div className="grid grid-cols-3 gap-1">
          {bottomNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all ${
                  item.active
                    ? 'text-slate-800'
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

      {/* Overlay when dropdown open */}
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default VerifikatorLayout;

