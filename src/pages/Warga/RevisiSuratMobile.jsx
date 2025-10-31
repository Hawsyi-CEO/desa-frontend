import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiFileText, 
  FiArrowLeft,
  FiSend,
  FiEye,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import WargaLayout from '../../components/WargaLayout';
import PreviewSurat from '../../components/PreviewSurat';
import SuccessModal from '../../components/SuccessModal';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RevisiSuratMobile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, hideToast, success, error, warning } = useToast();
  
  const [surat, setSurat] = useState(null);
  const [jenisSurat, setJenisSurat] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingNik, setLoadingNik] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchSuratData();
  }, [id]);

  const fetchSuratData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/warga/surat/${id}`);
      
      if (response.data.success) {
        const suratData = response.data.data;
        setSurat(suratData);
        
        // Check if surat is in revision status
        if (suratData.status_surat !== 'revisi_rt' && suratData.status_surat !== 'revisi_rw') {
          warning(`Surat tidak dalam status revisi. Status: ${suratData.status_surat}`);
          setTimeout(() => navigate('/warga/history'), 3000);
          return;
        }
        
        // Parse data_surat JSON
        const parsedData = typeof suratData.data_surat === 'string' 
          ? JSON.parse(suratData.data_surat) 
          : suratData.data_surat;
        
        setFormData(parsedData || {});
        
        // Fetch jenis surat info
        const jenisResponse = await api.get('/warga/jenis-surat');
        if (jenisResponse.data.success) {
          const jenis = jenisResponse.data.data.find(j => j.id === suratData.jenis_surat_id);
          setJenisSurat(jenis);
        }
      }
    } catch (err) {
      console.error('Error fetching surat data:', err);
      error('Gagal memuat data surat');
      setTimeout(() => navigate('/warga/history'), 2000);
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

        const templateFields = jenisSurat?.fields || [];
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
          'kewarganegaraan': 'kewarganegaraan',
          'alamat': 'alamat',
          'rt': 'rt',
          'rw': 'rw',
          'kelurahan': 'kelurahan',
          'kecamatan': 'kecamatan',
          'kabupaten': 'kabupaten_kota',
          'provinsi': 'provinsi'
        };

        templateFields.forEach(field => {
          const normalizedFieldName = field.name.toLowerCase().replace(/\s+/g, '_');
          const mappingKey = Object.keys(fieldMappings).find(key => 
            normalizedFieldName.includes(key) || key.includes(normalizedFieldName)
          );

          if (mappingKey && wargaData[fieldMappings[mappingKey]]) {
            let value = wargaData[fieldMappings[mappingKey]];
            
            if (mappingKey === 'tanggal_lahir') {
              value = formattedTanggalLahir;
            }
            
            newFormData[field.name] = value;
          }
        });

        setFormData(newFormData);
        success('Data berhasil diisi otomatis dari NIK');
      }
    } catch (err) {
      console.error('Error fetching warga data:', err);
      warning('NIK tidak ditemukan dalam database');
    } finally {
      setLoadingNik(false);
    }
  };

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Auto-fill if NIK field
    if (fieldName.toLowerCase().includes('nik') && value.length === 16) {
      fetchWargaByNik(value);
    }
  };

  const handlePreview = () => {
    const requiredFields = jenisSurat?.fields?.filter(f => f.required) || [];
    const emptyFields = requiredFields.filter(f => !formData[f.name]);

    if (emptyFields.length > 0) {
      warning(`Mohon lengkapi field: ${emptyFields.map(f => f.label).join(', ')}`);
      return;
    }

    setPreviewData({
      jenis_surat_id: surat.jenis_surat_id,
      data_surat: formData,
      template_konten: jenisSurat?.template_konten || '',
      kalimat_pembuka: jenisSurat?.kalimat_pembuka || '',
      nama_surat: jenisSurat?.nama_surat || ''
    });
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      // Check if surat is still in revision status
      if (surat.status_surat !== 'revisi_rt' && surat.status_surat !== 'revisi_rw') {
        error(`Surat tidak dalam status revisi. Status saat ini: ${surat.status_surat}`);
        setTimeout(() => navigate('/warga/history'), 2000);
        return;
      }

      setSubmitting(true);

      const payload = {
        data_surat: formData,
        keperluan: formData.keperluan || surat.keperluan || ''
      };

      const response = await api.put(`/warga/surat/${id}`, payload);

      if (response.data.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Error submitting revision:', err);
      const errorMessage = err.response?.data?.message || 'Gagal mengajukan revisi surat';
      error(errorMessage);
      
      // If status has changed, redirect to history after showing error
      if (err.response?.status === 400 || err.response?.status === 404) {
        setTimeout(() => navigate('/warga/history'), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const isNikField = field.name?.toLowerCase().includes('nik');
    
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
        ) : field.type === 'date' ? (
          <input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(e, field.name)}
            required={field.required}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
          />
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

  if (loading) {
    return (
      <WargaLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data surat...</p>
          </div>
        </div>
      </WargaLayout>
    );
  }

  if (!surat || !jenisSurat) {
    return (
      <WargaLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center">
            <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">Surat yang Anda cari tidak ditemukan</p>
            <button
              onClick={() => navigate('/warga/history')}
              className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              Kembali ke Riwayat
            </button>
          </div>
        </div>
      </WargaLayout>
    );
  }

  return (
    <WargaLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/warga/history')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Revisi Surat</h1>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <div className="flex items-start gap-3">
              <FiRefreshCw className="text-white mt-1 flex-shrink-0" size={20} />
              <div>
                <h2 className="font-bold text-white mb-1">{jenisSurat.nama_surat}</h2>
                <p className="text-sm text-orange-50 mb-2">Silakan revisi data sesuai catatan verifikator</p>
                {surat.keterangan && (
                  <div className="bg-white/30 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-white mb-1">Catatan Revisi:</p>
                    <p className="text-sm text-white">{surat.keterangan}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="space-y-5">
              {jenisSurat.fields?.map(field => renderField(field))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handlePreview}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiEye size={20} />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <FiSend size={20} />
                    <span>Kirim Revisi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <FiAlertCircle className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-sm mb-1">Petunjuk Revisi</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pastikan Anda telah memperbaiki data sesuai catatan revisi dari verifikator. 
                  Surat akan dikirim ulang untuk proses verifikasi setelah Anda mengirim revisi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewSurat
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          previewData={previewData}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Revisi Berhasil Dikirim!"
        message="Surat Anda telah berhasil direvisi dan diajukan kembali untuk verifikasi"
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

export default RevisiSuratMobile;

