import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WargaLayout from '../../components/WargaLayout';
import { 
  FiUser, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiEdit2, 
  FiLock, 
  FiLogOut,
  FiChevronRight,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const WargaProfileMobile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    {
      icon: FiEdit2,
      title: 'Edit Profil',
      subtitle: 'Ubah informasi pribadi',
      onClick: () => toast.info('Fitur dalam pengembangan'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FiLock,
      title: 'Ganti Password',
      subtitle: 'Ubah password akun',
      onClick: () => navigate('/warga/change-password'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FiLogOut,
      title: 'Keluar',
      subtitle: 'Logout dari aplikasi',
      onClick: handleLogout,
      color: 'from-red-500 to-red-600'
    }
  ];

  if (loading) {
    return (
      <WargaLayout>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 px-4 pt-6 pb-12 rounded-b-3xl shadow-xl">
          <h1 className="text-white text-2xl font-bold mb-6">Profil Saya</h1>
          
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-xl border-4 border-white">
              <span className="text-white text-4xl font-bold">
                {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            <h2 className="text-white text-xl font-bold mb-1">{user?.nama || 'Nama User'}</h2>
            <p className="text-slate-300 text-sm mb-4">NIK: {user?.nik || '-'}</p>
            
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <FiCheckCircle className="text-green-400" size={16} />
              <span className="text-white text-sm font-medium">Akun Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="px-4 -mt-8 space-y-4">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Informasi Pribadi</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-blue-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                  <p className="font-semibold text-gray-900">{user?.nama || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-green-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{user?.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-orange-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">No. Telepon</p>
                  <p className="font-semibold text-gray-900">{user?.no_telepon || 'Belum diisi'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-purple-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Alamat</p>
                  <p className="font-semibold text-gray-900 leading-relaxed">
                    {user?.alamat || 'Belum diisi'}
                  </p>
                  {(user?.rt || user?.rw) && (
                    <p className="text-sm text-gray-600 mt-1">
                      RT {user?.rt || '-'} / RW {user?.rw || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Pengaturan</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-all active:bg-gray-100"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                    </div>
                    <FiChevronRight className="text-gray-400" size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* App Info */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-5 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-1">Surat Digital Desa</p>
            <p className="text-xs text-slate-500">Kabupaten Bogor v1.0.0</p>
          </div>
        </div>
      </div>
    </WargaLayout>
  );
};

export default WargaProfileMobile;

