import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

/**
 * Install PWA Banner Component
 * Shows install prompt for Progressive Web App
 * Only shows banner (no floating button)
 * Auto-hide if already installed
 */
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = window.navigator.standalone === true;
      
      if (isStandalone || isIosStandalone) {
        setIsInstalled(true);
        setShowBanner(false);
        // Mark as installed (jika buka dari PWA icon)
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      return false;
    };

    // Initial check
    if (checkIfInstalled()) {
      return;
    }

    // Check if user has installed before (even if opening in browser)
    const hasInstalledBefore = localStorage.getItem('pwa-installed');
    
    // ⭐ PERBAIKAN: Jika flag installed = true tapi beforeinstallprompt fired
    // Artinya PWA sudah di-uninstall (browser request install lagi)
    let hasUninstalled = false;

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // ⭐ Jika event ini fire padahal flag installed = true
      // Berarti user sudah uninstall PWA
      if (hasInstalledBefore === 'true') {
        console.log('PWA was uninstalled, clearing flag');
        localStorage.removeItem('pwa-installed');
        hasUninstalled = true;
      }
      
      // Check if user has dismissed banner before (permanent)
      const hasBeenDismissed = localStorage.getItem('pwa-banner-dismissed');
      
      if (!hasBeenDismissed && !isInstalled) {
        setShowBanner(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowBanner(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      // Mark as installed permanently (even when opened in browser)
      localStorage.setItem('pwa-installed', 'true');
      localStorage.removeItem('pwa-banner-dismissed'); // Clear dismissed flag
    };

    // Don't show banner if installed before and not uninstalled
    if (hasInstalledBefore === 'true' && !hasUninstalled) {
      setIsInstalled(true);
      setShowBanner(false);
      // Still listen for events to detect uninstall
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowBanner(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true'); // Permanent dismiss
  };

  // Don't show anything if installed or banner dismissed
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    /* Install Banner - Only show if not installed and not dismissed */
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:bottom-4 lg:left-4 lg:right-auto lg:max-w-md
      bg-gradient-to-r from-slate-800 to-slate-900 text-white
      shadow-2xl border-t-4 border-blue-500 lg:rounded-2xl
      animate-slideUp">
      
      <div className="relative p-4 lg:p-5">
        {/* Close Button */}
        <button
          onClick={handleDismissBanner}
          className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Tutup"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FiSmartphone className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 pr-8">
            <h3 className="font-bold text-lg mb-1">Install Surat Muliya</h3>
            <p className="text-sm text-slate-300">
              Tambahkan ke layar utama untuk akses cepat seperti aplikasi native
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4 ml-16 lg:ml-0">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Akses lebih cepat tanpa browser</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Bekerja offline dengan cache</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Notifikasi langsung (segera hadir)</span>
          </div>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstallClick}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
            text-white font-semibold rounded-xl
            shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-[1.02]
            flex items-center justify-center gap-2"
        >
          <FiDownload className="w-5 h-5" />
          <span>Install Sekarang</span>
        </button>

        {/* Dismiss Text */}
        <button
          onClick={handleDismissBanner}
          className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Mungkin nanti
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
