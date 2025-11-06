import { useState, useEffect } from 'react';
import { FiHome, FiFileText, FiUser, FiBell, FiMenu } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import logoBogor from '../assets/Lambang_Kabupaten_Bogor.png';
import api from '../services/api';

const WargaLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    fetchNotifications();
    fetchPendingCount();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchPendingCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/warga/notifications');
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.data?.filter(n => !n.is_read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await api.get('/warga/surat');
      if (response.data.success) {
        const suratData = response.data.data || [];
        const pending = suratData.filter(s => 
          ['pending', 'menunggu_verifikasi_rt', 'menunggu_verifikasi_rw', 'revisi_rt', 'revisi_rw'].includes(s.status_surat)
        ).length;
        setPendingCount(pending);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/warga/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const bottomNavItems = [
    { icon: FiHome, label: 'Beranda', path: '/warga/dashboard', active: location.pathname === '/warga/dashboard' },
    { icon: FiFileText, label: 'Ajukan', path: '/warga/surat', active: location.pathname === '/warga/surat' },
    { icon: FiFileText, label: 'Riwayat', path: '/warga/history', active: location.pathname === '/warga/history', badge: pendingCount },
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
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
            <div className="bg-slate-700 px-4 py-3 text-white font-semibold flex items-center justify-between">
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.surat_id) {
                        navigate('/warga/history');
                        setShowNotifications(false);
                      }
                    }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notif.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatNotificationTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <FiBell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada notifikasi</p>
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
                <div className={`p-2 rounded-xl transition-all relative ${
                  item.active ? 'bg-slate-100' : ''
                }`}>
                  <Icon size={22} strokeWidth={item.active ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
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

