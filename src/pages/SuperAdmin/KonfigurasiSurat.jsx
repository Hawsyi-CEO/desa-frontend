import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import { FiSave, FiMapPin, FiEdit3 } from 'react-icons/fi';

const KonfigurasiSurat = () => {
  const { toast, hideToast, success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Header/Kop Surat
    nama_kabupaten: '',
    nama_kecamatan: '',
    nama_desa: '',
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
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Konfigurasi Surat</h1>
          <p className="mt-2 text-gray-600">
            Kelola informasi kop surat dan pejabat penandatangan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kop Surat */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiMapPin className="w-6 h-6 text-indigo-600" />
                Kop Surat
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kabupaten
                  </label>
                  <input
                    type="text"
                    name="nama_kabupaten"
                    value={formData.nama_kabupaten}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="PEMERINTAH KABUPATEN ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kecamatan
                  </label>
                  <input
                    type="text"
                    name="nama_kecamatan"
                    value={formData.nama_kecamatan}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="KECAMATAN ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Desa
                  </label>
                  <input
                    type="text"
                    name="nama_desa"
                    value={formData.nama_desa}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="DESA ..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Kantor Desa
                  </label>
                  <textarea
                    name="alamat_kantor"
                    value={formData.alamat_kantor}
                    onChange={handleInputChange}
                    className="input"
                    rows="2"
                    placeholder="Alamat lengkap kantor desa..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota/Provinsi
                    </label>
                    <input
                      type="text"
                      name="kota"
                      value={formData.kota}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Kota - Provinsi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      name="kode_pos"
                      value={formData.kode_pos}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="16620"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon
                    </label>
                    <input
                      type="text"
                      name="telepon"
                      value={formData.telepon}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="0251-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="desa@email.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pejabat Penandatangan */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiEdit3 className="w-6 h-6 text-indigo-600" />
                Pejabat Penandatangan
              </h2>

              {/* Kepala Desa */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Kepala Desa</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jabatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jabatan_ttd"
                      value={formData.jabatan_ttd}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Kepala Desa ..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Contoh: Kepala Desa Cibadak
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama_ttd"
                      value={formData.nama_ttd}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Nama kepala desa..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP (Opsional)
                    </label>
                    <input
                      type="text"
                      name="nip_ttd"
                      value={formData.nip_ttd || ''}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="NIP..."
                    />
                  </div>
                </div>
              </div>

              {/* Sekretaris Desa */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sekretaris Desa</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Jika kepala desa berhalangan, sekretaris desa dapat menandatangani surat dengan format "a.n Kepala Desa"
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap Sekretaris Desa
                    </label>
                    <input
                      type="text"
                      name="nama_sekretaris"
                      value={formData.nama_sekretaris || ''}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Nama sekretaris desa..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP Sekretaris Desa (Opsional)
                    </label>
                    <input
                      type="text"
                      name="nip_sekretaris"
                      value={formData.nip_sekretaris || ''}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="NIP sekretaris..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Simpan Konfigurasi
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
