import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiChevronRight,
  FiArrowLeft,
  FiSend,
  FiEye,
  FiSearch
} from 'react-icons/fi';
import WargaLayout from '../../components/WargaLayout';
import PreviewSurat from '../../components/PreviewSurat';
import SuccessModal from '../../components/SuccessModal';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuratMobile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, hideToast, success, error, warning } = useToast();
  const [jenisSurat, setJenisSurat] = useState([]);
  const [filteredJenisSurat, setFilteredJenisSurat] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingNik, setLoadingNik] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [step, setStep] = useState(1); // 1: pilih surat, 2: isi form

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJenisSurat(jenisSurat);
    } else {
      const filtered = jenisSurat.filter(surat =>
        surat.nama_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surat.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJenisSurat(filtered);
    }
  }, [searchQuery, jenisSurat]);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warga/jenis-surat');
      if (response.data.success) {
        setJenisSurat(response.data.data);
        setFilteredJenisSurat(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
      error('Gagal memuat daftar jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const fetchWargaByNik = async (nik) => {
    if (!nik || nik.length !== 16) return;

    try {
      setLoadingNik(true);
      const response = await api.get(`/warga/data-by-nik/${nik}`);
      
      if (response.data.success) {
        const wargaData = response.data.data;
        
        let formattedTanggalLahir = '';
        if (wargaData.tanggal_lahir) {
          const date = new Date(wargaData.tanggal_lahir);
          formattedTanggalLahir = date.toISOString().split('T')[0];
        }

        const normalizeFieldName = (name) => {
          return name.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
        };

        const templateFields = selectedJenis?.fields || [];
        const newFormData = { ...formData };

        const fieldMappings = {
          'nik': 'nik',
          'nama': 'nama',
          'nama_lengkap': 'nama',
          'tempat_lahir': 'tempat_lahir',
          'tanggal_lahir': formattedTanggalLahir,
          'jenis_kelamin': 'jenis_kelamin',
          'agama': 'agama',
          'status_perkawinan': 'status_perkawinan',
          'pekerjaan': 'pekerjaan',
          'alamat': 'alamat',
          'rt': 'rt',
          'rw': 'rw',
          'kelurahan': 'kelurahan_desa',
          'kecamatan': 'kecamatan',
          'kabupaten': 'kabupaten_kota',
          'provinsi': 'provinsi',
          'kewarganegaraan': 'kewarganegaraan'
        };

        templateFields.forEach(field => {
          const normalizedFieldName = normalizeFieldName(field.name);
          const mapping = fieldMappings[normalizedFieldName];
          
          if (mapping) {
            if (mapping === formattedTanggalLahir) {
              newFormData[field.name] = formattedTanggalLahir;
            } else {
              newFormData[field.name] = wargaData[mapping] || '';
            }
          }
        });

        setFormData(newFormData);
        success('Data berhasil dimuat dari NIK');
      }
    } catch (err) {
      console.error('Error fetching warga data:', err);
      warning('Data warga tidak ditemukan. Silakan isi manual.');
    } finally {
      setLoadingNik(false);
    }
  };

  const handleSelectJenis = (jenis) => {
    setSelectedJenis(jenis);
    setFormData({});
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedJenis(null);
    setFormData({});
  };

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (fieldName.toLowerCase().includes('nik') && value.length === 16) {
      fetchWargaByNik(value);
    }
  };

  const handlePreview = () => {
    const requiredFields = selectedJenis.fields.filter(field => field.required);
    const emptyFields = requiredFields.filter(field => !formData[field.name]);

    if (emptyFields.length > 0) {
      warning('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setPreviewData({
      jenis_surat: selectedJenis,
      data_surat: formData,
      warga: user
    });
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.post('/warga/surat', {
        jenis_surat_id: selectedJenis.id,
        data_surat: formData
      });

      if (response.data.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error submitting surat:', err);
      error(err.response?.data?.message || 'Gagal mengajukan surat');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const isNikField = field.name.toLowerCase().includes('nik');
    
    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'textarea' ? (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(e, field.name)}
            placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
            required={field.required}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
          />
        ) : field.type === 'select' ? (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(e, field.name)}
            required={field.required}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <input
              type={field.type || 'text'}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(e, field.name)}
              placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}`}
              required={field.required}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            />
            {isNikField && loadingNik && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
              </div>
            )}
          </div>
        )}
        
        {field.description && (
          <p className="text-xs text-slate-500">{field.description}</p>
        )}
      </div>
    );
  };

  if (loading && jenisSurat.length === 0) {
    return (
      <WargaLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data...</p>
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <FiArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-2xl font-bold">
              {step === 1 ? 'Pilih Jenis Surat' : selectedJenis?.nama_surat}
            </h1>
          </div>
          
          {step === 1 && (
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis surat..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:bg-white/20 focus:outline-none transition-all"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 -mt-4">
          {step === 1 ? (
            // Step 1: Pilih Jenis Surat (Card Grid)
            <div className="space-y-3">
              {filteredJenisSurat.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <FiFileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">Tidak ada jenis surat yang ditemukan</p>
                </div>
              ) : (
                filteredJenisSurat.map((jenis) => (
                  <div
                    key={jenis.id}
                    onClick={() => handleSelectJenis(jenis)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md">
                          <FiFileText className="text-white" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                            {jenis.nama_surat}
                          </h3>
                          {jenis.deskripsi && (
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {jenis.deskripsi}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <FiClock size={12} />
                              {jenis.fields?.length || 0} field
                            </span>
                            {jenis.auto_generate_nomor && (
                              <span className="flex items-center gap-1 text-green-600">
                                <FiCheckCircle size={12} />
                                Auto nomor
                              </span>
                            )}
                          </div>
                        </div>
                        <FiChevronRight className="text-slate-400 flex-shrink-0" size={20} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Step 2: Form Input
            <div className="space-y-4">
              {/* Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Informasi</h3>
                    <p className="text-sm text-blue-700">
                      Masukkan NIK untuk mengisi data otomatis. Pastikan semua data sudah benar sebelum mengirim.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
                {selectedJenis?.fields
                  ?.filter(field => field.showInDocument !== false || field.type !== 'hidden')
                  .map(renderField)}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 sticky bottom-20 pb-4">
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex-1 py-4 bg-white border-2 border-slate-700 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <FiEye size={20} />
                  Preview
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <FiSend size={20} />
                      Kirim
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewSurat
          data={previewData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Surat Berhasil Diajukan!"
        message="Surat Anda telah berhasil diajukan dan akan segera diproses oleh RT/RW"
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/warga/dashboard');
        }}
        onContinue={() => {
          setShowSuccessModal(false);
          navigate('/warga/history');
        }}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </WargaLayout>
  );
};

export default SuratMobile;

