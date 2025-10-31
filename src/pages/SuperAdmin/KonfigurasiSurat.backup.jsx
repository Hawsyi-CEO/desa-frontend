import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const KonfigurasiSurat = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    // Header/Kop Surat
    nama_kabupaten: 'PEMERINTAH KABUPATEN BOGOR',
    nama_kecamatan: 'KECAMATAN CIAMPEA',
    nama_desa: 'DESA CIBADAK',
    alamat_kantor: 'Kp. Cibadak Balai Desa No.5 RT.005 RW.001 Desa Cibadak Kecamatan Ciampea Kabupaten Bogor',
    kota: 'Jawa Barat',
    kode_pos: '16620',
    telepon: '0251-1234567',
    email: 'desacibadak@bogor.go.id',
    website: 'www.desacibadak.id',
    
    // Logo
    logo_url: null,
    logo_width: 80,
    logo_height: 80,
    
    // Format Nomor Surat
    format_nomor: '{{nomor}}/{{kode}}/{{bulan}}/{{tahun}}',
    nomor_urut_awal: 1,
    reset_nomor_tiap_tahun: true,
    
    // Pejabat
    jabatan_ttd: 'Kepala Desa Cibadak',
    nama_ttd: 'LIYA MULIYA, S.Pd.I., M.Pd.',
    nip_ttd: '',
    jabatan_verifikator: 'Ketua RT/RW',
    
    // Stempel
    gunakan_stempel: true,
    stempel_url: null,
    
    // Footer
    footer_text: '',
    
    // Style
    border_color: '#000000',
    border_width: 3,
    font_family: 'Times New Roman',
    font_size_header: 14,
    font_size_body: 12,
    
    keterangan: ''
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
      // Jika belum ada konfigurasi, gunakan default
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('logo', file);

    try {
      setLoading(true);
      const response = await api.post('/admin/konfigurasi/upload-logo', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: response.data.data.url
        }));
        alert('File berhasil diupload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Gagal upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put('/admin/konfigurasi', formData);
      
      if (response.data.success) {
        alert('Konfigurasi berhasil disimpan!');
      }
    } catch (error) {
      console.error('Error saving konfigurasi:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan konfigurasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Konfigurasi Surat</h1>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn btn-secondary"
            >
              👁️ Preview Surat
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kop Surat */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏛️ Kop Surat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kabupaten
                  </label>
                  <input
                    type="text"
                    name="nama_kabupaten"
                    value={formData.nama_kabupaten}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="PEMERINTAH KABUPATEN BOGOR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kecamatan
                  </label>
                  <input
                    type="text"
                    name="nama_kecamatan"
                    value={formData.nama_kecamatan}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="KECAMATAN CIAMPEA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Desa
                  </label>
                  <input
                    type="text"
                    name="nama_desa"
                    value={formData.nama_desa}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="DESA CIBADAK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota/Provinsi
                  </label>
                  <input
                    type="text"
                    name="kota"
                    value={formData.kota}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Jawa Barat"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Kantor Desa
                  </label>
                  <textarea
                    name="alamat_kantor"
                    value={formData.alamat_kantor}
                    onChange={handleInputChange}
                    className="input"
                    rows="2"
                    placeholder="Alamat lengkap kantor desa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="text"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Logo & Stempel */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🖼️ Logo & Stempel</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Desa
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'logo_url')}
                    className="input"
                    accept="image/*"
                  />
                  {formData.logo_url && (
                    <img 
                      src={`http://localhost:5000${formData.logo_url}`} 
                      alt="Logo" 
                      className="mt-2 h-20 w-20 object-contain border rounded"
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-xs text-gray-600">Lebar (px)</label>
                      <input
                        type="number"
                        name="logo_width"
                        value={formData.logo_width}
                        onChange={handleInputChange}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Tinggi (px)</label>
                      <input
                        type="number"
                        name="logo_height"
                        value={formData.logo_height}
                        onChange={handleInputChange}
                        className="input text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="gunakan_stempel"
                      checked={formData.gunakan_stempel}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Gunakan Stempel
                    </span>
                  </label>
                  
                  {formData.gunakan_stempel && (
                    <>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'stempel_url')}
                        className="input"
                        accept="image/*"
                      />
                      {formData.stempel_url && (
                        <img 
                          src={`http://localhost:5000${formData.stempel_url}`} 
                          alt="Stempel" 
                          className="mt-2 h-20 w-20 object-contain border rounded"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Penandatangan */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">✍️ Pejabat Penandatangan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    name="jabatan_ttd"
                    value={formData.jabatan_ttd}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Kepala Desa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama_ttd"
                    value={formData.nama_ttd}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Nama dan Gelar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP (opsional)
                  </label>
                  <input
                    type="text"
                    name="nip_ttd"
                    value={formData.nip_ttd || ''}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan Verifikator
                  </label>
                  <input
                    type="text"
                    name="jabatan_verifikator"
                    value={formData.jabatan_verifikator}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Ketua RT/RW"
                  />
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Gaya Surat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warna Border
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="border_color"
                      value={formData.border_color}
                      onChange={handleInputChange}
                      className="h-10 w-16"
                    />
                    <input
                      type="text"
                      name="border_color"
                      value={formData.border_color}
                      onChange={handleInputChange}
                      className="input flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ketebalan Border (px)
                  </label>
                  <input
                    type="number"
                    name="border_width"
                    value={formData.border_width}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    name="font_family"
                    value={formData.font_family}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ukuran Font Header
                  </label>
                  <input
                    type="number"
                    name="font_size_header"
                    value={formData.font_size_header}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ukuran Font Isi
                  </label>
                  <input
                    type="number"
                    name="font_size_body"
                    value={formData.font_size_body}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Footer & Keterangan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teks Footer (opsional)
                  </label>
                  <textarea
                    name="footer_text"
                    value={formData.footer_text || ''}
                    onChange={handleInputChange}
                    className="input"
                    rows="2"
                    placeholder="Teks yang muncul di bagian bawah surat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan (opsional)
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan || ''}
                    onChange={handleInputChange}
                    className="input"
                    rows="2"
                    placeholder="Catatan internal"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="btn btn-secondary"
              >
                👁️ Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>
          </form>

          {/* Preview Modal */}
          {showPreview && (
            <PreviewKonfigurasi 
              config={formData} 
              onClose={() => setShowPreview(false)} 
            />
          )}
        </div>
      </div>
    </>
  );
};

// Komponen Preview
const PreviewKonfigurasi = ({ config, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        {/* Tombol Aksi */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h3 className="text-lg font-bold text-gray-900">Preview Konfigurasi Surat</h3>
          <div className="space-x-2">
            <button onClick={handlePrint} className="btn btn-primary text-sm">
              🖨️ Print
            </button>
            <button onClick={onClose} className="btn btn-secondary text-sm">
              Tutup
            </button>
          </div>
        </div>

        {/* Preview Surat */}
        <div 
          id="surat-preview" 
          className="bg-white p-8 border"
          style={{ 
            borderColor: config.border_color,
            borderWidth: `${config.border_width}px`,
            fontFamily: config.font_family
          }}
        >
          {/* Header/Kop Surat */}
          <div 
            className="pb-4 mb-6"
            style={{ 
              borderBottom: `${config.border_width}px solid ${config.border_color}`
            }}
          >
            <div className="flex items-start gap-4">
              {/* Logo */}
              {config.logo_url ? (
                <div className="flex-shrink-0">
                  <img 
                    src={`http://localhost:5000${config.logo_url}`}
                    alt="Logo"
                    style={{ 
                      width: `${config.logo_width}px`,
                      height: `${config.logo_height}px`
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div 
                    className="border-2 border-gray-800 rounded-full flex items-center justify-center bg-yellow-400"
                    style={{ 
                      width: `${config.logo_width}px`,
                      height: `${config.logo_height}px`
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-bold">LOGO</div>
                      <div className="text-xs">DESA</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Kop Surat */}
              <div className="flex-1 text-center">
                <h2 
                  className="font-bold uppercase"
                  style={{ fontSize: `${config.font_size_header}px` }}
                >
                  {config.nama_kabupaten}
                </h2>
                <h3 
                  className="font-bold uppercase"
                  style={{ fontSize: `${config.font_size_header - 2}px` }}
                >
                  {config.nama_kecamatan}
                </h3>
                <h3 
                  className="font-bold uppercase"
                  style={{ fontSize: `${config.font_size_header - 2}px` }}
                >
                  {config.nama_desa}
                </h3>
                <p 
                  className="mt-1"
                  style={{ fontSize: `${config.font_size_body - 2}px` }}
                >
                  {config.alamat_kantor}
                </p>
                <p style={{ fontSize: `${config.font_size_body - 2}px` }}>
                  {config.kota} {config.kode_pos}
                </p>
                {config.telepon && (
                  <p style={{ fontSize: `${config.font_size_body - 2}px` }}>
                    Telp: {config.telepon} | Email: {config.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center mb-6">
            <h4 
              className="font-bold uppercase underline"
              style={{ fontSize: `${config.font_size_header}px` }}
            >
              SURAT KETERANGAN DOMISILI
            </h4>
            <p 
              className="font-semibold"
              style={{ fontSize: `${config.font_size_body}px` }}
            >
              Nomor : 100.005/SKD/10/2025
            </p>
          </div>

          {/* Isi Surat (Contoh) */}
          <div 
            className="leading-relaxed space-y-4"
            style={{ fontSize: `${config.font_size_body}px` }}
          >
            <p className="text-justify">
              Yang bertanda tangan di bawah ini, {config.jabatan_ttd}, 
              dengan ini menerangkan bahwa :
            </p>

            <div className="ml-8 space-y-1">
              <div className="flex">
                <div className="w-40">Nama Lengkap</div>
                <div className="w-8 text-center">:</div>
                <div className="flex-1 font-semibold">Contoh Nama</div>
              </div>
              <div className="flex">
                <div className="w-40">NIK</div>
                <div className="w-8 text-center">:</div>
                <div className="flex-1 font-semibold">3201150304680003</div>
              </div>
              <div className="flex">
                <div className="w-40">Tempat/Tgl Lahir</div>
                <div className="w-8 text-center">:</div>
                <div className="flex-1 font-semibold">Bogor, 15 Desember 1990</div>
              </div>
              <div className="flex">
                <div className="w-40">Alamat</div>
                <div className="w-8 text-center">:</div>
                <div className="flex-1 font-semibold">{config.nama_desa}, {config.nama_kecamatan}</div>
              </div>
            </div>

            <p className="text-justify">
              Benar adalah warga yang berdomisili di wilayah kami. 
              Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 flex justify-end">
            <div className="text-center" style={{ width: '250px' }}>
              <p style={{ fontSize: `${config.font_size_body}px` }} className="mb-12">
                Cibadak, 28 Oktober 2025
              </p>
              <p style={{ fontSize: `${config.font_size_body}px` }}>
                {config.jabatan_ttd}
              </p>
              
              {/* Stempel */}
              {config.gunakan_stempel && config.stempel_url && (
                <div className="my-8">
                  <img 
                    src={`http://localhost:5000${config.stempel_url}`}
                    alt="Stempel"
                    className="mx-auto"
                    style={{ height: '80px', opacity: 0.7 }}
                  />
                </div>
              )}
              
              <p 
                style={{ fontSize: `${config.font_size_body}px` }} 
                className="font-bold mt-12"
              >
                {config.nama_ttd}
              </p>
              {config.nip_ttd && (
                <p style={{ fontSize: `${config.font_size_body - 2}px` }}>
                  NIP. {config.nip_ttd}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          {config.footer_text && (
            <div 
              className="mt-8 pt-4 text-center border-t"
              style={{ 
                fontSize: `${config.font_size_body - 2}px`,
                borderColor: config.border_color
              }}
            >
              {config.footer_text}
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #surat-preview, #surat-preview * {
            visibility: visible;
          }
          #surat-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2cm;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KonfigurasiSurat;

