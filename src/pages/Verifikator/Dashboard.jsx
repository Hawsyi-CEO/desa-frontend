import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifikatorLayout from '../../components/VerifikatorLayout';
import api from '../../services/api';
import { 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiFileText, 
  FiUser,
  FiArrowRight,
  FiTrendingUp,
  FiAlertCircle,
  FiAward,
  FiMapPin
} from 'react-icons/fi';

const VerifikatorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSurat, setRecentSurat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const response = await api.get('/verifikator/dashboard');
      setStats(response.data.data);
      
      // Fetch recent surat
      const suratResponse = await api.get('/verifikator/surat-masuk');
      if (suratResponse.data.success) {
        setRecentSurat(suratResponse.data.data.slice(0, 3)); // Only 3 for mobile
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'menunggu_verifikasi_rt': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Menunggu RW' },
      'disetujui_rt': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RT' },
      'disetujui_rw': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RW' },
      'ditolak_rt': { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Ditolak RT' },
      'ditolak_rw': { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Ditolak RW' },
      'ditolak': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Ditolak' },
      'selesai': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Selesai' },
      'pending': { color: 'bg-gray-50 text-gray-700 border-gray-200', text: 'Pending' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', text: status };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <VerifikatorLayout>
        <div className="p-4 space-y-4">
          {/* Skeleton Loading */}
          <div className="animate-pulse">
            <div className="h-40 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-40 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </VerifikatorLayout>
    );
  }

  const levelBadge = stats?.verifikator_info?.level === 'rt' ? 'RT' : 'RW';
  const rtRwInfo = stats?.verifikator_info?.level === 'rt'
    ? `RT ${stats?.verifikator_info?.rt} / RW ${stats?.verifikator_info?.rw}`
    : `RW ${stats?.verifikator_info?.rw}`;

  return (
    <VerifikatorLayout>
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        {/* Welcome Card with Navy/Slate Gradient */}
        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-6 rounded-b-3xl shadow-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FiAward className="text-yellow-400" size={24} />
              <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full">
                VERIFIKATOR {levelBadge}
              </span>
            </div>
            <p className="text-slate-300 text-sm">Selamat Datang,</p>
            <h2 className="text-2xl font-bold mt-1">{user?.username || 'Verifikator'}</h2>
            <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm">
              <FiMapPin size={14} />
              <span>{rtRwInfo}</span>
            </div>
          </div>

          {/* Stats Cards in Welcome Section - Navy Theme */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 text-xs">Menunggu</span>
                <FiClock className="text-yellow-400" size={18} />
              </div>
              <p className="text-3xl font-bold">{stats?.stats?.menunggu_verifikasi || 0}</p>
              <p className="text-xs text-slate-300 mt-1">Perlu verifikasi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 text-xs">Diverifikasi</span>
                <FiCheckCircle className="text-green-400" size={18} />
              </div>
              <p className="text-3xl font-bold text-green-400">{stats?.stats?.diverifikasi_hari_ini || 0}</p>
              <p className="text-xs text-slate-300 mt-1">Hari ini</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6 -mt-6">
          {/* Quick Action Button */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
            <button
              onClick={() => navigate('/verifikator/surat')}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-98 shadow-lg"
            >
              <FiCheckCircle size={22} />
              Verifikasi Surat Sekarang
              <FiArrowRight size={20} />
            </button>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                  <FiCheckCircle className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{stats?.stats?.diverifikasi_hari_ini || 0}</p>
                  <p className="text-xs text-green-700 font-medium">Disetujui</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                  <FiXCircle className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{stats?.stats?.ditolak_hari_ini || 0}</p>
                  <p className="text-xs text-red-700 font-medium">Ditolak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Aktivitas Terbaru</h3>
              <button 
                onClick={() => navigate('/verifikator/surat')}
                className="text-slate-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Lihat Semua
                <FiArrowRight size={16} />
              </button>
            </div>

            {!recentSurat || recentSurat.length === 0 ? (
              <div className="text-center py-8">
                <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 text-sm">Belum ada surat yang perlu diverifikasi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSurat.map((surat) => (
                  <div
                    key={surat.id}
                    onClick={() => navigate('/verifikator/surat')}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:from-slate-100 transition-all cursor-pointer border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="text-slate-700" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {surat.nama_surat || 'Surat'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {surat.nama_pemohon || 'Warga'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(surat.created_at)}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(surat.status_surat)}
                      </div>
                    </div>
                    <FiArrowRight className="text-gray-400 flex-shrink-0 mt-2" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Banner - Navy Theme */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-4 border border-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                <FiTrendingUp className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Info Verifikator {levelBadge}</h4>
                <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
                  <p>• Anda adalah <strong>Verifikator {levelBadge}</strong> untuk <strong>{rtRwInfo}</strong></p>
                  {stats?.verifikator_info?.level === 'rt' && (
                    <p>• Verifikasi surat dari warga RT {stats?.verifikator_info?.rt} saja</p>
                  )}
                  {stats?.verifikator_info?.level === 'rw' && (
                    <p>• Verifikasi surat dari semua RT di RW {stats?.verifikator_info?.rw}</p>
                  )}
                  <p>• Setelah verifikasi, surat dilanjutkan ke tahap berikutnya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VerifikatorLayout>
  );
};

export default VerifikatorDashboard;

