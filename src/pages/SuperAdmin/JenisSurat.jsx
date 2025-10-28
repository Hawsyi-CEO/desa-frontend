import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter, FiX } from 'react-icons/fi';

const JenisSurat = () => {
  const navigate = useNavigate();
  const { toast, hideToast, success, error } = useToast();
  const { confirm, confirmState } = useConfirm();
  const [jenisSurat, setJenisSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/jenis-surat');
      if (response.data.success) {
        setJenisSurat(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
      error('Gagal memuat data jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const confirmed = await confirm({
      title: 'Hapus Jenis Surat',
      message: `Yakin ingin menghapus jenis surat "${nama}"? Data yang sudah terhapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      confirmColor: 'red'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      await api.delete(`/admin/jenis-surat/${id}`);
      success('Jenis surat berhasil dihapus');
      fetchJenisSurat();
    } catch (err) {
      console.error('Error deleting jenis surat:', err);
      error(err.response?.data?.message || 'Gagal menghapus jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item) => {
    setSelectedSurat(item);
    setShowPreview(true);
  };

  const filteredData = jenisSurat.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jenis Surat</h1>
              <p className="text-gray-600 mt-1">Kelola jenis-jenis surat yang tersedia</p>
            </div>
            <button
              onClick={() => navigate('/admin/jenis-surat/tambah')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FiPlus /> Tambah Jenis Surat
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <FiFilter className="text-gray-500" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('aktif')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'aktif'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilterStatus('nonaktif')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'nonaktif'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non-Aktif
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Tidak ada data jenis surat</p>
            <button
              onClick={() => navigate('/admin/jenis-surat/tambah')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Tambah Jenis Surat Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((item) => {
              const fields = typeof item.fields === 'string' ? JSON.parse(item.fields) : item.fields || [];
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.nama_surat}
                        </h3>
                        <span className="text-sm px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                          {item.kode_surat}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.status === 'aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                        {item.require_verification && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            Butuh Verifikasi
                          </span>
                        )}
                      </div>

                      {item.deskripsi && (
                        <p className="text-sm text-gray-600 mb-3">{item.deskripsi}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Format Nomor:</span>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.format_nomor || 'NOMOR/KODE/BULAN/TAHUN'}
                          </code>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Jumlah Fields:</span>
                          <span>{fields.length} field</span>
                        </div>
                      </div>

                      {item.kalimat_pembuka && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Kalimat Pembuka:</p>
                          <p className="text-sm text-gray-700 italic">"{item.kalimat_pembuka}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handlePreview(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Preview"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/jenis-surat/edit/${item.id}`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nama_surat)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedSurat && (
        <PreviewSurat
          jenisSurat={selectedSurat}
          onClose={() => {
            setShowPreview(false);
            setSelectedSurat(null);
          }}
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
    </Layout>
  );
};

// PreviewSurat Component - Copied from FormJenisSurat
const PreviewSurat = ({ jenisSurat, onClose }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKonfigurasi();
  }, []);

  const fetchKonfigurasi = async () => {
    try {
      const response = await api.get('/auth/konfigurasi');
      if (response.data.success) {
        setConfig(response.data.data);
      } else {
        setConfig(getDefaultConfig());
      }
    } catch (error) {
      console.error('Error fetching konfigurasi:', error);
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultConfig = () => ({
    nama_kabupaten: 'PEMERINTAH KABUPATEN BOGOR',
    nama_kecamatan: 'KECAMATAN CIAMPEA',
    nama_desa: 'DESA CIBADAK',
    alamat_kantor: 'Kp. Cibadak Balai Desa No.5 RT.005 RW.001 Desa Cibadak Kecamatan Ciampea Kabupaten Bogor',
    kota: 'Jawa Barat',
    kode_pos: '16620',
    telepon: '0251-1234567',
    email: 'desacibadak@bogor.go.id',
    logo_width: 80,
    logo_height: 80,
    border_color: '#000000',
    border_width: 3,
    font_family: 'Times New Roman',
    font_size_header: 14,
    font_size_body: 12,
    jabatan_ttd: 'Kepala Desa Cibadak',
    nama_ttd: 'LIYA MULIYA, S.Pd.I., M.Pd.',
    gunakan_stempel: false
  });

  const sampleData = {
    nama: 'Ahmad Fauzi',
    nik: '3201012312980001',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '23 Desember 1998',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Kp. Cibadak RT.005 RW.001',
    pekerjaan: 'Wiraswasta',
    agama: 'Islam',
    status_perkawinan: 'Belum Kawin',
    keperluan: 'Melamar Pekerjaan'
  };

  const renderTemplate = (template) => {
    if (!template) return '';
    
    let rendered = template;
    
    // Replace dengan format (field)
    rendered = rendered.replace(/\((\w+)\)/g, (match, fieldName) => {
      return `<strong>${sampleData[fieldName] || `(Data ${fieldName})`}</strong>`;
    });
    
    // Backward compatibility untuk format lama
    rendered = rendered.replace(/\[(\w+)\]/g, (match, fieldName) => {
      return `<strong>${sampleData[fieldName] || `(Data ${fieldName})`}</strong>`;
    });
    
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
      return `<strong>${sampleData[fieldName] || `(Data ${fieldName})`}</strong>`;
    });
    
    return rendered;
  };

  const getCurrentDate = () => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date();
    const desaName = config?.nama_desa?.replace('DESA ', '') || 'Cibadak';
    return `${desaName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const generateNomorSurat = (format) => {
    const date = new Date();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const tahun = date.getFullYear();
    const nomor = '001';
    
    return format
      .replace(/NOMOR/gi, nomor)
      .replace(/KODE/gi, jenisSurat.kode_surat || 'XXX')
      .replace(/BULAN/gi, bulan)
      .replace(/TAHUN/gi, tahun);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p>Memuat preview...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 no-print">
      <div className="relative top-10 mx-auto p-8 w-full max-w-5xl">
        <div className="bg-white rounded-lg shadow-xl print:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
            <h3 className="text-xl font-semibold text-gray-900">
              Preview: {jenisSurat.nama_surat}
            </h3>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Tutup
            </button>
          </div>

          {/* Surat Content */}
          <div className="p-4 print:p-0">
            <div 
              id="surat-preview"
              className="bg-white mx-auto"
              style={{
                fontFamily: 'Arial, sans-serif',
                width: '210mm',
                minHeight: '297mm',
                maxWidth: '210mm',
                padding: '10mm 20mm',
                boxSizing: 'border-box'
              }}
            >
              {/* Header/Kop Surat */}
              <div 
                className="pb-3 mb-3"
                style={{
                  borderBottom: '3px solid #000'
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Logo Baku */}
                  <div className="flex-shrink-0">
                    <img 
                      src="/assets/Lambang_Kabupaten_Bogor.png"
                      alt="Logo Kabupaten"
                      style={{ 
                        width: '90px',
                        height: '90px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                      }}
                    />
                  </div>
                  
                  {/* Kop Surat */}
                  <div className="flex-1 text-center" style={{ marginRight: '90px' }}>
                    <h2 
                      className="font-bold uppercase"
                      style={{ fontSize: '20px', lineHeight: '1.3', marginBottom: '3px' }}
                    >
                      {config.nama_kabupaten}
                    </h2>
                    <h3 
                      className="font-bold uppercase"
                      style={{ fontSize: '18px', lineHeight: '1.3', marginBottom: '3px' }}
                    >
                      {config.nama_kecamatan}
                    </h3>
                    <h3 
                      className="font-bold uppercase"
                      style={{ fontSize: '18px', lineHeight: '1.3', marginBottom: '5px' }}
                    >
                      {config.nama_desa}
                    </h3>
                    <p 
                      style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '2px' }}
                    >
                      {config.alamat_kantor}
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      {config.kota} {config.kode_pos}
                    </p>
                  </div>
                </div>
              </div>

              {/* Judul Surat */}
              <div className="text-center" style={{ marginBottom: '14px', marginTop: '16px' }}>
                <h4 
                  className="font-bold uppercase underline"
                  style={{ fontSize: '16px', marginBottom: '7px' }}
                >
                  {jenisSurat.nama_surat}
                </h4>
                <p 
                  className="font-semibold"
                  style={{ fontSize: '14px' }}
                >
                  Nomor : {generateNomorSurat(jenisSurat.format_nomor || 'NOMOR/KODE/BULAN/TAHUN')}
                </p>
              </div>

              {/* Isi Surat */}
              <div 
                style={{ 
                  fontSize: '14px',
                  lineHeight: '1.7'
                }}
              >
                <p className="text-justify" style={{ marginBottom: '10px' }}>
                  {jenisSurat.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}
                </p>

                {/* Data Pemohon - Only show if fields exist */}
                {jenisSurat.fields && jenisSurat.fields.length > 0 && (
                  <div style={{ marginLeft: '30px', marginBottom: '10px' }}>
                    {jenisSurat.fields.map((field, index) => (
                      <div key={index} className="flex" style={{ marginBottom: '3px' }}>
                        <div style={{ width: '160px' }}>{field.label}</div>
                        <div style={{ width: '25px', textAlign: 'center' }}>:</div>
                        <div className="flex-1 font-semibold">{sampleData[field.name] || `[${field.label}]`}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Template Konten */}
                <div 
                  className="text-justify"
                  style={{ 
                    whiteSpace: 'pre-line',
                    marginTop: '10px'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderTemplate(jenisSurat.template_konten) }}
                />
              </div>

              {/* Tanda Tangan */}
              <div style={{ marginTop: '35px' }} className="flex justify-end">
                <div className="text-center" style={{ width: '220px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '50px' }}>
                    {getCurrentDate()}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                    {config.jabatan_ttd}
                  </p>
                  
                  <p 
                    style={{ fontSize: '14px', marginTop: '70px' }}
                    className="font-semibold underline"
                  >
                    {config.nama_ttd}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        confirmColor={confirmState.confirmColor}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
    </div>
  );
};

export default JenisSurat;
