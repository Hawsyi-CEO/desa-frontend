import { FiMaximize, FiMinimize } from 'react-icons/fi';
import useFullscreen from '../hooks/useFullscreen';

/**
 * Fullscreen Toggle Button Component
 * Can be placed anywhere in the app
 * Fullscreen mode will persist across page navigations and refreshes
 */
const FullscreenButton = ({ className = '' }) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      onClick={toggleFullscreen}
      className={`
        fixed top-4 right-4 z-50 
        bg-slate-800 hover:bg-slate-700 
        text-white p-3 rounded-xl 
        border border-slate-600 shadow-lg 
        transition-all duration-300 hover:scale-110 
        group
        ${className}
      `}
      title={isFullscreen ? "Keluar dari layar penuh (ESC)" : "Masuk ke layar penuh (F11)"}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <FiMinimize className="w-5 h-5" />
      ) : (
        <FiMaximize className="w-5 h-5" />
      )}
      
      {/* Tooltip */}
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
        {isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh"}
      </span>
    </button>
  );
};

export default FullscreenButton;
