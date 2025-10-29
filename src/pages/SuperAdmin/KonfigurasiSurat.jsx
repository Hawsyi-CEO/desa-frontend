import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { Save, MapPin, Edit3, FileText, Building2, Mail, Phone, User, IdCard, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const KonfigurasiSurat = () => {
  const { toast, hideToast, success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [showKopSurat, setShowKopSurat] = useState(false);
  const [showPejabat, setShowPejabat] = useState(false);
  const [formData, setFormData] = useState({
    // Header/Kop Surat
    nama_kabupaten: '',
    nama_kecamatan: '',
    nama_desa: '',
    nama_desa_penandatangan: '', // Nama desa untuk tanggal & ttd (proper case)
    alamat_kantor: '',
    kota: '',
    kode_pos: '',
    telepon: '',
    email: '',
    
    // Pejabat Penandatangan
    jabatan_ttd: '',
    nama_ttd: '',
    nip_ttd: '',
    
    // Sekretaris Desa
    nama_sekretaris: '',
    nip_sekretaris: ''
  });

  useEffect(() => {
    fetchKonfigurasi();
  }, []);

  const fetchKonfigurasi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/konfigurasi');
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching konfigurasi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put('/admin/konfigurasi', formData);
      
      if (response.data.success) {
        success('Konfigurasi berhasil disimpan!');
        fetchKonfigurasi(); // Refresh data
      }
    } catch (err) {
      console.error('Error saving konfigurasi:', err);
      error(err.response?.data?.message || 'Gagal menyimpan konfigurasi');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.nama_desa) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-700 mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat konfigurasi...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Modern Design */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Konfigurasi Surat</h1>
              <p className="text-slate-100 mt-2">
                Kelola informasi kop surat dan pejabat penandatangan dokumen resmi
              </p>
            </div>
          </div>
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Instansi</p>
                  <p className="font-semibold text-lg">{formData.nama_desa || 'Belum diatur'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Penandatangan</p>
                  <p className="font-semibold text-lg">{formData.nama_ttd || 'Belum diatur'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm">Status</p>
                  <p className="font-semibold text-lg">
                    {formData.nama_desa && formData.nama_ttd ? 'Lengkap' : 'Belum Lengkap'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kop Surat */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 cursor-pointer hover:from-slate-800 hover:to-slate-900 transition-all"
                onClick={() => setShowKopSurat(!showKopSurat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Kop Surat</h2>
                      <p className="text-slate-100 text-sm">Informasi kepala surat resmi desa</p>
                    </div>
                  </div>
                  <div className="text-white">
                    {showKopSurat ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showKopSurat ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 space-y-6">
                  {/* Wilayah Section */}
                  <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Building2 className="w-5 h-5 text-slate-700" />
                    <h3 className="font-semibold text-slate-900">Informasi Wilayah</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Kabupaten
                    </label>
                    <input
                      type="text"
                      name="nama_kabupaten"
                      value={formData.nama_kabupaten}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="PEMERINTAH KABUPATEN ..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Kecamatan
                    </label>
                    <input
                      type="text"
                      name="nama_kecamatan"
                      value={formData.nama_kecamatan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="KECAMATAN ..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Desa
                    </label>
                    <input
                      type="text"
                      name="nama_desa"
                      value={formData.nama_desa}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="DESA ..."
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                      <span className="text-slate-400">💡</span>
                      <span>Format UPPERCASE untuk kop surat (contoh: DESA CIBADAK)</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Desa (Penandatangan)
                    </label>
                    <input
                      type="text"
                      name="nama_desa_penandatangan"
                      value={formData.nama_desa_penandatangan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="Cibadak"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                      <span className="text-slate-400">💡</span>
                      <span>Format Proper Case untuk tanggal & tanda tangan (contoh: Cibadak, Ciampea Udik)</span>
                    </p>
                  </div>
                </div>

                {/* Alamat Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <MapPin className="w-5 h-5 text-slate-700" />
                    <h3 className="font-semibold text-slate-900">Alamat & Kontak</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alamat Kantor Desa
                    </label>
                    <textarea
                      name="alamat_kantor"
                      value={formData.alamat_kantor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      rows="2"
                      placeholder="Alamat lengkap kantor desa..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kota/Provinsi
                      </label>
                      <input
                        type="text"
                        name="kota"
                        value={formData.kota}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="Kota - Provinsi"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        name="kode_pos"
                        value={formData.kode_pos}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="16620"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>Telepon</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="telepon"
                        value={formData.telepon}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="0251-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                      placeholder="desa@email.com"
                    />
                  </div>
                </div>
              </div>
              </div>
              </div>
            </div>

            {/* Pejabat Penandatangan */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 cursor-pointer hover:from-slate-800 hover:to-slate-900 transition-all"
                onClick={() => setShowPejabat(!showPejabat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Pejabat Penandatangan</h2>
                      <p className="text-slate-100 text-sm">Data pejabat yang berwenang menandatangani dokumen</p>
                    </div>
                  </div>
                  <div className="text-white">
                    {showPejabat ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </div>

              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showPejabat ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 space-y-6">
                  {/* Kepala Desa */}
                  <div className="pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Kepala Desa</h3>
                  </div>
                
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jabatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="jabatan_ttd"
                        value={formData.jabatan_ttd}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="Kepala Desa ..."
                        required
                      />
                      <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                        <span className="text-slate-400">💡</span>
                        <span>Contoh: Kepala Desa Cibadak</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nama_ttd"
                        value={formData.nama_ttd}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="Nama kepala desa..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          <span>NIP (Opsional)</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="nip_ttd"
                        value={formData.nip_ttd || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="NIP..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sekretaris Desa */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Sekretaris Desa</h3>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">ℹ️ Info:</span> Jika kepala desa berhalangan, sekretaris desa dapat menandatangani surat dengan format "a.n Kepala Desa"
                    </p>
                  </div>
                
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nama Lengkap Sekretaris Desa
                      </label>
                      <input
                        type="text"
                        name="nama_sekretaris"
                        value={formData.nama_sekretaris || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="Nama sekretaris desa..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          <span>NIP Sekretaris Desa (Opsional)</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="nip_sekretaris"
                        value={formData.nip_sekretaris || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                        placeholder="NIP sekretaris..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Simpan Konfigurasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={hideToast} 
            duration={toast.duration}
          />
        )}
    </Layout>
  );
};

export default KonfigurasiSurat;
