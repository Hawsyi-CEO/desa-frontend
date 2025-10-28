import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VerifikatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const levelBadge = stats?.verifikator_info?.level === 'rt' 
    ? 'RT' 
    : stats?.verifikator_info?.level === 'rw' 
    ? 'RW' 
    : '';

  const rtRwInfo = stats?.verifikator_info?.level === 'rt'
    ? `RT ${stats?.verifikator_info?.rt} / RW ${stats?.verifikator_info?.rw}`
    : `RW ${stats?.verifikator_info?.rw}`;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Verifikator {levelBadge}</h1>
            <p className="mt-2 text-gray-600">
              Kelola verifikasi surat untuk {rtRwInfo}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Menunggu Verifikasi */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menunggu Verifikasi</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.stats?.menunggu_verifikasi || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => navigate('/verifikator/surat')}
                className="mt-4 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Lihat Surat →
              </button>
            </div>

            {/* Diverifikasi Hari Ini */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Diverifikasi Hari Ini</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.stats?.diverifikasi_hari_ini || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Ditolak Hari Ini */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ditolak Hari Ini</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.stats?.ditolak_hari_ini || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Info Verifikator {levelBadge}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Anda adalah <strong>Verifikator {levelBadge}</strong> untuk <strong>{rtRwInfo}</strong></p>
                  {stats?.verifikator_info?.level === 'rt' && (
                    <p className="mt-1">
                      • Anda dapat memverifikasi surat dari warga di RT {stats?.verifikator_info?.rt} saja
                    </p>
                  )}
                  {stats?.verifikator_info?.level === 'rw' && (
                    <p className="mt-1">
                      • Anda dapat memverifikasi surat dari semua RT di RW {stats?.verifikator_info?.rw} (setelah diverifikasi RT)
                    </p>
                  )}
                  <p className="mt-1">
                    • Setelah verifikasi {levelBadge}, surat akan dilanjutkan ke tahap berikutnya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/verifikator/surat')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Verifikasi Surat
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifikatorDashboard;
