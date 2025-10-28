import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const VerifikatorRiwayat = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/riwayat');
      setRiwayat(response.data.data);
    } catch (error) {
      console.error('Error fetching riwayat:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { color: 'green', text: 'Disetujui' },
      'rejected': { color: 'red', text: 'Ditolak' }
    };

    const statusInfo = statusMap[status] || { color: 'gray', text: status };
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
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
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Verifikasi</h1>
            <p className="mt-2 text-gray-600">
              Surat yang sudah Anda verifikasi
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat riwayat...</p>
            </div>
          ) : riwayat.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada riwayat</h3>
              <p className="mt-1 text-sm text-gray-500">
                Anda belum melakukan verifikasi surat apapun
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {riwayat.map((item) => (
                  <li key={item.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-medium text-gray-900">
                            {item.nama_surat}
                          </p>
                          {getStatusBadge(item.verification_status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Pemohon:</span> {item.nama_pemohon}
                          </div>
                          <div>
                            <span className="font-medium">NIK:</span> {item.nik_pemohon}
                          </div>
                          <div>
                            <span className="font-medium">RT/RW:</span> {item.pemohon_rt}/{item.pemohon_rw}
                          </div>
                          <div>
                            <span className="font-medium">Tanggal Verifikasi:</span>{' '}
                            {item.verified_at ? new Date(item.verified_at).toLocaleString('id-ID') : '-'}
                          </div>
                        </div>
                        {item.keterangan && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-700">Keterangan:</span>
                            <p className="text-gray-600 italic">{item.keterangan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerifikatorRiwayat;
