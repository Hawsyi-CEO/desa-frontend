# Panduan Update DataWarga.jsx

## Perubahan yang Perlu Dilakukan:

### 1. Import Library Excel
Tambahkan di bagian atas file (setelah import lainnya):
```jsx
import { Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
```

### 2. Tambahkan State untuk Export
Tambahkan di bagian state (sekitar baris 30):
```jsx
const [exporting, setExporting] = useState(false);
```

### 3. Tambahkan Fungsi Export
Tambahkan setelah fungsi handleResetFilters:
```jsx
const handleExportExcel = async () => {
  try {
    setExporting(true);
    
    // Get all data with current filters
    const params = {
      page: 1,
      limit: 999999, // Get all data
      search,
      rt: filterRt,
      rw: filterRw,
      jenis_kelamin: filterJenisKelamin,
      pekerjaan: filterPekerjaan
    };

    const response = await api.get('/admin/warga', { params });
    
    if (response.data.success && response.data.data.length > 0) {
      // Create filename based on filters
      let filename = 'data-warga';
      if (filterRt) filename += `_RT${filterRt}`;
      if (filterRw) filename += `_RW${filterRw}`;
      if (filterJenisKelamin) filename += `_${filterJenisKelamin}`;
      
      const exportedFile = exportToExcel(response.data.data, filename);
      success(`Data berhasil diekspor ke ${exportedFile}`);
    } else {
      error('Tidak ada data untuk diekspor');
    }
  } catch (err) {
    console.error('Error exporting:', err);
    error('Gagal mengekspor data: ' + (err.response?.data?.message || err.message));
  } finally {
    setExporting(false);
  }
};
```

### 4. Ubah Stats Cards ke Navy & Slate Theme
Ganti warna gradient stats cards (sekitar baris 165-220):

**Dari:**
```jsx
from-blue-500 to-blue-600    // Total Warga
from-green-500 to-green-600  // Laki-laki
from-pink-500 to-pink-600    // Perempuan
from-purple-500 to-purple-600 // Total KK
```

**Menjadi:**
```jsx
from-slate-700 to-slate-900    // Total Warga
from-blue-800 to-blue-950      // Laki-laki
from-green-600 to-green-700    // Perempuan
from-gray-600 to-gray-700      // Total KK
```

### 5. Ubah Tombol "Tambah Warga" ke Navy & Slate
Ganti (sekitar baris 158):

**Dari:**
```jsx
from-blue-600 to-blue-700
```

**Menjadi:**
```jsx
from-slate-700 to-slate-800
```

### 6. Tambahkan Tombol Export Excel
Tambahkan setelah tombol "Tambah Warga" (sekitar baris 160):

```jsx
<div className="flex gap-3">
  <button
    onClick={handleExportExcel}
    disabled={exporting || loading || warga.length === 0}
    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Download className="w-5 h-5" />
    <span>{exporting ? 'Mengekspor...' : 'Export Excel'}</span>
  </button>
  
  <button
    onClick={() => setShowAddModal(true)}
    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
  >
    <UserPlus className="w-5 h-5" />
    <span>Tambah Warga</span>
  </button>
</div>
```

### 7. Ubah Filter Button ke Navy & Slate
Ganti warna button filter (sekitar baris 248):

**Dari:**
```jsx
showFilters 
  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
```

**Menjadi:**
```jsx
showFilters 
  ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-lg' 
  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
```

### 8. Ubah Pagination Theme
Ganti warna pagination (sekitar baris 550-600):

**Dari:**
```jsx
bg-blue-50 px-4 py-2 rounded-lg border border-blue-100  // Info box
text-blue-600  // Numbers
bg-gradient-to-br from-blue-600 to-blue-700  // Active page
hover:bg-blue-50 hover:border-blue-500  // Hover
bg-blue-600 text-white hover:bg-blue-700  // View All button
```

**Menjadi:**
```jsx
bg-slate-50 px-4 py-2 rounded-lg border border-slate-200  // Info box
text-slate-700  // Numbers
bg-gradient-to-br from-slate-700 to-slate-900  // Active page
hover:bg-slate-50 hover:border-slate-700  // Hover
bg-slate-700 text-white hover:bg-slate-800  // View All button
```

### 9. Ubah Modal Header (AddWargaModal)
Ganti gradient header di AddWargaModal (sekitar baris 1200):

**Dari:**
```jsx
bg-gradient-to-r from-blue-600 to-blue-700
bg-blue-50 border-l-4 border-blue-600  // Info box
bg-blue-600  // Icon background
text-blue-800, text-blue-900  // Text colors
from-blue-600 to-blue-700  // Submit button
```

**Menjadi:**
```jsx
bg-gradient-to-r from-slate-700 via-slate-800 to-blue-900
bg-slate-50 border-l-4 border-slate-700  // Info box
bg-slate-700  // Icon background
text-slate-800, text-slate-900  // Text colors
from-slate-700 to-slate-800  // Submit button
```

### 10. Pastikan Default Limit = 5
Sudah benar di baris 18:
```jsx
const [currentLimit, setCurrentLimit] = useState(5);
```

Dan di baris 21-25:
```jsx
const [pagination, setPagination] = useState({
  page: 1,
  limit: 5,  // ✓ Sudah benar
  total: 0,
  totalPages: 0
});
```

---

## Cara Implementasi Manual:

1. **Buka file:** `frontend/src/pages/SuperAdmin/DataWarga.jsx`
2. **Ikuti langkah 1-9** di atas satu per satu
3. **Simpan file**
4. **Refresh browser**

Atau tunggu saya memberikan file lengkap yang sudah diperbaiki.

---

## Testing Export Excel:

1. Buka halaman Data Warga
2. Klik tombol "Export Excel" (hijau) di kanan atas
3. File akan otomatis terdownload dengan nama: `data-warga_YYYY-MM-DD.xlsx`
4. Jika ada filter aktif (RT/RW/dll), filename akan menyesuaikan: `data-warga_RT01_RW02_YYYY-MM-DD.xlsx`
5. Buka file Excel, semua data yang terfilter akan tersimpan rapi

---

## Fitur Export Excel:

✅ Export semua data sesuai filter aktif
✅ Format tanggal otomatis (dd/mm/yyyy)
✅ Column width optimal untuk readability  
✅ Sheet name: "Data Warga"
✅ Filename dengan timestamp
✅ Semua field warga ter-export (21 kolom)
