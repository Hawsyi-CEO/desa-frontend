import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PreviewSurat from '../../components/PreviewSurat';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';

const VerifikatorSurat = () => {
  const { toast, hideToast, success, error, warning } = useToast();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurat();
  }, []);

  const fetchSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/surat');
      setSuratList(response.data.data);
    } catch (err) {
      console.error('Error fetching surat:', err);
      error('Gagal mengambil data surat');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/verifikator/surat/${id}`);
      setSelectedSurat(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching surat detail:', err);
      error('Gagal mengambil detail surat');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action) => {
    if (!catatan && action === 'reject') {
      warning('Catatan harus diisi saat menolak surat');
      return;
    }

    if (!confirm(`Yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} surat ini?`)) {
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/verifikator/surat/${selectedSurat.id}/verify`, {
        action,
        catatan
      });
      
      success(`Surat berhasil ${action === 'approve' ? 'diverifikasi' : 'ditolak'}`);
      setShowDetailModal(false);
      setCatatan('');
      fetchSurat();
    } catch (err) {
      console.error('Error verifying surat:', err);
      error(err.response?.data?.message || 'Gagal memverifikasi surat');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      'menunggu_verifikasi': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Verifikasi' },
      'diverifikasi': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Diverifikasi' },
      'disetujui': { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      'ditolak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' }
    };

    const config = statusConfig[status] || statusConfig['draft'];
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Verifikasi Surat</h1>
            <p className="mt-2 text-sm text-gray-600">
              Daftar surat yang perlu diverifikasi dari warga di wilayah RT/RW Anda
            </p>
          </div>

          {loading && <div className="text-center py-8">Loading...</div>}

          {!loading && suratList.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Tidak ada surat yang perlu diverifikasi</p>
            </div>
          )}

          {!loading && suratList.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemohon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Surat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Ajukan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suratList.map((surat) => (
                    <tr key={surat.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{surat.nama_pemohon}</div>
                        <div className="text-sm text-gray-500">NIK: {surat.nik_pemohon}</div>
                        <div className="text-sm text-gray-500">RT/RW: {surat.rt}/{surat.rw}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{surat.nama_surat}</div>
                        {surat.keperluan && (
                          <div className="text-sm text-gray-500">Keperluan: {surat.keperluan}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(surat.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(surat.status_surat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            // Format data untuk PreviewSurat component
                            const formattedSurat = {
                              ...surat,
                              jenis_surat: {
                                nama_surat: surat.nama_surat,
                                kode_surat: surat.kode_surat,
                                fields: typeof surat.fields === 'string' 
                                  ? JSON.parse(surat.fields) 
                                  : surat.fields || [],
                                template_konten: surat.template_konten || ''
                              }
                            };
                            setSelectedSurat(formattedSurat);
                            setShowPreview(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => handleViewDetail(surat.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedSurat && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detail Surat</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Info Pemohon */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Informasi Pemohon</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Nama:</span>
                        <span className="ml-2 font-medium">{selectedSurat.nama_pemohon}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">NIK:</span>
                        <span className="ml-2 font-medium">{selectedSurat.nik_pemohon}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">No. Telepon:</span>
                        <span className="ml-2 font-medium">{selectedSurat.no_telepon || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">RT/RW:</span>
                        <span className="ml-2 font-medium">{selectedSurat.rt}/{selectedSurat.rw}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Alamat:</span>
                        <span className="ml-2 font-medium">{selectedSurat.alamat_pemohon}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Surat */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Informasi Surat</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Jenis Surat:</span>
                        <span className="ml-2 font-medium">{selectedSurat.nama_surat}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tanggal Ajukan:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedSurat.created_at)}</span>
                      </div>
                      {selectedSurat.keperluan && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Keperluan:</span>
                          <span className="ml-2 font-medium">{selectedSurat.keperluan}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Data Surat */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Data Yang Diisi</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedSurat.data_surat && typeof selectedSurat.data_surat === 'object' && 
                        Object.entries(selectedSurat.data_surat).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="ml-2 font-medium">{value}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Lampiran */}
                  {selectedSurat.lampiran && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Lampiran</h4>
                      <a 
                        href={`http://localhost:5000/uploads/${selectedSurat.lampiran}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Lihat Lampiran
                      </a>
                    </div>
                  )}

                  {/* History */}
                  {selectedSurat.history && selectedSurat.history.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Riwayat</h4>
                      <div className="space-y-2">
                        {selectedSurat.history.map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-500">{formatDate(item.created_at)}</span>
                            <span className="mx-2">-</span>
                            <span className="font-medium">{item.action}</span>
                            {item.keterangan && (
                              <>
                                <span className="mx-2">:</span>
                                <span className="text-gray-600">{item.keterangan}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Verifikasi */}
                  {selectedSurat.status_surat === 'menunggu_verifikasi' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Catatan Verifikasi</h4>
                      <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        className="input"
                        rows="3"
                        placeholder="Masukkan catatan (opsional untuk approve, wajib untuk reject)"
                      />

                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          onClick={() => handleVerify('reject')}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={submitting}
                        >
                          {submitting ? 'Memproses...' : 'Tolak'}
                        </button>
                        <button
                          onClick={() => handleVerify('approve')}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={submitting}
                        >
                          {submitting ? 'Memproses...' : 'Setujui'}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSurat.status_surat !== 'menunggu_verifikasi' && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                          Surat ini sudah {getStatusBadge(selectedSurat.status_surat)}
                        </p>
                        {selectedSurat.catatan_verifikasi && (
                          <p className="text-sm text-blue-700 mt-1">
                            Catatan: {selectedSurat.catatan_verifikasi}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && selectedSurat && (
            <PreviewSurat 
              pengajuan={selectedSurat} 
              onClose={() => setShowPreview(false)} 
            />
          )}

          {/* Toast Notification */}
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={hideToast} 
              duration={toast.duration}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerifikatorSurat;
