import { FiX } from 'react-icons/fi';
import { safeParseDataSurat } from '../utils/jsonHelpers';

const PreviewFormulirF102 = ({ pengajuan, onClose }) => {
  const doc = pengajuan || {};
  const dataSurat = safeParseDataSurat(doc.data_surat);

  const handlePrint = () => {
    window.print();
  };

  // Helper untuk cek checkbox
  const isChecked = (fieldName) => {
    return dataSurat[fieldName] === true || dataSurat[fieldName] === 'true' || dataSurat[fieldName] === 1;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 no-print">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10 print:p-0 print:border-0 print:shadow-none print:max-w-none print:m-0">
        
        {/* Tombol Aksi */}
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h3 className="text-lg font-bold text-gray-900">Preview Formulir F-1.02</h3>
          <div className="space-x-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary text-sm"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Tutup
            </button>
          </div>
        </div>

        {/* Formulir F-1.02 */}
        <div 
          id="formulir-f102" 
          className="bg-white mx-auto print:border-0"
          style={{
            fontFamily: 'Arial, sans-serif',
            width: '210mm',
            minHeight: '297mm',
            maxWidth: '210mm',
            padding: '20mm',
            boxSizing: 'border-box',
            fontSize: '11px'
          }}
        >
          {/* Header dengan nomor formulir */}
          <div style={{ textAlign: 'right', marginBottom: '15px' }}>
            <div style={{ 
              border: '1px solid #000', 
              display: 'inline-block', 
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              F-1.02
            </div>
          </div>

          {/* Judul */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              margin: 0,
              textTransform: 'uppercase'
            }}>
              FORMULIR PENDAFTARAN PERISTIWA KEPENDUDUKAN
            </h2>
          </div>

          {/* I. DATA PEMOHON */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>I. DATA PEMOHON</strong>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '30px', padding: '4px 8px' }}>1</td>
                  <td style={{ width: '200px', padding: '4px 8px' }}>NAMA LENGKAP</td>
                  <td style={{ padding: '4px 8px' }}>:</td>
                  <td style={{ 
                    padding: '4px 8px', 
                    borderBottom: '1px solid #000'
                  }}>
                    {dataSurat.nama_lengkap || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px' }}>2</td>
                  <td style={{ padding: '4px 8px' }}>NOMOR INDUK KEPENDUDUKAN</td>
                  <td style={{ padding: '4px 8px' }}>:</td>
                  <td style={{ 
                    padding: '4px 8px', 
                    borderBottom: '1px solid #000'
                  }}>
                    {dataSurat.nomor_induk_kependudukan || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px' }}>3</td>
                  <td style={{ padding: '4px 8px' }}>NOMOR KARTU KELUARGA</td>
                  <td style={{ padding: '4px 8px' }}>:</td>
                  <td style={{ 
                    padding: '4px 8px', 
                    borderBottom: '1px solid #000'
                  }}>
                    {dataSurat.nomor_kartu_keluarga || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px' }}>4</td>
                  <td style={{ padding: '4px 8px' }}>NOMOR HANDPHONE</td>
                  <td style={{ padding: '4px 8px' }}>:</td>
                  <td style={{ 
                    padding: '4px 8px', 
                    borderBottom: '1px solid #000'
                  }}>
                    {dataSurat.nomor_handphone || ''}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px' }}>5</td>
                  <td style={{ padding: '4px 8px' }}>ALAMAT EMAIL</td>
                  <td style={{ padding: '4px 8px' }}>:</td>
                  <td style={{ 
                    padding: '4px 8px', 
                    borderBottom: '1px solid #000'
                  }}>
                    {dataSurat.alamat_email || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* II. JENIS PERMOHONAN - Table Format */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>II. JENIS PERMOHONAN</strong>
            </div>
            
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              border: '1px solid #000'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '5%',
                    textAlign: 'center',
                    fontSize: '10px'
                  }}>I</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '28%',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>KARTU KELUARGA</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '5%',
                    textAlign: 'center',
                    fontSize: '10px'
                  }}>II</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '20%',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>KTP-El</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '5%',
                    textAlign: 'center',
                    fontSize: '10px'
                  }}>III</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '20%',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>KARTU IDENTITAS ANAK / KIA</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '5%',
                    textAlign: 'center',
                    fontSize: '10px'
                  }}>IV</th>
                  <th style={{ 
                    border: '1px solid #000', 
                    padding: '6px', 
                    width: '12%',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>PERUBAHAN DATA</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Headers A. BARU untuk semua kolom */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>BARU</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>BARU</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>A</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>BARU</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }} rowSpan="3">A</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }} rowSpan="3">KK</td>
                </tr>
                
                {/* Row 2: KK A.1 | KTP-el (kosong) | KIA (kosong) | Perubahan Data (rowspan dari row 1) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_membentuk_keluarga_baru') ? '#000' : 'transparent'
                      }}></span>
                      Membentuk Keluarga Baru
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
                
                {/* Row 3: KK A.2 | KTP-el B (PINDAH DATANG) | KIA B (HILANG/RUSAK) | Perubahan Data (rowspan dari row 1) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>2</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_penggantian_kepala_keluarga') ? '#000' : 'transparent'
                      }}></span>
                      Penggantian Kepala Keluarga
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>PINDAH DATANG</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>HILANG/ RUSAK</td>
                </tr>
                
                {/* Row 4: KK A.3 | KTP-el (kosong) | KIA 1 (Hilang) | Perubahan Data B (KTP-El) dengan rowspan=2 */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>3</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_pisah_kk') ? '#000' : 'transparent'
                      }}></span>
                      Pisah KK
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>1.</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>Hilang</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }} rowSpan="2">B</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }} rowSpan="2">KTP-El</td>
                </tr>
                
                {/* Row 5: KK A.4 | KTP-el C (HILANG/RUSAK) | KIA 2 (Rusak) | Perubahan Data (rowspan dari row 4) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>4</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_pindah_datang') ? '#000' : 'transparent'
                      }}></span>
                      Pindah Datang
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>C</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>HILANG/RUSAK</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>2.</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>Rusak</td>
                </tr>
                
                {/* Row 6: KK A.5 | KTP-el 1 (Hilang) | KIA (kosong) | Perubahan Data C (KIA) dengan rowspan */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>5</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_wni_ln_karena_pindahan') ? '#000' : 'transparent'
                      }}></span>
                      WNI dari LN karena Pindahan
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>1.</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>Hilang</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }} rowSpan="5">C</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }} rowSpan="5">
                    <div>KIA</div>
                    <div style={{ fontSize: '8px', fontWeight: 'normal', marginTop: '4px' }}>
                      Melampirkan:<br/>
                      1) Formulir Perubahan Data, dan<br/>
                      2) Bukti Perubahan Data
                    </div>
                  </td>
                </tr>
                
                {/* Row 7: KK A.6 | KTP-el 2 (Rusak) | KIA C (Perpanjangan ITAP) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>6</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_rentan_adminduk') ? '#000' : 'transparent'
                      }}></span>
                      Rentan Adminduk
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>2.</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>Rusak</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>C</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>Perpanjangan ITAP</td>
                </tr>
                
                {/* Row 8: KK B (PERUBAHAN DATA) | KTP-el (kosong) | KIA (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>B</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>PERUBAHAN DATA</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
                
                {/* Row 9: KK B.1 | KTP-el D (PERPANJANGAN ITAP) | KIA D (Lainnya) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_menumpang_dalam_kk') ? '#000' : 'transparent'
                      }}></span>
                      Menumpang dalam KK
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>D</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>PERPANJANGAN ITAP</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>D</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>Lainnya</td>
                </tr>
                
                {/* Row 10: KK B.2 | KTP-el (kosong) | KIA (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>2</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_peristiwa_penting') ? '#000' : 'transparent'
                      }}></span>
                      Peristiwa Penting
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
                
                {/* Row 11: KK B.3 | KTP-el E (PERUBAHAN STATUS KEWARGANEGARAAN) | KIA (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>3</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_perubahan_elemen_data_tercantum') ? '#000' : 'transparent'
                      }}></span>
                      Perubahan elemen data yang tercantum dalam KK
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>E</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>PERUBAHAN STATUS KEWARGANEGARAAN</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
                
                {/* Row 12: KK C (HILANG/RUSAK) | KTP-el F (LUAR DOMISILI) | KIA (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>C</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>HILANG/ RUSAK</td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>F</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>LUAR DOMISILI</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
                
                {/* Row 13: KK C.1 (Hilang) | KTP-el (kosong) | KIA (kosong) | Perubahan Data (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_hilang_rusak_hilang') ? '#000' : 'transparent'
                      }}></span>
                      Hilang
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }} rowSpan="2"></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }} rowSpan="2"></td>
                </tr>
                
                {/* Row 14: KK C.2 (Rusak) | KTP-el G (TRANSMIGRASI) | KIA (kosong) */}
                <tr>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>2</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontSize: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '12px', 
                        border: '1px solid #000',
                        marginRight: '6px',
                        backgroundColor: isChecked('kk_hilang_rusak_rusak') ? '#000' : 'transparent'
                      }}></span>
                      Rusak
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>G</td>
                  <td style={{ border: '1px solid #000', padding: '4px', fontWeight: 'bold' }}>TRANSMIGRASI</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* III. PERSYARATAN YANG DILAMPIRKAN */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>III. PERSYARATAN YANG DILAMPIRKAN</strong>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px' }}>
              {/* Kolom Kiri */}
              <div>
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_kk_lama') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  KK Lama/ KK Rusak/Hilang
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_buku_nikah') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Buku Nikah/ Kutipan Akta Perkawinan
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_kutipan_akta_perceraian') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Kutipan Akta Perceraian
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_kutipan_akta_kematian') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Kutipan Akta Kematian
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_keterangan_pindah') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Keterangan Pindah Luar Negeri
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_ktp_el_rusak') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  KTP-El Rusak
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_dokumen_perjalanan') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Dokumen Perjalanan
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_keterangan_hilang') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Keterangan Hilang dari Kepolisian
                </div>
              </div>
              
              {/* Kolom Kanan */}
              <div>
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_keterangan_bukti_perubahan') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Keterangan/Bukti Perubahan Peristiwa Kependudukan dan Peristiwa Penting
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_ktp_el_kewarganegaraan') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  KTP-El kewarganegaraan ganda/asing atau KTP-El pencabutan status kewarganegaraan
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_akta_kematian') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Akta Kematian
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_pernyataan_pindah') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Pernyataan tersedia menerima sebagai anggota keluarga
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_pernyataan_hilang_rusak') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Keterangan Pindah dan Perwalian RI
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_pernyataan_kepala_daerah') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat Pernyataan bersama menerima sebagai anggota keluarga
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_surat_kuasa_pengasuhan') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Surat kuasa pengasuhan anak dari orang tua/i wali
                </div>
                
                <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '10px', 
                    height: '10px', 
                    border: '1px solid #000',
                    borderRadius: '50%',
                    marginRight: '6px',
                    position: 'relative'
                  }}>
                    {isChecked('persyaratan_kartu_im_tinggal_tetap') && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '6px',
                        height: '6px',
                        backgroundColor: '#000',
                        borderRadius: '50%'
                      }}></span>
                    )}
                  </span>
                  Kartu Ijin Tinggal Tetap
                </div>
              </div>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div style={{ marginTop: '40px', fontSize: '11px' }}>
            {/* Tanggal dan Tempat */}
            <div style={{ textAlign: 'right', marginBottom: '60px' }}>
              Bogor, ....................................20....
            </div>
            
            {/* Petugas dan Pemohon */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '45%' }}>
                <div style={{ marginBottom: '80px' }}>Petugas,</div>
                <div style={{ 
                  borderBottom: '1px solid #000', 
                  width: '200px'
                }}></div>
                <div style={{ marginTop: '3px' }}>(...............................................)</div>
              </div>
              
              <div style={{ width: '45%', textAlign: 'left' }}>
                <div style={{ marginBottom: '80px' }}>Pemohon,</div>
                <div style={{ 
                  borderBottom: '1px solid #000', 
                  width: '200px'
                }}></div>
                <div style={{ marginTop: '3px' }}>(...............................................)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body, html {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          #formulir-f102 {
            margin: 0 !important;
            padding: 20mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewFormulirF102;
