import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  };

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: 'text-white',
      border: 'border-green-400'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: 'text-white',
      border: 'border-red-400'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      icon: 'text-white',
      border: 'border-yellow-400'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'text-white',
      border: 'border-blue-400'
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      <div className="pointer-events-auto animate-toast-in">
        <div 
          className={`${currentStyle.bg} ${currentStyle.border} border-2 rounded-2xl shadow-2xl p-6 min-w-[300px] max-w-md`}
        >
          <div className="flex items-start gap-4">
            <div className={`${currentStyle.icon} flex-shrink-0 mt-0.5`}>
              {icons[type]}
            </div>
            <div className="flex-1 text-white">
              <p className="font-semibold text-lg mb-1">
                {type === 'success' && 'Berhasil!'}
                {type === 'error' && 'Gagal!'}
                {type === 'warning' && 'Peringatan!'}
                {type === 'info' && 'Informasi'}
              </p>
              <p className="text-white/90 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress bar */}
          {duration > 0 && (
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/60 rounded-full animate-progress"
                style={{ animationDuration: `${duration}ms` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal Konfirmasi
export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Ya', 
  cancelText = 'Batal',
  onConfirm, 
  onCancel,
  type = 'danger' // 'danger' or 'warning' or 'info'
}) {
  if (!isOpen) return null;

  const styles = {
    danger: {
      gradient: 'from-red-500 to-rose-600',
      button: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      icon: <XCircle className="w-12 h-12" />
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-600',
      button: 'from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800',
      icon: <AlertCircle className="w-12 h-12" />
    },
    info: {
      gradient: 'from-blue-500 to-indigo-600',
      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      icon: <Info className="w-12 h-12" />
    }
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className={`bg-gradient-to-r ${currentStyle.gradient} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {currentStyle.icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 bg-gradient-to-r ${currentStyle.button} text-white rounded-xl font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
