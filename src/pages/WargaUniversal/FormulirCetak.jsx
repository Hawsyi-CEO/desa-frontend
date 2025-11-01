import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { FiDownload, FiFileText, FiGrid, FiList, FiSearch, FiFile, FiHome, FiPrinter, FiEdit3, FiClipboard, FiUsers, FiActivity, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import FillFormulirModal from '../../components/FillFormulirModal';

const FormulirCetakWargaUniversal = () => {
  const navigate = useNavigate();
  const [formulirList, setFormulirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFillModal, setShowFillModal] = useState(false);
  const [selectedFormulir, setSelectedFormulir] = useState(null);

  const kategoriOptions = [
    { value: '', label: 'Semua Kategori', icon: FiClipboard, color: 'gray' },
    { value: 'kependudukan', label: 'Kependudukan', icon: FiUsers, color: 'blue' },
    { value: 'kesehatan', label: 'Kesehatan', icon: FiActivity, color: 'green' },
    { value: 'usaha', label: 'Usaha', icon: FiBriefcase, color: 'purple' },
    { value: 'umum', label: 'Umum', icon: FiFileText, color: 'yellow' }
  ];

  useEffect(() => {
    loadFormulir();
  }, [filterKategori]);

  const loadFormulir = async () => {
    try {
      setLoading(true);
      const params = { is_active: 1 }; // Hanya tampilkan yang aktif
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

  const handleDownload = async (id, namaFile) => {
    try {
      const response = await api.get(`/formulir/${id}/download`, {
        responseType: 'blob'
      });

      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', namaFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Formulir berhasil didownload');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Gagal mendownload formulir');
    }
  };

  const handlePrint = async (id, namaFile, fileType) => {
    try {
      // Hanya PDF yang bisa di-print langsung
      if (fileType !== 'pdf') {
        toast.warning('Hanya file PDF yang bisa dicetak langsung. Silakan download terlebih dahulu.');
        handleDownload(id, namaFile);
        return;
      }

      const response = await api.get(`/formulir/${id}/download`, {
        responseType: 'blob'
      });

      // Create blob URL untuk PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open di window baru dan auto-trigger print
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        toast.error('Pop-up diblokir. Izinkan pop-up untuk mencetak formulir.');
      }

      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Print error:', error);
      toast.error('Gagal mencetak formulir');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return FiFileText;
    if (fileType === 'doc' || fileType === 'docx') return FiEdit3;
    return FiFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (kategori) => {
    const colors = {
      kependudukan: 'blue',
      kesehatan: 'green',
      usaha: 'purple',
      umum: 'yellow'
    };
    return colors[kategori] || 'gray';
  };

  // Filter by search term
  const filteredFormulir = formulirList.filter(f => 
    f.nama_formulir.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.deskripsi && f.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-navy-900/10 to-slate-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-600/10 to-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative mb-8">
            {/* Logout Button */}
            <div className="absolute top-0 right-0 z-20">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-red-200/50 hover:border-red-400 hover:scale-105"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Logout</span>
              </button>
            </div>

            {/* Title Section */}
            <div className="pr-32">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiFileText className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Formulir Siap Cetak
                  </h1>
                  <p className="text-slate-600 mt-1">Cetak formulir untuk keperluan administrasi</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/warga-universal/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <FiHome size={18} />
                  <span>Kembali ke Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari formulir..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
              {kategoriOptions.map(kat => {
                const IconComponent = kat.icon;
                return (
                  <button
                    key={kat.value}
                    onClick={() => setFilterKategori(kat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      filterKategori === kat.value
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow'
                    }`}
                  >
                    <IconComponent size={18} className={filterKategori === kat.value ? 'animate-pulse' : ''} />
                    {kat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFormulir.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center">
              <FiFile className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'Tidak ada formulir yang sesuai pencarian' : 'Belum ada formulir tersedia'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFormulir.map((formulir) => {
                const FileIcon = getFileIcon(formulir.file_type);
                return (
                  <div
                    key={formulir.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r from-${getCategoryColor(formulir.kategori)}-500 to-${getCategoryColor(formulir.kategori)}-600 p-6 text-white`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <FileIcon className="w-8 h-8 animate-pulse" />
                        </div>
                        <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full uppercase font-medium">
                          {formulir.file_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold line-clamp-2">
                        {formulir.nama_formulir}
                      </h3>
                    </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {formulir.deskripsi && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {formulir.deskripsi}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <FiDownload size={16} />
                        <span>{formulir.jumlah_download}x didownload</span>
                      </div>
                      <span>{formatFileSize(formulir.file_size)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {formulir.is_fillable && formulir.file_type === 'pdf' && (
                        <button
                          onClick={() => {
                            setSelectedFormulir(formulir);
                            setShowFillModal(true);
                          }}
                          className="py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <FiEdit3 size={18} />
                          Isi
                        </button>
                      )}
                      <button
                        onClick={() => handlePrint(formulir.id, formulir.file_name, formulir.file_type)}
                        className={`py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          formulir.is_fillable && formulir.file_type === 'pdf' ? '' : 'col-span-2'
                        }`}
                      >
                        <FiPrinter size={20} />
                        Cetak
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredFormulir.map((formulir) => {
                  const FileIcon = getFileIcon(formulir.file_type);
                  return (
                    <div
                      key={formulir.id}
                      className="p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                          <FileIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {formulir.nama_formulir}
                        </h3>
                        {formulir.deskripsi && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {formulir.deskripsi}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiDownload size={14} />
                            {formulir.jumlah_download}x
                          </span>
                          <span>{formatFileSize(formulir.file_size)}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs uppercase font-medium">
                            {formulir.file_type}
                          </span>
                          {formulir.is_fillable && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <FiCheckCircle size={12} />
                              Bisa Diisi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex gap-2">
                        {formulir.is_fillable && formulir.file_type === 'pdf' && (
                          <button
                            onClick={() => {
                              setSelectedFormulir(formulir);
                              setShowFillModal(true);
                            }}
                            className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                          >
                            <FiEdit3 size={20} />
                            Isi Formulir
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(formulir.id, formulir.file_name, formulir.file_type)}
                          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <FiPrinter size={20} />
                          Cetak
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fill Formulir Modal */}
      <FillFormulirModal
        formulir={selectedFormulir}
        isOpen={showFillModal}
        onClose={() => {
          setShowFillModal(false);
          setSelectedFormulir(null);
        }}
      />
    </div>
  );
};

export default FormulirCetakWargaUniversal;
