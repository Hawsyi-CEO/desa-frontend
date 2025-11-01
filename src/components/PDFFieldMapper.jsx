import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiFileText } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const PDFFieldMapper = ({ formulirId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [pdfFields, setPdfFields] = useState([]);
  const [isFillable, setIsFillable] = useState(false);
  const [fieldMapping, setFieldMapping] = useState({
    autoFill: [],
    manualInput: []
  });

  // Common auto-fillable fields from warga database
  const autoFillOptions = [
    'nama', 'nama_lengkap', 'nik', 'tempat_lahir', 'tanggal_lahir',
    'jenis_kelamin', 'alamat', 'rt', 'rw', 'dusun',
    'kelurahan_desa', 'kelurahan', 'desa', 'kecamatan',
    'agama', 'status_perkawinan', 'pekerjaan', 'kewarganegaraan',
    'no_kk', 'kk'
  ];

  useEffect(() => {
    if (isOpen && formulirId) {
      loadPDFFields();
    }
  }, [isOpen, formulirId]);

  const loadPDFFields = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/formulir/${formulirId}/fields`);
      
      if (response.data.success) {
        setPdfFields(response.data.data.fields);
        
        // Load existing mapping if available
        if (response.data.data.currentMapping) {
          setFieldMapping(response.data.data.currentMapping);
        }
      }
    } catch (error) {
      console.error('Load PDF fields error:', error);
      if (error.response?.status === 400) {
        toast.error('File bukan PDF atau tidak memiliki form fields');
      } else {
        toast.error('Gagal memuat fields dari PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldTypeChange = (fieldName, type) => {
    setFieldMapping(prev => {
      const newMapping = { ...prev };
      
      // Remove from both arrays first
      newMapping.autoFill = newMapping.autoFill.filter(f => f !== fieldName);
      newMapping.manualInput = newMapping.manualInput.filter(f => f !== fieldName);
      
      // Add to the selected type
      if (type === 'auto') {
        newMapping.autoFill.push(fieldName);
      } else if (type === 'manual') {
        newMapping.manualInput.push(fieldName);
      }
      
      return newMapping;
    });
  };

  const getFieldType = (fieldName) => {
    if (fieldMapping.autoFill.includes(fieldName)) return 'auto';
    if (fieldMapping.manualInput.includes(fieldName)) return 'manual';
    return 'none';
  };

  const autoDetectFields = () => {
    const newMapping = {
      autoFill: [],
      manualInput: []
    };

    pdfFields.forEach(field => {
      const fieldNameLower = field.name.toLowerCase().replace(/[_\s-]/g, '');
      
      // Check if field name matches any auto-fill option
      const isAutoFill = autoFillOptions.some(option => {
        const optionNormalized = option.toLowerCase().replace(/[_\s-]/g, '');
        return fieldNameLower.includes(optionNormalized) || optionNormalized.includes(fieldNameLower);
      });

      if (isAutoFill) {
        newMapping.autoFill.push(field.name);
      } else {
        newMapping.manualInput.push(field.name);
      }
    });

    setFieldMapping(newMapping);
    toast.success('Auto-detect berhasil!');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await api.patch(`/formulir/${formulirId}/mapping`, {
        is_fillable: isFillable,
        field_mapping: fieldMapping
      });

      toast.success('Konfigurasi field berhasil disimpan');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Save field mapping error:', error);
      toast.error('Gagal menyimpan konfigurasi field');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Konfigurasi Field PDF</h2>
              <p className="text-blue-100 mt-1">
                Tentukan field mana yang auto-fill dari database dan mana yang diisi manual
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Enable Fillable Toggle */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFillable}
                    onChange={(e) => setIsFillable(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-gray-900">Aktifkan Pengisian Otomatis</span>
                    <p className="text-sm text-gray-600 mt-1">
                      PDF ini dapat diisi otomatis oleh warga dengan data mereka
                    </p>
                  </div>
                </label>
              </div>

              {pdfFields.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiFileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Tidak ada form fields ditemukan di PDF ini</p>
                  <p className="text-sm mt-2">
                    Pastikan PDF memiliki form fields yang bisa diisi
                  </p>
                </div>
              ) : (
                <>
                  {/* Auto Detect Button */}
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Ditemukan {pdfFields.length} Field
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {fieldMapping.autoFill.length} auto-fill • {fieldMapping.manualInput.length} manual input
                      </p>
                    </div>
                    <button
                      onClick={autoDetectFields}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FiRefreshCw size={18} />
                      Auto Detect
                    </button>
                  </div>

                  {/* Field List */}
                  <div className="space-y-3">
                    {pdfFields.map((field, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {field.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Type: {field.type}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFieldTypeChange(field.name, 'auto')}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                getFieldType(field.name) === 'auto'
                                  ? 'bg-green-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                              }`}
                            >
                              {getFieldType(field.name) === 'auto' && <FiCheck className="inline mr-1" />}
                              Auto-fill
                            </button>

                            <button
                              onClick={() => handleFieldTypeChange(field.name, 'manual')}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                getFieldType(field.name) === 'manual'
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              {getFieldType(field.name) === 'manual' && <FiCheck className="inline mr-1" />}
                              Manual
                            </button>

                            <button
                              onClick={() => handleFieldTypeChange(field.name, 'none')}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                getFieldType(field.name) === 'none'
                                  ? 'bg-gray-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="font-semibold text-amber-900 mb-2">💡 Tips:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• <strong>Auto-fill</strong>: Field akan diisi otomatis dari database warga</li>
                      <li>• <strong>Manual</strong>: Warga perlu mengisi field ini secara manual</li>
                      <li>• <strong>Skip</strong>: Field tidak akan diisi</li>
                      <li>• Klik "Auto Detect" untuk deteksi otomatis berdasarkan nama field</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiCheck size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFFieldMapper;
