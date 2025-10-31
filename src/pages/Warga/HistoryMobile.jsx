import { useState, useEffect } from 'react';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEye, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import WargaLayout from "../../components/WargaLayout";
import HistoryModal from "../../components/HistoryModal";
import api from "../../services/api";

const WargaHistoryMobile = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuratId, setSelectedSuratId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSuratHistory();
  }, []);

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

  const handleViewHistory = (suratId) => {
    setSelectedSuratId(suratId);
    setShowHistoryModal(true);
  };

  const handleRevisiSurat = (suratId) => {
    window.location.href = `/warga/surat/revisi/${suratId}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-900', borderColor: 'border-yellow-200', icon: FiClock, text: 'Menunggu' },
      'menunggu_verifikasi_rt': { color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50', textColor: 'text-slate-900', borderColor: 'border-slate-200', icon: FiClock, text: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { color: 'from-slate-500 to-slate-600', bgColor: 'bg-slate-50', textColor: 'text-slate-900', borderColor: 'border-slate-200', icon: FiClock, text: 'Menunggu RW' },
      'disetujui_rt': { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200', icon: FiCheckCircle, text: 'Disetujui RT' },
      'disetujui_rw': { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200', icon: FiCheckCircle, text: 'Disetujui RW' },
      'revisi_rt': { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-900', borderColor: 'border-orange-200', icon: FiRefreshCw, text: 'Revisi RT' },
      'revisi_rw': { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-900', borderColor: 'border-orange-200', icon: FiRefreshCw, text: 'Revisi RW' },
      'ditolak': { color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-900', borderColor: 'border-red-200', icon: FiXCircle, text: 'Ditolak' },
      'selesai': { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200', icon: FiCheckCircle, text: 'Selesai' }
    };
    return configs[status] || { color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-900', borderColor: 'border-gray-200', icon: FiClock, text: status };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSurat = filterStatus === 'all' 
    ? suratList 
    : suratList.filter(s => {
        if (filterStatus === 'pending') return ['pending', 'menunggu_verifikasi_rt', 'menunggu_verifikasi_rw'].includes(s.status_surat);
        if (filterStatus === 'selesai') return s.status_surat === 'selesai';
        if (filterStatus === 'ditolak') return s.status_surat === 'ditolak';
        if (filterStatus === 'revisi') return ['revisi_rt', 'revisi_rw'].includes(s.status_surat);
        return true;
      });

  if (loading) {
    return (
      <WargaLayout>
        <div className="p-4 space-y-3">
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl mb-3"></div>
            ))}
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Riwayat Pengajuan</h1>
          <p className="text-slate-300 text-sm">Lihat semua pengajuan surat Anda</p>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 -mt-4 mb-4">
          <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'Semua', count: suratList.length },
              { key: 'pending', label: 'Proses', count: suratList.filter(s => ['pending', 'menunggu_verifikasi_rt', 'menunggu_verifikasi_rw'].includes(s.status_surat)).length },
              { key: 'selesai', label: 'Selesai', count: suratList.filter(s => s.status_surat === 'selesai').length },
              { key: 'revisi', label: 'Revisi', count: suratList.filter(s => ['revisi_rt', 'revisi_rw'].includes(s.status_surat)).length },
              { key: 'ditolak', label: 'Ditolak', count: suratList.filter(s => s.status_surat === 'ditolak').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  filterStatus === tab.key
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Surat List */}
        <div className="px-4 space-y-3">
          {filteredSurat.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <FiAlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Tidak ada data</h3>
              <p className="text-gray-500 text-sm">
                {filterStatus === 'all' 
                  ? 'Belum ada pengajuan surat' 
                  : 'Tidak ada surat dengan status ini'}
              </p>
            </div>
          ) : (
            filteredSurat.map((surat) => {
              const statusConfig = getStatusConfig(surat.status_surat);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={surat.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Status Bar */}
                  <div className={`h-2 bg-gradient-to-r ${statusConfig.color}`}></div>
                  
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight">
                          {surat.nama_surat}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <FiClock size={12} />
                          <span>{formatDate(surat.created_at)}</span>
                          <span>•</span>
                          <span>{formatTime(surat.created_at)}</span>
                        </div>
                      </div>
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${statusConfig.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <StatusIcon className="text-white" size={20} />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                      <StatusIcon size={12} />
                      {statusConfig.text}
                    </div>

                    {/* Notes */}
                    {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && surat.keterangan && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className="text-xs font-bold text-orange-900 mb-1 flex items-center gap-1">
                          <FiRefreshCw size={12} />
                          Catatan Revisi:
                        </p>
                        <p className="text-xs text-orange-800 leading-relaxed">{surat.keterangan}</p>
                      </div>
                    )}
                    
                    {surat.status_surat === 'ditolak' && surat.keterangan && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1">
                          <FiXCircle size={12} />
                          Alasan Ditolak:
                        </p>
                        <p className="text-xs text-red-800 leading-relaxed">{surat.keterangan}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleViewHistory(surat.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
                      >
                        <FiEye size={16} />
                        <span>Lihat Riwayat</span>
                      </button>
                      {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && (
                        <button
                          onClick={() => handleRevisiSurat(surat.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
                        >
                          <FiRefreshCw size={16} />
                          <span>Revisi Surat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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

export default WargaHistoryMobile;

