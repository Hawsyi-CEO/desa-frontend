import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

const WargaUniversalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingNik, setLoadingNik] = useState(false);
  const [wargaData, setWargaData] = useState(null);

  // Data
  const [jenisSuratList, setJenisSuratList] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [formData, setFormData] = useState({});
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0]);

  // Modal penandatangan
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [pendingSuratData, setPendingSuratData] = useState(null);
  const [configData, setConfigData] = useState(null);

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

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    toast.success('Logout berhasil!');
    navigate('/login');
  };

  // Handle surat selection
  const handleSelectJenis = (jenis) => {
    // Parse fields if it's a string
    let parsedJenis = { ...jenis };
    if (typeof jenis.fields === 'string') {
      try {
        parsedJenis.fields = JSON.parse(jenis.fields);
      } catch (err) {
        console.error('Error parsing fields:', err);
        parsedJenis.fields = [];
      }
    }
    
    setSelectedJenis(parsedJenis);
    setFormData({});
    setWargaData(null);
  };

  // Autofill data warga berdasarkan NIK (sama seperti di Dashboard Warga)
  const fetchWargaByNik = async (nik) => {
    console.log('?? fetchWargaByNik called with NIK:', nik);
    
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
        console.log('?? Warga data received:', wargaData);
        setWargaData(wargaData);
        
        // Format tanggal lahir dari timestamp ke YYYY-MM-DD
        let formattedTanggalLahir = '';
        if (wargaData.tanggal_lahir) {
          const date = new Date(wargaData.tanggal_lahir);
          formattedTanggalLahir = date.toISOString().split('T')[0]; // 2017-01-06
          console.log('?? Formatted tanggal_lahir:', formattedTanggalLahir);
        }
        
        // Normalize field name (lowercase, remove spaces, underscores)
        const normalizeFieldName = (name) => {
          return name.toLowerCase()
            .replace(/\s+/g, '_')  // space to underscore
            .replace(/[^a-z0-9_]/g, '');  // remove special chars
        };

        // Get template fields from selected jenis_surat
        const templateFields = selectedJenis?.fields || [];
        console.log('?? Template fields:', templateFields);

        // Master mapping of warga data (all possible fields)
        const wargaFieldMapping = {
          'nik': wargaData.nik,
          'nama': wargaData.nama,
          'namalengkap': wargaData.nama,
          'nama_lengkap': wargaData.nama,
          'nomorindukkependudukan': wargaData.nik,  // F-1.02 normalized
          'nomor_induk_kependudukan': wargaData.nik,  // F-1.02
          'nomorkartukeluarga': wargaData.no_kk,    // F-1.02 normalized
          'nomor_kartu_keluarga': wargaData.no_kk,    // F-1.02
          'nomorhandphone': wargaData.no_telepon,     // F-1.02 normalized
          'nomor_handphone': wargaData.no_telepon,     // F-1.02
          'alamatemail': wargaData.email || '',       // F-1.02 normalized
          'alamat_email': wargaData.email || '',       // F-1.02
          'tempatlahir': wargaData.tempat_lahir,
          'tempat_lahir': wargaData.tempat_lahir,
          'tanggallahir': formattedTanggalLahir,
          'tanggal_lahir': formattedTanggalLahir,
          'ttl': formattedTanggalLahir,
          'jeniskelamin': wargaData.jenis_kelamin,
          'jenis_kelamin': wargaData.jenis_kelamin,
          'pekerjaan': wargaData.pekerjaan,
          'agama': wargaData.agama,
          'statusperkawinan': wargaData.status_perkawinan,
          'status_perkawinan': wargaData.status_perkawinan,
          'statuskawin': wargaData.status_perkawinan,
          'status_kawin': wargaData.status_perkawinan,
          'kewarganegaraan': wargaData.kewarganegaraan,
          'pendidikan': wargaData.pendidikan,
          'golongandarah': wargaData.golongan_darah,
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
            console.log(`?? Checking template field: "${field.name}" ? normalized: "${normalizedFieldName}"`);
            
            // Check if we have data for this field
            if (wargaFieldMapping[normalizedFieldName]) {
              newData[field.name] = wargaFieldMapping[normalizedFieldName];
              console.log(`? Autofilled: ${field.name} = ${wargaFieldMapping[normalizedFieldName]}`);
            }
          });
          
          console.log('? Final autofilled formData:', newData);
          console.log('?? Autofilled fields count:', Object.keys(newData).filter(k => newData[k]).length);
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
    console.log('?? Field changed:', fieldName, '=', value);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Trigger autofill ketika NIK lengkap 16 digit
    // Match both 'nik' and 'nomor_induk_kependudukan' (for F-1.02)
    const normalizedFieldName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isNikField = normalizedFieldName === 'nik' || normalizedFieldName === 'nomorindukkependudukan';
    
    if (isNikField) {
      // Reset warga data jika NIK berubah
      if (value.length !== 16) {
        setWargaData(null);
      }
      
      // Trigger autofill ketika NIK lengkap 16 digit
      if (value.length === 16) {
        console.log('?? Triggering autofill for NIK:', value);
        fetchWargaByNik(value);
      }
    }
  };

  // Handle Create and Print (langsung cetak tanpa preview)
  const handleCreateAndPrint = async () => {
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

    try {
      setLoading(true);
      console.log('?? Creating surat...');

      const payload = {
        nik_pemohon: wargaData.nik,
        jenis_surat_id: selectedJenis.id,
        tanggal_surat: tanggalSurat,
        data_surat: formData
      };

      console.log('Payload:', payload);

      const response = await api.post('/warga-universal/surat', payload);
      
      if (response.data.success) {
        const suratData = response.data.data;
        console.log('? Surat created:', suratData);
        toast.success('Surat berhasil dibuat!');
        
        // Fetch konfigurasi dulu
        try {
          const configResponse = await api.get('/auth/konfigurasi');
          const config = configResponse.data.success ? configResponse.data.data : getDefaultConfig();
          
          // Simpan data surat dan config, lalu tampilkan modal
          setPendingSuratData(suratData);
          setConfigData(config);
          setShowSignerModal(true);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching config:', error);
          const defaultConfig = getDefaultConfig();
          setPendingSuratData(suratData);
          setConfigData(defaultConfig);
          setShowSignerModal(true);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error creating surat:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat surat');
      setLoading(false);
    }
  };

  // Handle pilihan penandatangan
  const handleSelectSigner = async (signerType) => {
    setShowSignerModal(false);
    
    // Buat config dengan penandatangan yang dipilih
    let finalConfig = { ...configData };
    
    if (signerType === 'sekretaris') {
      // Ganti dengan data sekretaris desa
      finalConfig = {
        ...finalConfig,
        isSekretaris: true, // Tambahkan flag untuk identifikasi
        jabatan_ttd: configData.jabatan_sekretaris || 'Sekretaris Desa',
        nama_ttd: configData.nama_sekretaris || configData.nama_ttd,
        nip_ttd: configData.nip_sekretaris || configData.nip_ttd
      };
    } else {
      finalConfig = {
        ...finalConfig,
        isSekretaris: false
      };
    }
    // Jika 'kepala', gunakan data default dari config
    
    console.log('? Selected signer:', signerType);
    console.log('? Final config for print:', finalConfig);
    
    // Langsung print dengan config yang sudah dipilih
    await printSurat(pendingSuratData, finalConfig);
  };

  // Print surat using iframe (like SuperAdmin)
  const printSurat = async (suratData, config) => {
    console.log('??? Starting print process...');
    console.log('?? Full Surat Data from backend:', suratData);
    console.log('?? Data Surat (raw):', suratData.data_surat);
    console.log('?? Jenis Surat (raw):', suratData.jenis_surat);
    console.log('?? Config for print:', config);

    // Parse data_surat - ini adalah data yang diinput user
    let dataSurat = {};
    try {
      if (suratData.data_surat) {
        if (typeof suratData.data_surat === 'string') {
          dataSurat = JSON.parse(suratData.data_surat);
          console.log('?? Parsed data_surat from string:', dataSurat);
        } else {
          dataSurat = suratData.data_surat;
          console.log('?? Using data_surat as object:', dataSurat);
        }
      }
    } catch (err) {
      console.error('? Error parsing data_surat:', err);
      dataSurat = {};
    }
    
    console.log('? Final dataSurat to use:', dataSurat);
    console.log('?? dataSurat keys:', Object.keys(dataSurat));

    // Parse fields from jenis_surat OR from backend response
    let fields = [];
    try {
      // Backend bisa return fields langsung atau di dalam jenis_surat object
      const fieldsSource = suratData.fields || suratData.jenis_surat?.fields;
      
      if (fieldsSource) {
        if (typeof fieldsSource === 'string') {
          fields = JSON.parse(fieldsSource);
          console.log('?? Parsed fields from string:', fields);
        } else {
          fields = fieldsSource;
          console.log('?? Using fields as array:', fields);
        }
      }
    } catch (err) {
      console.error('? Error parsing fields:', err);
      fields = [];
    }
    
    console.log('? Final fields to use:', fields);
    console.log('?? Fields count:', fields.length);

    // Generate HTML untuk print
    const printContent = generatePrintHTML(suratData, dataSurat, fields, config);

    // Buat iframe tersembunyi untuk print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // Wait for content to load then print
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      
      // Remove iframe and reset form after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
        
        // Reset form
        setSelectedJenis(null);
        setFormData({});
        setWargaData(null);
        setTanggalSurat(new Date().toISOString().split('T')[0]);
        toast.info('Surat berhasil dicetak! Form direset untuk surat baru.');
        console.log('?? Form reset');
      }, 100);
    }, 250);
  };

  const getDefaultConfig = () => ({
    nama_kabupaten: 'PEMERINTAH KABUPATEN BOGOR',
    nama_kecamatan: 'KECAMATAN CIAMPEA',
    nama_desa: 'DESA CIBADAK',
    nama_desa_penandatangan: 'Cibadak', // Nama desa untuk tanggal & ttd (proper case)
    alamat_kantor: 'Kp. Cibadak Balai Desa No.5 RT.005 RW.001 Desa Cibadak Kecamatan Ciampea Kabupaten Bogor',
    kota: 'Jawa Barat',
    kode_pos: '16620',
    telepon: '0251-1234567',
    email: 'desacibadak@bogor.go.id',
    jabatan_ttd: 'Kepala Desa Cibadak',
    nama_ttd: 'LIYA MULIYA, S.Pd.I., M.Pd.',
    nip_ttd: '196701011990031005'
  });

  const generatePrintHTML = (suratData, dataSurat, fields, config) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const formatTanggal = (tanggal) => {
      if (!tanggal) return '';
      const date = new Date(tanggal);
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Helper function untuk format nama desa (proper case)
    const formatNamaDesa = (namaDesa) => {
      if (!namaDesa) return '';
      return namaDesa
        .replace('DESA ', '')
        .replace('Desa ', '')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const getCurrentDate = () => {
      const date = suratData.tanggal_surat ? new Date(suratData.tanggal_surat) : new Date();
      // Gunakan nama_desa_penandatangan jika ada, jika tidak fallback ke formatNamaDesa
      const namaDesaBersih = config?.nama_desa_penandatangan || formatNamaDesa(config?.nama_desa) || 'Cibadak';
      return `${namaDesaBersih}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const renderTemplate = (template, data) => {
      if (!template) return '';
      let rendered = template;
      
      // Handle data object
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          const value = data[key] || '';
          // Replace (key) format - tanpa bold
          rendered = rendered.replace(new RegExp(`\\(${key}\\)`, 'g'), value);
          // Replace {{key}} format - tanpa bold
          rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
          // Replace [key] format - tanpa bold
          rendered = rendered.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
        });
      }
      
      return rendered;
    };

    const generateFieldsHTML = () => {
      if (!fields || fields.length === 0) {
        console.log('?? No fields to generate');
        return '';
      }
      
      console.log('?? Generating fields HTML with data:', dataSurat);
      console.log('?? Fields to render:', fields);
      
      // Filter only fields with showInDocument = true
      return fields
        .filter(field => field.showInDocument !== false)
        .map(field => {
          const value = dataSurat[field.name] || '[Data tidak tersedia]';
          console.log(`  Field: ${field.name} (${field.label}) - showInDocument: ${field.showInDocument !== false} = ${value}`);
          return `
            <div style="display: flex; margin-bottom: 4px;">
              <div style="width: 150px;">${field.label}</div>
              <div style="width: 20px; text-align: center;">:</div>
              <div style="flex: 1;">${value}</div>
            </div>
          `;
        }).join('');
    };

    const jenisSurat = suratData.jenis_surat || {};
    const namaSurat = suratData.nama_surat || jenisSurat.nama_surat || 'SURAT KETERANGAN';
    const kalimatPembuka = suratData.kalimat_pembuka || jenisSurat.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`;
    const templateKonten = suratData.template_konten || jenisSurat.template_konten || '';
    const nomorSurat = suratData.no_surat || suratData.nomor_surat || '';
    
    console.log('?? Print variables:');
    console.log('  - namaSurat:', namaSurat);
    console.log('  - nomorSurat:', nomorSurat);
    console.log('  - kalimatPembuka:', kalimatPembuka);
    console.log('  - templateKonten:', templateKonten);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cetak Surat - ${namaSurat}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 20mm;
            background: white;
          }
          .kop-surat {
            margin-bottom: 10px;
          }
          .kop-header {
            display: flex;
            align-items: flex-start;
            min-height: 95px;
            margin-bottom: 8px;
          }
          .logo-cell {
            width: 90px;
            flex-shrink: 0;
            padding-top: 0;
          }
          .logo {
            width: 90px;
            height: 90px;
            object-fit: contain;
            display: block;
          }
          .kop-text-cell {
            flex: 1;
            text-align: center;
            padding-top: 5px;
            padding-left: 0;
            padding-right: 90px;
          }
          .kop-text h1 {
            font-size: 20px;
            line-height: 1.2;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            padding: 0;
          }
          .kop-text h2 {
            font-size: 18px;
            line-height: 1.2;
            font-weight: bold;
            text-transform: uppercase;
            margin: 2px 0;
            padding: 0;
          }
          .kop-text h3 {
            font-size: 20px;
            line-height: 1.2;
            font-weight: bold;
            text-transform: uppercase;
            margin: 2px 0 4px 0;
            padding: 0;
          }
          .kop-text .alamat {
            font-size: 11px;
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          .garis-kop {
            border: none;
            border-top: 4px solid #000;
            margin: 0;
            padding: 0;
          }
          .judul-surat {
            text-align: center;
            margin-bottom: 14px;
            margin-top: 16px;
          }
          .judul-surat h4 {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            margin-bottom: 7px;
          }
          .judul-surat p {
            font-size: 14px;
            font-weight: 600;
          }
          .isi-surat {
            font-size: 14px;
            line-height: 1.7;
          }
          .isi-surat p {
            text-align: justify;
            margin-bottom: 12px;
          }
          .data-pemohon {
            margin-left: 30px;
            margin-bottom: 12px;
          }
          .template-konten {
            text-align: justify;
            white-space: pre-line;
            margin-top: 12px;
          }
          .ttd-container {
            margin-top: 35px;
            display: flex;
            justify-content: flex-end;
          }
          .ttd {
            text-align: center;
            width: 220px;
          }
          .ttd-tanggal {
            font-size: 14px;
            margin-bottom: 50px;
          }
          .ttd-jabatan {
            font-size: 14px;
            margin-bottom: 8px;
          }
          .ttd-nama {
            font-size: 14px;
            margin-top: 70px;
            font-weight: bold;
          }
          .ttd-nip {
            font-size: 11px;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <!-- Kop Surat -->
        <div class="kop-surat">
          <div class="kop-header">
            <div class="logo-cell">
              <img src="/assets/Lambang_Kabupaten_Bogor.png" alt="Logo" class="logo" onerror="this.src='/src/assets/Lambang_Kabupaten_Bogor.png'">
            </div>
            <div class="kop-text-cell">
              <div class="kop-text">
                <h1>${config.nama_kabupaten}</h1>
                <h2>${config.nama_kecamatan}</h2>
                <h3>${config.nama_desa}</h3>
                <p class="alamat">${config.alamat_kantor}</p>
                ${config.telepon ? `<p class="alamat">Telp: ${config.telepon}${config.email ? ` Email: ${config.email}` : ''}</p>` : ''}
              </div>
            </div>
          </div>
          <hr class="garis-kop">
        </div>

        <!-- Judul Surat -->
        <div class="judul-surat">
          <h4>${namaSurat}</h4>
          <p>Nomor : ${nomorSurat}</p>
        </div>

        <!-- Isi Surat -->
        <div class="isi-surat">
          <p>${kalimatPembuka}</p>

          ${fields && fields.length > 0 ? `
            <div class="data-pemohon">
              ${generateFieldsHTML()}
            </div>
          ` : ''}

          <div class="template-konten">
            ${renderTemplate(templateKonten, dataSurat)}
          </div>

          ${suratData.keperluan ? `
            <p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagai ${suratData.keperluan}.</p>
          ` : ''}
        </div>

        <!-- Tanda Tangan -->
        <div class="ttd-container">
          <div class="ttd">
            <div class="ttd-tanggal">${getCurrentDate()}</div>
            ${config.isSekretaris ? `
              <div class="ttd-jabatan" style="margin-bottom: 2px;">a.n Kepala Desa ${config.nama_desa_penandatangan || formatNamaDesa(config.nama_desa) || 'Cibadak'}</div>
            ` : ''}
            <div class="ttd-jabatan" style="margin-bottom: 8px;">${config.jabatan_ttd}</div>
            <div class="ttd-nama">${config.nama_ttd}</div>
            ${config.nip_ttd ? `<div class="ttd-nip">NIP. ${config.nip_ttd}</div>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
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
          {field.group && <span className="text-xs text-gray-500 ml-2">({field.group})</span>}
        </label>
        
        <div className="relative">
          {field.type === 'checkbox' ? (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData[field.name] === true || formData[field.name] === 'true' || formData[field.name] === 1}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="w-5 h-5 text-slate-600 border-2 border-gray-300 rounded focus:ring-slate-500"
              />
              <span className="ml-3 text-sm text-gray-700">{field.label}</span>
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
              placeholder={field.placeholder || ''}
            />
          ) : field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
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
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-4 focus:ring-slate-100 transition-all outline-none"
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
                  : 'border-gray-200 focus:border-slate-600 focus:ring-slate-100'
              }`}
              placeholder={field.placeholder || ''}
              maxLength={isNikField ? 16 : undefined}
            />
          )}
        </div>
        
        {/* Show loading indicator for NIK field */}
        {isNikField && loadingNik && (
          <p className="text-xs text-slate-600 flex items-center mt-1">
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

  // Render form khusus untuk F-1.02
  const renderFormF102 = () => {
    const fields = selectedJenis.fields || [];
    
    // Group fields - HANYA Kartu Keluarga yang ada input
    const dataPemohon = fields.filter(f => ['nama_lengkap', 'nomor_induk_kependudukan', 'nomor_kartu_keluarga', 'nomor_handphone', 'alamat_email'].includes(f.name));
    const kartuKeluarga = fields.filter(f => f.group === 'kartu_keluarga');
    const persyaratan = fields.filter(f => f.group === 'persyaratan');
    
    return (
      <div className="space-y-6">
        {/* I. DATA PEMOHON */}
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">I</span>
            DATA PEMOHON
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {dataPemohon.map(field => {
              const isNikField = field.name === 'nomor_induk_kependudukan';
              const value = formData[field.name] || '';
              const isNikLoaded = isNikField && wargaData && value === wargaData.nik;
              
              return (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                      isNikLoaded 
                        ? 'border-green-400 focus:border-green-500 focus:ring-green-100 bg-green-50' 
                        : 'border-gray-200 focus:border-slate-600 focus:ring-slate-100'
                    }`}
                    placeholder={`Masukkan ${field.label}`}
                    maxLength={isNikField ? 16 : undefined}
                  />
                  
                  {/* Show loading indicator for NIK field */}
                  {isNikField && loadingNik && (
                    <p className="text-xs text-slate-600 flex items-center mt-2">
                      <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memuat data warga...
                    </p>
                  )}
                  
                  {/* Show success indicator if warga data loaded */}
                  {isNikLoaded && (
                    <p className="text-xs text-green-600 flex items-center mt-2 font-medium">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Data {wargaData.nama} berhasil dimuat
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* II. JENIS PERMOHONAN - HANYA KARTU KELUARGA */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-slate-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">II</span>
            JENIS PERMOHONAN - KARTU KELUARGA
          </h4>
          
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800">
              <strong>?? Catatan:</strong> Untuk KTP-el, KIA, dan Perubahan Data akan diisi manual saat form dicetak.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-700 pb-2 border-b-2 border-slate-300">PILIH JENIS PERMOHONAN KARTU KELUARGA</h5>
            {kartuKeluarga.map(field => (
              <div key={field.name} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={formData[field.name] === true || formData[field.name] === 'true'}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  className="mt-1 w-4 h-4 text-slate-600 border-2 border-gray-300 rounded focus:ring-slate-500"
                />
                <label htmlFor={field.name} className="text-sm text-gray-700 cursor-pointer flex-1">
                  {field.label.replace('KK - ', '')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* III. PERSYARATAN YANG DILAMPIRKAN */}
        <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
          <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">III</span>
            PERSYARATAN YANG DILAMPIRKAN
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {persyaratan.map(field => (
              <div key={field.name} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={formData[field.name] === true || formData[field.name] === 'true'}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={field.name} className="text-sm text-gray-700 cursor-pointer flex-1">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements - Navy & Slate Theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-navy-900/10 to-slate-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-600/10 to-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-900/5 to-slate-800/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header dengan Professional Theme */}
          <div className="relative mb-8">
            {/* Tombol Logout - Absolute Position */}
            <div className="absolute top-0 right-0 z-20">
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-red-200/50 hover:border-red-400 hover:scale-105"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold">Logout</span>
              </button>
            </div>

            {/* Header Content */}
            <div className="text-center pt-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl mb-6 shadow-xl transform hover:rotate-3 transition-all duration-500 hover:scale-105">
                <svg className="w-12 h-12 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-5xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent drop-shadow-sm">
                  Mesin Pelayanan Surat Digital
                </span>
              </h1>
              <p className="text-lg text-slate-600 font-medium">Layanan Cepat • Mudah • Terpercaya</p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Online 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tanpa Verifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Cetak Langsung</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Pilih Jenis Surat - Modern Grid dengan Color Palette */}
          {!selectedJenis && (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl shadow-lg transform rotate-3">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Pilih Jenis Surat
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Tersedia {jenisSuratList.length} jenis surat digital</p>
                  </div>
                </div>
                
                {/* Search Bar - untuk navigasi cepat */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Cari surat..."
                    className="pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 focus:border-slate-600 focus:ring-4 focus:ring-slate-100 transition-all outline-none w-64"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Grid Cards - 3 columns untuk desktop, responsive untuk mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jenisSuratList.map((jenis, index) => {
                  // Professional Navy & Slate color palette
                  const colorPalettes = [
                    { from: 'from-slate-700', to: 'to-slate-900', hover: 'hover:shadow-slate-500/20', ring: 'focus:ring-slate-100', border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-700' },
                    { from: 'from-blue-800', to: 'to-blue-950', hover: 'hover:shadow-blue-500/20', ring: 'focus:ring-blue-100', border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800' },
                    { from: 'from-gray-700', to: 'to-gray-900', hover: 'hover:shadow-gray-500/20', ring: 'focus:ring-gray-100', border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-700' },
                    { from: 'from-slate-600', to: 'to-slate-800', hover: 'hover:shadow-slate-400/20', ring: 'focus:ring-slate-100', border: 'border-slate-300', bg: 'bg-slate-100', text: 'text-slate-600' },
                    { from: 'from-blue-700', to: 'to-blue-900', hover: 'hover:shadow-blue-400/20', ring: 'focus:ring-blue-100', border: 'border-blue-300', bg: 'bg-blue-100', text: 'text-blue-700' },
                    { from: 'from-gray-600', to: 'to-gray-800', hover: 'hover:shadow-gray-400/20', ring: 'focus:ring-gray-100', border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-600' },
                    { from: 'from-slate-800', to: 'to-slate-950', hover: 'hover:shadow-slate-600/20', ring: 'focus:ring-slate-100', border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-800' },
                    { from: 'from-blue-900', to: 'to-blue-950', hover: 'hover:shadow-blue-600/20', ring: 'focus:ring-blue-100', border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-900' },
                  ];
                  const palette = colorPalettes[index % colorPalettes.length];
                  
                  return (
                    <button
                      key={jenis.id}
                      onClick={() => handleSelectJenis(jenis)}
                      className={`group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 ${palette.border} hover:border-transparent transition-all duration-300 text-left overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl ${palette.hover}`}
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${palette.from} ${palette.to} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      {/* Icon Badge */}
                      <div className="relative flex items-start justify-between mb-4">
                        <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${palette.from} ${palette.to} rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        
                        {/* Arrow Icon */}
                        <div className={`w-8 h-8 rounded-full ${palette.bg} flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300`}>
                          <svg className={`w-5 h-5 bg-gradient-to-br ${palette.from} ${palette.to} bg-clip-text text-transparent`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-gray-900 transition-colors line-clamp-2">
                          {jenis.nama_surat}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {jenis.deskripsi || 'Surat resmi yang dikeluarkan oleh pemerintah desa'}
                        </p>
                        
                        {/* Badge Kode Surat */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${palette.bg} rounded-full text-xs font-semibold`}>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className={`bg-gradient-to-r ${palette.from} ${palette.to} bg-clip-text text-transparent font-bold`}>
                              {jenis.kode_surat}
                            </span>
                          </span>
                          
                          {/* Quick Print Indicator */}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Siap Cetak
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Empty State jika tidak ada surat */}
              {jenisSuratList.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Jenis Surat</h3>
                  <p className="text-gray-500">Silakan hubungi admin untuk menambahkan jenis surat</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Form Input - Modern Design dengan Glass Effect */}
          {selectedJenis && (
            <div className="space-y-6">
              {/* Card Info Surat Terpilih - Glass Morphism */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 rounded-3xl shadow-2xl p-8">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg">
                      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/80 mb-1 font-medium">Sedang Membuat:</p>
                      <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">{selectedJenis.nama_surat}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold text-white">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          {selectedJenis.kode_surat}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-400/30 backdrop-blur-md rounded-full text-sm font-semibold text-white">
                          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                          Cetak Langsung
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJenis(null);
                      setFormData({});
                      setWargaData(null);
                    }}
                    className="group px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl transition-all font-semibold text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 duration-300"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Ganti Surat
                  </button>
                </div>
              </div>

              {/* Form Input - Modern Card dengan Shadow */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl shadow-lg">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-2xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Lengkapi Data Surat
                  </h3>
                </div>
                
                {/* Tanggal Surat */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Tanggal Surat
                  </label>
                  <input
                    type="date"
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-slate-600 focus:ring-4 focus:ring-slate-100 transition-all outline-none font-medium text-gray-700 shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Dynamic Fields */}
                {selectedJenis.kode_surat === 'F-1.02' ? (
                  // Form khusus untuk F-1.02
                  renderFormF102()
                ) : (
                  // Form standard untuk jenis surat lainnya
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedJenis.fields && Array.isArray(selectedJenis.fields) && selectedJenis.fields.map(field => renderField(field))}
                  </div>
                )}

                {/* Action Buttons - Modern dengan Gradient */}
                <div className="flex gap-4 mt-10 pt-8 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedJenis(null);
                      setFormData({});
                      setWargaData(null);
                    }}
                    className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                  </button>
                  <button
                    onClick={handleCreateAndPrint}
                    disabled={!wargaData || loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 hover:from-slate-800 hover:via-slate-900 hover:to-blue-950 text-white rounded-2xl transition-all font-bold shadow-2xl hover:shadow-slate-500/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-2xl transform hover:-translate-y-0.5 duration-300"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg">Memproses Surat...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span className="text-lg">Buat & Cetak Surat</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Modal Pilih Penandatangan */}
        {showSignerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Pilih Penandatangan</h3>
                <p className="text-gray-600">Siapa yang akan menandatangani surat ini?</p>
              </div>

              <div className="space-y-3 mb-6">
                {/* Kepala Desa */}
                <button
                  onClick={() => handleSelectSigner('kepala')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-slate-600 hover:bg-slate-50 transition-all text-left group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-slate-700">
                        {configData?.jabatan_ttd || 'Kepala Desa'}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        {configData?.nama_ttd || 'Nama Kepala Desa'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Desa {configData?.nama_desa || ''}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Sekretaris Desa */}
                <button
                  onClick={() => handleSelectSigner('sekretaris')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-800 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-800 to-blue-950 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">
                        a.n Kepala Desa {configData?.nama_desa || ''}
                      </p>
                      <h4 className="font-semibold text-gray-800 group-hover:text-blue-900">Sekretaris Desa</h4>
                      <p className="text-sm text-gray-600 font-medium mt-1">
                        {configData?.nama_sekretaris || configData?.nama_ttd || 'Nama Sekretaris Desa'}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSignerModal(false);
                  setPendingSuratData(null);
                  setConfigData(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default WargaUniversalDashboard;
