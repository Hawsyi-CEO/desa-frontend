import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WargaLayout from '../../components/WargaLayout';
import HistoryModal from '../../components/HistoryModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FiFileText, FiClock, FiCheckCircle, FiXCircle, FiChevronRight, 
  FiEye, FiRefreshCw, FiTrendingUp, FiAlertCircle 
} from 'react-icons/fi';

const WargaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [jenisSurat, setJenisSurat] = useState([]);
  const [recentSurat, setRecentSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuratId, setSelectedSuratId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
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
        setJenisSurat(jenisResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: FiClock, text: 'Menunggu' },
      'menunggu_verifikasi_rt': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiClock, text: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiClock, text: 'Menunggu RW' },
      'disetujui_rt': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Disetujui RT' },
      'disetujui_rw': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Disetujui RW' },
      'revisi_rt': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: FiRefreshCw, text: 'Revisi RT' },
      'revisi_rw': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: FiRefreshCw, text: 'Revisi RW' },
      'ditolak': { color: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle, text: 'Ditolak' },
      'selesai': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Selesai' }
    };
    return configs[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: FiClock, text: status };
  };

  const handleViewHistory = (suratId) => {
    setSelectedSuratId(suratId);
    setShowHistoryModal(true);
  };

  const handleRevisiSurat = (suratId) => {
    navigate(`/warga/surat/revisi/${suratId}`);
  };

  if (loading) {
    return (
      <WargaLayout>
        <div className="px-4 py-6 space-y-4">
          {/* Skeleton Loading */}
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-40 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white px-4 pt-6 pb-8 -mt-1">
          <div className="mb-6">
            <p className="text-slate-300 text-sm mb-1">Selamat datang,</p>
            <h2 className="text-2xl font-bold">{user?.nama || 'Warga'}</h2>
            <p className="text-slate-300 text-sm mt-1">NIK: {user?.nik || '-'}</p>
          </div>

          {/* Stats Cards - Overlapping */}
          <div className="grid grid-cols-2 gap-3 -mb-12">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiFileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Surat</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <FiClock className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Menunggu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-xl">
                  <FiCheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Disetujui</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-xl">
                  <FiXCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Ditolak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pt-16 pb-6 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Layanan Cepat</h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => navigate('/warga/surat')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center text-white">
                    <FiFileText size={20} />
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">Ajukan Surat</span>
                </button>

                <button
                  onClick={() => navigate('/warga/history')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                    <FiClock size={20} />
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">Riwayat</span>
                </button>

                <button
                  onClick={() => navigate('/warga/profile')}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                    <FiCheckCircle size={20} />
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">Profil</span>
                </button>

                <button
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                    <FiTrendingUp size={20} />
                  </div>
                  <span className="text-xs text-gray-700 text-center font-medium">Bantuan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Aktivitas Terkini</h3>
              <button
                onClick={() => navigate('/warga/history')}
                className="text-sm text-slate-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                Lihat Semua
                <FiChevronRight size={16} />
              </button>
            </div>

            {recentSurat.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiFileText className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 text-sm mb-4">Belum ada pengajuan surat</p>
                <button
                  onClick={() => navigate('/warga/surat')}
                  className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                  Ajukan Surat Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSurat.map((surat) => {
                  const statusConfig = getStatusConfig(surat.status_surat);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={surat.id}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <FiFileText className="text-slate-700" size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                            {surat.nama_jenis_surat}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(surat.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.text}
                          </div>

                          {/* Rejection/Revision Notes */}
                          {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && surat.keterangan && (
                            <div className="mt-2 p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
                              <p className="text-xs text-orange-900">
                                <span className="font-semibold">Catatan: </span>
                                {surat.keterangan}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => handleViewHistory(surat.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors"
                        >
                          <FiEye size={14} />
                          Lihat Detail
                        </button>
                        {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && (
                          <button
                            onClick={() => handleRevisiSurat(surat.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors"
                          >
                            <FiRefreshCw size={14} />
                            Revisi
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiAlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Informasi Penting</h4>
                <p className="text-sm text-blue-50">
                  Pastikan data yang Anda input sudah benar sebelum mengajukan surat. 
                  Proses verifikasi membutuhkan waktu 1-3 hari kerja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          isOpen={showHistoryModal}
          suratId={selectedSuratId}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </WargaLayout>
  );
};

export default WargaDashboard;
