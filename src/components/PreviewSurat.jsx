import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiX } from 'react-icons/fi';
import { safeParseDataSurat, safeParseFields } from '../utils/jsonHelpers';

const PreviewSurat = ({ pengajuan, surat, onClose }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get paper size from surat (jenis_surat), default to A4
  const paperSize = surat?.paper_size || 'a4';
  
  // Paper size configuration
  const paperConfig = {
    a4: {
      maxWidth: '210mm',
      padding: '12mm 18mm',
      minHeight: '297mm'
    },
    legal: {
      maxWidth: '215.9mm',
      padding: '15mm 20mm',
      minHeight: '355.6mm'
    }
  };
  
  const paper = paperConfig[paperSize] || paperConfig.a4;

  useEffect(() => {
    fetchKonfigurasi();
  }, []);

  const fetchKonfigurasi = async () => {
    try {
      const response = await api.get('/auth/konfigurasi');
      if (response.data.success) {
        const configData = response.data.data;
        
        // Fetch nama RT/RW berdasarkan penandatangan dari jenis_surat
        if (surat && surat.penandatangan) {
          const penandatangan = typeof surat.penandatangan === 'string' 
            ? JSON.parse(surat.penandatangan) 
            : surat.penandatangan;
            
          for (const ttd of penandatangan) {
            if (ttd.jabatan === 'ketua_rt' && ttd.rt_number) {
              try {
                const rtResponse = await api.get(`/admin/rt-name/${ttd.rt_number}`);
                if (rtResponse.data.success) {
                  configData[`nama_rt_${ttd.rt_number}`] = rtResponse.data.nama;
                }
              } catch (err) {
                console.error('Error fetching RT name:', err);
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
              }
            }
          }
        }
        
        setConfig(configData);
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

  const renderSignatureLayout = (doc, config) => {
    const jenisSurat = doc?.jenis_surat || {};
    const penandatangan = jenisSurat.penandatangan || [{
      jabatan: 'kepala_desa',
      label: config.jabatan_ttd,
      posisi: 'kanan_bawah',
      required: true
    }];
    const layout = jenisSurat.layout_ttd || '1_kanan';
    const showMaterai = jenisSurat.show_materai || false;

    // Parse penandatangan if it's a string
    let signatories = [];
    try {
      signatories = typeof penandatangan === 'string' ? JSON.parse(penandatangan) : penandatangan;
    } catch (e) {
      signatories = [{
        jabatan: 'kepala_desa',
        label: config.jabatan_ttd,
        posisi: 'kanan_bawah',
        required: true
      }];
    }

    // Default jika tidak ada data
    if (!signatories || signatories.length === 0) {
      signatories = [{
        jabatan: 'kepala_desa',
        label: config.jabatan_ttd,
        posisi: 'kanan_bawah',
        required: true
      }];
    }

    // Helper untuk render single TTD box
    const SignatureBox = ({ data, withDate = false }) => {
      // Get nama dan NIP berdasarkan jabatan
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
      } else if (data.jabatan === 'ketua_rt' && data.rt_number) {
        nama = config?.[`nama_rt_${data.rt_number}`] || `KETUA RT ${data.rt_number}`;
      } else if (data.jabatan === 'ketua_rw' && data.rw_number) {
        nama = config?.[`nama_rw_${data.rw_number}`] || `KETUA RW ${data.rw_number}`;
      }
      
      return (
        <div style={{ 
          textAlign: 'center',
          width: 'clamp(150px, 40vw, 220px)', 
          flex: layout === '2_horizontal' || layout === '3_horizontal' ? 1 : 'none',
          flexShrink: 0
        }}>
          {withDate && (
            <p style={{ 
              fontSize: 'clamp(11px, 3vw, 14px)', 
              marginBottom: 'clamp(8px, 2vw, 10px)' 
            }}>
              {getCurrentDate(doc)}
            </p>
          )}
          {config.isSekretaris && data.jabatan === 'sekretaris_desa' && (
            <p style={{ 
              fontSize: 'clamp(11px, 3vw, 14px)', 
              marginBottom: '2px' 
            }}>
              a.n Kepala Desa {config.nama_desa_penandatangan || 'Cibadak'}
            </p>
          )}
          <p style={{ 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            marginBottom: '4px' 
          }}>
            {data.label || config.jabatan_ttd}
          </p>
          <div style={{ height: 'clamp(30px, 7vw, 50px)' }}></div>
          <p 
            style={{ 
              fontSize: 'clamp(11px, 3vw, 14px)', 
              marginTop: 'clamp(5px, 2vw, 10px)',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            {nama}
          </p>
          {nip && (
            <p style={{ 
              fontSize: 'clamp(9px, 2.5vw, 11px)', 
              marginTop: '3px' 
            }}>
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
        width: 'clamp(100px, 30vw, 150px)' 
      }}>
        <p style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', marginBottom: '5px' }}>Materai</p>
        <div 
          style={{ 
            width: 'clamp(60px, 20vw, 80px)', 
            height: 'clamp(60px, 20vw, 80px)', 
            border: '2px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            fontWeight: 'bold'
          }}
        >
          Rp 10.000
        </div>
      </div>
    );

    // Layout 1: Hanya Kepala Desa di kanan
    if (layout === '1_kanan' || signatories.length === 1) {
      return (
        <div style={{ 
          marginTop: 'clamp(10px, 3vw, 18px)', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <SignatureBox data={signatories[0]} withDate={true} />
        </div>
      );
    }

    // Layout 2 Horizontal: 2 TTD sejajar
    if (layout === '2_horizontal' && signatories.length >= 2) {
      return (
        <div style={{ marginTop: 'clamp(10px, 3vw, 18px)' }}>
          <p style={{ 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            marginBottom: 'clamp(10px, 3vw, 15px)', 
            textAlign: 'right',
            paddingRight: 'clamp(150px, 40vw, 220px)'
          }}>
            {getCurrentDate(doc)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <SignatureBox data={signatories[0]} />
            <SignatureBox data={signatories[1]} />
          </div>
        </div>
      );
    }

    // Layout 3 Horizontal: 2 TTD + Materai
    if (layout === '3_horizontal') {
      return (
        <div style={{ marginTop: 'clamp(10px, 3vw, 18px)' }}>
          <p style={{ 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            marginBottom: 'clamp(10px, 3vw, 15px)', 
            textAlign: 'center' 
          }}>
            {getCurrentDate(doc)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px' }}>
            <SignatureBox data={signatories[0]} />
            {showMaterai && <MateraiBox />}
            <SignatureBox data={signatories[1] || signatories[0]} />
          </div>
        </div>
      );
    }

    // Layout 2 Vertical: 2 TTD bertingkat
    if (layout === '2_vertical' && signatories.length >= 2) {
      return (
        <div style={{ marginTop: 'clamp(10px, 3vw, 18px)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <SignatureBox data={signatories[0]} withDate={true} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SignatureBox data={signatories[1]} />
          </div>
        </div>
      );
    }

    // Layout 4 Grid: 2x2
    if (layout === '4_grid') {
      const kiriAtas = signatories.find(s => s.posisi === 'kiri_atas');
      const kiriBawah = signatories.find(s => s.posisi === 'kiri_bawah');
      const kananAtas = signatories.find(s => s.posisi === 'kanan_atas');
      const kananBawah = signatories.find(s => s.posisi === 'kanan_bawah');

      return (
        <div style={{ marginTop: 'clamp(10px, 3vw, 18px)' }}>
          <p style={{ 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            marginBottom: 'clamp(10px, 3vw, 15px)', 
            textAlign: 'center' 
          }}>
            {getCurrentDate(doc)}
          </p>
          {/* Baris 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: 'clamp(150px, 40vw, 220px)' }}>
              {kiriAtas && <SignatureBox data={kiriAtas} />}
            </div>
            <div style={{ width: 'clamp(150px, 40vw, 220px)' }}>
              {kananAtas && <SignatureBox data={kananAtas} />}
            </div>
          </div>
          {/* Baris 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ width: 'clamp(150px, 40vw, 220px)' }}>
              {kiriBawah && <SignatureBox data={kiriBawah} />}
            </div>
            <div style={{ width: 'clamp(150px, 40vw, 220px)' }}>
              {kananBawah && <SignatureBox data={kananBawah} />}
            </div>
          </div>
        </div>
      );
    }

    // Fallback: default layout (same as 1_kanan)
    return (
      <div style={{ 
        marginTop: 'clamp(10px, 3vw, 18px)', 
        display: 'flex', 
        justifyContent: 'flex-end' 
      }}>
        <SignatureBox data={signatories[0]} withDate={true} />
      </div>
    );
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 md:top-10 mx-auto p-2 md:p-5 border-0 md:border w-full max-w-full md:max-w-4xl shadow-none md:shadow-lg rounded-none md:rounded-md bg-white mb-0 md:mb-10 min-h-screen md:min-h-0">
        {/* Tombol Aksi */}
        <div className="sticky top-0 z-10 bg-white flex justify-between items-center mb-4 p-3 md:p-0 border-b md:border-b-0 shadow-sm md:shadow-none">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Preview Surat</h3>
          <div className="flex gap-2 items-center">
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
          className="bg-white mx-auto"
          style={{
            borderColor: '#ccc',
            fontFamily: 'Arial, sans-serif',
            // Fixed size untuk konsistensi dengan print
            width: '100%',
            maxWidth: paper.maxWidth,
            minHeight: paper.minHeight,
            padding: paper.padding,
            boxSizing: 'border-box',
            fontSize: '13px', // Base font size sama dengan print
            lineHeight: '1.35' // Sama dengan print
          }}
        >
          {/* Header/Kop Surat */}
          <div 
            style={{
              position: 'relative',
              minHeight: 'clamp(70px, 18vw, 95px)',
              marginBottom: 'clamp(6px, 1.5vw, 8px)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(8px, 2vw, 12px)'
            }}
          >
            {/* Logo - Responsive */}
            <div style={{ 
              width: 'clamp(60px, 15vw, 90px)', // Responsive: 60px min, 90px max
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
            
            {/* Kop Surat - Centered & Responsive */}
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              paddingTop: 'clamp(1px, 0.5vw, 2px)'
            }}>
              <h2 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(11px, 3.2vw, 18px)', // Responsive font
                  lineHeight: '1.3', 
                  margin: '0 0 2px 0', 
                  padding: '0',
                  letterSpacing: '0.3px'
                }}
              >
                {config.nama_kabupaten || 'PEMERINTAH KABUPATEN BOGOR'}
              </h2>
              <h3 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(10px, 2.8vw, 16px)', 
                  lineHeight: '1.3', 
                  margin: '0 0 2px 0', 
                  padding: '0',
                  letterSpacing: '0.3px'
                }}
              >
                {config.nama_kecamatan || 'KECAMATAN CIAMPEA'}
              </h3>
              <h3 
                className="font-bold uppercase"
                style={{ 
                  fontSize: 'clamp(10px, 2.8vw, 16px)', 
                  lineHeight: '1.3', 
                  margin: '0 0 5px 0', 
                  padding: '0',
                  letterSpacing: '0.3px'
                }}
              >
                KANTOR KEPALA {config.nama_desa || 'DESA CIBADAK'}
              </h3>
              <p 
                style={{ 
                  fontSize: 'clamp(7px, 1.8vw, 10px)', 
                  lineHeight: '1.4', 
                  margin: '0', 
                  padding: '0' 
                }}
              >
                {config.alamat_kantor || 'Kp. Cibadak Balai Desa No. 5 RT. 005/001 Desa Cibadak, Kecamatan Ciampea - Kabupaten Bogor 16620'}
              </p>
              {(config.telepon || config.email) && (
                <p style={{ 
                  fontSize: 'clamp(7px, 1.8vw, 10px)', 
                  lineHeight: '1.4', 
                  margin: '0', 
                  padding: '0' 
                }}>
                  {config.telepon ? `Telp: ${config.telepon}` : ''}{config.telepon && config.email ? ' | ' : ''}{config.email ? `Email: ${config.email}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Garis Kop - Double line effect */}
          <hr style={{ 
            border: 'none', 
            borderTop: 'clamp(2px, 0.6vw, 3px) solid #000',
            borderBottom: 'clamp(0.5px, 0.2vw, 1px) solid #000',
            height: 'clamp(3px, 0.8vw, 4px)',
            margin: '0 0 clamp(8px, 2vw, 12px) 0' 
          }} />

          {/* Judul Surat - Responsive */}
          <div className="text-center" style={{ marginBottom: '5px', marginTop: '5px' }}>
            <h4 
              className="font-bold uppercase underline"
              style={{ 
                fontSize: 'clamp(13px, 3.5vw, 16px)', 
                marginBottom: '3px' 
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
              lineHeight: '1.4'
            }}
          >
            <p className="text-justify" style={{ marginBottom: '4px' }}>
              {doc.jenis_surat?.kalimat_pembuka || `Yang bertanda tangan di bawah ini, ${config.jabatan_ttd}, dengan ini menerangkan bahwa :`}
            </p>

            {/* Data Pemohon - Responsive layout */}
            {fields && fields.length > 0 && (
              <div style={{ 
                marginLeft: 'clamp(15px, 4vw, 30px)', 
                marginBottom: '4px' 
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
                      <div key={index} className="flex flex-wrap" style={{ marginBottom: '1px' }}>
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
                marginTop: '4px'
              }}
              dangerouslySetInnerHTML={{ 
                __html: renderTemplate(doc.jenis_surat?.template_konten || '', dataSurat) 
              }}
            />

            {/* Keperluan - Responsive */}
            {doc.keperluan && (
              <p className="text-justify" style={{ marginTop: '4px' }}>
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

          {/* Tanda Tangan - Dynamic Layout */}
          {renderSignatureLayout(doc, config)}

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
        /* General table styles */
        #surat-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: inherit;
        }
        
        #surat-preview th,
        #surat-preview td {
          border: 1px solid #000;
          padding: 5px;
          text-align: left;
          vertical-align: top;
        }
        
        #surat-preview th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        #surat-preview tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        /* Compact spacing for paragraphs - DIPERBAIKI */
        #surat-preview p {
          margin: 0 0 3px 0 !important;
          padding: 0 !important;
          line-height: 1.4 !important;
        }
        
        /* Reduce space in content area - DIPERBAIKI */
        #surat-preview > div > p {
          margin: 0 0 3px 0 !important;
          padding: 0 !important;
          line-height: 1.4 !important;
        }
        
        /* Compact spacing untuk konten dari RichTextEditor - DIPERBAIKI */
        #surat-preview .text-justify p {
          margin: 0 0 3px 0 !important;
          padding: 0 !important;
          line-height: 1.4 !important;
        }
        
        /* Menghilangkan extra space dari br tag - BARU */
        #surat-preview br {
          display: block;
          margin: 0 !important;
          padding: 0 !important;
          content: "";
          line-height: 0 !important;
        }
        
        /* Heading spacing - DIPERBAIKI */
        #surat-preview .text-justify h1,
        #surat-preview .text-justify h2,
        #surat-preview .text-justify h3,
        #surat-preview .text-justify h4,
        #surat-preview .text-justify h5,
        #surat-preview .text-justify h6 {
          margin: 6px 0 3px 0 !important;
          padding: 0 !important;
          line-height: 1.2 !important;
        }
        
        /* List spacing - DIPERBAIKI */
        #surat-preview .text-justify ul,
        #surat-preview .text-justify ol {
          margin: 3px 0 !important;
          padding: 0 0 0 20px !important;
        }
        
        #surat-preview .text-justify li {
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1.4 !important;
        }
        
        /* Table spacing */
        #surat-preview .text-justify table {
          margin: 6px 0 !important;
        }
        
        /* Div spacing - BARU untuk handle div wrapper */
        #surat-preview .text-justify div {
          margin: 0 !important;
          padding: 0 !important;
        }
        
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
          
          /* Better spacing on mobile - DIPERBAIKI */
          #surat-preview p {
            margin: 0 0 4px 0 !important;
            padding: 0 !important;
            line-height: 1.4 !important;
          }
          
          /* Responsive table on mobile */
          #surat-preview table {
            font-size: 10px !important;
            margin: 8px 0 !important;
          }
          
          #surat-preview th,
          #surat-preview td {
            padding: 4px !important;
            font-size: 10px !important;
          }
          
          /* Responsive table/field layout */
          #surat-preview .flex {
            display: flex !important;
            flex-wrap: wrap;
          }
        }
        
        /* Print Styles - BARU untuk konsistensi cetak */
        @media print {
          #surat-preview {
            width: 210mm;
            padding: 12mm 18mm;
            font-size: 13px;
            line-height: 1.35;
          }
          
          /* Kompak untuk print */
          #surat-preview p {
            margin: 0 0 2px 0 !important;
            padding: 0 !important;
            line-height: 1.35 !important;
          }
          
          #surat-preview .text-justify p {
            margin: 0 0 2px 0 !important;
            padding: 0 !important;
            line-height: 1.35 !important;
          }
          
          #surat-preview br {
            line-height: 0 !important;
          }
          
          /* Hide scroll */
          body {
            overflow: visible !important;
          }
          
          /* Ensure A4 page */
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewSurat;

