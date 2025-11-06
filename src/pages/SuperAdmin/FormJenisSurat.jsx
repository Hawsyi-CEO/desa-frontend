import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import RichTextEditor from '../../components/RichTextEditor';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import api from '../../services/api';
import { FiChevronDown, FiChevronUp, FiSave, FiX, FiPlus, FiTrash2, FiInfo, FiCpu, FiTag, FiFileText, FiEdit2, FiMove } from 'react-icons/fi';

const FormJenisSurat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const templateRef = useRef(null);
  const { toast, hideToast, success, error, warning } = useToast();
  const { confirm, confirmState } = useConfirm();

  const [loading, setLoading] = useState(false);
  const [paperSize, setPaperSize] = useState('a4'); // 'a4' or 'legal'
  const [showTips, setShowTips] = useState({
    formatNomor: false,
    kalimatPembuka: false,
    fields: false,
    template: false
  });
  
  const [formData, setFormData] = useState({
    nama_surat: '',
    kode_surat: '',
    deskripsi: '',
    format_nomor: 'NOMOR/KODE/BULAN/TAHUN',
    kalimat_pembuka: '',
    template_konten: '',
    fields: [],
    require_verification: true,
    status: 'aktif',
    penandatangan: [{
      jabatan: 'kepala_desa',
      label: 'Kepala Desa Cibadak',
      posisi: 'kanan_bawah',
      required: true
    }],
    layout_ttd: '1_kanan',
    show_materai: false,
    paper_size: 'a4'
  });

  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: true,
    options: '',
    showInDocument: true // Default: tampil di surat
  });

  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [rtOptions, setRtOptions] = useState([]);
  const [rwOptions, setRwOptions] = useState([]);

  // Template presets
  const templatePresets = [
    {
      name: 'Surat Keterangan',
      template: 'Adalah benar bahwa orang tersebut di atas adalah warga Desa Cibadak yang berdomisili di alamat yang tertera.\n\nSurat keterangan ini dibuat untuk keperluan (keperluan).\n\nDemikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.'
    },
    {
      name: 'Surat Pengantar',
      template: 'Dengan ini kami memberikan pengantar kepada yang bersangkutan untuk keperluan (keperluan).\n\nDemikian surat pengantar ini kami buat untuk dapat dipergunakan sebagaimana mestinya.'
    },
    {
      name: 'Surat Keterangan Usaha',
      template: 'Adalah benar yang bersangkutan menjalankan usaha (jenis_usaha) yang berlokasi di (alamat_usaha).\n\nUsaha tersebut telah berjalan sejak tahun (tahun_mulai) dan merupakan usaha yang sah.\n\nDemikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.'
    },
    {
      name: 'Surat Keterangan Tidak Mampu',
      template: 'Adalah benar yang bersangkutan termasuk dalam kategori keluarga kurang mampu berdasarkan data yang kami miliki.\n\nSurat keterangan ini dibuat untuk keperluan (keperluan).\n\nDemikian surat keterangan ini dibuat dengan sebenarnya.'
    }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchJenisSurat();
    }
    fetchRTRWOptions();
  }, [id]);

  // Debug: Log formData.fields changes
  useEffect(() => {
    console.log('🔄 FormData.fields changed:', formData.fields);
    console.log('📊 Fields count:', formData.fields.length);
  }, [formData.fields]);

  const fetchRTRWOptions = async () => {
    try {
      const response = await api.get('/admin/rt-rw-options');
      if (response.data.success) {
        setRtOptions(response.data.rt || []);
        setRwOptions(response.data.rw || []);
      }
    } catch (error) {
      console.error('Error fetching RT/RW options:', error);
    }
  };

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/jenis-surat/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        
        console.log('📥 Loaded jenis surat data:', data);
        console.log('🔍 require_verification value:', data.require_verification);
        
        // Parse penandatangan dari JSON jika string
        let penandatanganData = [{
          jabatan: 'kepala_desa',
          label: 'Kepala Desa Cibadak',
          posisi: 'kanan_bawah',
          required: true
        }];
        
        if (data.penandatangan) {
          try {
            penandatanganData = typeof data.penandatangan === 'string' 
              ? JSON.parse(data.penandatangan) 
              : data.penandatangan;
          } catch (e) {
            console.error('Error parsing penandatangan:', e);
          }
        }
        
        setFormData({
          nama_surat: data.nama_surat,
          kode_surat: data.kode_surat,
          deskripsi: data.deskripsi || '',
          format_nomor: data.format_nomor || 'NOMOR/KODE/BULAN/TAHUN',
          kalimat_pembuka: data.kalimat_pembuka || 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :',
          template_konten: data.template_konten,
          fields: typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields,
          require_verification: data.require_verification,
          status: data.status,
          penandatangan: penandatanganData,
          layout_ttd: data.layout_ttd || '1_kanan',
          show_materai: data.show_materai || false,
          paper_size: data.paper_size || 'a4'
        });
        
        // Sync paperSize state with loaded data
        setPaperSize(data.paper_size || 'a4');
        
        console.log('✅ FormData set with require_verification:', data.require_verification);
      }
    } catch (err) {
      console.error('❌ Error fetching jenis surat:', err);
      error('Gagal memuat data jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    console.log(`📝 Input changed: ${name} = ${newValue} (type: ${type})`);
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
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
      warning('Nama field dan label harus diisi');
      return;
    }

    // Auto-generate name from label if not filled
    const fieldName = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');

    if (editingFieldIndex !== null) {
      // Update existing field
      console.log('✏️ Updating field at index:', editingFieldIndex);
      setFormData(prev => ({
        ...prev,
        fields: prev.fields.map((field, index) => 
          index === editingFieldIndex ? { ...newField, name: fieldName } : field
        )
      }));
      setEditingFieldIndex(null);
      success('Field berhasil diupdate');
    } else {
      // Add new field
      console.log('➕ Adding new field:', { ...newField, name: fieldName });
      setFormData(prev => {
        const newFields = [...prev.fields, { ...newField, name: fieldName }];
        console.log('📋 Total fields after add:', newFields.length);
        return {
          ...prev,
          fields: newFields
        };
      });
      success('Field berhasil ditambahkan');
    }

    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: true,
      options: '',
      showInDocument: true
    });
  };

  const editField = (index) => {
    const field = formData.fields[index];
    setNewField(field);
    setEditingFieldIndex(index);
  };

  const cancelEdit = () => {
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: true,
      options: '',
      showInDocument: true
    });
    setEditingFieldIndex(null);
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const moveFieldUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newFields = [...prev.fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      return { ...prev, fields: newFields };
    });
  };

  const moveFieldDown = (index) => {
    if (index === formData.fields.length - 1) return;
    setFormData(prev => {
      const newFields = [...prev.fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      return { ...prev, fields: newFields };
    });
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setFormData(prev => {
      const newFields = [...prev.fields];
      const draggedItem = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(index, 0, draggedItem);
      return { ...prev, fields: newFields };
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const insertFieldTag = (fieldName) => {
    const textarea = templateRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.template_konten;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + `(${fieldName})` + after;

    setFormData(prev => ({
      ...prev,
      template_konten: newText
    }));

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + fieldName.length + 2, start + fieldName.length + 2);
    }, 0);
  };

  const useTemplatePreset = async (preset) => {
    const confirmed = await confirm({
      title: 'Gunakan Template Preset',
      message: `Gunakan template "${preset.name}"? Template saat ini akan diganti.`,
      confirmText: 'Ya, Gunakan',
      cancelText: 'Batal',
      confirmColor: 'blue'
    });

    if (confirmed) {
      setFormData(prev => ({
        ...prev,
        template_konten: preset.template
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_surat || !formData.kode_surat || !formData.template_konten) {
      warning('Nama surat, kode surat, dan template konten harus diisi');
      return;
    }

    console.log('📤 Submitting jenis surat data:', {
      ...formData,
      require_verification: formData.require_verification
    });

    try {
      setLoading(true);
      if (isEdit) {
        const response = await api.put(`/admin/jenis-surat/${id}`, formData);
        console.log('✅ Update response:', response.data);
        success('Jenis surat berhasil diupdate');
      } else {
        const response = await api.post('/admin/jenis-surat', formData);
        console.log('✅ Create response:', response.data);
        success('Jenis surat berhasil ditambahkan');
      }
      setTimeout(() => navigate('/admin/jenis-surat'), 1000);
    } catch (err) {
      console.error('❌ Error saving jenis surat:', err);
      error(err.response?.data?.message || 'Gagal menyimpan jenis surat');
    } finally {
      setLoading(false);
    }
  };

  const toggleTips = (section) => {
    setShowTips(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading && isEdit) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? 'Edit Jenis Surat' : 'Tambah Jenis Surat'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit ? 'Perbarui data jenis surat' : 'Buat jenis surat baru untuk sistem'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/jenis-surat')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiX /> Batal
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Dasar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_surat"
                  value={formData.nama_surat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Contoh: Surat Keterangan Domisili"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kode_surat"
                  value={formData.kode_surat}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Contoh: SKD"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="2"
                  placeholder="Deskripsi singkat tentang jenis surat ini..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checkbox Butuh Verifikasi */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
                    <input
                      type="checkbox"
                      name="require_verification"
                      checked={formData.require_verification}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 block">Butuh Verifikasi</span>
                      <span className="text-xs text-gray-500">
                        {formData.require_verification ? 'Surat perlu verifikasi RT/RW' : 'Surat tidak perlu verifikasi'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Dropdown Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-Aktif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Format Nomor Surat */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Format Nomor Surat</h2>
              <button
                type="button"
                onClick={() => toggleTips('formatNomor')}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <FiInfo className="w-4 h-4" />
                {showTips.formatNomor ? 'Sembunyikan Tips' : 'Lihat Tips'}
                {showTips.formatNomor ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {showTips.formatNomor && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
                  <FiInfo className="w-4 h-4" />
                  Panduan Format Nomor:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li><code className="bg-blue-100 px-1">NOMOR</code> → Nomor urut otomatis (001, 002, 003...)</li>
                  <li><code className="bg-blue-100 px-1">KODE</code> → Kode surat yang Anda tentukan</li>
                  <li><code className="bg-blue-100 px-1">BULAN</code> → Bulan dalam 2 digit (01-12)</li>
                  <li><code className="bg-blue-100 px-1">TAHUN</code> → Tahun 4 digit (2025)</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <p className="text-xs text-blue-700 font-medium mb-1">Contoh:</p>
                  <p className="text-xs text-blue-800">• <code className="bg-blue-100 px-1">NOMOR/KODE/BULAN/TAHUN</code> → 001/SKD/10/2025</p>
                  <p className="text-xs text-blue-800">• <code className="bg-blue-100 px-1">KODE-NOMOR/TAHUN</code> → SKD-001/2025</p>
                </div>
              </div>
            )}

            <input
              type="text"
              name="format_nomor"
              value={formData.format_nomor}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="NOMOR/KODE/BULAN/TAHUN"
              required
            />

            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900 font-medium flex items-center gap-2">
                <FiCpu className="w-4 h-4" />
                Nomor surat akan di-generate otomatis saat approve
              </p>
              <p className="text-xs text-green-700 mt-1">
                Preview: {formData.format_nomor.replace(/NOMOR/g, '001').replace(/KODE/g, formData.kode_surat || 'XXX').replace(/BULAN/g, '10').replace(/TAHUN/g, '2025')}
              </p>
            </div>
          </div>

          {/* Kalimat Pembuka */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Kalimat Pembuka</h2>
              <button
                type="button"
                onClick={() => toggleTips('kalimatPembuka')}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <FiInfo className="w-4 h-4" />
                {showTips.kalimatPembuka ? 'Sembunyikan Tips' : 'Lihat Tips'}
                {showTips.kalimatPembuka ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {showTips.kalimatPembuka && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2 flex items-center gap-2">
                  <FiInfo className="w-4 h-4" />
                  Contoh Kalimat Pembuka:
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :</li>
                  <li>• Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini memberikan pengantar kepada :</li>
                  <li>• Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, Kecamatan Ciampea, dengan ini menerangkan dengan sebenarnya bahwa :</li>
                </ul>
              </div>
            )}

            <textarea
              name="kalimat_pembuka"
              value={formData.kalimat_pembuka}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              placeholder="Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :"
              required
            />
          </div>

          {/* Konfigurasi Tanda Tangan */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Konfigurasi Tanda Tangan
                </h2>
                <p className="text-xs text-gray-500 mt-1">Atur layout dan penandatangan surat</p>
              </div>
            </div>

            {/* Layout Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Tanda Tangan
              </label>
              <select
                name="layout_ttd"
                value={formData.layout_ttd}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1_kanan">1 TTD - Kepala Desa di Kanan</option>
                <option value="2_horizontal">2 TTD - Horizontal (Kiri | Kanan)</option>
                <option value="2_vertical">2 TTD - Vertikal (Atas Kiri, Bawah Kanan)</option>
                <option value="3_horizontal">3 Kolom - Dengan Materai (Kiri | Materai | Kanan)</option>
                <option value="4_grid">4 TTD - Grid 2x2</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.layout_ttd === '1_kanan' && '📍 Hanya Kepala Desa di kanan bawah (default)'}
                {formData.layout_ttd === '2_horizontal' && '📍 2 penandatangan sejajar kiri-kanan (contoh: RW | Kepala Desa)'}
                {formData.layout_ttd === '2_vertical' && '📍 2 penandatangan bertingkat (atas kiri, bawah kanan)'}
                {formData.layout_ttd === '3_horizontal' && '📍 2 TTD + kotak materai di tengah (contoh: Camat | Materai | Kepala Desa)'}
                {formData.layout_ttd === '4_grid' && '📍 4 penandatangan dalam grid 2x2 (contoh: Camat, Kapolsek, RW, Kepala Desa)'}
              </p>
            </div>

            {/* Show Materai Checkbox */}
            {formData.layout_ttd === '3_horizontal' && (
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="show_materai"
                    checked={formData.show_materai}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tampilkan Kotak Materai</span>
                </label>
              </div>
            )}

            {/* Penandatangan List */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Daftar Penandatangan ({formData.penandatangan.length})
              </label>
              
              {formData.penandatangan.map((ttd, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Jabatan</label>
                      <select
                        value={ttd.jabatan}
                        onChange={(e) => {
                          const newPenandatangan = [...formData.penandatangan];
                          newPenandatangan[index].jabatan = e.target.value;
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="kepala_desa">Kepala Desa</option>
                        <option value="sekretaris_desa">Sekretaris Desa</option>
                        <option value="ketua_rt">Ketua RT</option>
                        <option value="ketua_rw">Ketua RW</option>
                        <option value="camat">Camat</option>
                        <option value="kapolsek">Kapolsek</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Posisi</label>
                      <select
                        value={ttd.posisi}
                        onChange={(e) => {
                          const newPenandatangan = [...formData.penandatangan];
                          newPenandatangan[index].posisi = e.target.value;
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        {formData.layout_ttd === '4_grid' ? (
                          <>
                            <option value="kiri_atas">Kiri Atas</option>
                            <option value="kanan_atas">Kanan Atas</option>
                            <option value="kiri_bawah">Kiri Bawah</option>
                            <option value="kanan_bawah">Kanan Bawah</option>
                          </>
                        ) : (
                          <>
                            <option value="kiri">Kiri</option>
                            <option value="kanan">Kanan</option>
                            <option value="kanan_bawah">Kanan Bawah</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Label/Teks yang Tampil</label>
                    <input
                      type="text"
                      value={ttd.label}
                      onChange={(e) => {
                        const newPenandatangan = [...formData.penandatangan];
                        newPenandatangan[index].label = e.target.value;
                        setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                      }}
                      placeholder="Contoh: Kepala Desa Cibadak / Mengetahui, Camat Ciampea"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>

                  {/* RT/RW Number Selector */}
                  {ttd.jabatan === 'ketua_rt' && (
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Nomor RT</label>
                      <select
                        value={ttd.rt_number || ''}
                        onChange={(e) => {
                          const newPenandatangan = [...formData.penandatangan];
                          newPenandatangan[index].rt_number = e.target.value;
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">-- Pilih RT --</option>
                        {rtOptions.map(rt => (
                          <option key={rt} value={rt}>RT {rt}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Nama akan diambil dari database users</p>
                    </div>
                  )}

                  {ttd.jabatan === 'ketua_rw' && (
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Nomor RW</label>
                      <select
                        value={ttd.rw_number || ''}
                        onChange={(e) => {
                          const newPenandatangan = [...formData.penandatangan];
                          newPenandatangan[index].rw_number = e.target.value;
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">-- Pilih RW --</option>
                        {rwOptions.map(rw => (
                          <option key={rw} value={rw}>RW {rw}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Nama akan diambil dari database users</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={ttd.required}
                        onChange={(e) => {
                          const newPenandatangan = [...formData.penandatangan];
                          newPenandatangan[index].required = e.target.checked;
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="w-3 h-3"
                      />
                      <span className="text-xs text-gray-600">Wajib</span>
                    </label>
                    {formData.penandatangan.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newPenandatangan = formData.penandatangan.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add TTD Button */}
              {formData.penandatangan.length < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    const newPenandatangan = [...formData.penandatangan, {
                      jabatan: 'sekretaris_desa',
                      label: 'Sekretaris Desa',
                      posisi: formData.layout_ttd === '4_grid' ? 'kanan_atas' : 'kiri',
                      required: false
                    }];
                    setFormData(prev => ({ ...prev, penandatangan: newPenandatangan }));
                  }}
                  className="w-full px-3 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
                >
                  <FiPlus className="w-4 h-4" /> Tambah Penandatangan
                </button>
              )}
            </div>
          </div>

          {/* Fields (Opsional) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Fields Form</h2>
                <p className="text-xs text-gray-500 mt-1">Opsional - Bisa langsung tulis di template</p>
              </div>
              <button
                type="button"
                onClick={() => toggleTips('fields')}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <FiInfo className="w-4 h-4" />
                {showTips.fields ? 'Sembunyikan Tips' : 'Lihat Tips'}
                {showTips.fields ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {showTips.fields && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium flex items-center gap-2">
                  <FiInfo className="w-4 h-4" />
                  Perbedaan Field: Tampil di Surat vs Hanya Data Dinamis
                </p>
                <div className="mt-3 space-y-2 text-xs text-yellow-800">
                  <div className="bg-white bg-opacity-50 p-2 rounded">
                    <p className="font-bold text-green-700">✅ Field dengan "Tampil di Surat" (dicentang):</p>
                    <p className="ml-4">• Akan ditampilkan sebagai form input saat warga mengajukan surat</p>
                    <p className="ml-4">• Valuenya bisa dipakai di template dengan format: <code className="bg-white px-1">(nama_field)</code></p>
                    <p className="ml-4 font-semibold">• Contoh: Field "Keperluan" → di surat tampil: "Keperluan: Melamar Pekerjaan"</p>
                  </div>
                  <div className="bg-white bg-opacity-50 p-2 rounded">
                    <p className="font-bold text-purple-700">🔹 Field "Hanya Data Dinamis" (tidak dicentang):</p>
                    <p className="ml-4">• Tetap ditampilkan sebagai form input saat warga mengisi</p>
                    <p className="ml-4">• Valuenya HANYA untuk dipakai di template, TIDAK tampil sebagai "Label: Value"</p>
                    <p className="ml-4 font-semibold">• Contoh: Field "Nama" → di surat langsung: "MAD SOLEH" (tanpa label "Nama:")</p>
                    <p className="ml-4 font-semibold">• Berguna untuk surat yang formatnya sudah fix seperti gambar contoh</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-3 font-semibold">
                  💡 Setelah menambahkan field, klik nama field di bagian Template Editor untuk memasukkan placeholder: <code className="bg-white px-1">(nama_field)</code>
                </p>
              </div>
            )}

            {/* Field List */}
            {formData.fields.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.fields.map((field, index) => (
                  <div 
                    key={index} 
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 transition-colors ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FiMove className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{field.label}</span>
                          <span className="text-gray-500">({field.name}) - {field.type}</span>
                          {field.required && <span className="text-red-500">*</span>}
                          {field.showInDocument === false && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              Hanya Data Dinamis
                            </span>
                          )}
                          {field.showInDocument !== false && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              Tampil di Surat
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveFieldUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        title="Pindah ke atas"
                      >
                        <FiChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFieldDown(index)}
                        disabled={index === formData.fields.length - 1}
                        className={`p-1 rounded ${index === formData.fields.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                        title="Pindah ke bawah"
                      >
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editField(index)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Edit field"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus field"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Field Form */}
            {editingFieldIndex !== null && (
              <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <FiEdit2 className="w-4 h-4" />
                    Mode Edit - Mengubah field "{formData.fields[editingFieldIndex]?.label}"
                  </p>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-blue-700 hover:text-blue-900 text-sm font-medium"
                  >
                    Batal Edit
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    name="label"
                    value={newField.label}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Label (Nama Lengkap)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="name"
                    value={newField.name}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Name (nama)"
                  />
                </div>
                <div>
                  <select
                    name="type"
                    value={newField.type}
                    onChange={handleFieldChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addField}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    {editingFieldIndex !== null ? (
                      <>
                        <FiSave className="w-4 h-4" /> Update Field
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" /> Tambah Field
                      </>
                    )}
                  </button>
                  {editingFieldIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
                    >
                      <FiX className="w-4 h-4" /> Batal
                    </button>
                  )}
                </div>
              </div>
              
              {/* Checkbox Options */}
              <div className="flex items-center gap-6 pl-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="required"
                    checked={newField.required}
                    onChange={handleFieldChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Wajib Diisi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="showInDocument"
                    checked={newField.showInDocument}
                    onChange={handleFieldChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tampil di Surat</span>
                  <span className="text-xs text-gray-500 italic">
                    (jika tidak dicentang, hanya jadi data dinamis untuk template)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Template Konten <span className="text-red-500">*</span></h2>
                <p className="text-xs text-gray-500 mt-1">Bisa tulis langsung atau klik tombol field untuk data dinamis</p>
              </div>
              <button
                type="button"
                onClick={() => toggleTips('template')}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <FiInfo className="w-4 h-4" />
                {showTips.template ? 'Sembunyikan Helper' : 'Tampilkan Helper'}
                {showTips.template ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {showTips.template && (
              <div className="mb-4 space-y-3">
                {/* Info */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
                    <FiInfo className="w-4 h-4" />
                    Tips Menulis Template:
                  </p>
                  <ul className="text-xs text-blue-800 mt-2 ml-4 list-disc space-y-1">
                    <li><strong>Langsung tulis</strong> - Konten statis yang sama untuk semua surat</li>
                    <li><strong>Pakai field</strong> - Data dinamis yang berbeda per pemohon (klik tombol field)</li>
                    <li className="text-red-700 font-bold">Format placeholder: Gunakan <code className="bg-white px-1">(nama_field)</code> BUKAN [nama_field]</li>
                    <li>Contoh: adalah benar <code className="bg-white px-1">(nama)</code> dengan NIK <code className="bg-white px-1">(nik)</code> lahir di <code className="bg-white px-1">(tempat lahir)</code></li>
                  </ul>
                </div>

                {/* Presets */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FiFileText className="w-4 h-4" />
                    Template Siap Pakai:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {templatePresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => useTemplatePreset(preset)}
                        className="text-xs bg-white hover:bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded border border-indigo-300"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Fields */}
                {formData.fields.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                      <FiTag className="w-4 h-4" />
                      Klik untuk Tambahkan ke Template:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.fields.map((field, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertFieldTag(field.name)}
                          className="text-xs bg-white hover:bg-green-100 text-green-700 px-3 py-1.5 rounded border border-green-300"
                        >
                          {field.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <RichTextEditor
              value={formData.template_konten}
              onChange={(content) => setFormData(prev => ({ ...prev, template_konten: content }))}
              placeholder="Tulis konten surat di sini...&#10;&#10;Contoh:&#10;Adalah benar bahwa orang tersebut di atas adalah warga Desa Cibadak.&#10;&#10;Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya."
              availableFields={formData.fields}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              type="button"
              onClick={() => navigate('/admin/jenis-surat')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              <FiSave />
              {loading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan')}
            </button>
          </div>
        </form>

        {/* Live Preview Surat */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          {/* Paper Size Selector Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preview Surat</h2>
              <p className="text-sm text-gray-600 mt-1">Preview tampilan surat dengan data sample</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setPaperSize('a4');
                  setFormData(prev => ({ ...prev, paper_size: 'a4' }));
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paperSize === 'a4'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                A4 (210×297mm)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaperSize('legal');
                  setFormData(prev => ({ ...prev, paper_size: 'legal' }));
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  paperSize === 'legal'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Legal (216×356mm)
              </button>
            </div>
          </div>
          
          <PreviewSuratLive formData={formData} paperSize={paperSize} />
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

// Preview Surat Live Component
const PreviewSuratLive = ({ formData, paperSize }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKonfigurasi();
  }, [formData.penandatangan]); // Re-fetch when penandatangan changes

  const fetchKonfigurasi = async () => {
    try {
      const response = await api.get('/auth/konfigurasi');
      if (response.data.success) {
        const configData = response.data.data;
        
        // Fetch nama RT/RW berdasarkan penandatangan dari formData
        if (formData && formData.penandatangan) {
          const penandatangan = formData.penandatangan;
          
          for (const ttd of penandatangan) {
            if (ttd.jabatan === 'ketua_rt' && ttd.rt_number) {
              try {
                const rtResponse = await api.get(`/admin/rt-name/${ttd.rt_number}`);
                if (rtResponse.data.success) {
                  configData[`nama_rt_${ttd.rt_number}`] = rtResponse.data.nama;
                }
              } catch (err) {
                console.error('Error fetching RT name:', err);
                configData[`nama_rt_${ttd.rt_number}`] = `KETUA RT ${ttd.rt_number}`;
              }
            }
            
            if (ttd.jabatan === 'ketua_rw' && ttd.rw_number) {
              try {
                const rwResponse = await api.get(`/admin/rw-name/${ttd.rw_number}`);
                if (rwResponse.data.success) {
                  configData[`nama_rw_${ttd.rw_number}`] = rwResponse.data.nama;
                }
              } catch (err) {
                console.error('Error fetching RW name:', err);
                configData[`nama_rw_${ttd.rw_number}`] = `KETUA RW ${ttd.rw_number}`;
              }
            }
          }
        }
        
        setConfig(configData);
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
    nama_desa_penandatangan: 'Cibadak',
    alamat_kantor: 'Kp. Cibadak Balai Desa No.5 RT.005 RW.001 Desa Cibadak Kecamatan Ciampea Kabupaten Bogor',
    kota: 'Jawa Barat',
    kode_pos: '16620',
    telepon: '0251-1234567',
    email: 'desacibadak@bogor.go.id',
    jabatan_ttd: 'Kepala Desa Cibadak',
    nama_ttd: 'LIYA MULIYA, S.Pd.I., M.Pd.',
    nip_ttd: '196701011990031005'
  });

  const sampleData = {
    // Data pribadi umum
    nama: 'Ahmad Fauzi',
    nik: '3201012312980001',
    tempat_lahir: 'Bogor',
    tanggal_lahir: '23 Desember 1998',
    jenis_kelamin: 'Laki-laki',
    alamat: 'Kp. Cibadak RT.005 RW.001',
    pekerjaan: 'Wiraswasta',
    agama: 'Islam',
    status_perkawinan: 'Belum Kawin',
    keperluan: 'Melamar Pekerjaan',
    
    // Data usaha
    'Nama Perusahaan': 'CV SAURIL SIDIK',
    'nama_perusahaan': 'CV SAURIL SIDIK',
    'Jenis/Sifat Usaha': 'Perdagangan Umum',
    'Jenis/Sifat usaha': 'Perdagangan Umum',
    'jenis_sifat_usaha': 'Perdagangan Umum',
    'Bergerak di bidang': 'Perdagangan Eceran',
    'Bergerak di bidang g': 'Perdagangan Eceran',
    'bergerak_di_bidang': 'Perdagangan Eceran',
    'Penanggung Jawab': 'Ahmad Fauzi',
    'penanggung_jawab': 'Ahmad Fauzi',
    'Akta Pendirian': 'Nomor 123/2023',
    'akta_pendirian': 'Nomor 123/2023',
    'Jumlah Karyawan': '5 Orang',
    'jumlah_karyawan': '5 Orang',
    'Lokasi Usaha': 'Kp. Cibadak Balai Desa',
    'lokasi_usaha': 'Kp. Cibadak Balai Desa',
    'Jumlah Permodalan': 'Rp 50.000.000',
    'jumlah_permodalan': 'Rp 50.000.000',
    'Status Bangunan': 'Milik Sendiri',
    'status_bangunan': 'Milik Sendiri',
    
    // Data lainnya
    'skdu': '01 Januari 2025',
    'Alamat': 'Kp. Cibadak Balai Desa'
  };

  const renderTemplate = (template) => {
    if (!template) return '';
    let rendered = template;
    
    // Replace placeholder dengan sample data
    if (sampleData && typeof sampleData === 'object') {
      Object.keys(sampleData).forEach(key => {
        const value = sampleData[key] || '';
        // Escape special regex characters in key
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Replace {{key}} format - double curly braces (PRIORITAS TINGGI)
        rendered = rendered.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'gi'), value);
        // Replace ((key)) format - double parenthesis
        rendered = rendered.replace(new RegExp(`\\(\\(${escapedKey}\\)\\)`, 'gi'), value);
        // Replace (key) format - single parenthesis
        rendered = rendered.replace(new RegExp(`\\(${escapedKey}\\)`, 'gi'), value);
        // Replace [key] format - square brackets
        rendered = rendered.replace(new RegExp(`\\[${escapedKey}\\]`, 'gi'), value);
      });
    }
    
    // Strip HTML tags dan convert ke plain text
    rendered = rendered
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .split('\n')
      .filter(line => line.trim())
      .join('\n');
    
    return rendered;
  };

  const getCurrentDate = () => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date();
    const desaName = config?.nama_desa_penandatangan || 'Cibadak';
    return `${desaName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const generateNomorSurat = (format) => {
    const date = new Date();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const tahun = date.getFullYear();
    const nomor = '001';
    
    return format
      .replace(/NOMOR/gi, nomor)
      .replace(/KODE/gi, formData.kode_surat || 'XXX')
      .replace(/BULAN/gi, bulan)
      .replace(/TAHUN/gi, tahun);
  };

  const renderSignatureLayout = () => {
    const penandatangan = formData.penandatangan || [];
    const layout = formData.layout_ttd || '1_kanan';
    const showMaterai = formData.show_materai || false;

    console.log('🔍 Preview Signature Layout:', { 
      layout, 
      penandatanganCount: penandatangan.length,
      penandatangan: penandatangan 
    });

    const SignatureBox = ({ data, withDate = false }) => {
      // Get nama berdasarkan jabatan
      let nama = '(...........................)';
      let nip = '';
      
      if (data.jabatan === 'kepala_desa') {
        nama = config?.nama_ttd || 'NAMA KEPALA DESA';
        nip = config?.nip_ttd || '';
      } else if (data.jabatan === 'sekretaris_desa') {
        nama = config?.nama_sekretaris || 'NAMA SEKRETARIS DESA';
        nip = config?.nip_sekretaris || '';
      } else if (data.jabatan === 'camat') {
        nama = config?.nama_camat || 'NAMA CAMAT';
      } else if (data.jabatan === 'kapolsek') {
        nama = config?.nama_kapolsek || 'NAMA KAPOLSEK';
      } else if (data.jabatan === 'danramil') {
        nama = config?.nama_danramil || 'NAMA DANRAMIL';
      } else if (data.jabatan === 'ketua_rt') {
        nama = config?.[`nama_rt_${data.rt_number}`] || `KETUA RT ${data.rt_number || ''}`;
      } else if (data.jabatan === 'ketua_rw') {
        nama = config?.[`nama_rw_${data.rw_number}`] || `KETUA RW ${data.rw_number || ''}`;
      }
      
      return (
        <div style={{ 
          textAlign: 'center', 
          width: '220px', 
          flex: layout === '2_horizontal' || layout === '3_horizontal' ? 1 : 'none',
          flexShrink: 0
        }}>
          {withDate && (
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>{getCurrentDate()}</p>
          )}
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>
            {data.label || config?.jabatan_ttd || 'Kepala Desa'}
          </p>
          <div style={{ height: '60px' }}></div>
          <p style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'bold', textDecoration: 'underline' }}>
            {nama}
          </p>
          {nip && (
            <p style={{ fontSize: '13px', marginTop: '2px' }}>
              NIP. {nip}
            </p>
          )}
        </div>
      );
    };

    const MateraiBox = () => (
      <div style={{ 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '150px' 
      }}>
        <p style={{ fontSize: '12px', marginBottom: '5px' }}>Materai</p>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          border: '2px solid #000',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '11px', 
          fontWeight: 'bold'
        }}>
          Rp 10.000
        </div>
      </div>
    );

    if (layout === '1_kanan' || penandatangan.length === 1) {
      return (
        <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'flex-end' }}>
          <SignatureBox data={penandatangan[0]} withDate={true} />
        </div>
      );
    }

    if (layout === '2_horizontal' && penandatangan.length === 2) {
      return (
        <div style={{ marginTop: '35px' }}>
          <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'right', paddingRight: '220px' }}>
            {getCurrentDate()}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px' }}>
            <SignatureBox data={penandatangan[0]} />
            <SignatureBox data={penandatangan[1]} />
          </div>
        </div>
      );
    }

    if (layout === '3_horizontal') {
      return (
        <div style={{ marginTop: '35px' }}>
          <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>{getCurrentDate()}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
            <SignatureBox data={penandatangan[0]} />
            {showMaterai && <MateraiBox />}
            <SignatureBox data={penandatangan[1] || penandatangan[0]} />
          </div>
        </div>
      );
    }

    if (layout === '2_vertical' && penandatangan.length === 2) {
      return (
        <div style={{ marginTop: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <SignatureBox data={penandatangan[0]} withDate={true} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SignatureBox data={penandatangan[1]} />
          </div>
        </div>
      );
    }

    if (layout === '4_grid') {
      const kiriAtas = penandatangan.find(s => s.posisi === 'kiri_atas');
      const kiriBawah = penandatangan.find(s => s.posisi === 'kiri_bawah');
      const kananAtas = penandatangan.find(s => s.posisi === 'kanan_atas');
      const kananBawah = penandatangan.find(s => s.posisi === 'kanan_bawah');

      return (
        <div style={{ marginTop: '35px' }}>
          <p style={{ fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>{getCurrentDate()}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '24px' }}>
            <div style={{ width: '220px' }}>{kiriAtas && <SignatureBox data={kiriAtas} />}</div>
            <div style={{ width: '220px' }}>{kananAtas && <SignatureBox data={kananAtas} />}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px' }}>
            <div style={{ width: '220px' }}>{kiriBawah && <SignatureBox data={kiriBawah} />}</div>
            <div style={{ width: '220px' }}>{kananBawah && <SignatureBox data={kananBawah} />}</div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'flex-end' }}>
        <SignatureBox data={penandatangan[0]} withDate={true} />
      </div>
    );
  };

  if (loading || !config) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Memuat preview...</p>
      </div>
    );
  }

  const paperConfig = {
    a4: { width: '210mm', height: '297mm', padding: '10mm 20mm' },
    legal: { width: '215.9mm', height: '355.6mm', padding: '15mm 20mm' }
  };

  const currentPaper = paperConfig[paperSize];

  return (
    <div className="mt-8">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-t-lg p-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <FiFileText className="w-6 h-6" />
          Preview Surat ({paperSize.toUpperCase()})
        </h3>
      </div>
      
      <div className="bg-gray-100 p-8 rounded-b-lg">
        <div 
          className="bg-white mx-auto shadow-lg"
          style={{
            fontFamily: 'Arial, sans-serif',
            width: currentPaper.width,
            minHeight: currentPaper.height,
            maxWidth: currentPaper.width,
            padding: currentPaper.padding,
            boxSizing: 'border-box'
          }}
        >
          {/* Kop Surat */}
          <div className="pb-3 mb-3" style={{ borderBottom: '3px solid #000' }}>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img 
                  src="/assets/Lambang_Kabupaten_Bogor.png"
                  alt="Logo"
                  style={{ 
                    width: paperSize === 'legal' ? '85px' : '90px',
                    height: paperSize === 'legal' ? '85px' : '90px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => { e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png'; }}
                />
              </div>
              <div className="flex-1 text-center" style={{ marginRight: paperSize === 'legal' ? '85px' : '90px' }}>
                <h2 className="font-bold uppercase" style={{ 
                  fontSize: paperSize === 'legal' ? '19px' : '20px', 
                  lineHeight: '1.3', marginBottom: '3px' 
                }}>
                  {config.nama_kabupaten}
                </h2>
                <h3 className="font-bold uppercase" style={{ 
                  fontSize: paperSize === 'legal' ? '17px' : '18px', 
                  lineHeight: '1.3', marginBottom: '3px' 
                }}>
                  {config.nama_kecamatan}
                </h3>
                <h3 className="font-bold uppercase" style={{ 
                  fontSize: paperSize === 'legal' ? '17px' : '18px', 
                  lineHeight: '1.3', marginBottom: '5px' 
                }}>
                  {config.nama_desa}
                </h3>
                <p style={{ 
                  fontSize: paperSize === 'legal' ? '11px' : '12px', 
                  lineHeight: '1.4', marginBottom: '2px' 
                }}>
                  {config.alamat_kantor}
                </p>
                <p style={{ fontSize: paperSize === 'legal' ? '11px' : '12px', lineHeight: '1.4' }}>
                  {config.kota} {config.kode_pos}
                </p>
              </div>
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center" style={{ 
            marginBottom: paperSize === 'legal' ? '12px' : '14px', 
            marginTop: paperSize === 'legal' ? '14px' : '16px' 
          }}>
            <h4 className="font-bold uppercase underline" style={{ 
              fontSize: paperSize === 'legal' ? '15px' : '16px', 
              marginBottom: '7px' 
            }}>
              {formData.nama_surat || 'NAMA SURAT'}
            </h4>
            <p className="font-semibold" style={{ fontSize: paperSize === 'legal' ? '13px' : '14px' }}>
              Nomor : {generateNomorSurat(formData.format_nomor || 'NOMOR/KODE/BULAN/TAHUN')}
            </p>
          </div>

          {/* Isi Surat */}
          <div style={{ 
            fontSize: paperSize === 'legal' ? '13px' : '14px',
            lineHeight: paperSize === 'legal' ? '1.6' : '1.7'
          }}>
            <p className="text-justify" style={{ marginBottom: paperSize === 'legal' ? '8px' : '10px' }}>
              {formData.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}
            </p>

            {formData.fields && formData.fields.length > 0 && (
              <div style={{ 
                marginLeft: paperSize === 'legal' ? '25px' : '30px', 
                marginBottom: paperSize === 'legal' ? '8px' : '10px' 
              }}>
                {formData.fields
                  .filter(field => field.showInDocument !== false)
                  .map((field, index) => (
                    <div 
                      key={index} 
                      className="flex" 
                      style={{ marginBottom: paperSize === 'legal' ? '2px' : '3px' }}
                    >
                      <div style={{ width: paperSize === 'legal' ? '150px' : '160px' }}>
                        {field.label}
                      </div>
                      <div style={{ width: '25px', textAlign: 'center' }}>:</div>
                      <div className="flex-1 font-semibold">
                        {sampleData[field.name] || `[${field.label}]`}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            <div 
              className="text-justify"
              style={{ whiteSpace: 'pre-line', marginTop: '10px' }}
            >
              {renderTemplate(formData.template_konten)}
            </div>
          </div>

          {/* Tanda Tangan */}
          {renderSignatureLayout()}
        </div>
      </div>
    </div>
  );
};

export default FormJenisSurat;

