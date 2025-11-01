import { useState, useEffect } from 'react';

/**
 * Custom hook untuk manage fullscreen mode
 * Fullscreen state akan persist bahkan setelah page refresh atau navigation
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Check if fullscreen mode was enabled before
    const fullscreenPref = sessionStorage.getItem('fullscreenMode');
    
    // Auto-restore fullscreen on mount
    if (fullscreenPref === 'true') {
      requestFullscreen();
    }

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Save preference to sessionStorage
      sessionStorage.setItem('fullscreenMode', isCurrentlyFullscreen ? 'true' : 'false');
    };

    // Add event listeners for all browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check
    handleFullscreenChange();

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = () => {
    const elem = document.documentElement;
    
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
  };

  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  return {
    isFullscreen,
    toggleFullscreen,
    requestFullscreen,
    exitFullscreen
  };
};

export default useFullscreen;
