import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const WargaUniversalDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [loadingNik, setLoadingNik] = useState(false);
  const [wargaData, setWargaData] = useState(null);

  // Data
  const [jenisSuratList, setJenisSuratList] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({});
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [createdSurat, setCreatedSurat] = useState(null); // Untuk data surat yang sudah dibuat

  // Load jenis surat
  useEffect(() => {
    loadJenisSurat();
  }, []);

  const loadJenisSurat = async () => {
    try {
      const response = await api.get('/warga-universal/jenis-surat');
      if (response.data.success) {
        setJenisSuratList(response.data.data);
      }
    } catch (error) {
      console.error('Error loading jenis surat:', error);
      toast.error('Gagal memuat jenis surat');
    }
  };

  // Handle surat selection
  const handleSelectJenis = (jenis) => {
    setSelectedJenis(jenis);
    setFormData({});
    setShowPreview(false);
    setWargaData(null);
  };

  // Autofill data warga berdasarkan NIK (sama seperti di Dashboard Warga)
  const fetchWargaByNik = async (nik) => {
    console.log('📞 fetchWargaByNik called with NIK:', nik);
    
    // Validasi jenis surat harus dipilih dulu
    if (!selectedJenis) {
      toast.warning('Pilih jenis surat terlebih dahulu sebelum mengisi NIK');
      return;
    }
    
    // Validasi format NIK
    if (!nik || nik.length !== 16) {
      console.log('NIK validation failed. Length:', nik?.length);
      return;
    }

    try {
      setLoadingNik(true);
      console.log('Fetching data from API:', `/warga-universal/warga/${nik}`);
      
      const response = await api.get(`/warga-universal/warga/${nik}`);
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const wargaData = response.data.data;
        console.log('📦 Warga data received:', wargaData);
        setWargaData(wargaData);
        
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
          console.log('📊 Autofilled fields count:', Object.keys(newData).filter(k => newData[k]).length);
          return newData;
        });

        toast.success(`Data ${wargaData.nama} berhasil dimuat`);
      }
    } catch (error) {
      console.error('Error fetching warga by NIK:', error);
      if (error.response?.status === 404) {
        toast.warning('NIK tidak ditemukan di database');
        setWargaData(null);
      } else {
        toast.error('Gagal memuat data warga');
      }
    } finally {
      setLoadingNik(false);
    }
  };

  // Handle field change dengan autofill trigger
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Trigger autofill ketika NIK lengkap 16 digit
    if (fieldName.toLowerCase() === 'nik' && value.length === 16) {
      fetchWargaByNik(value);
    }
  };

  // Handle Preview (tanpa create surat dulu, hanya generate preview)
  const handlePreview = () => {
    // Validasi
    if (!selectedJenis) {
      toast.error('Pilih jenis surat terlebih dahulu');
      return;
    }

    if (!wargaData || !wargaData.nik) {
      toast.error('Masukkan NIK warga terlebih dahulu');
      return;
    }

    // Check required fields
    const requiredFields = selectedJenis.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.name]);
    
    if (missingFields.length > 0) {
      toast.error(`Field wajib belum diisi: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Generate preview dari template
    let content = selectedJenis.template_konten || '';
    
    console.log('🖨️ Generating preview...');
    console.log('Template konten:', content);
    console.log('Form data:', formData);
    
    // Replace placeholders dengan data form
    Object.keys(formData).forEach(key => {
      const placeholder = `{${key}}`;
      const value = formData[key] || '';
      content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      console.log(`Replacing ${placeholder} with ${value}`);
    });
    
    // Replace tanggal surat
    const formattedDate = new Date(tanggalSurat).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    content = content.replace(/{tanggal_surat}/g, formattedDate);
    console.log('Tanggal surat:', formattedDate);
    
    // Format content for HTML display (preserve line breaks)
    content = content.replace(/\n/g, '<br>');
    
    console.log('✅ Preview content generated');
    setPreviewContent(content);
    setShowPreview(true);
  };

  // Handle Create & Print
  const handleCreateAndPrint = async () => {
    try {
      setLoading(true);
      
      // Prepare data untuk create surat
      const payload = {
        nik_pemohon: wargaData.nik, // NIK warga yang membuat surat
        jenis_surat_id: selectedJenis.id,
        data_surat: formData,
        tanggal_surat: tanggalSurat
      };

      console.log('📤 Creating surat with payload:', payload);
      
      const response = await api.post('/warga-universal/surat', payload);
      
      if (response.data.success) {
        const suratData = response.data.data;
        console.log('✅ Surat created:', suratData);
        
        toast.success('Surat berhasil dibuat!');
        setCreatedSurat(suratData);
        
        // Tunggu sebentar lalu buka window print
        setTimeout(() => {
          openPrintWindow(suratData);
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error creating surat:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat surat');
    } finally {
      setLoading(false);
    }
  };

  // Open print window
  const openPrintWindow = (suratData) => {
    console.log('🖨️ Opening print window...');
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk mencetak surat.');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Surat - ${selectedJenis.nama_surat}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.8;
            margin: 0;
            padding: 20px;
            color: #000;
          }
          
          .kop-surat {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          
          .kop-surat h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
          }
          
          .kop-surat h2 {
            font-size: 16pt;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
          }
          
          .kop-surat p {
            font-size: 10pt;
            margin: 2px 0;
          }
          
          .judul-surat {
            text-align: center;
            margin: 30px 0 20px 0;
            text-decoration: underline;
            font-weight: bold;
            font-size: 14pt;
            text-transform: uppercase;
          }
          
          .nomor-surat {
            text-align: center;
            margin-bottom: 30px;
            font-size: 11pt;
          }
          
          .content {
            text-align: justify;
            white-space: pre-wrap;
            margin-bottom: 40px;
          }
          
          .ttd {
            margin-top: 50px;
            text-align: right;
            margin-right: 50px;
          }
          
          .button-container {
            text-align: center;
            margin: 30px 0;
            page-break-after: avoid;
          }
          
          .print-button {
            padding: 12px 30px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14pt;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.3s;
          }
          
          .print-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          }
          
          @media print {
            body { 
              padding: 0; 
            }
            .button-container { 
              display: none !important; 
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="kop-surat">
          <h1>PEMERINTAH DESA</h1>
          <h2>DESA [NAMA DESA]</h2>
          <p>Alamat: [Alamat Kantor Desa]</p>
          <p>Telepon: [Nomor Telepon] | Email: [Email Desa]</p>
        </div>
        
        <div class="judul-surat">
          ${selectedJenis.nama_surat}
        </div>
        
        <div class="nomor-surat">
          Nomor: ${suratData.no_surat || '-'}
        </div>
        
        <div class="content">
          ${previewContent}
        </div>
        
        <div class="ttd">
          <p>Kepala Desa,</p>
          <br><br><br>
          <p><strong><u>[NAMA KEPALA DESA]</u></strong></p>
        </div>
        
        <div class="button-container no-print">
          <button onclick="window.print()" class="print-button">
            🖨️ Cetak Surat
          </button>
          <br><br>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    console.log('✅ Print window opened successfully');
    
    // Reset form setelah print window terbuka
    setTimeout(() => {
      setSelectedJenis(null);
      setFormData({});
      setShowPreview(false);
      setPreviewContent('');
      setWargaData(null);
      setCreatedSurat(null);
      setTanggalSurat(new Date().toISOString().split('T')[0]);
      toast.info('Form direset. Siap membuat surat baru.');
      console.log('🔄 Form reset');
    }, 1000);
  };

  // Handle close preview dan kembali ke form
  const handleBackToForm = () => {
    setShowPreview(false);
    setPreviewContent('');
  };

  // Render field form
  const renderField = (field) => {
    const value = formData[field.name] || '';
    const isNikField = field.name.toLowerCase() === 'nik';
    const isNikLoaded = isNikField && wargaData && value === wargaData.nik;

    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              placeholder={field.placeholder || ''}
            />
          ) : field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            >
              <option value="">Pilih {field.label}</option>
              {field.options?.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === 'date' ? (
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
          ) : (
            <input
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                isNikLoaded 
                  ? 'border-green-400 focus:border-green-500 focus:ring-green-100 bg-green-50' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
              placeholder={field.placeholder || ''}
              maxLength={isNikField ? 16 : undefined}
            />
          )}
        </div>
        
        {/* Show loading indicator for NIK field */}
        {isNikField && loadingNik && (
          <p className="text-xs text-blue-600 flex items-center mt-1">
            <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memuat data warga...
          </p>
        )}
        
        {/* Show success indicator if warga data loaded */}
        {isNikLoaded && (
          <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Data {wargaData.nama} berhasil dimuat
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mesin Pelayanan Surat Desa
          </h1>
          <p className="text-gray-600 mt-2">Cetak surat resmi dengan cepat dan mudah</p>
        </div>

        {/* Step 1: Pilih Jenis Surat */}
        {!selectedJenis && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full mr-3 text-sm">1</span>
              Pilih Jenis Surat
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jenisSuratList.map(jenis => (
                <button
                  key={jenis.id}
                  onClick={() => handleSelectJenis(jenis)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
                        {jenis.nama_surat}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{jenis.deskripsi || 'Tidak ada deskripsi'}</p>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Kode: {jenis.kode_surat}
                      </span>
                    </div>
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Isi Form */}
        {selectedJenis && !showPreview && (
          <div className="space-y-6">
            {/* Card Info Surat Terpilih */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Membuat Surat:</p>
                  <h2 className="text-2xl font-bold">{selectedJenis.nama_surat}</h2>
                  <p className="text-sm opacity-90 mt-1">Kode: {selectedJenis.kode_surat}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedJenis(null);
                    setFormData({});
                    setWargaData(null);
                  }}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all"
                >
                  Ganti Surat
                </button>
              </div>
            </div>

            {/* Form Input */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Form Data Surat</h3>
              
              {/* Tanggal Surat */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Surat
                </label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Dynamic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedJenis.fields?.map(field => renderField(field))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setSelectedJenis(null);
                    setFormData({});
                    setWargaData(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handlePreview}
                  disabled={!wargaData}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Surat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview dengan data yang diinput */}
        {showPreview && (
          <div className="space-y-6">
            {/* Card Info */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Preview Surat:</p>
                  <h2 className="text-2xl font-bold">{selectedJenis.nama_surat}</h2>
                  <p className="text-sm opacity-90 mt-1">Periksa kembali data sebelum mencetak</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Preview Dokumen
              </h3>
              
              <div 
                className="border-2 border-gray-200 rounded-xl p-8 mb-6 bg-white min-h-[400px] shadow-inner"
                style={{ 
                  fontFamily: "'Times New Roman', Times, serif",
                  lineHeight: '1.8',
                  fontSize: '11pt'
                }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />

              {/* Action Buttons - Pisah antara Kembali dan Cetak */}
              <div className="flex gap-4">
                <button
                  onClick={handleBackToForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Kembali Edit
                </button>
                <button
                  onClick={handleCreateAndPrint}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan & Membuka Print...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Simpan & Cetak Surat
                    </>
                  )}
                </button>
              </div>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-semibold mb-1">Informasi:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Klik "Kembali Edit" jika ada data yang perlu diperbaiki</li>
                      <li>Klik "Simpan & Cetak" untuk menyimpan surat ke database dan membuka jendela cetak</li>
                      <li>Surat akan otomatis tersimpan dengan status "Disetujui"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WargaUniversalDashboard;
