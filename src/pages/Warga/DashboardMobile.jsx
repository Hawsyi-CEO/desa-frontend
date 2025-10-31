import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WargaLayout from '../../components/WargaLayout';
import api from '../../services/api';
import { 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiPlusCircle, 
  FiArrowRight,
  FiTrendingUp,
  FiAlertCircle
} from 'react-icons/fi';

const WargaDashboardMobile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [jenisSurat, setJenisSurat] = useState([]);
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
      
      // Fetch surat warga
      const suratResponse = await api.get('/warga/surat');
      const suratData = suratResponse.data.data || [];
      
      // Calculate stats
      setStats({
        total: suratData.length,
        pending: suratData.filter(s => 
          s.status_surat === 'pending' || 
          s.status_surat === 'menunggu_verifikasi_rt' || 
          s.status_surat === 'menunggu_verifikasi_rw'
        ).length,
        approved: suratData.filter(s => s.status_surat === 'selesai').length,
        rejected: suratData.filter(s => s.status_surat === 'ditolak').length
      });
      
      // Get recent 3 surat
      setRecentSurat(suratData.slice(0, 3));
      
      // Fetch jenis surat aktif
      const jenisResponse = await api.get('/warga/jenis-surat');
      if (jenisResponse.data.success) {
        setJenisSurat(jenisResponse.data.data.slice(0, 6)); // Limit to 6 for mobile
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Menunggu' },
      'menunggu_verifikasi_rt': { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Verifikasi RT' },
      'menunggu_verifikasi_rw': { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Verifikasi RW' },
      'disetujui_rt': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RT' },
      'disetujui_rw': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RW' },
      'revisi_rt': { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Revisi RT' },
      'revisi_rw': { color: 'bg-orange-50 text-orange-700 border-orange-200', text: 'Revisi RW' },
      'ditolak': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Ditolak' },
      'selesai': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Selesai' }
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
      <WargaLayout>
        <div className="p-4 space-y-4">
          {/* Skeleton Loading */}
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-40 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
        {/* Welcome Card with Gradient */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-6 rounded-b-3xl shadow-xl">
          <div className="mb-4">
            <p className="text-slate-300 text-sm">Selamat Datang,</p>
            <h2 className="text-2xl font-bold mt-1">{user?.nama || 'Warga'}</h2>
            <p className="text-slate-300 text-sm mt-1">NIK: {user?.nik || '-'}</p>
          </div>

          {/* Stats Cards in Welcome Section */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 text-xs">Total Pengajuan</span>
                <FiFileText className="text-slate-300" size={18} />
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-200 text-xs">Selesai</span>
                <FiCheckCircle className="text-green-400" size={18} />
              </div>
              <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6 -mt-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Layanan Surat</h3>
              <button 
                onClick={() => navigate('/warga/surat')}
                className="text-slate-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Lihat Semua
                <FiArrowRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {jenisSurat.slice(0, 6).map((jenis) => (
                <button
                  key={jenis.id}
                  onClick={() => navigate(`/warga/surat?jenis=${jenis.id}`)}
                  className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-2 shadow-md">
                    <FiFileText className="text-white" size={20} />
                  </div>
                  <span className="text-xs text-center font-medium text-gray-700 leading-tight line-clamp-2">
                    {jenis.nama_surat.replace('Surat ', '')}
                  </span>
                </button>
              ))}
            </div>

            {/* Big CTA Button */}
            <button
              onClick={() => navigate('/warga/surat')}
              className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-98 shadow-lg"
            >
              <FiPlusCircle size={22} />
              Ajukan Surat Baru
            </button>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <FiClock className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                  <p className="text-xs text-yellow-700 font-medium">Diproses</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <FiXCircle className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                  <p className="text-xs text-red-700 font-medium">Ditolak</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Aktivitas Terbaru</h3>
              <button 
                onClick={() => navigate('/warga/history')}
                className="text-slate-700 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Lihat Semua
                <FiArrowRight size={16} />
              </button>
            </div>

            {recentSurat.length === 0 ? (
              <div className="text-center py-8">
                <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSurat.map((surat) => (
                  <div
                    key={surat.id}
                    onClick={() => navigate('/warga/history')}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-slate-50 transition-all cursor-pointer border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="text-slate-700" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {surat.nama_surat}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
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

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <FiTrendingUp className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-sm mb-1">Tips Pengajuan Surat</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pastikan data yang Anda masukkan sudah benar dan lengkap untuk mempercepat proses verifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WargaLayout>
  );
};

export default WargaDashboardMobile;

