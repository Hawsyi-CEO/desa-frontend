import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';

const JenisSurat = () => {
  const navigate = useNavigate();
  const { toast, hideToast, success, error } = useToast();
  const { confirm, confirmState } = useConfirm();
  const [jenisSurat, setJenisSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/jenis-surat');
      if (response.data.success) {
        setJenisSurat(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
      error('Gagal memuat data jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const confirmed = await confirm({
      title: 'Hapus Jenis Surat',
      message: `Yakin ingin menghapus jenis surat "${nama}"? Data yang sudah terhapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      confirmColor: 'red'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await api.delete(`/admin/jenis-surat/${id}`);
      success('Jenis surat berhasil dihapus');
      fetchJenisSurat();
    } catch (err) {
      console.error('Error deleting jenis surat:', err);
      error(err.response?.data?.message || 'Gagal menghapus jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = jenisSurat.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jenis Surat</h1>
              <p className="text-gray-600 mt-1">Kelola jenis-jenis surat yang tersedia</p>
            </div>
            <button
              onClick={() => navigate('/admin/jenis-surat/tambah')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FiPlus /> Tambah Jenis Surat
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <FiFilter className="text-gray-500" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('aktif')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'aktif'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilterStatus('nonaktif')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'nonaktif'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non-Aktif
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Tidak ada data jenis surat</p>
            <button
              onClick={() => navigate('/admin/jenis-surat/tambah')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Tambah Jenis Surat Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((item) => {
              const fields = typeof item.fields === 'string' ? JSON.parse(item.fields) : item.fields || [];
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.nama_surat}
                        </h3>
                        <span className="text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                          {item.kode_surat}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.status === 'aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                        {item.require_verification && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            Butuh Verifikasi
                          </span>
                        )}
                      </div>

                      {item.deskripsi && (
                        <p className="text-sm text-gray-600 mb-3">{item.deskripsi}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Format Nomor:</span>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.format_nomor || 'NOMOR/KODE/BULAN/TAHUN'}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Jumlah Fields:</span>
                          <span>{fields.length} field</span>
                        </div>
                      </div>

                      {item.kalimat_pembuka && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Kalimat Pembuka:</p>
                          <p className="text-sm text-gray-700 italic">"{item.kalimat_pembuka}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/admin/jenis-surat/edit/${item.id}`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_surat)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        confirmColor={confirmState.confirmColor}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />

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
  );
};

export default JenisSurat;

