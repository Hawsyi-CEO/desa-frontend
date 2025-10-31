import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPrinter, FiX } from 'react-icons/fi';
import { safeParseDataSurat, safeParseFields } from '../utils/jsonHelpers';

const PreviewSurat = ({ pengajuan, surat, onClose }) => {
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
      }
    } catch (error) {
      console.error('Error fetching konfigurasi:', error);
      // Use default config
      setConfig(getDefaultConfig());
    } finally {
      setLoading(false);
    }
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

  const getCurrentDate = (doc) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = doc?.tanggal_surat ? new Date(doc.tanggal_surat) : new Date();
    // Gunakan nama_desa_penandatangan untuk proper case (Cibadak), bukan nama_desa (DESA CIBADAK)
    const namaDesa = config?.nama_desa_penandatangan || config?.nama_desa?.replace('DESA ', '').replace('Desa ', '') || 'Cibadak';
    return `${namaDesa}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const generateNomorSurat = (doc) => {
    // Jika sudah ada no_surat dari database, gunakan itu
    if (doc?.no_surat) {
      return doc.no_surat;
    }

    // Generate dari format
    const format = doc?.jenis_surat?.format_nomor || '{nomor}/{kode_surat}/{bulan}/{tahun}';
    const date = doc?.tanggal_surat ? new Date(doc.tanggal_surat) : new Date();
    const bulan = String(date.getMonth() + 1).padStart(2, '0');
    const tahun = date.getFullYear();
    
    // Nomor urut (dari id atau default)
    const nomor = doc?.id ? String(doc.id).padStart(3, '0') : '001';
    const kodeSurat = doc?.jenis_surat?.kode_surat || 'SK';
    
    return format
      .replace('{nomor}', nomor)
      .replace('{kode_surat}', kodeSurat)
      .replace('{bulan}', bulan)
      .replace('{tahun}', tahun);
  };

  // Helper function untuk normalisasi key
  const normalizeKey = (key) => key.toLowerCase().replace(/[\s_-]/g, '');
  
  // Helper function untuk get value dengan flexible matching
  const getFieldValue = (fieldName, dataSurat) => {
    // Coba exact match dulu
    if (dataSurat[fieldName]) return dataSurat[fieldName];
    
    // Buat normalized map
    const normalizedData = {};
    Object.keys(dataSurat).forEach(key => {
      const normalized = normalizeKey(key);
      normalizedData[normalized] = dataSurat[key];
    });
    
    // Cari dengan normalized key
    const normalized = normalizeKey(fieldName);
    return normalizedData[normalized] || '';
  };
  
  const renderTemplate = (template, dataSurat) => {
    let rendered = template;
    
    // Buat map dengan key yang dinormalisasi untuk pencarian
    const normalizedData = {};
    Object.keys(dataSurat).forEach(key => {
      const normalized = normalizeKey(key);
      normalizedData[normalized] = dataSurat[key];
    });
    
    // Replace placeholders dengan flexible matching
    // Replace (key) format
    rendered = rendered.replace(/\(([^)]+)\)/g, (match, key) => {
      const normalized = normalizeKey(key);
      const value = normalizedData[normalized] || dataSurat[key];
      return value || match;
    });
    
    // Replace {{key}} format
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const normalized = normalizeKey(key);
      const value = normalizedData[normalized] || dataSurat[key];
      return value || match;
    });
    
    // Replace [key] format
    rendered = rendered.replace(/\[([^\]]+)\]/g, (match, key) => {
      const normalized = normalizeKey(key);
      const value = normalizedData[normalized] || dataSurat[key];
      return value || match;
    });
    
    // Replace variables yang belum terisi dengan placeholder
    rendered = rendered.replace(/\((\w+)\)/g, '[Data $1]');
    rendered = rendered.replace(/\{\{(\w+)\}\}/g, '[Data $1]');
    rendered = rendered.replace(/\[(\w+)\]/g, '[Data $1]');
    
    return rendered;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <p>Memuat konfigurasi...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  // Support both prop names: `pengajuan` (older) or `surat` (current)
  const doc = pengajuan || surat || {};

  // Safely parse data_surat and fields using helper functions
  const dataSurat = safeParseDataSurat(doc.data_surat);
  const fields = safeParseFields(doc.jenis_surat?.fields);

  // DEBUG: Log data untuk troubleshooting
  console.log('📄 PreviewSurat - Document:', doc);
  console.log('📊 PreviewSurat - Data Surat (parsed):', dataSurat);
  console.log('📋 PreviewSurat - Fields (parsed):', fields);
  console.log('🔍 PreviewSurat - Jenis Surat:', doc.jenis_surat);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 no-print">
      <div className="relative top-0 md:top-10 mx-auto p-2 md:p-5 border-0 md:border w-full max-w-full md:max-w-4xl shadow-none md:shadow-lg rounded-none md:rounded-md bg-white mb-0 md:mb-10 min-h-screen md:min-h-0 print:p-0 print:border-0 print:shadow-none print:max-w-none print:m-0">
        {/* Tombol Aksi */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-4 p-3 md:p-0 border-b md:border-b-0 shadow-sm md:shadow-none print:hidden">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Preview Surat</h3>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <FiX className="w-4 h-4" />
              <span className="hidden sm:inline">Tutup</span>
            </button>
          </div>
        </div>

        {/* Preview Surat - Responsive A4 Format */}
        <div 
          id="surat-preview" 
          className="bg-white mx-auto print:border-0"
          style={{
            borderColor: '#ccc',
            fontFamily: 'Arial, sans-serif',
            // Mobile: full width dengan padding kecil, Desktop: A4 size
            width: '100%',
            maxWidth: '210mm',
            padding: '10mm 8mm', // Lebih kecil untuk mobile
            boxSizing: 'border-box'
          }}
        >
          {/* Header/Kop Surat */}
          <div 
            style={{
              position: 'relative',
              minHeight: '70px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'row'
            }}
          >
            {/* Logo - Smaller on mobile */}
            <div style={{ 
              width: 'clamp(50px, 15vw, 90px)', // Responsive: 50px min, 90px max
              flexShrink: 0,
              paddingTop: '0'
            }}>
              <img 
                src="/assets/Lambang_Kabupaten_Bogor.png"
                alt="Logo Kabupaten"
                style={{ 
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1',
                  objectFit: 'contain',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.src = '/src/assets/Lambang_Kabupaten_Bogor.png';
                }}
              />
            </div>
            
            {/* Kop Surat - Responsive text */}
            <div style={{ 
              flex: 1, 
              textAlign: 'center', 
              paddingTop: '2px',
              paddingLeft: '8px',
              paddingRight: 'clamp(50px, 15vw, 90px)' // Match logo width
            }}>
              <h2 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(12px, 3.5vw, 20px)', // Responsive font
                  lineHeight: '1.2', 
                  margin: '0', 
                  padding: '0' 
                }}
              >
                {config.nama_kabupaten}
              </h2>
              <h3 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(11px, 3vw, 18px)', 
                  lineHeight: '1.2', 
                  margin: '2px 0', 
                  padding: '0' 
                }}
              >
                {config.nama_kecamatan}
              </h3>
              <h3 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(12px, 3.5vw, 20px)', 
                  lineHeight: '1.2', 
                  margin: '2px 0 4px 0', 
                  padding: '0' 
                }}
              >
                {config.nama_desa}
              </h3>
              <p 
                style={{ 
                  fontSize: 'clamp(8px, 2vw, 11px)', 
                  lineHeight: '1.3', 
                  margin: '0', 
                  padding: '0' 
                }}
              >
                {config.alamat_kantor}
              </p>
              {config.telepon && (
                <p style={{ 
                  fontSize: 'clamp(8px, 2vw, 11px)', 
                  lineHeight: '1.3', 
                  margin: '0', 
                  padding: '0' 
                }}>
                  Telp: {config.telepon}{config.email ? ` Email: ${config.email}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Garis Kop - Thinner on mobile */}
          <hr style={{ 
            border: 'none', 
            borderTop: 'clamp(2px, 0.5vw, 4px) solid #000', 
            margin: '0 0 12px 0' 
          }} />

          {/* Judul Surat - Responsive */}
          <div className="text-center" style={{ marginBottom: '12px', marginTop: '12px' }}>
            <h4 
              className="font-bold uppercase underline"
              style={{ 
                fontSize: 'clamp(13px, 3.5vw, 16px)', 
                marginBottom: '6px' 
              }}
            >
              {doc.jenis_surat?.nama_surat || 'SURAT KETERANGAN'}
            </h4>
            <p 
              className="font-semibold"
              style={{ 
                fontSize: 'clamp(11px, 3vw, 14px)' 
              }}
            >
              Nomor : {generateNomorSurat(doc)}
            </p>
          </div>

          {/* Isi Surat - Responsive */}
          <div 
            style={{ 
              fontSize: 'clamp(11px, 3vw, 14px)',
              lineHeight: '1.7'
            }}
          >
            <p className="text-justify" style={{ marginBottom: '10px' }}>
              {doc.jenis_surat?.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}
            </p>

            {/* Data Pemohon - Responsive layout */}
            {fields && fields.length > 0 && (
              <div style={{ 
                marginLeft: 'clamp(15px, 4vw, 30px)', 
                marginBottom: '10px' 
              }}>
                {(() => {
                  console.log('📋 All Fields:', fields);
                  const filteredFields = fields.filter(field => field.showInDocument !== false);
                  console.log('✅ Filtered Fields (yang akan ditampilkan):', filteredFields);
                  console.log('🚫 Hidden Fields (yang tidak ditampilkan):', fields.filter(field => field.showInDocument === false));
                  return filteredFields;
                })()
                  .map((field, index) => {
                    const value = getFieldValue(field.name, dataSurat);
                    console.log(`🔍 Rendering Field "${field.label}" (${field.name}):`, value || '[KOSONG]');
                    return (
                      <div key={index} className="flex flex-wrap" style={{ marginBottom: '3px' }}>
                        <div style={{ 
                          width: 'clamp(100px, 30vw, 150px)',
                          minWidth: '100px' 
                        }}>
                          {field.label}
                        </div>
                        <div style={{ 
                          width: 'clamp(15px, 3vw, 20px)', 
                          textAlign: 'center',
                          minWidth: '15px'
                        }}>
                          :
                        </div>
                        <div className="flex-1" style={{ minWidth: '120px' }}>
                          {value || `[${field.label}]`}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* Template Konten - Responsive */}
            <div 
              className="text-justify"
              style={{ 
                whiteSpace: 'pre-line',
                marginTop: '10px'
              }}
              dangerouslySetInnerHTML={{ 
                __html: renderTemplate(doc.jenis_surat?.template_konten || '', dataSurat) 
              }}
            />

            {/* Keperluan - Responsive */}
            {doc.keperluan && (
              <p className="text-justify" style={{ marginTop: '10px' }}>
                Demikian surat keterangan ini dibuat untuk dipergunakan sebagai {doc.keperluan}.
              </p>
            )}
          </div>

          {/* Status Badges untuk Preview */}
          {doc.status_surat && (
            <div className="mt-6 print:hidden">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  doc.status_surat === 'disetujui' ? 'bg-green-100 text-green-800' :
                  doc.status_surat === 'diverifikasi' ? 'bg-blue-100 text-blue-800' :
                  doc.status_surat === 'menunggu_verifikasi' ? 'bg-yellow-100 text-yellow-800' :
                  doc.status_surat === 'ditolak' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status_surat.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Tanda Tangan - Responsive */}
          <div style={{ marginTop: 'clamp(20px, 5vw, 35px)' }} className="flex justify-end">
            <div className="text-center" style={{ width: 'clamp(150px, 40vw, 220px)' }}>
              <p style={{ 
                fontSize: 'clamp(11px, 3vw, 14px)', 
                marginBottom: 'clamp(30px, 8vw, 50px)' 
              }}>
                {getCurrentDate(doc)}
              </p>
              <p style={{ 
                fontSize: 'clamp(11px, 3vw, 14px)', 
                marginBottom: '6px' 
              }}>
                {config.jabatan_ttd}
              </p>
              
              <p 
                style={{ 
                  fontSize: 'clamp(11px, 3vw, 14px)', 
                  marginTop: 'clamp(40px, 10vw, 70px)' 
                }}
                className="font-bold"
              >
                {config.nama_ttd}
              </p>
              {config.nip_ttd && (
                <p style={{ 
                  fontSize: 'clamp(9px, 2.5vw, 11px)', 
                  marginTop: '4px' 
                }}>
                  NIP. {config.nip_ttd}
                </p>
              )}
            </div>
          </div>

          {/* Footer - Responsive */}
          {config.footer_text && (
            <div 
              className="mt-6 pt-3 text-center"
              style={{ 
                fontSize: 'clamp(8px, 2vw, 10px)',
                borderTop: '1px solid #000'
              }}
            >
              {config.footer_text}
            </div>
          )}
        </div>
      </div>

      {/* Responsive & Print Styles */}
      <style>{`
        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          #surat-preview {
            font-size: 11px !important;
            padding: 8mm 6mm !important;
          }
          
          /* Prevent horizontal scroll */
          #surat-preview * {
            max-width: 100%;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          /* Better spacing on mobile */
          #surat-preview p {
            margin-bottom: 8px !important;
          }
          
          /* Responsive table/field layout */
          #surat-preview .flex {
            display: flex !important;
            flex-wrap: wrap;
          }
        }
        
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 20mm;
          }
          
          /* Hide everything except this modal */
          body > div:not(:has(#surat-preview)) {
            display: none !important;
          }
          
          /* Hide sidebar */
          aside {
            display: none !important;
          }
          
          /* Make modal full page */
          body, html {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: visible;
          }
          
          /* Reset modal container */
          .fixed.inset-0 {
            position: static !important;
            background: white !important;
            z-index: auto !important;
          }
          
          /* Hide buttons and header */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Reset all responsive clamp() to fixed sizes for print */
          #surat-preview {
            font-size: 14px !important;
            padding: 15mm 20mm !important;
            width: 210mm !important;
            max-width: 210mm !important;
          }
          
          /* Reset header sizes */
          #surat-preview h2 {
            font-size: 20px !important;
          }
          
          #surat-preview h3 {
            font-size: 18px !important;
          }
          
          #surat-preview h4 {
            font-size: 16px !important;
          }
          
          #surat-preview p {
            font-size: 14px !important;
          }
          
          /* Only show surat */
          #surat-preview {
            border: none !important;
            margin: 0 !important;
            padding: 10mm 20mm !important;
            width: 210mm !important;
            min-height: 297mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewSurat;

