import { useState } from 'react';
import { BASE_URL } from '../services/api';

const ApproveModalSuperAdmin = ({ isOpen, onClose, surat, onSuccess }) => {
  const [catatan, setCatatan] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen || !surat) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tanggalSurat) {
      alert('Tanggal surat harus diisi!');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/surat/${surat.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tanggal_surat: tanggalSurat,
          catatan: catatan || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyetujui surat');
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
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Setujui Surat</h3>
                  <p className="text-green-100 text-sm">Verifikasi dan approve pengajuan surat</p>
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
              {/* Tanggal Surat */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Tanggal Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                  required
                  disabled={loading}
                />
              </div>

              {/* Info Auto Generate */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-900 font-bold mb-1">
                      🤖 Nomor Surat Otomatis
                    </p>
                    <p className="text-xs text-green-700">
                      Sistem akan generate nomor surat secara otomatis setelah approval
                    </p>
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Catatan <span className="text-gray-400">(Opsional)</span>
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-all"
                  rows="3"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  disabled={loading}
                />
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Setujui Surat
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
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-6 animate-bounceIn shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Surat Berhasil Disetujui!</h3>
            <p className="text-gray-600 mb-6">
              Surat telah disetujui dan nomor surat telah di-generate otomatis
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

export default ApproveModalSuperAdmin;

