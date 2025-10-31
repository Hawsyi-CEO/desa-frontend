import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PreviewSurat from '../../components/PreviewSurat';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const WargaSurat = () => {
  const { user } = useAuth();
  const { toast, hideToast, success, error, warning } = useToast();
  const [jenisSurat, setJenisSurat] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingNik, setLoadingNik] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Helper function untuk mendapatkan value field dengan flexible matching
  const getFieldValue = (fieldName) => {
    // Coba exact match dulu
    if (formData[fieldName]) return formData[fieldName];
    
    // Jika tidak ada, coba berbagai variasi
    const fieldNameLower = fieldName.toLowerCase();
    const fieldNameNoSpace = fieldNameLower.replace(/\s+/g, '_');
    const fieldNameNoUnderscore = fieldNameLower.replace(/_/g, '');
    const fieldNameNoSpaceOrUnderscore = fieldNameLower.replace(/[\s_]/g, '');
    
    return formData[fieldNameLower] || 
           formData[fieldNameNoSpace] || 
           formData[fieldNameNoUnderscore] ||
           formData[fieldNameNoSpaceOrUnderscore] ||
           formData[fieldName.toLowerCase().replace(/\s+/g, '')] ||
           '';
  };

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warga/jenis-surat');
      if (response.data.success) {
        setJenisSurat(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
      error('Gagal memuat daftar jenis surat');
    } finally {
      setLoading(false);
    }
  };

  // Autofill data warga berdasarkan NIK
  const fetchWargaByNik = async (nik) => {
    console.log('📞 fetchWargaByNik called with NIK:', nik);
    
    // Validasi jenis surat harus dipilih dulu
    if (!selectedJenis) {
      warning('Pilih jenis surat terlebih dahulu sebelum mengisi NIK');
      return;
    }
    
    // Validasi format NIK
    if (!nik || nik.length !== 16) {
      console.log('NIK validation failed. Length:', nik?.length);
      return;
    }

    try {
      setLoadingNik(true);
      console.log('Fetching data from API:', `/warga/data-by-nik/${nik}`);
      
      const response = await api.get(`/warga/data-by-nik/${nik}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const wargaData = response.data.data;
        console.log('📦 Warga data received:', wargaData);
        
        // Format tanggal lahir dari timestamp ke YYYY-MM-DD
        let formattedTanggalLahir = '';
        if (wargaData.tanggal_lahir) {
          const date = new Date(wargaData.tanggal_lahir);
          formattedTanggalLahir = date.toISOString().split('T')[0]; // 2017-01-06
          console.log('📅 Formatted tanggal_lahir:', formattedTanggalLahir);
        }
        
        // Normalize field name (lowercase, remove spaces, underscores)
        const normalizeFieldName = (name) => {
          return name.toLowerCase()
            .replace(/\s+/g, '_')  // space to underscore
            .replace(/[^a-z0-9_]/g, '');  // remove special chars
        };

        // Get template fields from selected jenis_surat
        const templateFields = selectedJenis?.fields || [];
        console.log('📋 Template fields:', templateFields);

        // Master mapping of warga data (all possible fields)
        const wargaFieldMapping = {
          'nik': wargaData.nik,
          'nama': wargaData.nama,
          'nama_lengkap': wargaData.nama,
          'tempat_lahir': wargaData.tempat_lahir,
          'tanggal_lahir': formattedTanggalLahir,
          'ttl': formattedTanggalLahir,
          'jenis_kelamin': wargaData.jenis_kelamin,
          'pekerjaan': wargaData.pekerjaan,
          'agama': wargaData.agama,
          'status_perkawinan': wargaData.status_perkawinan,
          'status_kawin': wargaData.status_perkawinan,
          'kewarganegaraan': wargaData.kewarganegaraan,
          'pendidikan': wargaData.pendidikan,
          'golongan_darah': wargaData.golongan_darah,
          'alamat': wargaData.alamat,
          'dusun': wargaData.dusun,
          'rt': wargaData.rt,
          'rw': wargaData.rw,
          'no_telepon': wargaData.no_telepon,
          'no_kk': wargaData.no_kk,
          'nama_kepala_keluarga': wargaData.nama_kepala_keluarga,
          'hubungan_keluarga': wargaData.hubungan_keluarga
        };

        // Update formData HANYA dengan field yang ada di template
        setFormData(prev => {
          const newData = { ...prev };
          
          // Loop through template fields only
          templateFields.forEach(field => {
            const normalizedFieldName = normalizeFieldName(field.name);
            console.log(`🔍 Checking template field: "${field.name}" → normalized: "${normalizedFieldName}"`);
            
            // Check if we have data for this field
            if (wargaFieldMapping[normalizedFieldName]) {
              newData[field.name] = wargaFieldMapping[normalizedFieldName];
              console.log(`✅ Autofilled: ${field.name} = ${wargaFieldMapping[normalizedFieldName]}`);
            }
          });
          
          console.log('✨ Final autofilled formData:', newData);
          console.log('📊 Autofilled fields count:', Object.keys(newData).filter(k => k !== 'jenis_surat_id').length);
          return newData;
        });

        success('Data warga berhasil dimuat dari NIK');
      }
    } catch (err) {
      console.error('Error fetching warga by NIK:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 404) {
        warning('Data warga dengan NIK tersebut tidak ditemukan');
      } else {
        error(err.response?.data?.message || 'Gagal memuat data warga');
      }
    } finally {
      setLoadingNik(false);
    }
  };

  const handleJenisChange = (e) => {
    const jenisId = e.target.value;
    const jenis = jenisSurat.find(item => item.id === parseInt(jenisId));
    setSelectedJenis(jenis);
    setFormData({});
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Auto-fetch data warga saat NIK diisi lengkap 16 digit
    // Support case-insensitive NIK field name
    const fieldNameLower = fieldName.toLowerCase();
    if (fieldNameLower === 'nik' && value.length === 16) {
      console.log('NIK field detected! Fetching data for NIK:', value);
      fetchWargaByNik(value);
    }
  };

  const handlePreview = () => {
    if (!selectedJenis) {
      warning('Pilih jenis surat terlebih dahulu');
      return;
    }

    const fields = typeof selectedJenis.fields === 'string' 
      ? JSON.parse(selectedJenis.fields) 
      : (selectedJenis.fields || []);

    // Validate required fields (only if fields exist)
    if (fields.length > 0) {
      const missingFields = fields
        .filter(field => field.required && !getFieldValue(field.name))
        .map(field => field.label);

      if (missingFields.length > 0) {
        error(`Lengkapi field berikut: ${missingFields.join(', ')}`);
        return;
      }
    }

    setPreviewData({
      jenis_surat: {
        ...selectedJenis,
        fields,
        template: selectedJenis.template_konten, // For backward compatibility
        template_konten: selectedJenis.template_konten
      },
      data_surat: formData,
      user: user,
      status_surat: 'draft'
    });
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedJenis) {
      warning('Pilih jenis surat terlebih dahulu');
      return;
    }

    const fields = typeof selectedJenis.fields === 'string' 
      ? JSON.parse(selectedJenis.fields) 
      : (selectedJenis.fields || []);

    // Validate required fields (only if fields exist)
    if (fields.length > 0) {
      const missingFields = fields
        .filter(field => field.required && !getFieldValue(field.name))
        .map(field => field.label);

      if (missingFields.length > 0) {
        error(`Lengkapi field berikut: ${missingFields.join(', ')}`);
        return;
      }
    }

    try {
      setLoading(true);
      
      // Kirim data surat (tanpa keperluan dan lampiran)
      await api.post('/warga/surat', {
        jenis_surat_id: selectedJenis.id,
        data_surat: formData
      });

      success('Surat berhasil diajukan!');
      
      // Reset form
      setSelectedJenis(null);
      setFormData({});
      
    } catch (err) {
      console.error('Error submitting surat:', err);
      error(err.response?.data?.message || 'Gagal mengajukan surat');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    // DEBUG: Log field name dari jenis surat
    console.log('🏷️ Rendering field:', field.name, 'Type:', field.type);
    
    // Gunakan helper function untuk mendapatkan value
    const value = getFieldValue(field.name);
    
    if (value) {
      console.log('🔎 Found value for', field.name, ':', value);
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input"
            rows="3"
            required={field.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );
      
      default:
        // Special handling untuk field NIK dengan loading indicator
        // Support case-insensitive NIK field name
        const isNikField = field.name.toLowerCase() === 'nik';
        
        if (isNikField) {
          return (
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="input pr-10"
                required={field.required}
                maxLength={16}
                placeholder="Masukkan NIK 16 digit"
              />
              {loadingNik && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Data akan otomatis terisi saat NIK 16 digit dimasukkan
              </p>
            </div>
          );
        }
        
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ajukan Surat Baru</h1>
          
          {loading && !selectedJenis ? (
            <div className="card text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Memuat daftar jenis surat...</p>
            </div>
          ) : jenisSurat.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-2">Belum ada jenis surat yang tersedia</p>
              <p className="text-sm text-gray-500">Silakan hubungi admin desa</p>
            </div>
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pilih Jenis Surat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Surat *
                </label>
                <select
                  value={selectedJenis?.id || ''}
                  onChange={handleJenisChange}
                  className="input"
                  required
                >
                  <option value="">Pilih Jenis Surat</option>
                  {jenisSurat.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nama_surat} ({item.kode_surat})
                    </option>
                  ))}
                </select>
                {selectedJenis && (
                  <div className="mt-3 space-y-2">
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      {selectedJenis.deskripsi && (
                        <p className="text-sm text-indigo-900 mb-2">
                          <strong>Deskripsi:</strong> {selectedJenis.deskripsi}
                        </p>
                      )}
                      <p className="text-xs text-indigo-700">
                        <strong>Format Nomor:</strong> {selectedJenis.format_nomor || 'NOMOR/KODE/BULAN/TAHUN'}
                      </p>
                      {selectedJenis.require_verification && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Surat ini memerlukan verifikasi dari admin
                        </p>
                      )}
                    </div>
                    
                    {/* Info Autofill NIK */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 <strong>Tips:</strong> Saat Anda mengisi NIK 16 digit, data pribadi (nama, tanggal lahir, alamat, dll) akan otomatis terisi. Pastikan data Anda sudah terdaftar di sistem.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Fields */}
              {selectedJenis && (() => {
                const fields = typeof selectedJenis.fields === 'string' 
                  ? JSON.parse(selectedJenis.fields) 
                  : (selectedJenis.fields || []);
                
                return (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-medium text-gray-900">Data Surat</h3>
                    {fields.length > 0 ? (
                      fields.map((field, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium">
                          Surat ini tidak memerlukan input data
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Konten surat sudah ditentukan oleh admin. Anda bisa langsung mengajukan surat ini.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Buttons */}
              {selectedJenis && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="btn btn-secondary flex-1"
                  >
                    👁️ Preview Surat
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? 'Mengirim...' : '📤 Ajukan Surat'}
                  </button>
                </div>
              )}
            </form>
          </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pilih jenis surat yang ingin diajukan</li>
              <li>• Isi semua field yang wajib diisi (bertanda *)</li>
              <li>• Klik Preview untuk melihat tampilan surat sebelum diajukan</li>
              <li>• Surat yang diajukan akan diproses oleh admin desa</li>
              {selectedJenis?.require_verification && (
                <li className="text-yellow-700">• Surat ini memerlukan verifikasi sebelum disetujui</li>
              )}
            </ul>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <PreviewSurat 
            pengajuan={previewData} 
            onClose={() => setShowPreview(false)} 
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={hideToast} 
            duration={toast.duration}
          />
        )}
      </div>
    </Layout>
  );
};

export default WargaSurat;

