import { useState } from 'react';
import { FiX, FiCheckCircle, FiUpload, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api, { BASE_URL } from '../services/api';

const ApproveModal = ({ isOpen, onClose, surat, onSuccess }) => {
  const { user } = useAuth();
  const [keterangan, setKeterangan] = useState('');
  const [suratPengantar, setSuratPengantar] = useState(null);
  const [suratPengantarPreview, setSuratPengantarPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('File harus berupa PDF, JPG, atau PNG');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      setSuratPengantar(file);
      setSuratPengantarPreview(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!suratPengantar) {
      setError('Surat pengantar wajib diupload');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('surat_pengantar', suratPengantar);
      formData.append('keterangan', keterangan);

      const response = await api.put(`/verifikator/surat/${surat.id}/approve`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          // Reload page to refresh the surat list
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error('Error approving surat:', err);
      setError(err.response?.data?.message || 'Gagal menyetujui surat');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Success Animation
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-bounceIn">
          <div className="relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-scaleIn">
                <FiCheckCircle className="text-white" size={48} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="pt-14 pb-6 px-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Surat Disetujui!
            </h3>
            <p className="text-gray-600 mb-4">
              Surat telah berhasil disetujui dan diteruskan ke tahap berikutnya
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-green-800">
                  Status: Disetujui
                </p>
              </div>
              <p className="text-xs text-green-700">
                Surat akan diproses ke tahap selanjutnya
              </p>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes scaleIn {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
          .animate-scaleIn { animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        `}} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-slideUp"
           onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiCheckCircle className="text-white" size={28} />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Setujui Surat</h3>
              <p className="text-sm text-green-100 mt-0.5">{surat?.nama_surat}</p>
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

          {/* Warning Info */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiAlertCircle className="text-amber-600" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 mb-1">Wajib Upload Surat Pengantar</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Sebagai {user?.verifikator_level === 'rt' ? 'RT' : user?.verifikator_level === 'rw' ? 'RW' : 'Admin'}, Anda harus mengupload surat pengantar terlebih dahulu sebelum menyetujui pengajuan surat ini.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Surat Pengantar */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Surat Pengantar {user?.verifikator_level === 'rt' ? 'RT' : user?.verifikator_level === 'rw' ? 'RW' : 'Admin'} <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={submitting}
                className="hidden"
                id="surat-pengantar-upload"
              />
              <label
                htmlFor="surat-pengantar-upload"
                className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  suratPengantar 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                    : 'border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  suratPengantar ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' : 'bg-gray-400'
                }`}>
                  <FiUpload className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  {suratPengantarPreview ? (
                    <>
                      <p className="text-sm font-bold text-gray-900 truncate">{suratPengantarPreview}</p>
                      <p className="text-xs text-green-600 font-semibold">✓ File siap diupload</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-700">Upload Surat Pengantar</p>
                      <p className="text-xs text-gray-500">PDF, JPG, atau PNG (max 5MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              Format: PDF, JPG, PNG • Ukuran maksimal 5MB
            </p>
          </div>

          {/* Keterangan (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Catatan <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              rows={3}
              disabled={submitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all resize-none hover:border-gray-300 disabled:opacity-50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 animate-scaleIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle className="text-red-600" size={18} />
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
              disabled={submitting || !suratPengantar}
              className="flex-1 px-5 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle size={20} />
                  <span>Setujui Surat</span>
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

export default ApproveModal;

