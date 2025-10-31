import { useState } from 'react';
import { BASE_URL } from '../services/api';

const RejectModalSuperAdmin = ({ isOpen, onClose, surat, onSuccess }) => {
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen || !surat) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!catatan.trim()) {
      alert('Alasan penolakan harus diisi!');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/surat/${surat.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          catatan: catatan
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menolak surat');
      }

      // Show success animation
      setShowSuccess(true);
      
      // Wait for animation then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      alert(err.message || 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounceIn">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Tolak Surat</h3>
                  <p className="text-red-100 text-sm">Berikan alasan penolakan pengajuan surat</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Info Pemohon */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {surat.nama_pemohon?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Pemohon</h4>
                  <p className="text-lg font-bold text-gray-900">{surat.nama_pemohon || '-'}</p>
                  <p className="text-sm text-gray-600 mt-1">NIK: {surat.nik_pemohon || '-'}</p>
                </div>
              </div>
            </div>

            {/* Info Surat */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-xs font-semibold text-purple-600 mb-1">Jenis Surat</p>
                <p className="text-sm font-bold text-gray-900">{surat.nama_surat || '-'}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                <p className="text-xs font-semibold text-amber-600 mb-1">Tanggal Pengajuan</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(surat.created_at)}</p>
              </div>
            </div>

            {/* Surat Pengantar dari RT (jika ada) */}
            {surat.surat_pengantar_rt && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-900 mb-1">📄 Surat Pengantar dari RT</h4>
                    <p className="text-xs text-blue-700 mb-3">
                      Diupload: {formatDate(surat.tanggal_upload_pengantar_rt)}
                    </p>
                    <a
                      href={`${BASE_URL}/uploads/surat-pengantar/${surat.surat_pengantar_rt}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Lihat Surat Pengantar RT</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Surat Pengantar dari RW (jika ada) */}
            {surat.surat_pengantar_rw && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-5 border-2 border-purple-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-purple-900 mb-1">📑 Surat Pengantar dari RW</h4>
                    <p className="text-xs text-purple-700 mb-3">
                      Diupload: {formatDate(surat.tanggal_upload_pengantar_rw)}
                    </p>
                    <a
                      href={`${BASE_URL}/uploads/surat-pengantar/${surat.surat_pengantar_rw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Lihat Surat Pengantar RW</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 border-t pt-5">
              {/* Alasan Penolakan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 transition-all"
                  rows="4"
                  placeholder="Jelaskan alasan mengapa surat ini ditolak..."
                  required
                  disabled={loading}
                />
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm text-amber-900 font-bold mb-1">
                      ⚠️ Perhatian
                    </p>
                    <p className="text-xs text-amber-700">
                      Pemohon akan menerima notifikasi penolakan beserta alasan yang Anda berikan
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Tolak Surat
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleIn">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center mb-6 animate-bounceIn shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Surat Berhasil Ditolak</h3>
            <p className="text-gray-600 mb-6">
              Pemohon akan menerima notifikasi penolakan beserta alasan yang diberikan
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat ulang halaman...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RejectModalSuperAdmin;

