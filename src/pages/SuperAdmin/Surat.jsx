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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSurat();
    fetchJenisSurat();
  }, [filterStatus, filterJenis]);

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

  const handlePrintDirect = async (surat) => {
    try {
      setLoading(true);
      // Ambil detail lengkap surat untuk print
      const response = await api.get(`/admin/surat/${surat.id}`);
      const suratData = response.data.data;
      
      // Langsung print tanpa modal
      await printSurat(suratData);
    } catch (err) {
      console.error('Error fetching surat detail for print:', err);
      error('Gagal mengambil detail surat untuk dicetak');
    } finally {
      setLoading(false);
    }
  };

  const printSurat = async (suratData) => {
    // Fetch konfigurasi
    let config;
    try {
      const response = await api.get('/auth/konfigurasi');
      config = response.data.success ? response.data.data : getDefaultConfig();
    } catch (error) {
      config = getDefaultConfig();
    }

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

    const getCurrentDate = () => {
      const date = suratData.tanggal_surat ? new Date(suratData.tanggal_surat) : new Date();
      return `${config?.nama_desa?.replace('DESA ', '') || 'Cibadak'}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
            <div class="ttd-jabatan">${config.jabatan_ttd}</div>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Verifikasi & Approval Surat</h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola semua pengajuan surat dari warga
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Jenis Surat</label>
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="input"
                >
                  <option value="">Semua Jenis</option>
                  {jenisSurat.map((js) => (
                    <option key={js.id} value={js.id}>{js.nama_surat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && <div className="text-center py-8">Loading...</div>}

          {!loading && suratList.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Tidak ada surat</p>
            </div>
          )}

          {!loading && suratList.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Surat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemohon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Surat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
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
                  {suratList.map((surat) => (
                    <tr key={surat.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {surat.no_surat || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{surat.nama_pemohon}</div>
                        <div className="text-sm text-gray-500">NIK: {surat.nik_pemohon}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{surat.nama_surat}</div>
                        {surat.keperluan && (
                          <div className="text-sm text-gray-500">{surat.keperluan}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(surat.created_at)}
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
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 text-xs font-medium"
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
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-white bg-green-600 rounded hover:bg-green-700 text-xs font-medium"
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
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 bg-white rounded hover:bg-gray-50 text-xs font-medium"
                              title="Cetak Surat"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Cetak
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail Modal - SIMPLIFIED for Approval Only */}
          {showDetailModal && selectedSurat && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Approval Surat</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Quick Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-600">Pemohon:</span>
                        <span className="ml-2 font-medium">{selectedSurat.nama_pemohon}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Jenis Surat:</span>
                        <span className="ml-2 font-medium">{selectedSurat.nama_surat}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal Pengajuan:</span>
                        <span className="ml-2 font-medium">{formatDate(selectedSurat.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Approval */}
                  {(selectedSurat.status_surat === 'diverifikasi' || selectedSurat.status_surat === 'menunggu_admin') && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Approval Surat</h4>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Surat *
                        </label>
                        <input
                          type="date"
                          value={tanggalSurat}
                          onChange={(e) => setTanggalSurat(e.target.value)}
                          className="input"
                          required
                        />
                      </div>

                      {/* Info Auto Generate Nomor */}
                      <div className="mb-3">
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm text-green-800 font-medium">
                            🤖 Nomor surat akan di-generate otomatis oleh sistem
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Format: {selectedSurat.format_nomor || 'NOMOR/KODE/BULAN/TAHUN'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan (Opsional)
                        </label>
                        <textarea
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          className="input"
                          rows="3"
                          placeholder="Masukkan catatan jika diperlukan"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleReject}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          disabled={submitting}
                        >
                          {submitting ? 'Memproses...' : 'Tolak'}
                        </button>
                        <button
                          onClick={handleApprove}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          disabled={submitting}
                        >
                          {submitting ? 'Memproses...' : 'Setujui'}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSurat.status_surat !== 'diverifikasi' && (
                    <div className="border-t pt-4">
                      <div className={`border rounded-md p-3 ${
                        selectedSurat.status_surat === 'disetujui' ? 'bg-green-50 border-green-200' :
                        selectedSurat.status_surat === 'ditolak' ? 'bg-red-50 border-red-200' :
                        'bg-blue-50 border-blue-200'
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
