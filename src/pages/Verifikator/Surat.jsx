import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PreviewSurat from '../../components/PreviewSurat';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VerifikatorSurat = () => {
  const { toast, hideToast, success, error, warning } = useToast();
  const { user } = useAuth();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

  const fetchSuratMasuk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/surat-masuk');
      setSuratList(response.data.data);
    } catch (err) {
      console.error('Error fetching surat:', err);
      error('Gagal mengambil data surat');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (surat) => {
    setSelectedSurat(surat);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSurat) return;

    try {
      setSubmitting(true);
      await api.put(`/verifikator/surat/${selectedSurat.id}/approve`, {
        keterangan: keterangan || 'Disetujui'
      });
      
      success('Surat berhasil disetujui!');
      setShowApproveModal(false);
      setShowDetailModal(false);
      setKeterangan('');
      fetchSuratMasuk();
    } catch (err) {
      console.error('Error approving surat:', err);
      error(err.response?.data?.message || 'Gagal menyetujui surat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSurat) return;

    if (!keterangan.trim()) {
      warning('Keterangan penolakan harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/verifikator/surat/${selectedSurat.id}/reject`, {
        keterangan
      });
      
      success('Surat berhasil ditolak');
      setShowRejectModal(false);
      setShowDetailModal(false);
      setKeterangan('');
      fetchSuratMasuk();
    } catch (err) {
      console.error('Error rejecting surat:', err);
      error(err.response?.data?.message || 'Gagal menolak surat');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'menunggu_verifikasi_rt': { color: 'yellow', text: 'Menunggu RT' },
      'menunggu_verifikasi_rw': { color: 'yellow', text: 'Menunggu RW' },
      'menunggu_admin': { color: 'blue', text: 'Menunggu Admin' },
      'disetujui': { color: 'green', text: 'Disetujui' },
      'ditolak': { color: 'red', text: 'Ditolak' },
      'revisi_rt': { color: 'orange', text: 'Revisi RT' },
      'revisi_rw': { color: 'orange', text: 'Revisi RW' }
    };

    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[statusInfo.color]}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Surat Masuk</h1>
            <p className="mt-2 text-gray-600">
              Daftar surat yang menunggu verifikasi Anda
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data surat...</p>
            </div>
          ) : suratList.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada surat</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tidak ada surat yang menunggu verifikasi saat ini
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <li key={surat.id}>
                    <div className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-blue-600 truncate">
                              {surat.nama_surat}
                            </p>
                            {getStatusBadge(surat.status_surat)}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Pemohon:</span> {surat.nama_pemohon}
                            </div>
                            <div>
                              <span className="font-medium">NIK:</span> {surat.nik_pemohon}
                            </div>
                            <div>
                              <span className="font-medium">RT/RW:</span> {surat.pemohon_rt}/{surat.pemohon_rw}
                            </div>
                            <div>
                              <span className="font-medium">Tanggal:</span> {new Date(surat.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => handleViewDetail(surat)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSurat && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detail Surat - {selectedSurat.nama_surat}
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Data Pemohon */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Data Pemohon</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nama:</span>
                      <p className="font-medium">{selectedSurat.nama_pemohon}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">NIK:</span>
                      <p className="font-medium">{selectedSurat.nik_pemohon}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">RT/RW:</span>
                      <p className="font-medium">{selectedSurat.pemohon_rt}/{selectedSurat.pemohon_rw}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal Pengajuan:</span>
                      <p className="font-medium">{new Date(selectedSurat.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                {/* Preview Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Lihat Preview Surat
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedSurat && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowApproveModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Setujui Surat
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Anda akan menyetujui surat <strong>{selectedSurat.nama_surat}</strong> dari <strong>{selectedSurat.nama_pemohon}</strong>.
                      </p>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Keterangan (opsional)
                        </label>
                        <textarea
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Catatan persetujuan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Ya, Setujui'}
                </button>
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={submitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSurat && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRejectModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Tolak Surat
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Anda akan menolak surat <strong>{selectedSurat.nama_surat}</strong> dari <strong>{selectedSurat.nama_pemohon}</strong>.
                      </p>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={keterangan}
                          onChange={(e) => setKeterangan(e.target.value)}
                          rows={4}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Jelaskan alasan penolakan..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleReject}
                  disabled={submitting || !keterangan.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Ya, Tolak'}
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={submitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedSurat && (
        <PreviewSurat
          surat={{
            ...selectedSurat,
            jenis_surat: {
              nama_surat: selectedSurat.nama_surat,
              kode_surat: selectedSurat.kode_surat,
              fields: selectedSurat.fields,
              template_konten: selectedSurat.template_konten,
              kalimat_pembuka: selectedSurat.kalimat_pembuka
            }
          }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {toast?.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </Layout>
  );
};

export default VerifikatorSurat;

