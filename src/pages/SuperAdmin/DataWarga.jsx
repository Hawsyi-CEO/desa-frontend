import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Users, Home, ChevronLeft, ChevronRight, UserCheck, Filter as FilterIcon, RotateCcw, List, Grid3x3, UserPlus, Trash2, X, Calendar, MapPin, Briefcase, Phone, Mail, Lock, User, Hash, Heart, GraduationCap, Droplet, Download } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { exportToExcel } from '../../utils/excelExport';

export default function DataWarga() {
  const { toast, hideToast, success, error } = useToast();
  const [warga, setWarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRt, setFilterRt] = useState('');
  const [filterRw, setFilterRw] = useState('');
  const [filterJenisKelamin, setFilterJenisKelamin] = useState('');
  const [filterPekerjaan, setFilterPekerjaan] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [viewAll, setViewAll] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [statistik, setStatistik] = useState(null);
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Debug: Check user and token
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log('DataWarga - Token exists:', !!token);
    console.log('DataWarga - User:', user);
    console.log('DataWarga - User Role:', user.role);
  }, []);

  // Load statistik
  useEffect(() => {
    loadStatistik();
  }, []);

  // Load data warga
  useEffect(() => {
    loadWarga();
  }, [currentPage, currentLimit, search, filterRt, filterRw, filterJenisKelamin, filterPekerjaan, viewAll]);

  const loadStatistik = async () => {
    try {
      const response = await api.get('/admin/warga/statistik');
      if (response.data.success) {
        setStatistik(response.data.data);
      }
    } catch (error) {
      console.error('Error loading statistik:', error);
    }
  };

  const loadWarga = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: viewAll ? 999999 : currentLimit,
        search,
        rt: filterRt,
        rw: filterRw,
        jenis_kelamin: filterJenisKelamin,
        pekerjaan: filterPekerjaan
      };

      console.log('Loading warga with params:', params);
      const response = await api.get('/admin/warga', { params });
      console.log('Warga response:', response.data);
      console.log('Pagination data:', response.data.pagination);
      console.log('Total Pages:', response.data.pagination?.totalPages);
      
      if (response.data.success) {
        setWarga(response.data.data);
        setPagination(response.data.pagination);
        console.log('State updated - Total:', response.data.pagination.total, 'Pages:', response.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error loading warga:', err);
      console.error('Error response:', err.response?.data);
      error('Gagal memuat data warga: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedWarga(item);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setSelectedWarga(item);
    setShowEditModal(true);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    setCurrentLimit(newLimit);
    setCurrentPage(1);
    setViewAll(false);
  };

  const handleViewAll = () => {
    setViewAll(!viewAll);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterRt('');
    setFilterRw('');
    setFilterJenisKelamin('');
    setFilterPekerjaan('');
    setCurrentPage(1);
    setViewAll(false);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      
      // Get all data with current filters
      const params = {
        page: 1,
        limit: 999999, // Get all data
        search,
        rt: filterRt,
        rw: filterRw,
        jenis_kelamin: filterJenisKelamin,
        pekerjaan: filterPekerjaan
      };

      const response = await api.get('/admin/warga', { params });
      
      if (response.data.success && response.data.data.length > 0) {
        // Create filename based on filters
        let filename = 'data-warga';
        if (filterRt) filename += `_RT${filterRt}`;
        if (filterRw) filename += `_RW${filterRw}`;
        if (filterJenisKelamin) filename += `_${filterJenisKelamin}`;
        
        const exportedFile = exportToExcel(response.data.data, filename);
        success(`Data berhasil diekspor ke ${exportedFile}`);
      } else {
        error('Tidak ada data untuk diekspor');
      }
    } catch (err) {
      console.error('Error exporting:', err);
      error('Gagal mengekspor data: ' + (err.response?.data?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header - Modern Design */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              Data Warga
            </h1>
            <p className="text-gray-600 mt-2 ml-13">Kelola dan pantau data seluruh warga desa</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading || warga.length === 0}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export data ke Excel sesuai filter"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">{exporting ? 'Mengekspor...' : 'Export Excel'}</span>
              <span className="sm:hidden">{exporting ? '...' : 'Excel'}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="w-5 h-5" />
              <span>Tambah Warga</span>
            </button>
          </div>
        </div>

        {/* Statistik Cards - Modern with Shadow */}
        {statistik && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <div className="group stats-card bg-gradient-to-br from-slate-700 to-slate-900 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-sm font-medium">Total Warga</p>
                  <p className="text-3xl md:text-4xl font-bold mt-2">{statistik.total_warga?.toLocaleString() || 0}</p>
                  <p className="text-slate-100 text-xs mt-1">Terdaftar</p>
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <Users className="w-7 h-7 md:w-8 md:h-8" />
                </div>
              </div>
            </div>

            <div className="group stats-card bg-gradient-to-br from-blue-800 to-blue-950 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Laki-laki</p>
                  <p className="text-3xl md:text-4xl font-bold mt-2">{statistik.total_laki?.toLocaleString() || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">Warga</p>
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <UserCheck className="w-7 h-7 md:w-8 md:h-8" />
                </div>
              </div>
            </div>

            <div className="group stats-card bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Perempuan</p>
                  <p className="text-3xl md:text-4xl font-bold mt-2">{statistik.total_perempuan?.toLocaleString() || 0}</p>
                  <p className="text-pink-100 text-xs mt-1">Warga</p>
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <UserCheck className="w-7 h-7 md:w-8 md:h-8" />
                </div>
              </div>
            </div>

            <div className="group stats-card bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Total KK</p>
                  <p className="text-3xl md:text-4xl font-bold mt-2">{statistik.total_kk?.toLocaleString() || 0}</p>
                  <p className="text-gray-100 text-xs mt-1">Kepala Keluarga</p>
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <Home className="w-7 h-7 md:w-8 md:h-8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search - Modern Clean Design */}
        <div className="card shadow-lg border-0">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan NIK, nama, atau alamat..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input pl-12 pr-4 w-full h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 h-12 rounded-xl font-medium transition-all w-full sm:w-auto ${
                showFilters 
                  ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FilterIcon className="w-5 h-5" />
              Filter
              <ChevronRight className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RT</label>
                  <select
                    value={filterRt}
                    onChange={(e) => {
                      setFilterRt(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input w-full h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua RT</option>
                    {[...Array(20)].map((_, i) => (
                      <option key={i} value={String(i + 1).padStart(2, '0')}>
                        RT {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RW</label>
                  <select
                    value={filterRw}
                    onChange={(e) => {
                      setFilterRw(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input w-full h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua RW</option>
                    {[...Array(20)].map((_, i) => (
                      <option key={i} value={String(i + 1).padStart(2, '0')}>
                        RW {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
                  <select
                    value={filterJenisKelamin}
                    onChange={(e) => {
                      setFilterJenisKelamin(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input w-full h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pekerjaan</label>
                  <select
                    value={filterPekerjaan}
                    onChange={(e) => {
                      setFilterPekerjaan(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input w-full h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Semua Pekerjaan</option>
                    <option value="PNS">PNS</option>
                    <option value="TNI/Polri">TNI/Polri</option>
                    <option value="Pegawai Swasta">Pegawai Swasta</option>
                    <option value="Karyawan Swasta">Karyawan Swasta</option>
                    <option value="Wiraswasta">Wiraswasta</option>
                    <option value="Petani">Petani</option>
                    <option value="Nelayan">Nelayan</option>
                    <option value="Buruh">Buruh</option>
                    <option value="Guru">Guru</option>
                    <option value="Pedagang">Pedagang</option>
                    <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                    <option value="Pensiunan">Pensiunan</option>
                    <option value="IT Consultant">IT Consultant</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table - Modern Clean Design */}
        <div className="card overflow-hidden shadow-lg border-0">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Memuat data warga...</p>
            </div>
          ) : warga.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">Tidak ada data warga</p>
              <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>NIK</th>
                      <th>Nama</th>
                      <th>L/P</th>
                      <th>Usia</th>
                      <th>RT/RW</th>
                      <th>Alamat</th>
                      <th>Pekerjaan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warga.map((item, index) => (
                      <tr key={item.id}>
                        <td>{viewAll ? index + 1 : (currentPage - 1) * currentLimit + index + 1}</td>
                        <td className="font-mono text-sm">{item.nik}</td>
                        <td className="font-medium">{item.nama}</td>
                        <td>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.jenis_kelamin === 'Laki-laki'
                              ? 'bg-blue-100 text-blue-700'
                              : item.jenis_kelamin === 'Perempuan'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.jenis_kelamin === 'Laki-laki' ? 'L' : item.jenis_kelamin === 'Perempuan' ? 'P' : '-'}
                          </span>
                        </td>
                        <td>{item.usia || '-'} th</td>
                        <td>{item.rt}/{item.rw}</td>
                        <td className="max-w-xs truncate">{item.alamat}</td>
                        <td>{item.pekerjaan || '-'}</td>
                        <td>
                          <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWarga(item);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {warga.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500">
                        #{viewAll ? index + 1 : (currentPage - 1) * currentLimit + index + 1}
                      </p>
                      <p className="font-medium text-gray-900 mt-1">{item.nama}</p>
                      <p className="text-sm font-mono text-gray-600">{item.nik}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.jenis_kelamin === 'Laki-laki'
                        ? 'bg-blue-100 text-blue-700'
                        : item.jenis_kelamin === 'Perempuan'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.jenis_kelamin || '-'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Usia:</span> {item.usia || '-'} tahun
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">RT/RW:</span> {item.rt}/{item.rw}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Alamat:</span> {item.alamat}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Pekerjaan:</span> {item.pekerjaan || '-'}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWarga(item);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

              {/* Pagination - Ultra Modern Design */}
              <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-5">
                  {/* Left Side: Info & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {pagination.total > 0 && !viewAll && (
                      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                        <List className="w-4 h-4 text-slate-700" />
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="font-bold text-slate-700">{(currentPage - 1) * currentLimit + 1}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * currentLimit, pagination.total)}</span> dari <span className="font-bold text-slate-700">{pagination.total?.toLocaleString()}</span> data
                        </p>
                      </div>
                    )}
                    {pagination.total > 0 && viewAll && (
                      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                        <Grid3x3 className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          Menampilkan <span className="font-bold text-green-600">semua {pagination.total?.toLocaleString()}</span> data
                        </p>
                      </div>
                    )}
                    {pagination.total === 0 && (
                      <p className="text-sm text-gray-500 italic">Tidak ada data</p>
                    )}
                    
                    {!viewAll && pagination.total > 0 && (
                      <select
                        value={currentLimit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="input text-sm py-2 px-4 border-gray-300 bg-white rounded-lg shadow-sm font-medium focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="5">5 per halaman</option>
                        <option value="10">10 per halaman</option>
                        <option value="25">25 per halaman</option>
                        <option value="50">50 per halaman</option>
                        <option value="100">100 per halaman</option>
                      </select>
                    )}

                    {pagination.total > 5 && (
                      <button
                        onClick={handleViewAll}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                          viewAll 
                            ? 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300' 
                            : 'bg-slate-700 text-white hover:bg-slate-800 border-2 border-slate-700'
                        }`}
                      >
                        {viewAll ? (
                          <>
                            <List className="w-4 h-4" />
                            Per Halaman
                          </>
                        ) : (
                          <>
                            <Grid3x3 className="w-4 h-4" />
                            Lihat Semua
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Right Side: Pagination Buttons */}
                  {!viewAll && pagination.total > currentLimit && (
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-md">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold text-gray-700"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>
                      
                      {/* Page Numbers - Modern Style */}
                      <div className="flex items-center gap-1.5">
                        {pagination.totalPages <= 7 ? (
                          // Show all pages if total <= 7
                          [...Array(pagination.totalPages)].map((_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-bold transition-all ${
                                  currentPage === page
                                    ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg scale-110 ring-2 ring-slate-300'
                                    : 'border-2 border-gray-300 hover:bg-slate-50 hover:border-slate-700 text-gray-700'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })
                        ) : (
                          // Show with ellipsis if more than 7 pages
                          [...Array(pagination.totalPages)].map((_, i) => {
                            const page = i + 1;
                            // Show first, last, current, and adjacent pages
                            if (
                              page === 1 ||
                              page === pagination.totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-bold transition-all ${
                                    currentPage === page
                                      ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg scale-110 ring-2 ring-slate-300'
                                      : 'border-2 border-gray-300 hover:bg-slate-50 hover:border-slate-700 text-gray-700'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="px-2 text-gray-400 font-bold text-lg">•••</span>;
                            }
                            return null;
                          })
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="flex items-center gap-1.5 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-semibold text-gray-700"
                        title="Halaman Selanjutnya"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWarga && (
        <DetailModal
          warga={selectedWarga}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWarga(null);
          }}
          formatDate={formatDate}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWarga && (
        <EditModal
          warga={selectedWarga}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWarga(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedWarga(null);
            loadWarga();
            loadStatistik();
          }}
          showToast={success}
          showError={error}
        />
      )}

      {/* Add Warga Modal */}
      {showAddModal && (
        <AddWargaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadWarga();
            loadStatistik();
          }}
          showToast={success}
          showError={error}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWarga && (
        <DeleteModal
          warga={selectedWarga}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedWarga(null);
          }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedWarga(null);
            loadWarga();
            loadStatistik();
          }}
          showToast={success}
          showError={error}
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
    </Layout>
  );
}

// Detail Modal Component
function DetailModal({ warga, onClose, formatDate }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Detail Warga</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="NIK" value={warga.nik} />
            <DetailItem label="Nama Lengkap" value={warga.nama} />
            <DetailItem label="Jenis Kelamin" value={warga.jenis_kelamin} />
            <DetailItem label="Tempat, Tanggal Lahir" value={`${warga.tempat_lahir || '-'}, ${formatDate(warga.tanggal_lahir)}`} />
            <DetailItem label="Usia" value={`${warga.usia || '-'} tahun`} />
            <DetailItem label="Agama" value={warga.agama || '-'} />
            <DetailItem label="Status Perkawinan" value={warga.status_perkawinan || '-'} />
            <DetailItem label="Pekerjaan" value={warga.pekerjaan || '-'} />
            <DetailItem label="Pendidikan" value={warga.pendidikan || '-'} />
            <DetailItem label="Golongan Darah" value={warga.golongan_darah || '-'} />
            <DetailItem label="Kewarganegaraan" value={warga.kewarganegaraan || '-'} />
            <DetailItem label="No. KK" value={warga.no_kk || '-'} />
            <DetailItem label="Nama Kepala Keluarga" value={warga.nama_kepala_keluarga || '-'} />
            <DetailItem label="Hubungan Keluarga" value={warga.hubungan_keluarga || '-'} />
            <DetailItem label="RT/RW" value={`${warga.rt}/${warga.rw}`} />
            <DetailItem label="Dusun" value={warga.dusun || '-'} />
            <DetailItem label="No. Telepon" value={warga.no_telepon || '-'} />
          </div>
          <DetailItem label="Alamat" value={warga.alamat} fullWidth />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value || '-'}</p>
    </div>
  );
}

// Edit Modal Component
function EditModal({ warga, onClose, onSuccess, showToast, showError }) {
  const [formData, setFormData] = useState({
    nama: warga.nama || '',
    alamat: warga.alamat || '',
    rt: warga.rt || '',
    rw: warga.rw || '',
    dusun: warga.dusun || '',
    tempat_lahir: warga.tempat_lahir || '',
    tanggal_lahir: warga.tanggal_lahir ? warga.tanggal_lahir.split('T')[0] : '',
    jenis_kelamin: warga.jenis_kelamin || '',
    agama: warga.agama || '',
    pekerjaan: warga.pekerjaan || '',
    pendidikan: warga.pendidikan || '',
    status_perkawinan: warga.status_perkawinan || '',
    golongan_darah: warga.golongan_darah || '',
    no_telepon: warga.no_telepon || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put(`/admin/warga/${warga.id}`, formData);
      
      if (response.data.success) {
        showToast('Data warga berhasil diperbarui', 'success');
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating warga:', err);
      showError(err.response?.data?.message || 'Gagal memperbarui data warga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Edit Data Warga</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <select
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Perkawinan
              </label>
              <select
                value={formData.status_perkawinan}
                onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <input
                type="text"
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendidikan
              </label>
              <input
                type="text"
                value={formData.pendidikan}
                onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <select
                value={formData.golongan_darah}
                onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.no_telepon}
                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <input
                type="text"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <input
                type="text"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dusun
              </label>
              <input
                type="text"
                value={formData.dusun}
                onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                className="input w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows={3}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Warga Modal Component
function AddWargaModal({ onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    password: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    pendidikan: '',
    pekerjaan: '',
    status_perkawinan: '',
    golongan_darah: '',
    rt: '',
    rw: '',
    dusun: '',
    alamat: '',
    no_kk: '',
    nama_kepala_keluarga: '',
    hubungan_keluarga: '',
    no_telepon: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nik || !formData.nama || !formData.email) {
      showError('NIK, Nama, dan Email wajib diisi!');
      return;
    }

    if (formData.nik.length !== 16) {
      showError('NIK harus 16 digit!');
      return;
    }

    setLoading(true);

    try {
      await api.post('/admin/warga', formData);
      showToast('Data warga berhasil ditambahkan!', 'success');
      onSuccess();
    } catch (err) {
      console.error('Error adding warga:', err);
      showError(err.response?.data?.message || 'Gagal menambahkan data warga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tambah Data Warga</h2>
                <p className="text-sm text-slate-100 mt-1">Login: NIK sebagai username, password default: password123</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Box */}
          <div className="bg-slate-50 border-l-4 border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">ℹ</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">Informasi Login Warga</h3>
                <ul className="text-sm text-slate-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                    <strong>Username:</strong> NIK yang didaftarkan
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                    <strong>Password Default:</strong> password123 (warga dapat mengubahnya setelah login)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NIK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-700" />
                NIK (Username Login) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="16 digit NIK"
                maxLength={16}
                className="input w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">NIK ini akan digunakan sebagai username untuk login</p>
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Nama lengkap"
                className="input w-full"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="input w-full"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password (Opsional)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kosongkan untuk password default"
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Default: <strong>password123</strong> (jika dikosongkan)</p>
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Kota kelahiran"
                className="input w-full"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* Agama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                Agama
              </label>
              <select
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            {/* Pendidikan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Pendidikan
              </label>
              <select
                value={formData.pendidikan}
                onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="Tidak Sekolah">Tidak Sekolah</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Pekerjaan
              </label>
              <select
                value={formData.pekerjaan}
                onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Pekerjaan</option>
                <option value="Belum/Tidak Bekerja">Belum/Tidak Bekerja</option>
                <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                <option value="PNS">PNS</option>
                <option value="TNI/Polri">TNI/Polri</option>
                <option value="Karyawan Swasta">Karyawan Swasta</option>
                <option value="Wiraswasta">Wiraswasta</option>
                <option value="Petani">Petani</option>
                <option value="Pedagang">Pedagang</option>
                <option value="Guru">Guru</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Pengacara">Pengacara</option>
                <option value="IT Consultant">IT Consultant</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Status Perkawinan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Perkawinan
              </label>
              <select
                value={formData.status_perkawinan}
                onChange={(e) => setFormData({ ...formData, status_perkawinan: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Status</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>

            {/* Golongan Darah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                Golongan Darah
              </label>
              <select
                value={formData.golongan_darah}
                onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            {/* RT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                RT
              </label>
              <input
                type="text"
                value={formData.rt}
                onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                placeholder="001"
                className="input w-full"
              />
            </div>

            {/* RW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                RW
              </label>
              <input
                type="text"
                value={formData.rw}
                onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                placeholder="001"
                className="input w-full"
              />
            </div>

            {/* Dusun */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dusun
              </label>
              <input
                type="text"
                value={formData.dusun}
                onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                placeholder="Nama dusun"
                className="input w-full"
              />
            </div>

            {/* No KK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor KK
              </label>
              <input
                type="text"
                value={formData.no_kk}
                onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                placeholder="16 digit nomor KK"
                maxLength={16}
                className="input w-full"
              />
            </div>

            {/* Nama Kepala Keluarga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kepala Keluarga
              </label>
              <input
                type="text"
                value={formData.nama_kepala_keluarga}
                onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                placeholder="Nama kepala keluarga"
                className="input w-full"
              />
            </div>

            {/* Hubungan Keluarga */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hubungan Keluarga
              </label>
              <select
                value={formData.hubungan_keluarga}
                onChange={(e) => setFormData({ ...formData, hubungan_keluarga: e.target.value })}
                className="input w-full"
              >
                <option value="">Pilih Hubungan</option>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Cucu">Cucu</option>
                <option value="Menantu">Menantu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* No Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.no_telepon}
                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="input w-full"
              />
            </div>

            {/* Alamat - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Alamat Lengkap
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Alamat lengkap"
                rows={3}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menyimpan...' : 'Tambah Warga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteModal({ warga, onClose, onSuccess, showToast, showError }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await api.delete(`/admin/warga/${warga.id}`);
      showToast('Data warga berhasil dihapus!', 'success');
      onSuccess();
    } catch (err) {
      console.error('Error deleting warga:', err);
      showError(err.response?.data?.message || 'Gagal menghapus data warga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Apakah Anda yakin ingin menghapus data warga berikut?
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-medium text-gray-900">{warga.nama}</p>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">NIK: {warga.nik}</p>
              </div>
              {warga.alamat && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600">{warga.alamat}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <strong>Peringatan:</strong> Data yang sudah dihapus tidak dapat dikembalikan!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

