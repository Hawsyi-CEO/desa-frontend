import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

// Komponen Preview Surat dengan Konfigurasi
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

  const generateSampleData = () => {
    const sampleData = {};
    jenisSurat.fields.forEach(field => {
      switch (field.type) {
        case 'date':
          sampleData[field.name] = '15 Desember 2003';
          break;
        case 'number':
          sampleData[field.name] = '2025';
          break;
        default:
          sampleData[field.name] = field.label === 'NIK' ? '3201150304680003' : 
                                   field.label === 'Nama Lengkap' || field.label === 'Nama' ? 'Ahmad Suryadi' :
                                   field.label.includes('Tempat Lahir') ? 'Bogor' :
                                   field.label.includes('Jenis Kelamin') ? 'Laki-laki' :
                                   field.label.includes('Status') ? 'Menikah' :
                                   field.label.includes('Pekerjaan') ? 'Wiraswasta' :
                                   field.label.includes('Agama') ? 'Islam' :
                                   field.label.includes('RT') ? '001' :
                                   field.label.includes('RW') ? '001' :
                                   field.label.includes('Alamat') ? 'Jl. Raya Ciampea No. 123, Desa Cibadak' :
                                   field.label.includes('Keperluan') ? 'mengurus administrasi' :
                                   `Contoh ${field.label}`;
      }
    });
    return sampleData;
  };

  const sampleData = generateSampleData();
  
  const renderTemplate = (template) => {
    let rendered = template;
    
    // Replace semua placeholder
    Object.keys(sampleData).forEach(key => {
      // Support format (key) - BARU
      const regex1 = new RegExp(`\\(${key}\\)`, 'g');
      rendered = rendered.replace(regex1, `<strong>${sampleData[key]}</strong>`);
      
      // Support old format {{key}}
      const regex2 = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex2, `<strong>${sampleData[key]}</strong>`);
      
      // Support old format [key]
      const regex3 = new RegExp(`\\[${key}\\]`, 'g');
      rendered = rendered.replace(regex3, `<strong>${sampleData[key]}</strong>`);
    });
    
    // Replace any remaining placeholders
    rendered = rendered.replace(/\((\w+)\)/g, '<strong>(Data $1)</strong>');
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, '<strong>(Data $1)</strong>');
    rendered = rendered.replace(/\[(\w+)\]/g, '<strong>(Data $1)</strong>');
    
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
    
    // Sample nomor urut
    const nomor = '001';
    
    // Replace keywords (case insensitive)
    return format
      .replace(/NOMOR/gi, nomor)
      .replace(/KODE/gi, jenisSurat.kode_surat)
      .replace(/BULAN/gi, bulan)
      .replace(/TAHUN/gi, tahun);
  };

  const handlePrint = () => {
    window.print();
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
        {/* Tombol Aksi */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h3 className="text-lg font-bold text-gray-900">Preview Surat</h3>
          <div className="space-x-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary text-sm"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary text-sm"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Preview Surat - Format Resmi A4 dengan Konfigurasi */}
        <div 
          id="surat-preview" 
          className="bg-white p-8 border mx-auto"
          style={{
            borderColor: config.border_color,
            borderWidth: `${config.border_width}px`,
            fontFamily: config.font_family,
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '210mm',
            boxSizing: 'border-box'
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
                  <p style={{ fontSize: `${config.font_size_body - 3}px` }}>
                    Telp: {config.telepon} {config.email && `| Email: ${config.email}`}
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
              {jenisSurat.nama_surat}
            </h4>
            <p 
              className="font-semibold"
              style={{ fontSize: `${config.font_size_body}px` }}
            >
              Nomor : {generateNomorSurat(jenisSurat.format_nomor || 'NOMOR/KODE/BULAN/TAHUN')}
            </p>
          </div>

          {/* Isi Surat */}
          <div 
            className="leading-relaxed space-y-4"
            style={{ fontSize: `${config.font_size_body}px` }}
          >
            <p className="text-justify">
              {jenisSurat.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}
            </p>

            {/* Data Pemohon - Only show if fields exist */}
            {jenisSurat.fields && jenisSurat.fields.length > 0 && (
              <div className="ml-8 space-y-1">
                {jenisSurat.fields.map((field, index) => (
                  <div key={index} className="flex">
                    <div className="w-40">{field.label}</div>
                    <div className="w-8 text-center">:</div>
                    <div className="flex-1 font-semibold">{sampleData[field.name] || `[${field.label}]`}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Template Konten */}
            <div 
              className="text-justify whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: renderTemplate(jenisSurat.template_konten) }}
            />
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 flex justify-end">
            <div className="text-center w-64">
              <p style={{ fontSize: `${config.font_size_body}px` }} className="mb-12">
                {getCurrentDate()}
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
              className="mt-8 pt-4 text-center"
              style={{ 
                fontSize: `${config.font_size_body - 2}px`,
                borderTop: `1px solid ${config.border_color}`
              }}
            >
              {config.footer_text}
            </div>
          )}
        </div>
      </div>

      {/* Print Styles - A4 Size */}
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
            width: 210mm;
            height: 297mm;
            padding: 20mm;
            margin: 0;
            box-sizing: border-box;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        
        /* Screen view - A4 size */
        #surat-preview {
          page-break-after: always;
        }
      `}</style>
    </div>
  );
};

const JenisSurat = () => {
  const [jenisSurat, setJenisSurat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showTemplateHelper, setShowTemplateHelper] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const templateRef = useState(null);
  
  const [formData, setFormData] = useState({
    nama_surat: '',
    kode_surat: '',
    deskripsi: '',
    format_nomor: 'NOMOR/KODE/BULAN/TAHUN',
    kalimat_pembuka: 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :',
    template_konten: '',
    fields: [],
    require_verification: true,
    status: 'aktif'
  });
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: true,
    options: ''
  });

  // Template presets dengan format (field) yang mudah dipahami
  const templatePresets = [
    {
      name: 'Surat Keterangan Umum',
      template: `Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama lengkap warga adalah (nama) dengan NIK (nik), lahir di (tempat_lahir) pada tanggal (tanggal_lahir), jenis kelamin (jenis_kelamin), bekerja sebagai (pekerjaan), beralamat di (alamat) RT (rt) RW (rw).

Adalah benar warga kami yang bertempat tinggal di wilayah kami.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`
    },
    {
      name: 'Surat Keterangan Usaha',
      template: `Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama lengkap (nama) dengan NIK (nik), beralamat di (alamat) RT (rt) RW (rw), adalah benar memiliki usaha dengan data sebagai berikut:

Nama Usaha: (nama_usaha)
Jenis Usaha: (jenis_usaha)
Alamat Usaha: (alamat_usaha)
Berdiri Sejak: Tahun (tahun_berdiri)

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`
    },
    {
      name: 'Surat Keterangan Domisili',
      template: `Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:

(nama) dengan NIK (nik), lahir di (tempat_lahir) pada tanggal (tanggal_lahir), beralamat di (alamat) RT (rt) RW (rw), benar adalah warga yang berdomisili di wilayah kami.

Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`
    },
    {
      name: 'Surat Keterangan Tidak Mampu',
      template: `Yang bertanda tangan di bawah ini menerangkan bahwa:

(nama) dengan NIK (nik), lahir di (tempat_lahir) pada tanggal (tanggal_lahir), bekerja sebagai (pekerjaan), beralamat di (alamat) RT (rt) RW (rw), adalah benar warga kami yang tergolong keluarga kurang mampu.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`
    }
  ];

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/jenis-surat');
      setJenisSurat(response.data.data);
    } catch (error) {
      console.error('Error fetching jenis surat:', error);
      alert('Gagal mengambil data jenis surat');
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

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addField = () => {
    if (!newField.name || !newField.label) {
      alert('Name dan Label field harus diisi');
      return;
    }

    const field = {
      name: newField.name,
      label: newField.label,
      type: newField.type,
      required: newField.required
    };

    if (newField.type === 'select' && newField.options) {
      field.options = newField.options.split(',').map(opt => opt.trim());
    }

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: true,
      options: ''
    });
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_surat || !formData.kode_surat || !formData.template_konten) {
      alert('Nama surat, kode surat, dan template konten harus diisi');
      return;
    }

    try {
      setLoading(true);
      if (editMode) {
        await api.put(`/admin/jenis-surat/${currentId}`, formData);
        alert('Jenis surat berhasil diupdate');
      } else {
        await api.post('/admin/jenis-surat', formData);
        alert('Jenis surat berhasil ditambahkan');
      }
      
      setShowModal(false);
      resetForm();
      fetchJenisSurat();
    } catch (error) {
      console.error('Error saving jenis surat:', error);
      alert(error.response?.data?.message || 'Gagal menyimpan jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentId(item.id);
    setFormData({
      nama_surat: item.nama_surat,
      kode_surat: item.kode_surat,
      deskripsi: item.deskripsi || '',
      format_nomor: item.format_nomor || 'NOMOR/KODE/BULAN/TAHUN',
      kalimat_pembuka: item.kalimat_pembuka || 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :',
      template_konten: item.template_konten,
      fields: typeof item.fields === 'string' ? JSON.parse(item.fields) : item.fields,
      require_verification: item.require_verification,
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus jenis surat ini?')) return;

    try {
      setLoading(true);
      await api.delete(`/admin/jenis-surat/${id}`);
      alert('Jenis surat berhasil dihapus');
      fetchJenisSurat();
    } catch (error) {
      console.error('Error deleting jenis surat:', error);
      alert(error.response?.data?.message || 'Gagal menghapus jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_surat: '',
      kode_surat: '',
      deskripsi: '',
      format_nomor: 'NOMOR/KODE/BULAN/TAHUN',
      kalimat_pembuka: 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :',
      template_konten: '',
      fields: [],
      require_verification: true,
      status: 'aktif'
    });
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: true,
      options: ''
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handlePreview = (item) => {
    const fields = typeof item.fields === 'string' ? JSON.parse(item.fields) : item.fields;
    setPreviewData({
      ...item,
      fields
    });
    setShowPreview(true);
  };

  const insertFieldTag = (fieldName) => {
    // Gunakan format (field) yang lebih user-friendly
    const tag = `(${fieldName})`;
    const textarea = document.getElementById('template_konten');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.template_konten;
      const newText = text.substring(0, start) + tag + text.substring(end);
      
      setFormData(prev => ({
        ...prev,
        template_konten: newText
      }));
      
      // Set cursor position after inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  };

  const useTemplatePreset = (preset) => {
    if (confirm(`Gunakan template "${preset.name}"? Template saat ini akan ditimpa.`)) {
      setFormData(prev => ({
        ...prev,
        template_konten: preset.template
      }));
    }
  };

  const getLivePreview = () => {
    let preview = formData.template_konten;
    formData.fields.forEach(field => {
      // Support format (field)
      const regex1 = new RegExp(`\\(${field.name}\\)`, 'g');
      preview = preview.replace(regex1, `<strong>${field.label}</strong>`);
      
      // Support old format {{field}}
      const regex2 = new RegExp(`{{${field.name}}}`, 'g');
      preview = preview.replace(regex2, `<strong>${field.label}</strong>`);
      
      // Support old format [field]
      const regex3 = new RegExp(`\\[${field.name}\\]`, 'g');
      preview = preview.replace(regex3, `<strong>${field.label}</strong>`);
    });
    
    // Highlight unmatched fields - show them as is
    preview = preview.replace(/\((\w+)\)/g, '<span style="background-color: #fef3c7; padding: 0 4px; border-radius: 2px;">($1)</span>');
    preview = preview.replace(/{{(\w+)}}/g, '<span style="background-color: #fef3c7; padding: 0 4px; border-radius: 2px;">{{$1}}</span>');
    preview = preview.replace(/\[(\w+)\]/g, '<span style="background-color: #fef3c7; padding: 0 4px; border-radius: 2px;">[$1]</span>');
    
    return preview;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Jenis Surat</h1>
            <button
              onClick={openAddModal}
              className="btn btn-primary"
            >
              + Tambah Jenis Surat
            </button>
          </div>

          {loading && <div className="text-center py-8">Loading...</div>}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Surat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verifikasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jenisSurat.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.nama_surat}</div>
                      <div className="text-sm text-gray-500">{item.deskripsi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.kode_surat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.require_verification ? 'Ya' : 'Tidak'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePreview(item)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Form */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editMode ? 'Edit Jenis Surat' : 'Tambah Jenis Surat'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama Surat *</label>
                      <input
                        type="text"
                        name="nama_surat"
                        value={formData.nama_surat}
                        onChange={handleInputChange}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kode Surat *</label>
                      <input
                        type="text"
                        name="kode_surat"
                        value={formData.kode_surat}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Contoh: SKD, SKU, SKTM"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Format Nomor Surat *</label>
                    <input
                      type="text"
                      name="format_nomor"
                      value={formData.format_nomor}
                      onChange={handleInputChange}
                      className="input text-sm"
                      placeholder="NOMOR/KODE/BULAN/TAHUN"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Gunakan kata: <code className="bg-gray-100 px-1">NOMOR</code> untuk nomor urut, 
                      <code className="bg-gray-100 px-1 ml-1">KODE</code> untuk kode surat, 
                      <code className="bg-gray-100 px-1 ml-1">BULAN</code> untuk bulan (2 digit), 
                      <code className="bg-gray-100 px-1 ml-1">TAHUN</code> untuk tahun
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Contoh: <code className="bg-blue-50 px-1">NOMOR/KODE/BULAN/TAHUN</code> → 001/SKD/10/2025
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Atau: <code className="bg-green-50 px-1">KODE-NOMOR/TAHUN</code> → SKD-001/2025
                    </p>
                    
                    {/* Info Auto Generate */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium">
                        🤖 Nomor surat akan di-generate otomatis saat approve
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Sistem akan menghitung nomor urut otomatis (001, 002, 003...) sesuai format di atas
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kalimat Pembuka *</label>
                    <textarea
                      name="kalimat_pembuka"
                      value={formData.kalimat_pembuka}
                      onChange={handleInputChange}
                      className="input text-sm"
                      rows="3"
                      placeholder="Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Kalimat pembuka akan muncul sebelum isi surat. Anda bisa custom sesuai kebutuhan masing-masing jenis surat.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Contoh lain: "Yang bertanda tangan di bawah ini Lurah Cibadak, Kecamatan Ciampea, dengan ini menerangkan bahwa :"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      className="input"
                      rows="2"
                    />
                  </div>

                  {/* Template Builder Section */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Template Konten * 
                        <span className="text-xs text-gray-500 font-normal ml-2">
                          (Bisa tulis langsung atau klik tombol field untuk data dinamis)
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTemplateHelper(!showTemplateHelper)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        {showTemplateHelper ? '▼ Sembunyikan Helper' : '▶ Tampilkan Helper'}
                      </button>
                    </div>

                    {/* Template Helper */}
                    {showTemplateHelper && (
                      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                        {/* Info */}
                        <div className="bg-white border border-blue-300 rounded p-2">
                          <p className="text-xs text-blue-900">
                            <strong>💡 Tips:</strong> Anda bisa menulis template dengan 2 cara:
                          </p>
                          <ul className="text-xs text-blue-800 mt-1 ml-4 list-disc space-y-1">
                            <li><strong>Langsung tulis</strong> - Konten statis yang sama untuk semua surat</li>
                            <li><strong>Pakai field</strong> - Data dinamis yang berbeda per pemohon (gunakan tombol field di bawah)</li>
                          </ul>
                        </div>

                        {/* Template Presets */}
                        <div>
                          <h5 className="text-xs font-semibold text-blue-900 mb-2">Template Siap Pakai:</h5>
                          <div className="flex flex-wrap gap-2">
                            {templatePresets.map((preset, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => useTemplatePreset(preset)}
                                className="text-xs bg-white hover:bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-300"
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Available Fields */}
                        {formData.fields.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-blue-900 mb-2">
                              🏷️ Klik untuk Tambahkan ke Template:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {formData.fields.map((field, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => insertFieldTag(field.name)}
                                  className="text-xs bg-white hover:bg-green-100 text-green-700 px-2 py-1 rounded border border-green-300 font-mono"
                                  title={`Insert {{${field.name}}}`}
                                >
                                  {'{{'}{field.name}{'}}'}  - {field.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Guide */}
                        <div>
                          <h5 className="text-xs font-semibold text-blue-900 mb-1">💡 Tips:</h5>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Tambahkan field terlebih dahulu di bagian bawah</li>
                            <li>• Klik tombol field untuk memasukkan tag ke template</li>
                            <li>• Tag akan diganti dengan data saat surat dibuat</li>
                            <li>• Gunakan template siap pakai sebagai contoh</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Template Textarea - Enhanced */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Editor Template:</p>
                        <textarea
                          id="template_konten"
                          name="template_konten"
                          value={formData.template_konten}
                          onChange={handleInputChange}
                          className="input font-mono text-xs"
                          rows="12"
                          placeholder="Contoh:&#10;Yang bertanda tangan di bawah ini menerangkan bahwa:&#10;&#10;Nama lengkap (nama) dengan NIK (nik), beralamat di (alamat) RT (rt) RW (rw).&#10;&#10;Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya."
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tips: Gunakan (nama_field) untuk menampilkan data. Contoh: (nama), (nik), (alamat)
                        </p>
                      </div>
                      
                      {/* Live Preview */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
                        <div 
                          className="bg-gray-50 border border-gray-300 rounded p-3 text-xs font-mono h-full overflow-y-auto whitespace-pre-wrap"
                          style={{ minHeight: '12rem', maxHeight: '18rem' }}
                          dangerouslySetInnerHTML={{ __html: getLivePreview() }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tag yang valid akan ditampilkan dengan <strong>tebal</strong>, yang tidak valid akan berwarna kuning
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="require_verification"
                        checked={formData.require_verification}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Perlu Verifikasi RT/RW
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Fields Builder */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Fields Form</h4>
                      <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                        Opsional - Bisa langsung tulis di template
                      </span>
                    </div>
                    
                    {/* Info Helper */}
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900 font-medium">
                        💡 Fields bersifat opsional
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Anda bisa membuat surat tanpa field sama sekali dengan langsung menulis konten di Editor Template di bawah. 
                        Fields hanya digunakan jika Anda ingin data dinamis yang diisi oleh pemohon.
                      </p>
                    </div>
                    
                    {/* Field List */}
                    {formData.fields.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {formData.fields.map((field, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="text-sm">
                              <span className="font-medium">{field.label}</span>
                              <span className="text-gray-500"> ({field.name}) - {field.type}</span>
                              {field.required && <span className="text-red-500"> *</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Field Form */}
                    <div className="grid grid-cols-5 gap-2 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={newField.name}
                          onChange={handleFieldChange}
                          className="input text-sm"
                          placeholder="nama"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Label</label>
                        <input
                          type="text"
                          name="label"
                          value={newField.label}
                          onChange={handleFieldChange}
                          className="input text-sm"
                          placeholder="Nama Lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Type</label>
                        <select
                          name="type"
                          value={newField.type}
                          onChange={handleFieldChange}
                          className="input text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                        </select>
                      </div>
                      <div>
                        {newField.type === 'select' && (
                          <>
                            <label className="block text-xs font-medium text-gray-700">Options</label>
                            <input
                              type="text"
                              name="options"
                              value={newField.options}
                              onChange={handleFieldChange}
                              className="input text-sm"
                              placeholder="opt1,opt2,opt3"
                            />
                          </>
                        )}
                        {newField.type !== 'select' && (
                          <div className="flex items-center h-10">
                            <input
                              type="checkbox"
                              name="required"
                              checked={newField.required}
                              onChange={handleFieldChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-xs text-gray-700">Required</label>
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={addField}
                          className="btn btn-secondary w-full text-sm"
                        >
                          + Field
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn btn-secondary"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Preview */}
        {showPreview && previewData && (
          <PreviewSurat 
            jenisSurat={previewData} 
            onClose={() => setShowPreview(false)} 
          />
        )}
      </div>
    </>
  );
};

export default JenisSurat;

