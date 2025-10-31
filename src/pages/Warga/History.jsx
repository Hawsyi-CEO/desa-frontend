import { useState, useEffect } from 'react';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiEye, FiRefreshCw } from 'react-icons/fi';
import Layout from "../../components/Layout";
import HistoryModal from "../../components/HistoryModal";
import api from "../../services/api";

const WargaHistory = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuratId, setSelectedSuratId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchSuratHistory();
  }, []);

  // Debug: monitor modal state
  useEffect(() => {
    console.log('Modal state changed:', { showHistoryModal, selectedSuratId });
  }, [showHistoryModal, selectedSuratId]);

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
    console.log('Opening history modal for surat ID:', suratId);
    setSelectedSuratId(suratId);
    setShowHistoryModal(true);
    console.log('State updated - showHistoryModal should be true');
    console.log('selectedSuratId:', suratId);
  };

  const handleRevisiSurat = (suratId) => {
    window.location.href = `/warga/surat/revisi/${suratId}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: FiClock, text: 'Menunggu' },
      'menunggu_verifikasi_rt': { color: 'bg-slate-100 text-slate-800', icon: FiClock, text: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { color: 'bg-slate-100 text-slate-800', icon: FiClock, text: 'Menunggu RW' },
      'disetujui_rt': { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Disetujui RT' },
      'disetujui_rw': { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Disetujui RW' },
      'revisi_rt': { color: 'bg-orange-100 text-orange-800', icon: FiRefreshCw, text: 'Revisi RT' },
      'revisi_rw': { color: 'bg-orange-100 text-orange-800', icon: FiRefreshCw, text: 'Revisi RW' },
      'ditolak': { color: 'bg-red-100 text-red-800', icon: FiXCircle, text: 'Ditolak' },
      'selesai': { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, text: 'Selesai' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: FiClock, text: status };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Riwayat Pengajuan Surat</h1>

          {suratList.length === 0 ? (
            <div className="card text-center py-12">
              <FiFileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pengajuan surat</h3>
              <p className="text-gray-600 mb-6">Anda belum pernah mengajukan surat apapun</p>
              <a
                href="/warga/surat"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiFileText size={18} />
                Ajukan Surat Baru
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {suratList.map((surat) => (
                <div key={surat.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FiFileText size={24} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {surat.nama_jenis_surat}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FiClock size={14} />
                              {formatDate(surat.created_at)}
                            </span>
                            <span>•</span>
                            <span>No. Pengajuan: {surat.nomor_surat || '-'}</span>
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(surat.status_surat)}
                          </div>
                          {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && surat.keterangan && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm font-medium text-orange-900 mb-1">Catatan Revisi:</p>
                              <p className="text-sm text-orange-800">{surat.keterangan}</p>
                            </div>
                          )}
                          {surat.status_surat === 'ditolak' && surat.keterangan && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-900 mb-1">Alasan Ditolak:</p>
                              <p className="text-sm text-red-800">{surat.keterangan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewHistory(surat.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <FiEye size={18} />
                        <span>Lihat Riwayat</span>
                      </button>
                      {(surat.status_surat === 'revisi_rt' || surat.status_surat === 'revisi_rw') && (
                        <button
                          onClick={() => handleRevisiSurat(surat.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <FiRefreshCw size={18} />
                          <span>Revisi Surat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
    </Layout>
  );
};

export default WargaHistory;
