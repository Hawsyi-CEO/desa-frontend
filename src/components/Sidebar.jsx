import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiCheckCircle,
  FiClock,
  FiFile,
  FiUser,
  FiList,
  FiPlusCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close sidebar on mobile initially
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update body class when sidebar state changes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
      document.body.classList.remove('sidebar-closed');
    } else {
      document.body.classList.add('sidebar-closed');
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu berdasarkan role dengan kategori
  const getMenuItems = () => {
    if (user?.role === 'superadmin' || user?.role === 'super_admin') {
      return [
        { 
          category: 'Main',
          items: [
            { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
          ]
        },
        { 
          category: 'Manajemen Surat',
          items: [
            { path: '/admin/jenis-surat', icon: FiList, label: 'Jenis Surat' },
            { path: '/admin/surat', icon: FiFileText, label: 'Semua Surat' },
          ]
        },
        { 
          category: 'Manajemen User',
          items: [
            { path: '/admin/users', icon: FiUsers, label: 'Kelola Users' },
            { path: '/admin/data-warga', icon: FiUsers, label: 'Data Warga' },
          ]
        },
        { 
          category: 'Pengaturan',
          items: [
            { path: '/admin/konfigurasi', icon: FiSettings, label: 'Konfigurasi Surat' },
          ]
        },
      ];
    }
    
    if (user?.role === 'admin') {
      return [
        { 
          category: 'Main',
          items: [
            { path: '/verifikator/dashboard', icon: FiHome, label: 'Dashboard' },
          ]
        },
        { 
          category: 'Verifikasi Surat',
          items: [
            { path: '/verifikator/surat', icon: FiClock, label: 'Perlu Verifikasi' },
            { path: '/verifikator/riwayat', icon: FiCheckCircle, label: 'Riwayat Verifikasi' },
          ]
        },
        { 
          category: 'Data',
          items: [
            { path: '/verifikator/data-warga', icon: FiUsers, label: 'Data Warga' },
          ]
        },
      ];
    }
    
    if (user?.role === 'verifikator') {
      return [
        { 
          category: 'Main',
          items: [
            { path: '/verifikator/dashboard', icon: FiHome, label: 'Dashboard' },
          ]
        },
        { 
          category: 'Verifikasi Surat',
          items: [
            { path: '/verifikator/surat', icon: FiClock, label: 'Surat Masuk' },
            { path: '/verifikator/riwayat', icon: FiCheckCircle, label: 'Riwayat' },
          ]
        },
      ];
    }
    
    if (user?.role === 'warga') {
      return [
        { 
          category: 'Main',
          items: [
            { path: '/warga/dashboard', icon: FiHome, label: 'Dashboard' },
          ]
        },
        { 
          category: 'Layanan Surat',
          items: [
            { path: '/warga/surat', icon: FiPlusCircle, label: 'Ajukan Surat' },
            { path: '/warga/history', icon: FiFile, label: 'Riwayat Pengajuan' },
          ]
        },
        { 
          category: 'Akun',
          items: [
            { path: '/warga/profile', icon: FiUser, label: 'Profil Saya' },
          ]
        },
      ];
    }
    
    return [];
  };

  const menuItems = getMenuItems();
  
  // Debug log
  console.log('Sidebar - User:', user);
  console.log('Sidebar - Menu Items:', menuItems);

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open Menu"
          >
            <FiMenu className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <img 
              src="/assets/Lambang_Kabupaten_Bogor.png" 
              alt="Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
              }}
            />
            <span className="font-bold text-gray-900 text-sm">Surat Digital Desa</span>
          </div>
          
          {/* Empty space for balance */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'w-64' : 'lg:w-20'}
        `}
      >
        <div className="h-full w-full bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-2xl flex flex-col relative">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              {/* Logo & Title - Always show when open */}
              <div className={`flex items-center gap-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden lg:hidden'}`}>
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <img 
                    src="/assets/Lambang_Kabupaten_Bogor.png" 
                    alt="Logo Kabupaten Bogor"
                    className="w-9 h-9 object-contain"
                    onError={(e) => {
                      e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Surat Digital</h1>
                  <p className="text-xs text-slate-300">Kabupaten Bogor</p>
                </div>
              </div>
              
              {/* Logo Only - Desktop collapsed */}
              {!isOpen && (
                <div className="hidden lg:flex w-10 h-10 bg-white rounded-lg items-center justify-center mx-auto shadow-md">
                  <img 
                    src="/assets/Lambang_Kabupaten_Bogor.png" 
                    alt="Logo Kabupaten Bogor"
                    className="w-9 h-9 object-contain"
                    onError={(e) => {
                      e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                    }}
                  />
                </div>
              )}
              
              {/* Close Button - Mobile Only */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-white hover:bg-slate-700 p-2 rounded-lg transition-colors"
                aria-label="Close Menu"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-700">
            {isOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center shadow-md">
                  <FiUser className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">{user?.nama || user?.username || 'User'}</p>
                  <p className="text-xs text-slate-300 capitalize">
                    {user?.role === 'verifikator' 
                      ? user?.verifikator_level === 'rt' 
                        ? `Admin RT ${user?.rt || ''} / RW ${user?.rw || ''}`
                        : `Admin RW ${user?.rw || ''}`
                      : user?.role?.replace('_', ' ') || 'Guest'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <FiUser className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {isOpen ? (
              <div className="space-y-6">
                {menuItems && menuItems.length > 0 ? (
                  menuItems.map((category, catIndex) => (
                    <div key={catIndex}>
                      {/* Category Header */}
                      <div className="px-4 mb-2">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {category.category}
                      </h3>
                    </div>
                    
                    {/* Category Items */}
                    <ul className="space-y-1">
                      {category.items && category.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                active
                                  ? 'bg-white text-slate-900 shadow-lg font-semibold'
                                  : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                              }`}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  setIsOpen(false);
                                }
                              }}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-slate-400 text-sm">
                  Tidak ada menu tersedia
                </div>
              )}
            </div>
            ) : (
              // Mini sidebar - Icons only
              <div className="space-y-2">
                {menuItems && menuItems.length > 0 && 
                  menuItems.map((category) => 
                    category.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 mx-auto ${
                            active
                              ? 'bg-white text-slate-900 shadow-lg'
                              : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                          }`}
                          title={item.label}
                        >
                          <Icon className="w-5 h-5" />
                        </Link>
                      );
                    })
                  )
                }
              </div>
            )}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700">
            {isOpen ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Keluar</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 mx-auto"
                title="Keluar"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Toggle Button - Positioned on sidebar edge */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-3 top-20 bg-white hover:bg-gray-100 text-slate-900 p-2 rounded-full shadow-lg transition-all duration-300 hidden lg:flex items-center justify-center border-2 border-slate-300"
            style={{ zIndex: 40 }}
          >
            {isOpen ? (
              <FiChevronLeft className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
