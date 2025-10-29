import * as XLSX from 'xlsx';

/**
 * Export data warga to Excel file
 * @param {Array} data - Array of warga objects to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, filename = 'data-warga') => {
  if (!data || data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor');
  }

  // Prepare data for export - map to desired columns
  const exportData = data.map((item, index) => ({
    'No': index + 1,
    'NIK': item.nik || '',
    'Nama Lengkap': item.nama || '',
    'Jenis Kelamin': item.jenis_kelamin || '',
    'Tempat Lahir': item.tempat_lahir || '',
    'Tanggal Lahir': item.tanggal_lahir ? new Date(item.tanggal_lahir).toLocaleDateString('id-ID') : '',
    'Usia': item.usia ? `${item.usia} tahun` : '',
    'Agama': item.agama || '',
    'Pendidikan': item.pendidikan || '',
    'Pekerjaan': item.pekerjaan || '',
    'Status Perkawinan': item.status_perkawinan || '',
    'Golongan Darah': item.golongan_darah || '',
    'RT': item.rt || '',
    'RW': item.rw || '',
    'Dusun': item.dusun || '',
    'Alamat': item.alamat || '',
    'No. KK': item.no_kk || '',
    'Nama Kepala Keluarga': item.nama_kepala_keluarga || '',
    'Hubungan Keluarga': item.hubungan_keluarga || '',
    'No. Telepon': item.no_telepon || '',
    'Email': item.email || '',
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 18 }, // NIK
    { wch: 25 }, // Nama
    { wch: 15 }, // Jenis Kelamin
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 10 }, // Usia
    { wch: 12 }, // Agama
    { wch: 15 }, // Pendidikan
    { wch: 20 }, // Pekerjaan
    { wch: 18 }, // Status Perkawinan
    { wch: 12 }, // Golongan Darah
    { wch: 5 },  // RT
    { wch: 5 },  // RW
    { wch: 15 }, // Dusun
    { wch: 35 }, // Alamat
    { wch: 18 }, // No. KK
    { wch: 25 }, // Nama Kepala Keluarga
    { wch: 18 }, // Hubungan Keluarga
    { wch: 15 }, // No. Telepon
    { wch: 25 }, // Email
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Warga');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fullFilename);

  return fullFilename;
};

/**
 * Get filtered warga data for export
 * @param {Array} allData - All warga data
 * @param {Object} filters - Filter object containing search, rt, rw, etc.
 */
export const getFilteredDataForExport = (allData, filters) => {
  let filtered = [...allData];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      (item.nik && item.nik.toLowerCase().includes(searchLower)) ||
      (item.nama && item.nama.toLowerCase().includes(searchLower)) ||
      (item.alamat && item.alamat.toLowerCase().includes(searchLower))
    );
  }

  // Apply RT filter
  if (filters.rt) {
    filtered = filtered.filter(item => item.rt === filters.rt);
  }

  // Apply RW filter
  if (filters.rw) {
    filtered = filtered.filter(item => item.rw === filters.rw);
  }

  // Apply Jenis Kelamin filter
  if (filters.jenis_kelamin) {
    filtered = filtered.filter(item => item.jenis_kelamin === filters.jenis_kelamin);
  }

  // Apply Pekerjaan filter
  if (filters.pekerjaan) {
    filtered = filtered.filter(item => item.pekerjaan === filters.pekerjaan);
  }

  return filtered;
};
