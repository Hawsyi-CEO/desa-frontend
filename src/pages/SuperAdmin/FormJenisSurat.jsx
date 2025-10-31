import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
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
    status: 'aktif'
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
  }, [id]);

  const fetchJenisSurat = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/jenis-surat/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setFormData({
          nama_surat: data.nama_surat,
          kode_surat: data.kode_surat,
          deskripsi: data.deskripsi || '',
          format_nomor: data.format_nomor || 'NOMOR/KODE/BULAN/TAHUN',
          kalimat_pembuka: data.kalimat_pembuka || 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :',
          template_konten: data.template_konten,
          fields: typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields,
          require_verification: data.require_verification,
          status: data.status
        });
      }
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
      error('Gagal memuat data jenis surat');
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
      warning('Nama field dan label harus diisi');
      return;
    }

    // Auto-generate name from label if not filled
    const fieldName = newField.name || newField.label.toLowerCase().replace(/\s+/g, '_');

    if (editingFieldIndex !== null) {
      // Update existing field
      setFormData(prev => ({
        ...prev,
        fields: prev.fields.map((field, index) => 
          index === editingFieldIndex ? { ...newField, name: fieldName } : field
        )
      }));
      setEditingFieldIndex(null);
    } else {
      // Add new field
      setFormData(prev => ({
        ...prev,
        fields: [...prev.fields, { ...newField, name: fieldName }]
      }));
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

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/admin/jenis-surat/${id}`, formData);
        success('Jenis surat berhasil diupdate');
      } else {
        await api.post('/admin/jenis-surat', formData);
        success('Jenis surat berhasil ditambahkan');
      }
      setTimeout(() => navigate('/admin/jenis-surat'), 1000);
    } catch (err) {
      console.error('Error saving jenis surat:', err);
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
            <button
              onClick={() => navigate('/superadmin/jenis-surat')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiX /> Batal
            </button>
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

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="require_verification"
                    checked={formData.require_verification}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Butuh Verifikasi</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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

            <textarea
              ref={templateRef}
              name="template_konten"
              value={formData.template_konten}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              rows="12"
              placeholder="Tulis konten surat di sini...&#10;&#10;Contoh:&#10;Adalah benar bahwa orang tersebut di atas adalah warga Desa Cibadak.&#10;&#10;Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya."
              required
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

export default FormJenisSurat;
