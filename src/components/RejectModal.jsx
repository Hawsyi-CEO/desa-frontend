import { useState } from 'react';
import { FiX, FiXCircle, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import api, { BASE_URL } from '../services/api';

const RejectModal = ({ isOpen, onClose, surat, onSuccess }) => {
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!keterangan.trim()) {
      setError('Alasan penolakan wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await api.put(`/verifikator/surat/${surat.id}/reject`, {
        keterangan
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          setKeterangan('');
          // Reload page to refresh the surat list
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error('Error rejecting surat:', err);
      setError(err.response?.data?.message || 'Gagal menolak surat');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
         onClick={onClose}>
      
      {/* Success Animation */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-bounceIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/50">
              <FiXCircle className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center">Surat Ditolak</h3>
            <p className="text-gray-600 text-center mt-2">Pemohon akan diberitahu</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-slideUp"
           onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiXCircle className="text-white" size={28} />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Tolak Surat</h3>
              <p className="text-sm text-red-100 mt-0.5">{surat?.nama_surat}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Pemohon */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-slate-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Pemohon</p>
                <p className="font-bold text-slate-900">{surat?.nama_pemohon}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    NIK: {surat?.nik_pemohon}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                    RT {surat?.pemohon_rt || '-'} / RW {surat?.pemohon_rw || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Surat Pengantar dari Level Sebelumnya (jika ada) */}
          {surat?.surat_pengantar_rt && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FiFileText className="text-blue-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 mb-1">Surat Pengantar dari RT</p>
                  <p className="text-xs text-blue-700 mb-2">
                    Diupload: {surat?.tanggal_upload_pengantar_rt ? new Date(surat.tanggal_upload_pengantar_rt).toLocaleDateString('id-ID') : '-'}
                  </p>
                  <a
                    href={`${BASE_URL}/uploads/surat-pengantar/${surat.surat_pengantar_rt}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <FiFileText size={14} />
                    <span>Lihat Surat Pengantar RT</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {surat?.surat_pengantar_rw && (
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FiFileText className="text-purple-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900 mb-1">Surat Pengantar dari RW</p>
                  <p className="text-xs text-purple-700 mb-2">
                    Diupload: {surat?.tanggal_upload_pengantar_rw ? new Date(surat.tanggal_upload_pengantar_rw).toLocaleDateString('id-ID') : '-'}
                  </p>
                  <a
                    href={`${BASE_URL}/uploads/surat-pengantar/${surat.surat_pengantar_rw}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <FiFileText size={14} />
                    <span>Lihat Surat Pengantar RW</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiAlertTriangle className="text-red-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 mb-1">Konfirmasi Penolakan</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Pastikan alasan penolakan jelas agar pemohon dapat memperbaiki pengajuan selanjutnya.
                </p>
              </div>
            </div>
          </div>

          {/* Alasan Penolakan */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => {
                setKeterangan(e.target.value);
                setError('');
              }}
              placeholder="Jelaskan alasan penolakan dengan jelas..."
              rows={4}
              disabled={submitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all resize-none hover:border-gray-300 disabled:opacity-50"
              required
            />
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              Berikan penjelasan detail agar pemohon dapat memperbaiki pengajuan
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 animate-scaleIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FiXCircle className="text-red-600" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">Terjadi Kesalahan</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !keterangan.trim()}
              className="flex-1 px-5 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiXCircle size={20} />
                  <span>Tolak Surat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}} />
    </div>
  );
};

export default RejectModal;

