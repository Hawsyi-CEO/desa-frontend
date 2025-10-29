import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PreviewSurat from '../../components/PreviewSurat';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { safeParseDataSurat, safeParseFields } from '../../utils/jsonHelpers';
import api from '../../services/api';

const AdminSurat = () => {
  const { toast, hideToast, success, error, warning } = useToast();
  const { confirm, confirmState, hideConfirm } = useConfirm();
  const [suratList, setSuratList] = useState([]);
  const [jenisSurat, setJenisSurat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // State untuk modal pilihan penandatangan
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [pendingSuratData, setPendingSuratData] = useState(null);
  const [configData, setConfigData] = useState(null);
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  // State untuk bulk delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSurat();
    fetchJenisSurat();
  }, [filterStatus, filterJenis]);

  useEffect(() => {
    // Reset to page 1 when filters or search change
    setCurrentPage(1);
  }, [filterStatus, filterJenis, searchQuery]);

  const fetchSurat = async () => {
    try {
      setLoading(true);
      let url = '/admin/surat?';
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterJenis) url += `jenis=${filterJenis}`;
      
      const response = await api.get(url);
      setSuratList(response.data.data);
    } catch (err) {
      console.error('Error fetching surat:', err);
      error('Gagal mengambil data surat');
    } finally {
      setLoading(false);
    }
  };

  const fetchJenisSurat = async () => {
    try {
      const response = await api.get('/admin/jenis-surat');
      setJenisSurat(response.data.data);
    } catch (err) {
      console.error('Error fetching jenis surat:', err);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/surat/${id}`);
      setSelectedSurat(response.data.data);
      setTanggalSurat(new Date().toISOString().split('T')[0]);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching surat detail:', err);
      error('Gagal mengambil detail surat');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!tanggalSurat) {
      warning('Tanggal surat harus diisi');
      return;
    }

    const confirmed = await confirm({
      title: 'Setujui Surat',
      message: 'Yakin ingin menyetujui surat ini? Nomor surat akan digenerate otomatis.',
      confirmText: 'Ya, Setujui',
      cancelText: 'Batal',
      confirmColor: 'green'
    });

    if (!confirmed) return;

    try {
      setSubmitting(true);
      const response = await api.put(`/admin/surat/${selectedSurat.id}/approve`, {
        catatan,
        tanggal_surat: tanggalSurat
      });
      
      success(`Surat berhasil disetujui dengan nomor: ${response.data.data.no_surat}`);
      setShowDetailModal(false);
      setCatatan('');
      fetchSurat();
    } catch (err) {
      console.error('Error approving surat:', err);
      error(err.response?.data?.message || 'Gagal menyetujui surat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!catatan) {
      warning('Catatan penolakan harus diisi');
      return;
    }

    const confirmed = await confirm({
      title: 'Tolak Surat',
      message: 'Yakin ingin menolak surat ini? Pemohon akan diminta untuk mengajukan ulang.',
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal',
      confirmColor: 'red'
    });

    if (!confirmed) return;

    try {
      setSubmitting(true);
      await api.put(`/admin/surat/${selectedSurat.id}/reject`, {
        catatan
      });
      
      success('Surat berhasil ditolak');
      setShowDetailModal(false);
      setCatatan('');
      fetchSurat();
    } catch (err) {
      console.error('Error rejecting surat:', err);
      error(err.response?.data?.message || 'Gagal menolak surat');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle checkbox selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentItems.map(surat => surat.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle delete single surat
  const handleDeleteSurat = async (id) => {
    const confirmed = await confirm({
      title: 'Hapus Surat',
      message: 'Yakin ingin menghapus surat ini? Data yang sudah dihapus tidak dapat dikembalikan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      confirmColor: 'red'
    });

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await api.delete(`/admin/surat/${id}`);
      success('Surat berhasil dihapus');
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      fetchSurat();
    } catch (err) {
      console.error('Error deleting surat:', err);
      error(err.response?.data?.message || 'Gagal menghapus surat');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      warning('Pilih minimal satu surat untuk dihapus');
      return;
    }

    const confirmed = await confirm({
      title: 'Hapus Surat Terpilih',
      message: `Yakin ingin menghapus ${selectedIds.length} surat yang dipilih? Data yang sudah dihapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus Semua',
      cancelText: 'Batal',
      confirmColor: 'red'
    });

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await api.post('/admin/surat/bulk-delete', { ids: selectedIds });
      success(`${selectedIds.length} surat berhasil dihapus`);
      setSelectedIds([]);
      fetchSurat();
    } catch (err) {
      console.error('Error bulk deleting surat:', err);
      error(err.response?.data?.message || 'Gagal menghapus surat');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrintDirect = async (surat) => {
    try {
      setLoading(true);
      // Ambil detail lengkap surat untuk print
      const response = await api.get(`/admin/surat/${surat.id}`);
      const suratData = response.data.data;
      
      // Fetch konfigurasi
      let config;
      try {
        const configResponse = await api.get('/auth/konfigurasi');
        config = configResponse.data.success ? configResponse.data.data : getDefaultConfig();
      } catch (error) {
        config = getDefaultConfig();
      }

      // Simpan data dan config, lalu tampilkan modal pilihan penandatangan
      setPendingSuratData(suratData);
      setConfigData(config);
      setShowSignerModal(true);
    } catch (err) {
      console.error('Error fetching surat detail for print:', err);
      error('Gagal mengambil detail surat untuk dicetak');
    } finally {
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
    
    console.log('✅ Selected signer:', signerType);
    console.log('✅ Final config for print:', finalConfig);
    
    // Langsung print dengan config yang sudah dipilih
    await printSurat(pendingSuratData, finalConfig);
  };

  const printSurat = async (suratData, config) => {
    // Parse data dengan helper functions
    const dataSurat = safeParseDataSurat(suratData.data_surat);
    const fields = safeParseFields(suratData.jenis_surat?.fields);

    console.log('Print Data:', { suratData, dataSurat, fields }); // Debug

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
      // Remove iframe after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
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
          // Replace (key) format
          rendered = rendered.replace(new RegExp(`\\(${key}\\)`, 'g'), `<strong>${value}</strong>`);
          // Replace {{key}} format
          rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), `<strong>${value}</strong>`);
          // Replace [key] format
          rendered = rendered.replace(new RegExp(`\\[${key}\\]`, 'g'), `<strong>${value}</strong>`);
        });
      }
      
      return rendered;
    };

    const generateFieldsHTML = () => {
      if (!fields || fields.length === 0) return '';
      
      return fields.map(field => {
        const value = dataSurat[field.name] || '[Data tidak tersedia]';
        return `
          <div style="display: flex; margin-bottom: 4px;">
            <div style="width: 150px;">${field.label}</div>
            <div style="width: 20px; text-align: center;">:</div>
            <div style="flex: 1; font-weight: 600;">${value}</div>
          </div>
        `;
      }).join('');
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cetak Surat - ${suratData.nama_surat}</title>
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
            position: relative;
            min-height: 95px;
            margin-bottom: 8px;
          }
          .logo-cell {
            position: absolute;
            left: 0;
            top: 0;
            width: 90px;
          }
          .logo {
            width: 90px;
            height: 90px;
            object-fit: contain;
          }
          .kop-text-cell {
            text-align: center;
            padding-top: 5px;
            padding-left: 1.5px;
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
          <h4>${suratData.jenis_surat?.nama_surat || 'SURAT KETERANGAN'}</h4>
          <p>Nomor : ${suratData.no_surat}</p>
        </div>

        <!-- Isi Surat -->
        <div class="isi-surat">
          <p>${suratData.jenis_surat?.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}</p>

          ${fields && fields.length > 0 ? `
            <div class="data-pemohon">
              ${generateFieldsHTML()}
            </div>
          ` : ''}

          <div class="template-konten">
            ${renderTemplate(suratData.jenis_surat?.template_konten || '', dataSurat)}
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      'menunggu_verifikasi': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Verifikasi' },
      'diverifikasi': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Diverifikasi' },
      'disetujui': { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      'ditolak': { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' }
    };

    const config = statusConfig[status] || statusConfig['draft'];
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Filter dan Search Logic
  const filteredSuratList = suratList.filter(surat => {
    const matchSearch = searchQuery === '' || 
      surat.nama_pemohon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.nik_pemohon?.includes(searchQuery) ||
      surat.no_surat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surat.nama_surat?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchSearch;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuratList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSuratList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header dengan gradient modern */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">📋 Verifikasi & Approval Surat</h1>
                  <p className="text-slate-200 text-lg">
                    Kelola semua pengajuan surat dari warga dengan mudah dan cepat
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg className="w-24 h-24 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters dengan design modern */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-slate-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h2>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Pencarian
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama pemohon, NIK, nomor surat, atau jenis surat..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="diverifikasi">Diverifikasi</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Filter Jenis Surat
                </label>
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-slate-700 focus:ring focus:ring-slate-200 focus:ring-opacity-50 transition-all"
                >
                  <option value="">📄 Semua Jenis</option>
                  {jenisSurat.map((js) => (
                    <option key={js.id} value={js.id}>{js.nama_surat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          )}

          {!loading && suratList.length === 0 && (
            <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-100">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Tidak ada surat ditemukan</p>
              <p className="text-gray-400 mt-1">Coba ubah filter untuk melihat hasil lainnya</p>
            </div>
          )}

          {!loading && suratList.length > 0 && (
            <>
              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 font-semibold">
                        {selectedIds.length} surat dipilih
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedIds([])}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal Pilih
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center"
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus {selectedIds.length} Surat
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {/* Checkbox Column */}
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-slate-700 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 focus:ring-2 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          No. Surat
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Pemohon
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Jenis Surat
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Tanggal
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Aksi
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">Tidak ada surat ditemukan</p>
                            <p className="text-gray-400 text-sm mt-2">
                              {searchQuery || filterStatus || filterJenis 
                                ? 'Coba ubah filter atau kata kunci pencarian Anda' 
                                : 'Belum ada pengajuan surat'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((surat, index) => (
                      <tr key={surat.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        {/* Checkbox Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(surat.id)}
                            onChange={() => handleSelectOne(surat.id)}
                            className="w-4 h-4 text-slate-700 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 focus:ring-2 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold">
                              {indexOfFirstItem + index + 1}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{surat.no_surat || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-blue-900 flex items-center justify-center text-white font-bold text-sm">
                                {surat.nama_pemohon?.charAt(0)?.toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-gray-900">{surat.nama_pemohon}</div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                NIK: {surat.nik_pemohon}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{surat.nama_surat}</div>
                          {surat.keperluan && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {surat.keperluan}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(surat.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(surat.status_surat)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Preview Button */}
                            <button
                              onClick={() => {
                                setSelectedSurat(surat);
                                setShowPreview(true);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all text-xs font-medium"
                              title="Lihat Preview Surat"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview
                            </button>

                            {/* Approve Button - only for verified surat */}
                            {(surat.status_surat === 'diverifikasi' || surat.status_surat === 'menunggu_admin') && (
                              <button
                                onClick={() => {
                                  setSelectedSurat(surat);
                                  handleViewDetail(surat.id);
                                }}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transition-all text-xs font-medium"
                                title="Setujui Surat"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Setujui
                              </button>
                            )}

                            {/* Print Button - only for approved surat */}
                            {surat.status_surat === 'disetujui' && (
                              <button
                                onClick={() => handlePrintDirect(surat)}
                                className="inline-flex items-center px-3 py-2 border border-purple-300 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all text-xs font-medium"
                                title="Cetak Surat"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteSurat(surat.id)}
                              disabled={isDeleting}
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 hover:shadow-md transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Hapus Surat"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Component */}
              {filteredSuratList.length > 0 && (
                <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Results Info */}
                    <div className="text-sm text-gray-700">
                      Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> sampai{' '}
                      <span className="font-semibold">
                        {Math.min(indexOfLastItem, filteredSuratList.length)}
                      </span>{' '}
                      dari <span className="font-semibold">{filteredSuratList.length}</span> data
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? 'bg-slate-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {/* Detail Modal - Modern Design */}
          {showDetailModal && selectedSurat && (
            <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="relative mx-auto w-full max-w-2xl shadow-2xl rounded-2xl bg-white animate-modal-in">
                {/* Header dengan gradient */}
                <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900 rounded-t-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold flex items-center">
                        <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approval Surat
                      </h3>
                      <p className="text-slate-200 text-sm mt-1">Setujui dan Generate Nomor Surat</p>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Quick Info dengan card modern */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Pemohon</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSurat.nama_pemohon}</p>
                          <p className="text-xs text-gray-600">NIK: {selectedSurat.nik_pemohon}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Jenis Surat</p>
                          <p className="text-sm font-bold text-gray-900">{selectedSurat.nama_surat}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Tanggal Pengajuan</p>
                          <p className="text-sm font-bold text-gray-900">{formatDate(selectedSurat.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Status</p>
                          <p className="text-sm font-bold">{getStatusBadge(selectedSurat.status_surat)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Approval */}
                  {(selectedSurat.status_surat === 'diverifikasi' || selectedSurat.status_surat === 'menunggu_admin') && (
                    <div className="space-y-4">
                      <div className="flex items-center pb-3 border-b border-gray-200">
                        <svg className="w-5 h-5 text-slate-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h4 className="font-bold text-gray-900 text-lg">Form Approval</h4>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Tanggal Surat <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={tanggalSurat}
                          onChange={(e) => setTanggalSurat(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
                          required
                        />
                      </div>

                      {/* Info Auto Generate Nomor */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <div>
                            <p className="text-sm text-green-900 font-bold mb-1">
                              🤖 Nomor Surat Otomatis
                            </p>
                            <p className="text-xs text-green-700">
                              Sistem akan generate nomor surat secara otomatis setelah approval
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Catatan <span className="text-gray-400">(Opsional)</span>
                        </label>
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
                          rows="3"
                          placeholder="Tambahkan catatan jika diperlukan..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleReject}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Memproses...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Tolak Surat
                            </span>
                          )}
                        </button>
                        <button
                          onClick={handleApprove}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Memproses...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Setujui Surat
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSurat.status_surat !== 'diverifikasi' && selectedSurat.status_surat !== 'menunggu_admin' && (
                    <div className="border-t pt-4">
                      <div className={`border-2 rounded-xl p-4 ${
                        selectedSurat.status_surat === 'disetujui' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                        selectedSurat.status_surat === 'ditolak' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                        'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      }`}>
                        <p className="text-sm font-medium">
                          Status: {getStatusBadge(selectedSurat.status_surat)}
                        </p>
                        {selectedSurat.status_surat === 'disetujui' && selectedSurat.catatan_approval && (
                          <p className="text-sm mt-1">Catatan: {selectedSurat.catatan_approval}</p>
                        )}
                        {selectedSurat.status_surat === 'ditolak' && selectedSurat.catatan_reject && (
                          <p className="text-sm mt-1">Alasan: {selectedSurat.catatan_reject}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && selectedSurat && (
            <PreviewSurat 
              surat={{
                ...selectedSurat,
                jenis_surat: {
                  nama_surat: selectedSurat.nama_surat,
                  kode_surat: selectedSurat.kode_surat,
                  fields: selectedSurat.fields,
                  template_konten: selectedSurat.template_konten,
                  kalimat_pembuka: selectedSurat.kalimat_pembuka
                }
              }}
              onClose={() => setShowPreview(false)} 
            />
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
                  className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </Layout>
  );
};

export default AdminSurat;
