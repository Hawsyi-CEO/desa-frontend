import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye, FiFileText, FiUpload, FiSettings } from 'react-icons/fi';
import PDFFieldMapper from '../../components/PDFFieldMapper';

const FormulirCetak = () => {
  const [formulirList, setFormulirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [selectedFormulirId, setSelectedFormulirId] = useState(null);
  
  const [formData, setFormData] = useState({
    nama_formulir: '',
    kategori: 'umum',
    deskripsi: '',
    urutan: 0,
    is_active: 1
  });

  const [filterKategori, setFilterKategori] = useState('');

  const kategoriOptions = [
    { value: 'kependudukan', label: 'Kependudukan' },
    { value: 'kesehatan', label: 'Kesehatan' },
    { value: 'usaha', label: 'Usaha' },
    { value: 'umum', label: 'Umum' }
  ];

  useEffect(() => {
    loadFormulir();
  }, [filterKategori]);

  const loadFormulir = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterKategori) params.kategori = filterKategori;

      const response = await api.get('/formulir', { params });
      
      if (response.data.success) {
        setFormulirList(response.data.data);
      }
    } catch (error) {
      console.error('Load formulir error:', error);
      toast.error('Gagal memuat data formulir');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        e.target.value = '';
        return;
      }

      // Validasi tipe file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Hanya file PDF, DOC, dan DOCX yang diperbolehkan');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !selectedFile) {
      toast.error('File formulir harus diupload');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update (tanpa file)
        await api.put(`/formulir/${editingId}`, formData);
        toast.success('Formulir berhasil diupdate');
      } else {
        // Upload baru (dengan file)
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('nama_formulir', formData.nama_formulir);
        uploadData.append('kategori', formData.kategori);
        uploadData.append('deskripsi', formData.deskripsi);
        uploadData.append('urutan', formData.urutan);

        await api.post('/formulir', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Formulir berhasil diupload');
      }

      handleCloseModal();
      loadFormulir();
    } catch (error) {
      console.error('Submit formulir error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan formulir');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (formulir) => {
    setEditingId(formulir.id);
    setFormData({
      nama_formulir: formulir.nama_formulir,
      kategori: formulir.kategori,
      deskripsi: formulir.deskripsi || '',
      urutan: formulir.urutan || 0,
      is_active: formulir.is_active
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus formulir ini?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/formulir/${id}`);
      toast.success('Formulir berhasil dihapus');
      loadFormulir();
    } catch (error) {
      console.error('Delete formulir error:', error);
      toast.error('Gagal menghapus formulir');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSelectedFile(null);
    setFormData({
      nama_formulir: '',
      kategori: 'umum',
      deskripsi: '',
      urutan: 0,
      is_active: 1
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (fileType === 'doc' || fileType === 'docx') return '📝';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Formulir Siap Cetak</h1>
            <p className="text-gray-600 mt-1">Kelola formulir untuk warga universal</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiPlus /> Upload Formulir
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter Kategori:</label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formulir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Download
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : formulirList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Belum ada formulir
                  </td>
                </tr>
              ) : (
                formulirList.map((formulir) => (
                  <tr key={formulir.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{formulir.nama_formulir}</div>
                        {formulir.deskripsi && (
                          <div className="text-sm text-gray-500">{formulir.deskripsi}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {kategoriOptions.find(k => k.value === formulir.kategori)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getFileIcon(formulir.file_type)}</span>
                        <div className="text-sm">
                          <div className="text-gray-900 uppercase">{formulir.file_type}</div>
                          <div className="text-gray-500">{formatFileSize(formulir.file_size)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FiDownload className="text-gray-400" />
                        {formulir.jumlah_download}x
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        formulir.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formulir.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {formulir.file_type === 'pdf' && (
                          <button
                            onClick={() => {
                              setSelectedFormulirId(formulir.id);
                              setShowFieldMapper(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Konfigurasi Field PDF"
                          >
                            <FiSettings size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(formulir)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(formulir.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Hapus"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Upload/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {editingId ? 'Edit Formulir' : 'Upload Formulir Baru'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* File Upload (hanya untuk tambah baru) */}
                  {!editingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Formulir * (PDF, DOC, DOCX - Max 10MB)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Pilih File
                        </label>
                        {selectedFile && (
                          <div className="mt-2 text-sm text-gray-600">
                            📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nama Formulir */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Formulir *
                    </label>
                    <input
                      type="text"
                      value={formData.nama_formulir}
                      onChange={(e) => setFormData({ ...formData, nama_formulir: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Formulir Permohonan KTP"
                      required
                    />
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {kategoriOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Deskripsi formulir (opsional)"
                    />
                  </div>

                  {/* Urutan & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urutan Tampilan
                      </label>
                      <input
                        type="number"
                        value={formData.urutan}
                        onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Aktif</option>
                        <option value={0}>Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* PDF Field Mapper Modal */}
        <PDFFieldMapper
          formulirId={selectedFormulirId}
          isOpen={showFieldMapper}
          onClose={() => {
            setShowFieldMapper(false);
            setSelectedFormulirId(null);
          }}
          onSuccess={() => {
            loadFormulir();
          }}
        />
      </div>
    </Layout>
  );
};

export default FormulirCetak;
