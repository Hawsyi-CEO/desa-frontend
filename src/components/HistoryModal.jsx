import { useState, useEffect } from 'react';
import { FiX, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiFileText, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';

const HistoryModal = ({ isOpen, onClose, suratId }) => {
  const [loading, setLoading] = useState(false);
  const [suratDetail, setSuratDetail] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen && suratId) {
      fetchHistory();
    }
  }, [isOpen, suratId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching history for surat ID:', suratId);
      const response = await api.get(`/warga/surat/${suratId}`);
      console.log('API Response:', response.data);
      if (response.data.success) {
        setSuratDetail(response.data.data);
        setHistory(response.data.data.history || []);
        console.log('History data:', response.data.data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Gagal memuat riwayat: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'created':
        return <FiFileText className="w-5 h-5 text-blue-500" />;
      case 'verified':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case 'approved':
        return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'revised':
        return <FiRefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionText = (action, keterangan) => {
    // Extract action type from keterangan for verified/rejected actions
    if (keterangan) {
      if (keterangan.includes('RT:')) {
        if (action === 'verified') return 'Diverifikasi oleh RT';
        if (action === 'rejected') return 'Ditolak oleh RT';
      }
      if (keterangan.includes('RW:')) {
        if (action === 'verified') return 'Diverifikasi oleh RW';
        if (action === 'rejected') return 'Ditolak oleh RW';
      }
      if (keterangan.includes('VERIFIKATOR:')) {
        if (action === 'verified') return 'Diverifikasi oleh Verifikator';
        if (action === 'rejected') return 'Ditolak oleh Verifikator';
      }
    }
    
    const texts = {
      created: 'Surat Diajukan',
      verified: 'Diverifikasi',
      rejected: 'Ditolak',
      approved: 'Disetujui',
      revised: 'Direvisi'
    };
    return texts[action] || action;
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created':
        return 'bg-blue-50 border-blue-200';
      case 'verified':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'approved':
        return 'bg-emerald-50 border-emerald-200';
      case 'revised':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' },
      'menunggu_verifikasi_rt': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Menunggu RW' },
      'diproses': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Diproses' },
      'selesai': { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      'ditolak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      'revisi_rt': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Revisi RT' },
      'revisi_rw': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Revisi RW' }
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Riwayat Tracking Surat</h3>
                  {suratDetail && (
                    <p className="text-sm text-indigo-100">{suratDetail.nama_surat}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Memuat riwayat...</p>
              </div>
            ) : (
              <>
                {/* Current Status */}
                {suratDetail && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status Saat Ini:</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(suratDetail.status_surat).bg} ${getStatusBadge(suratDetail.status_surat).text}`}>
                            {getStatusBadge(suratDetail.status_surat).label}
                          </span>
                          {suratDetail.nomor_surat && (
                            <span className="text-sm text-gray-600">
                              Nomor: <span className="font-medium">{suratDetail.nomor_surat}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {(suratDetail.status_surat === 'revisi_rt' || suratDetail.status_surat === 'revisi_rw') && (
                        <div className="flex items-center gap-2 text-orange-600">
                          <FiAlertCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Perlu Perbaikan</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {history.length > 0 ? (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-4">
                      {history.map((item, index) => (
                        <div key={index} className="relative pl-14">
                          {/* Icon */}
                          <div className="absolute left-0 top-0 w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center z-10">
                            {getActionIcon(item.action)}
                          </div>

                          {/* Content */}
                          <div className={`p-4 rounded-lg border ${getActionColor(item.action)}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{getActionText(item.action, item.keterangan)}</h4>
                                <p className="text-sm text-gray-600">
                                  oleh <span className="font-medium">{item.user_name}</span>
                                  {item.role && (
                                    <span className="text-xs text-gray-500"> ({item.role})</span>
                                  )}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDate(item.created_at)}
                              </span>
                            </div>

                            {item.keterangan && (
                              <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                                <p className="text-sm text-gray-700 font-medium mb-1">Catatan:</p>
                                <p className="text-sm text-gray-600">{item.keterangan}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada riwayat untuk surat ini</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
