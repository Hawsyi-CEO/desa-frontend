import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { FiUsers, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      menunggu_verifikasi: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      diverifikasi: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      disetujui: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800',
      ditolak: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800',
    };
    return badges[status] || badges.draft;
  };

  // Filter and Search Logic
  const filteredSurat = (stats?.recentSurat || []).filter(surat => {
    const matchSearch = searchQuery === '' || 
      surat.nama_pemohon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.nama_surat?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = filterStatus === '' || surat.status_surat === filterStatus;
    
    return matchSearch && matchStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-slate-800 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard Super Admin</h1>
            <p className="text-sm md:text-base text-slate-200">Selamat datang kembali! Berikut ringkasan aktivitas sistem.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:translate-y-[-4px]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Total Warga</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600 mt-2">● Aktif</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <FiUsers className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:translate-y-[-4px]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Total Surat</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.totalSurat || 0}</p>
                <p className="text-xs text-gray-500 mt-2 truncate">Semua pengajuan</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <FiFileText className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:translate-y-[-4px]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Perlu Approval</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stats?.suratByStatus?.find(s => s.status_surat === 'diverifikasi')?.total || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-2">● Menunggu</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <FiClock className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:translate-y-[-4px]">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Disetujui</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stats?.suratByStatus?.find(s => s.status_surat === 'disetujui')?.total || 0}
                </p>
                <p className="text-xs text-green-600 mt-2">✓ Selesai</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                <FiCheckCircle className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Surat */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Surat Terbaru</h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Daftar pengajuan surat terbaru</p>
          </div>

          {/* Search & Filter */}
          <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pencarian
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama pemohon, nomor surat..."
                    className="w-full pl-10 pr-4 py-2 md:py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 md:py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all text-sm md:text-base"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="diverifikasi">Diverifikasi</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            {/* Results Info */}
            <div className="mt-3 text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{currentItems.length}</span> dari{' '}
              <span className="font-semibold text-gray-900">{filteredSurat.length}</span> surat
              {(searchQuery || filterStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('');
                  }}
                  className="ml-3 text-slate-700 hover:text-slate-900 font-medium underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    No Surat
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Jenis Surat
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg font-medium">Tidak ada surat ditemukan</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {searchQuery || filterStatus 
                            ? 'Coba ubah filter atau kata kunci pencarian' 
                            : 'Belum ada pengajuan surat'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((surat, index) => (
                    <tr key={surat.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                          {indexOfFirstItem + index + 1}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{surat.no_surat || '-'}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{surat.nama_pemohon}</p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-sm text-gray-700">{surat.nama_surat}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(surat.status_surat)}>
                          {surat.status_surat.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(surat.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">Tidak ada surat ditemukan</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery || filterStatus 
                    ? 'Coba ubah filter' 
                    : 'Belum ada pengajuan'}
                </p>
              </div>
            ) : (
              currentItems.map((surat, index) => (
                <div key={surat.id} className="p-4 hover:bg-slate-50 transition-colors duration-150">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center">
                        {indexOfFirstItem + index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {surat.no_surat || 'No. Surat belum tersedia'}
                        </p>
                        <p className="text-xs text-gray-600">{surat.nama_pemohon}</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(surat.status_surat)}>
                      {surat.status_surat.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="space-y-1 ml-11">
                    <p className="text-sm text-gray-700">{surat.nama_surat}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(surat.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredSurat.length > 0 && (
            <div className="border-t border-gray-200 px-4 md:px-6 py-4 bg-white rounded-b-xl md:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Results Info */}
                <div className="text-sm text-gray-700">
                  Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> sampai{' '}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, filteredSurat.length)}
                  </span>{' '}
                  dari <span className="font-semibold">{filteredSurat.length}</span> data
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              currentPage === page
                                ? 'bg-slate-700 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
