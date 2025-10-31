import { FiAlertCircle, FiLogOut, FiX } from 'react-icons/fi';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-2xl relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <FiX size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FiAlertCircle className="text-white" size={28} />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Konfirmasi Logout</h3>
              <p className="text-sm text-red-100 mt-0.5">Anda yakin ingin keluar?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Anda akan keluar dari aplikasi Surat Muliya
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">i</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Anda perlu login kembali untuk mengakses aplikasi
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <FiLogOut size={18} />
              Ya, Keluar
            </button>
          </div>
        </div>
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
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default LogoutConfirmModal;

