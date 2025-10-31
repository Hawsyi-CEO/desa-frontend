import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const Tutorial = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState(null);

  const tutorialSteps = [
    {
      id: 'welcome',
      title: '👋 Mari Mulai!',
      description: 'Ikuti highlight yang muncul pada setiap langkah.',
      position: 'center',
      highlight: null,
    },
    
    {
      id: 'step-sidebar-pengaturan',
      title: '⚙️ Klik Menu Pengaturan',
      description: 'Klik menu "Pengaturan" di sidebar.',
      position: 'right',
      highlight: 'a[href="/super-admin/pengaturan"]',
    },
    {
      id: 'step-sidebar-jenis-surat',
      title: '📋 Langkah 2: Buka Menu Jenis Surat',
      description: 'Sekarang kita akan membuat template surat. Klik menu "Jenis Surat" di sidebar.',
      position: 'right',
      highlight: 'a[href="/super-admin/jenis-surat"]',
      action: 'Klik menu "Jenis Surat" yang ditandai',
    },
    {
      id: 'step-tambah-jenis-surat',
      title: '➕ Langkah 3: Tambah Jenis Surat Baru',
      description: 'Di halaman Jenis Surat, klik tombol "Tambah Jenis Surat" untuk membuat template surat baru.',
      position: 'bottom',
      highlight: 'button:contains("Tambah Jenis Surat"), a:contains("Tambah Jenis Surat")',
      action: 'Klik tombol "Tambah Jenis Surat"',
    },
    {
      id: 'step-sidebar-semua-surat',
      title: '📥 Langkah 4: Lihat Semua Surat',
      description: 'Untuk mereview surat yang masuk dari warga, klik menu "Semua Surat".',
      position: 'right',
      highlight: 'a[href="/super-admin/surat"]',
      action: 'Klik menu "Semua Surat" di sidebar',
    },
    {
      id: 'step-review-surat',
      title: '🔍 Langkah 5: Review Detail Surat',
      description: 'Klik pada salah satu surat untuk melihat detailnya. Periksa data pemohon dan isi surat.',
      position: 'top',
      highlight: '.surat-item, tr:has(td)',
      action: 'Klik pada baris surat untuk melihat detail',
    },
    {
      id: 'step-approve-surat',
      title: '✅ Langkah 6: Setujui atau Tolak Surat',
      description: 'Setelah mereview, Anda bisa menyetujui atau menolak surat dengan tombol yang tersedia.',
      position: 'top',
      highlight: 'button:contains("Setujui"), button:contains("Tolak")',
      action: 'Klik "Setujui" jika data valid, atau "Tolak" jika ada masalah',
    },
    {
      id: 'step-sidebar-users',
      title: '� Langkah 7: Kelola User',
      description: 'Untuk menambah verifikator atau admin, klik menu "Users".',
      position: 'right',
      highlight: 'a[href="/super-admin/users"]',
      action: 'Klik menu "Users" di sidebar',
    },
    {
      id: 'step-tambah-user',
      title: '➕ Langkah 8: Tambah User Baru',
      description: 'Klik tombol "Tambah User" untuk membuat akun verifikator atau admin baru.',
      position: 'bottom',
      highlight: 'button:contains("Tambah User"), a:contains("Tambah User")',
      action: 'Klik tombol "Tambah User"',
    },
    {
      id: 'step-sidebar-warga',
      title: '📇 Langkah 9: Kelola Data Warga',
      description: 'Untuk mengelola database warga, klik menu "Data Warga".',
      position: 'right',
      highlight: 'a[href="/super-admin/warga"]',
      action: 'Klik menu "Data Warga" di sidebar',
    },
    {
      id: 'step-tambah-warga',
      title: '➕ Langkah 10: Tambah Data Warga',
      description: 'Klik tombol "Tambah Warga" untuk menambahkan data warga baru ke database.',
      position: 'bottom',
      highlight: 'button:contains("Tambah Warga"), a:contains("Tambah Warga")',
      action: 'Klik tombol "Tambah Warga"',
    },
    
    // ========== COMPLETE ==========
    {
      id: 'complete',
      title: '🎉 Tutorial Selesai!',
      description: 'Sekarang Anda sudah tahu cara menggunakan sistem. Setiap elemen yang ditandai akan memandu Anda untuk melakukan aksi yang tepat. Klik tombol "?" kapan saja untuk membuka tutorial kembali.',
      position: 'center',
      highlight: null,
    },
  ];

  const currentStepData = tutorialSteps[currentStep];

  useEffect(() => {
    if (currentStepData.highlight) {
      // Helper function to find element with text content
      const findElementBySelector = (selector) => {
        // Check if selector contains :contains()
        const containsMatch = selector.match(/(.+):contains\("(.+)"\)/);
        if (containsMatch) {
          const [, baseSelector, text] = containsMatch;
          const elements = document.querySelectorAll(baseSelector);
          for (let el of elements) {
            if (el.textContent.includes(text)) {
              return el;
            }
          }
          return null;
        }
        
        // Try multiple selectors separated by comma
        const selectors = selector.split(',').map(s => s.trim());
        for (let sel of selectors) {
          const containsMatch = sel.match(/(.+):contains\("(.+)"\)/);
          if (containsMatch) {
            const [, baseSelector, text] = containsMatch;
            const elements = document.querySelectorAll(baseSelector);
            for (let el of elements) {
              if (el.textContent.includes(text)) {
                return el;
              }
            }
          } else {
            const element = document.querySelector(sel);
            if (element) return element;
          }
        }
        return null;
      };

      const element = findElementBySelector(currentStepData.highlight);
      if (element) {
        setHighlightElement(element);
        // Scroll to element smoothly
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightElement(null);
      }
    } else {
      setHighlightElement(null);
    }
  }, [currentStep, currentStepData.highlight]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    sessionStorage.setItem('tutorialCompleted', 'true');
    onClose();
  };

  const getTooltipPosition = () => {
    if (!highlightElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = highlightElement.getBoundingClientRect();
    const position = currentStepData.position;

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div className="fixed inset-0 z-[9998]">
        {/* Dark overlay with cutout for highlighted element */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {highlightElement && (
                <rect
                  x={highlightElement.getBoundingClientRect().left - 10}
                  y={highlightElement.getBoundingClientRect().top - 10}
                  width={highlightElement.getBoundingClientRect().width + 20}
                  height={highlightElement.getBoundingClientRect().height + 20}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.75)" mask="url(#spotlight-mask)" />
        </svg>

        {/* Highlight Border */}
        {highlightElement && (
          <div
            className="absolute pointer-events-none animate-pulse"
            style={{
              top: `${highlightElement.getBoundingClientRect().top - 10}px`,
              left: `${highlightElement.getBoundingClientRect().left - 10}px`,
              width: `${highlightElement.getBoundingClientRect().width + 20}px`,
              height: `${highlightElement.getBoundingClientRect().height + 20}px`,
              border: '3px solid #3b82f6',
              borderRadius: '12px',
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5)',
            }}
          />
        )}
      </div>

      {/* Tooltip/Callout */}
      <div
        className="fixed z-[9999] max-w-md w-full mx-4"
        style={getTooltipPosition()}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden animate-fade-in-scale">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step Counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Langkah {currentStep + 1} dari {tutorialSteps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action Hint */}
            {currentStepData.action && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                <p className="text-sm text-blue-800 font-medium whitespace-pre-line">
                  💡 {currentStepData.action}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft size={18} />
                Sebelumnya
              </button>

              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-500 w-6'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    <Check size={18} />
                    Selesai
                  </>
                ) : (
                  <>
                    Lanjut
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow Pointer */}
        {highlightElement && currentStepData.position !== 'center' && (
          <div
            className="absolute w-0 h-0"
            style={{
              ...(currentStepData.position === 'top' && {
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid #3b82f6',
              }),
              ...(currentStepData.position === 'bottom' && {
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid #3b82f6',
              }),
              ...(currentStepData.position === 'left' && {
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '10px solid #3b82f6',
              }),
              ...(currentStepData.position === 'right' && {
                left: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid #3b82f6',
              }),
            }}
          />
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Tutorial;

