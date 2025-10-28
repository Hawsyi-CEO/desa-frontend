import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiPlusCircle } from 'react-icons/fi';

const WargaDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [jenisSurat, setJenisSurat] = useState([]);
  const [recentSurat, setRecentSurat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch surat warga
      const suratResponse = await api.get('/warga/surat');
      const suratData = suratResponse.data.data || [];
      
      // Calculate stats
      setStats({
        total: suratData.length,
        pending: suratData.filter(s => s.status === 'pending' || s.status === 'diproses').length,
        approved: suratData.filter(s => s.status === 'selesai').length,
        rejected: suratData.filter(s => s.status === 'ditolak').length
      });
      
      // Get recent 5 surat
      setRecentSurat(suratData.slice(0, 5));
      
      // Fetch jenis surat aktif
      const jenisResponse = await api.get('/warga/jenis-surat');
      if (jenisResponse.data.success) {
        setJenisSurat(jenisResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'diproses': 'bg-blue-100 text-blue-800',
      'selesai': 'bg-green-100 text-green-800',
      'ditolak': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Menunggu',
      'diproses': 'Diproses',
      'selesai': 'Selesai',
      'ditolak': 'Ditolak'
    };
    return texts[status] || status;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Warga</h1>
            <p className="text-gray-600 mt-2">Selamat datang, {user?.username}!</p>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Pengajuan</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FiFileText className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Menunggu</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <FiClock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Disetujui</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FiCheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ditolak</p>
                      <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FiXCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Jenis Surat Tersedia */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Jenis Surat Tersedia</h2>
                    <span className="text-sm text-gray-500">{jenisSurat.length} jenis</span>
                  </div>
                  
                  {jenisSurat.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      Belum ada jenis surat tersedia
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {jenisSurat.map(jenis => (
                        <div
                          key={jenis.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                          onClick={() => navigate('/warga/surat')}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{jenis.nama_surat}</h3>
                              <p className="text-sm text-gray-600 mt-1">{jenis.deskripsi || 'Tidak ada deskripsi'}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                  {jenis.kode_surat}
                                </span>
                                {jenis.require_verification && (
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                    Perlu Verifikasi
                                  </span>
                                )}
                              </div>
                            </div>
                            <FiPlusCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 ml-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/warga/surat')}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FiPlusCircle className="inline mr-2" />
                    Ajukan Surat Baru
                  </button>
                </div>

                {/* Pengajuan Terbaru */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Pengajuan Terbaru</h2>
                    <button
                      onClick={() => navigate('/warga/history')}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  
                  {recentSurat.length === 0 ? (
                    <div className="text-center py-12">
                      <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Belum ada pengajuan surat</p>
                      <button
                        onClick={() => navigate('/warga/surat')}
                        className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Ajukan Surat Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentSurat.map(surat => (
                        <div
                          key={surat.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{surat.jenis_surat?.nama_surat || 'Surat'}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(surat.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(surat.status)}`}>
                              {getStatusText(surat.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Panel */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-medium text-blue-900 mb-3">ℹ️ Panduan Pengajuan Surat</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>1. Pilih jenis surat yang ingin Anda ajukan</li>
                  <li>2. Isi formulir dengan data yang benar dan lengkap</li>
                  <li>3. Upload lampiran jika diperlukan</li>
                  <li>4. Preview surat sebelum mengajukan</li>
                  <li>5. Tunggu proses verifikasi dari admin desa</li>
                  <li>6. Surat yang sudah disetujui dapat diunduh di halaman Riwayat</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WargaDashboard;
