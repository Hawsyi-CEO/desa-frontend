import { useState, useEffect } from 'react';
import VerifikatorLayout from '../../components/VerifikatorLayout';
import api from '../../services/api';
import { 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiFileText,
  FiFilter,
  FiTrendingUp
} from 'react-icons/fi';

const Riwayat = () => {
  const [riwayatList, setRiwayatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('semua');

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/riwayat');
      if (response.data.success) {
        setRiwayatList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching riwayat:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'disetujui_rt': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RT', icon: FiCheckCircle },
      'disetujui_rw': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Disetujui RW', icon: FiCheckCircle },
      'ditolak_rt': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Ditolak RT', icon: FiXCircle },
      'ditolak_rw': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Ditolak RW', icon: FiXCircle },
      'ditolak': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Ditolak', icon: FiXCircle },
      'selesai': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Selesai', icon: FiCheckCircle },
    };
    const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', text: status, icon: FiAlertCircle };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterRiwayat = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'hari_ini':
        return riwayatList.filter(r => {
          const date = new Date(r.updated_at || r.created_at);
          return date.toDateString() === now.toDateString();
        });
      case 'minggu_ini':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return riwayatList.filter(r => {
          const date = new Date(r.updated_at || r.created_at);
          return date >= weekAgo;
        });
      case 'bulan_ini':
        return riwayatList.filter(r => {
          const date = new Date(r.updated_at || r.created_at);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      default:
        return riwayatList;
    }
  };

  const filteredRiwayat = filterRiwayat();

  const stats = {
    total: riwayatList.length,
    disetujui: riwayatList.filter(r => r.status_surat?.includes('disetujui') || r.status_surat === 'selesai').length,
    ditolak: riwayatList.filter(r => r.status_surat === 'ditolak').length,
  };

  if (loading) {
    return (
      <VerifikatorLayout>
        <div className="p-4 space-y-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-24 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-24 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </VerifikatorLayout>
    );
  }

  return (
    <VerifikatorLayout>
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen pb-4">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white px-4 py-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <FiClock size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Riwayat Verifikasi</h1>
              <p className="text-slate-300 text-sm">{stats.total} total verifikasi</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <FiCheckCircle className="text-green-400" size={18} />
                <span className="text-xs text-slate-300">Disetujui</span>
              </div>
              <p className="text-2xl font-bold">{stats.disetujui}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <FiXCircle className="text-red-400" size={18} />
                <span className="text-xs text-slate-300">Ditolak</span>
              </div>
              <p className="text-2xl font-bold">{stats.ditolak}</p>
            </div>
          </div>
        </div>

        {/* Filter Period */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FiFilter className="text-slate-600 flex-shrink-0" size={18} />
            {[
              { key: 'semua', label: 'Semua' },
              { key: 'hari_ini', label: 'Hari Ini' },
              { key: 'minggu_ini', label: 'Minggu Ini' },
              { key: 'bulan_ini', label: 'Bulan Ini' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedPeriod(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPeriod === filter.key
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Riwayat List */}
        <div className="px-4 py-4 space-y-3">
          {filteredRiwayat.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-sm font-medium">Belum ada riwayat verifikasi</p>
            </div>
          ) : (
            filteredRiwayat.map((riwayat) => (
              <div
                key={riwayat.id}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    riwayat.status_surat?.includes('disetujui') || riwayat.status_surat === 'selesai'
                      ? 'bg-gradient-to-br from-green-100 to-green-200'
                      : 'bg-gradient-to-br from-red-100 to-red-200'
                  }`}>
                    {riwayat.status_surat?.includes('disetujui') || riwayat.status_surat === 'selesai' ? (
                      <FiCheckCircle className="text-green-700" size={20} />
                    ) : (
                      <FiXCircle className="text-red-700" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                      {riwayat.nama_surat || 'Surat'}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <FiUser size={12} />
                      <span className="truncate">{riwayat.nama_pemohon || 'Warga'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <FiCalendar size={12} />
                      <span>{formatDate(riwayat.updated_at || riwayat.created_at)}</span>
                    </div>

                    <div className="mt-2">
                      {getStatusBadge(riwayat.status_surat)}
                    </div>

                    {/* Keterangan if any */}
                    {riwayat.keterangan && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-600">
                          <strong>Keterangan:</strong> {riwayat.keterangan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Card */}
        {filteredRiwayat.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4 border border-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <FiTrendingUp className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Ringkasan Verifikasi</h4>
                  <p className="text-xs text-slate-700">
                    Anda telah memverifikasi <strong>{filteredRiwayat.length} surat</strong> dalam periode {selectedPeriod === 'semua' ? 'keseluruhan' : selectedPeriod.replace('_', ' ')}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VerifikatorLayout>
  );
};

export default Riwayat;

