import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { FiUsers, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Super Admin</h1>
          <p className="text-sm md:text-base text-gray-600">Selamat datang kembali! Berikut ringkasan aktivitas sistem.</p>
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
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
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
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
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
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
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
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-100">
                {stats?.recentSurat?.map((surat) => (
                  <tr key={surat.id} className="hover:bg-gray-50 transition-colors duration-150">
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {stats?.recentSurat?.map((surat) => (
              <div key={surat.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {surat.no_surat || 'No. Surat belum tersedia'}
                    </p>
                    <p className="text-xs text-gray-600">{surat.nama_pemohon}</p>
                  </div>
                  <span className={getStatusBadge(surat.status_surat)}>
                    {surat.status_surat.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="space-y-1">
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
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminDashboard;
