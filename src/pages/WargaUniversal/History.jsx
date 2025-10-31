import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const WargaUniversalHistory = () => {
  const [loading, setLoading] = useState(false);
  const [suratList, setSuratList] = useState([]);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Filter tanggal
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadHistory();
  }, [tanggalMulai, tanggalAkhir]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warga-universal/surat', {
        params: {
          tanggal_mulai: tanggalMulai,
          tanggal_akhir: tanggalAkhir
        }
      });

      if (response.data.success) {
        setSuratList(response.data.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Gagal memuat riwayat surat');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (suratId) => {
    try {
      const response = await api.get(`/warga-universal/surat/${suratId}`);
      
      if (response.data.success) {
        const surat = response.data.data;
        setSelectedSurat(surat);
        
        // Generate preview content
        const dataSurat = JSON.parse(surat.data_surat || '{}');
        const fields = JSON.parse(surat.fields || '[]');
        let content = surat.template_konten || '';
        let kalimatPembuka = surat.kalimat_pembuka || '';

        // Replace placeholders
        Object.keys(dataSurat).forEach(key => {
          const placeholder = new RegExp(`{{${key}}}`, 'gi');
          kalimatPembuka = kalimatPembuka.replace(placeholder, dataSurat[key] || '');
          content = content.replace(placeholder, dataSurat[key] || '');
        });

        const previewHTML = `
          <html>
            <head>
              <title>${surat.nama_surat} - ${surat.nomor_surat}</title>
              <style>
                @media print {
                  @page { size: A4; margin: 2cm; }
                  body { font-family: 'Times New Roman', serif; }
                }
                body {
                  font-family: 'Times New Roman', serif;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: bold;">PEMERINTAH KABUPATEN</h2>
                <h2 style="margin: 0; font-size: 18px; font-weight: bold;">KECAMATAN</h2>
                <h1 style="margin: 10px 0; font-size: 20px; font-weight: bold;">KANTOR DESA</h1>
                <hr style="border: 2px solid black; margin: 10px 0;" />
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <h3 style="text-decoration: underline; font-weight: bold; font-size: 16px;">${surat.nama_surat}</h3>
                <p style="margin: 5px 0;">Nomor: ${surat.nomor_surat}</p>
              </div>

              <div style="text-align: justify; line-height: 1.8; font-size: 14px; margin: 20px 0;">
                <p>${kalimatPembuka}</p>
                ${content}
              </div>

              <div style="margin-top: 50px; text-align: right;">
                <p>Dibuat di: [Nama Desa]</p>
                <p>Pada tanggal: ${new Date(surat.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <br/><br/><br/>
                <p style="font-weight: bold;">Kepala Desa</p>
                <br/><br/>
                <p>([Nama Kepala Desa])</p>
              </div>
            </body>
          </html>
        `;

        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(previewHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        
        toast.success('Surat siap dicetak');
      }
    } catch (error) {
      console.error('Error printing surat:', error);
      toast.error('Gagal mencetak surat');
    }
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setTanggalMulai(today);
    setTanggalAkhir(today);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Surat</h1>

        {/* Filter Tanggal */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSetToday}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Hari Ini
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Surat</p>
            <p className="text-2xl font-bold text-blue-600">{suratList.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Periode</p>
            <p className="text-sm font-semibold text-green-600">
              {new Date(tanggalMulai).toLocaleDateString('id-ID')} - {new Date(tanggalAkhir).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-sm font-semibold text-purple-600">Semua Selesai</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : suratList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-600">Tidak ada surat pada periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Surat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Pemohon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Surat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suratList.map((surat) => (
                  <tr key={surat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(surat.tanggal_pengajuan).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {surat.nomor_surat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {surat.nik}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {surat.nama_pemohon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {surat.nama_surat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handlePrint(surat.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WargaUniversalHistory;

