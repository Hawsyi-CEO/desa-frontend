import Sidebar from './Sidebar';
import FullscreenButton from './FullscreenButton';
import { useEffect, useState } from 'react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Auto close sidebar on mobile, open on desktop
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
        document.body.classList.add('sidebar-closed');
      } else {
        setSidebarOpen(true);
        document.body.classList.add('sidebar-open');
        document.body.classList.remove('sidebar-closed');
      }
    };

    // Check on mount
    handleResize();

    // Listen for resize
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Listen for sidebar state changes
    const checkSidebarState = () => {
      const isOpen = document.body.classList.contains('sidebar-open');
      setSidebarOpen(isOpen);
    };

    // Check initially
    checkSidebarState();

    // Set up observer for body class changes
    const observer = new MutationObserver(checkSidebarState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <FullscreenButton />
      <Sidebar />
      <main 
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
      >
        {/* Mobile Top Bar with Hamburger Space */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 sticky top-0 z-30"></div>
        
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

