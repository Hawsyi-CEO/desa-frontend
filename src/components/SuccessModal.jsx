import { FiCheckCircle, FiX } from 'react-icons/fi';

const SuccessModal = ({ isOpen, onClose, title, message, onContinue, requireVerification = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-bounceIn">
        {/* Success Icon */}
        <div className="relative">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-scaleIn">
              <FiCheckCircle className="text-white" size={48} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-6 px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {title || 'Berhasil!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {message || 'Surat Anda berhasil diajukan'}
          </p>

          {/* Success Details - DYNAMIC based on verification */}
          {requireVerification ? (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-yellow-800">
                  Status: Menunggu Verifikasi
                </p>
              </div>
              <p className="text-xs text-yellow-700">
                Surat Anda akan diproses oleh RT/RW
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-green-800">
                  Status: Langsung ke Admin
                </p>
              </div>
              <p className="text-xs text-green-700">
                Surat Anda langsung diproses oleh Kepala Desa (tanpa verifikasi RT/RW)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Tutup
            </button>
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              Lihat Riwayat
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
        >
          <FiX size={20} />
        </button>
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

        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}} />
    </div>
  );
};

export default SuccessModal;

