import { useState, useEffect } from 'react';
import VerifikatorLayout from '../../components/VerifikatorLayout';
import ApproveModal from '../../components/ApproveModal';
import RejectModal from '../../components/RejectModal';
import api from '../../services/api';
import { 
  FiInbox, 
  FiUser, 
  FiCalendar, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiFileText,
  FiChevronRight,
  FiFilter,
  FiClock
} from 'react-icons/fi';

const SuratMasuk = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [user, setUser] = useState(null);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
    fetchSuratMasuk();
  }, []);

  const fetchSuratMasuk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/verifikator/surat-masuk');
      if (response.data.success) {
        setSuratList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching surat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (surat) => {
    setSelectedSurat(surat);
    setShowApproveModal(true);
  };

  const handleRejectClick = (surat) => {
    setSelectedSurat(surat);
    setShowRejectModal(true);
  };

  const handleApproveSuccess = (message) => {
    setToastMessage(message);
    setToastType('success');
    setTimeout(() => setToastMessage(''), 3000);
    fetchSuratMasuk(); // Refresh list
  };

  const handleRejectSuccess = (message) => {
    setToastMessage(message);
    setToastType('success');
    setTimeout(() => setToastMessage(''), 3000);
    fetchSuratMasuk(); // Refresh list
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'menunggu_verifikasi_rt': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Menunggu RT', icon: FiClock },
      'menunggu_verifikasi_rw': { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Menunggu RW', icon: FiClock },
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffTime / (1000 * 60));
      return `${diffMins} menit lalu`;
    }
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredSurat = selectedStatus === 'semua' 
    ? suratList 
    : suratList.filter(s => s.status_surat === selectedStatus);

  const stats = {
    semua: suratList.length,
    menunggu: suratList.filter(s => s.status_surat?.includes('menunggu_verifikasi')).length,
    disetujui: suratList.filter(s => s.status_surat?.includes('disetujui')).length,
    ditolak: suratList.filter(s => s.status_surat?.includes('ditolak')).length
  };

  if (loading) {
    return (
      <VerifikatorLayout>
        <div className="p-4 space-y-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-24 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-24 bg-gray-200 rounded-xl mb-3"></div>
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
              <FiInbox size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Surat Masuk</h1>
              <p className="text-slate-300 text-sm">{stats.semua} total surat</p>
            </div>
          </div>

          {/* Stats Mini */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <p className="text-yellow-400 text-lg font-bold">{stats.menunggu}</p>
              <p className="text-xs text-slate-300">Menunggu</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <p className="text-green-400 text-lg font-bold">{stats.disetujui}</p>
              <p className="text-xs text-slate-300">Disetujui</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
              <p className="text-red-400 text-lg font-bold">{stats.ditolak}</p>
              <p className="text-xs text-slate-300">Ditolak</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 sticky top-16 z-10 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <FiFilter className="text-slate-600 flex-shrink-0" size={18} />
            {[
              { key: 'semua', label: 'Semua', count: stats.semua },
              { key: 'menunggu_verifikasi_rt', label: 'Menunggu RT', count: suratList.filter(s => s.status_surat === 'menunggu_verifikasi_rt').length },
              { key: 'menunggu_verifikasi_rw', label: 'Menunggu RW', count: suratList.filter(s => s.status_surat === 'menunggu_verifikasi_rw').length },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedStatus(filter.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === filter.key
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Surat List */}
        <div className="px-4 py-4 space-y-3">
          {filteredSurat.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <FiAlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-sm font-medium">Tidak ada surat {selectedStatus !== 'semua' ? `dengan status ${selectedStatus}` : ''}</p>
            </div>
          ) : (
            filteredSurat.map((surat) => (
              <div
                key={surat.id}
                onClick={() => {/* Navigate to detail */}}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="text-slate-700" size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                      {surat.nama_surat || 'Surat'}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <FiUser size={12} />
                      <span className="truncate">{surat.nama_pemohon || 'Warga'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <FiCalendar size={12} />
                      <span>{formatDate(surat.created_at)}</span>
                    </div>

                    <div className="mt-2">
                      {getStatusBadge(surat.status_surat)}
                    </div>
                  </div>

                  <FiChevronRight className="text-gray-400 flex-shrink-0 mt-2" size={20} />
                </div>

                {/* Quick Actions for Pending */}
                {(surat.status_surat === 'menunggu_verifikasi_rt' || surat.status_surat === 'menunggu_verifikasi_rw') && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveClick(surat);
                      }}
                      className="flex-1 py-2 px-3 bg-green-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-green-600 active:scale-95 transition-all"
                    >
                      <FiCheckCircle size={14} />
                      Setujui
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectClick(surat);
                      }}
                      className="flex-1 py-2 px-3 bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-600 active:scale-95 transition-all"
                    >
                      <FiXCircle size={14} />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
              toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {toastType === 'success' ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
              <span className="font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Modals */}
        <ApproveModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          surat={selectedSurat}
        />

        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          surat={selectedSurat}
        />
      </div>
    </VerifikatorLayout>
  );
};

export default SuratMasuk;

