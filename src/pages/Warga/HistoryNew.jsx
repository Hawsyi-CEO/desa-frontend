import { useState, useEffect } from 'react';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEye, FiRefreshCw, FiFilter } from 'react-icons/fi';
import WargaLayout from "../../components/WargaLayout";
import HistoryModal from "../../components/HistoryModal";
import api from "../../services/api";

const WargaHistory = () => {
  const [suratList, setSuratList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuratId, setSelectedSuratId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    fetchSuratHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterStatus, suratList]);

  const fetchSuratHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warga/surat');
      setSuratList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching surat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterStatus === 'all') {
      setFilteredList(suratList);
    } else {
      setFilteredList(suratList.filter(s => s.status_surat === filterStatus));
    }
  };

  const handleViewHistory = (suratId) => {
    setSelectedSuratId(suratId);
    setShowHistoryModal(true);
  };

  const handleRevisiSurat = (suratId) => {
    window.location.href = `/warga/surat/revisi/${suratId}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: FiClock, text: 'Menunggu', dot: 'bg-yellow-500' },
      'menunggu_verifikasi_rt': { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FiClock, text: 'Menunggu RT', dot: 'bg-slate-500' },
      'menunggu_verifikasi_rw': { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FiClock, text: 'Menunggu RW', dot: 'bg-slate-500' },
      'disetujui_rt': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Disetujui RT', dot: 'bg-green-500' },
      'disetujui_rw': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Disetujui RW', dot: 'bg-green-500' },
      'revisi_rt': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: FiRefreshCw, text: 'Revisi RT', dot: 'bg-orange-500' },
      'revisi_rw': { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: FiRefreshCw, text: 'Revisi RW', dot: 'bg-orange-500' },
      'ditolak': { color: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle, text: 'Ditolak', dot: 'bg-red-500' },
      'selesai': { color: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle, text: 'Selesai', dot: 'bg-green-500' }
    };
    return configs[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: FiClock, text: status, dot: 'bg-gray-500' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filterOptions = [
    { value: 'all', label: 'Semua Status', count: suratList.length },
    { value: 'pending', label: 'Menunggu', count: suratList.filter(s => s.status_surat === 'pending').length },
    { value: 'menunggu_verifikasi_rt', label: 'Menunggu RT', count: suratList.filter(s => s.status_surat === 'menunggu_verifikasi_rt').length },
    { value: 'menunggu_verifikasi_rw', label: 'Menunggu RW', count: suratList.filter(s => s.status_surat === 'menunggu_verifikasi_rw').length },
    { value: 'selesai', label: 'Selesai', count: suratList.filter(s => s.status_surat === 'selesai').length },
    { value: 'revisi_rt', label: 'Revisi RT', count: suratList.filter(s => s.status_surat === 'revisi_rt').length },
    { value: 'revisi_rw', label: 'Revisi RW', count: suratList.filter(s => s.status_surat === 'revisi_rw').length },
    { value: 'ditolak', label: 'Ditolak', count: suratList.filter(s => s.status_surat === 'ditolak').length }
  ];

  if (loading) {
    return (
      <WargaLayout>
        <div className="px-4 py-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white sticky top-16 z-30 border-b px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Riwayat Surat</h1>
              <p className="text-sm text-gray-500">{filteredList.length} pengajuan</p>
            </div>
            <button
              onClick={() => setShowFilterSheet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <FiFilter size={18} />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {filteredList.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm mt-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data</h3>
              <p className="text-gray-600 text-sm mb-6">
                {filterStatus === 'all' 
                  ? 'Anda belum pernah mengajukan surat apapun' 
                  : 'Tidak ada surat dengan status ini'}
              </p>
              <a
                href="/warga/surat"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                <FiFileText size={18} />
                Ajukan Surat Baru
              </a>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredList.map((surat) => {
                const statusConfig = getStatusConfig(surat.status_surat);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={surat.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Main Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {/* Icon with status indicator */}
                        <div className="relative">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <FiFileText className="text-slate-700" size={22} />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusConfig.dot} rounded-full border-2 border-white`}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {surat.nama_jenis_surat}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-gray-500">{formatDate(surat.created_at)}</p>
                            {surat.nomor_surat && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">No. {surat.nomor_surat}</p>
                              </>
                            )}
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.text}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && surat.keterangan && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                          <div className="flex items-start gap-2">
                            <FiRefreshCw className="text-orange-600 mt-0.5" size={14} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-orange-900 mb-1">Catatan Revisi:</p>
                              <p className="text-xs text-orange-800 leading-relaxed">{surat.keterangan}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {surat.status_surat === 'ditolak' && surat.keterangan && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                          <div className="flex items-start gap-2">
                            <FiXCircle className="text-red-600 mt-0.5" size={14} />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-red-900 mb-1">Alasan Ditolak:</p>
                              <p className="text-xs text-red-800 leading-relaxed">{surat.keterangan}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => handleViewHistory(surat.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 active:scale-95 transition-all"
                      >
                        <FiEye size={16} />
                        Lihat Riwayat
                      </button>
                      {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && (
                        <button
                          onClick={() => handleRevisiSurat(surat.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all"
                        >
                          <FiRefreshCw size={16} />
                          Revisi Surat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter Bottom Sheet */}
      {showFilterSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setShowFilterSheet(false)}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up max-h-[80vh] overflow-hidden">
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Status Surat</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value);
                      setShowFilterSheet(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      filterStatus === option.value
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${
                      filterStatus === option.value
                        ? 'bg-white text-slate-700'
                        : 'bg-white text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          isOpen={showHistoryModal}
          suratId={selectedSuratId}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </WargaLayout>
  );
};

export default WargaHistory;
