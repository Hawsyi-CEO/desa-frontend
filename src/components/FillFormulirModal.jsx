import { useState, useEffect } from 'react';
import { FiX, FiDownload, FiPrinter, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const FillFormulirModal = ({ formulir, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [pdfFields, setPdfFields] = useState([]);
  const [autoFillData, setAutoFillData] = useState({});

  useEffect(() => {
    if (isOpen && formulir) {
      loadFieldsAndData();
    }
  }, [isOpen, formulir]);

  const loadFieldsAndData = async () => {
    try {
      setLoading(true);

      // Get PDF fields info
      const fieldsResponse = await api.get(`/formulir/${formulir.id}/fields`);
      
      if (fieldsResponse.data.success) {
        setPdfFields(fieldsResponse.data.data.fields);
        
        const mapping = fieldsResponse.data.data.currentMapping || { autoFill: [], manualInput: [] };
        
        // Initialize form data
        const initialData = {};
        mapping.manualInput.forEach(fieldName => {
          initialData[fieldName] = '';
        });
        
        setFormData(initialData);
      }
    } catch (error) {
      console.error('Load fields error:', error);
      toast.error('Gagal memuat konfigurasi formulir');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFill = async (action = 'download') => {
    try {
      setLoading(true);

      const response = await api.post(`/formulir/${formulir.id}/fill`, {
        formData
      }, {
        responseType: 'blob'
      });

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (action === 'print') {
        // Open in new window and print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        // Download
        const link = document.createElement('a');
        link.href = url;
        link.download = `filled_${formulir.file_name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      window.URL.revokeObjectURL(url);
      toast.success(action === 'print' ? 'PDF siap dicetak!' : 'PDF berhasil diunduh!');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Fill PDF error:', error);
      toast.error('Gagal mengisi formulir');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !formulir) return null;

  const mapping = formulir.field_mapping || { autoFill: [], manualInput: [] };
  const hasManualFields = mapping.manualInput && mapping.manualInput.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{formulir.nama_formulir}</h2>
              <p className="text-blue-100">
                {formulir.deskripsi || 'Isi data yang diperlukan untuk melengkapi formulir'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {loading && pdfFields.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Auto-fill Info */}
              {mapping.autoFill && mapping.autoFill.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="font-semibold text-green-900 mb-2">
                    ✓ Data Otomatis Terisi
                  </h3>
                  <p className="text-sm text-green-700">
                    Data berikut akan diisi otomatis dari profil Anda: {' '}
                    <span className="font-medium">
                      {mapping.autoFill.join(', ')}
                    </span>
                  </p>
                </div>
              )}

              {/* Manual Input Fields */}
              {hasManualFields ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Data yang Perlu Diisi:
                  </h3>

                  {mapping.manualInput.map((fieldName, index) => {
                    // Find field info
                    const fieldInfo = pdfFields.find(f => f.name === fieldName);
                    const fieldType = fieldInfo?.type || 'text';

                    return (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {fieldName.replace(/_/g, ' ')}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        
                        {fieldType === 'text' ? (
                          <input
                            type="text"
                            value={formData[fieldName] || ''}
                            onChange={(e) => handleInputChange(fieldName, e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Masukkan ${fieldName.replace(/_/g, ' ')}`}
                          />
                        ) : fieldType === 'checkbox' ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[fieldName] === 'true' || formData[fieldName] === true}
                              onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Ya / Setuju</span>
                          </label>
                        ) : (
                          <input
                            type="text"
                            value={formData[fieldName] || ''}
                            onChange={(e) => handleInputChange(fieldName, e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiDownload size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Formulir Siap Diisi Otomatis
                  </h3>
                  <p className="text-gray-600">
                    Semua data akan diisi otomatis dari profil Anda.
                    <br />
                    Klik tombol di bawah untuk mengunduh atau mencetak formulir.
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>💡 Catatan:</strong> Formulir akan diisi dengan data terbaru dari profil Anda. 
                  Pastikan data profil Anda sudah benar sebelum mengunduh formulir.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={loading}
          >
            Batal
          </button>
          
          <button
            onClick={() => handleFill('download')}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={18} />
                Memproses...
              </>
            ) : (
              <>
                <FiDownload size={18} />
                Unduh PDF
              </>
            )}
          </button>

          <button
            onClick={() => handleFill('print')}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={18} />
                Memproses...
              </>
            ) : (
              <>
                <FiPrinter size={18} />
                Cetak PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FillFormulirModal;
