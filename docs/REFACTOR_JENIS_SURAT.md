# Refactor Jenis Surat - Halaman Terpisah

## Overview
Mengubah tampilan Jenis Surat dari **popup modal** menjadi **halaman terpisah** dengan tata letak yang lebih rapi dan tips yang bisa di-hide/show.

## Perubahan

### ❌ Sebelumnya (Modal Popup)
- Form tambah/edit dalam modal popup
- Tampilan sempit dan ramai
- Tips selalu tampil, memakan space
- Sulit untuk form yang kompleks

### ✅ Sekarang (Halaman Terpisah)
- **List Page** (`JenisSurat.jsx`) - Halaman daftar jenis surat
- **Form Page** (`FormJenisSurat.jsx`) - Halaman tambah/edit terpisah
- Tips bisa di-hide/show dengan tombol
- Tata letak lebih luas dan rapi
- Full-width untuk editing yang nyaman

---

## Struktur File Baru

```
frontend/src/pages/SuperAdmin/
├── JenisSurat.jsx          → List page (tampilan grid card)
├── FormJenisSurat.jsx      → Form page (tambah/edit)
└── JenisSurat.backup.jsx   → Backup file lama
```

---

## Routing

### List Page
```
/admin/jenis-surat
```
- Tampilan daftar jenis surat dalam bentuk card
- Filter: Semua, Aktif, Non-Aktif
- Action: Edit, Hapus
- Button: Tambah Jenis Surat

### Form Tambah
```
/admin/jenis-surat/tambah
```
- Form kosong untuk membuat jenis surat baru
- Full-page layout

### Form Edit
```
/admin/jenis-surat/edit/:id
```
- Form ter-isi dengan data existing
- Full-page layout

---

## Fitur Baru

### 1. **Collapsible Tips** 
Setiap section memiliki tombol "Lihat Tips" / "Sembunyikan Tips":

```jsx
<button onClick={() => toggleTips('formatNomor')}>
  <FiInfo /> {showTips.formatNomor ? 'Sembunyikan Tips' : 'Lihat Tips'}
  {showTips.formatNomor ? <FiChevronUp /> : <FiChevronDown />}
</button>
```

Tips yang tersedia:
- ✅ Format Nomor Surat
- ✅ Kalimat Pembuka
- ✅ Fields Form
- ✅ Template Konten

### 2. **Section-based Layout**
Form dibagi menjadi section dengan card terpisah:

1. **Informasi Dasar**
   - Nama Surat, Kode Surat
   - Deskripsi
   - Status, Require Verification

2. **Format Nomor Surat**
   - Input format nomor
   - Tips keyword (NOMOR, KODE, BULAN, TAHUN)
   - Preview auto-generate

3. **Kalimat Pembuka**
   - Textarea untuk kalimat pembuka
   - Contoh-contoh kalimat

4. **Fields Form (Opsional)**
   - Info bahwa fields opsional
   - List fields yang sudah ditambah
   - Form tambah field baru

5. **Template Konten**
   - Editor template
   - Template presets (siap pakai)
   - Insert field buttons

### 3. **Better Visual Hierarchy**

```
┌─────────────────────────────────────────┐
│  📄 Tambah Jenis Surat        [X] Batal │
│  Buat jenis surat baru untuk sistem     │
├─────────────────────────────────────────┤
│  📋 Informasi Dasar                     │
│  ┌───────────────────────────────────┐  │
│  │ [Input Fields]                    │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  🔢 Format Nomor Surat    [💡 Tips]    │
│  ┌───────────────────────────────────┐  │
│  │ [Collapsible Tips if opened]     │  │
│  │ [Input Field]                     │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  📝 Kalimat Pembuka       [💡 Tips]    │
│  ... (similar structure)                │
├─────────────────────────────────────────┤
│  🏷️ Fields Form          [💡 Tips]    │
│  ... (similar structure)                │
├─────────────────────────────────────────┤
│  ✍️ Template Konten       [💡 Tips]    │
│  ... (similar structure)                │
├─────────────────────────────────────────┤
│  [Batal]  [👁️ Preview]  [💾 Simpan]   │
└─────────────────────────────────────────┘
```

### 4. **List Page Features**

**Filter Status:**
- Semua
- Aktif
- Non-Aktif

**Card Display:**
```
┌────────────────────────────────────────┐
│ Surat Keterangan Domisili [SKD] [Aktif] [Butuh Verifikasi] │
│                                        │
│ Deskripsi surat...                     │
│                                        │
│ Format: NOMOR/KODE/BULAN/TAHUN        │
│ Jumlah Fields: 5 field                │
│                                        │
│ Kalimat Pembuka:                      │
│ "Yang bertanda tangan..."             │
│                                        │
│                            [✏️] [🗑️]  │
└────────────────────────────────────────┘
```

---

## User Flow

### Menambah Jenis Surat Baru

1. Klik **"Tambah Jenis Surat"** di list page
2. Navigate ke `/admin/jenis-surat/tambah`
3. Isi form:
   - Informasi dasar
   - Format nomor
   - Kalimat pembuka
   - Fields (opsional)
   - Template
4. Klik **"Preview"** untuk lihat hasil (opsional)
5. Klik **"Simpan"**
6. Redirect kembali ke list page

### Mengedit Jenis Surat

1. Klik **icon edit** ✏️ di card
2. Navigate ke `/admin/jenis-surat/edit/:id`
3. Form ter-isi dengan data existing
4. Edit yang diperlukan
5. Klik **"Update"**
6. Redirect kembali ke list page

---

## Benefits

### ✅ UX Improvements
- **Lebih Luas** - Full page width untuk editing
- **Lebih Rapi** - Section-based dengan card terpisah
- **Lebih Bersih** - Tips bisa di-hide
- **Lebih Fokus** - Satu task per halaman

### ✅ Developer Experience
- **Modular** - Pemisahan concerns (list vs form)
- **Maintainable** - Easier to update each part
- **Reusable** - Form component bisa digunakan untuk tambah & edit
- **Scalable** - Easier to add new sections

### ✅ Performance
- **Lazy Loading** - List page lebih ringan
- **Better Memory** - Tidak load form data di background
- **Faster Navigation** - React Router handles routing

---

## State Management

### List Page State
```jsx
const [jenisSurat, setJenisSurat] = useState([]);
const [loading, setLoading] = useState(true);
const [filterStatus, setFilterStatus] = useState('all');
```

### Form Page State
```jsx
const [formData, setFormData] = useState({ ... });
const [newField, setNewField] = useState({ ... });
const [showTips, setShowTips] = useState({
  formatNomor: false,
  kalimatPembuka: false,
  fields: false,
  template: false
});
const [showPreview, setShowPreview] = useState(false);
```

---

## Icons Used

```jsx
import { 
  FiPlus,        // Tambah
  FiEdit2,       // Edit
  FiTrash2,      // Hapus
  FiEye,         // Preview
  FiSave,        // Simpan
  FiX,           // Close/Batal
  FiFilter,      // Filter
  FiInfo,        // Tips info
  FiChevronDown, // Expand
  FiChevronUp    // Collapse
} from 'react-icons/fi';
```

---

## Tips Toggle Logic

```jsx
const [showTips, setShowTips] = useState({
  formatNomor: false,
  kalimatPembuka: false,
  fields: false,
  template: false
});

const toggleTips = (section) => {
  setShowTips(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};
```

**Usage:**
```jsx
<button onClick={() => toggleTips('formatNomor')}>
  {showTips.formatNomor ? 'Sembunyikan' : 'Lihat'} Tips
</button>

{showTips.formatNomor && (
  <div className="tips-box">...</div>
)}
```

---

## Responsive Design

### Desktop (> 768px)
- Full-width cards
- 2-column grid for form inputs
- Side-by-side layout

### Mobile (< 768px)
- Stack sections vertically
- Single column for form inputs
- Full-width buttons

---

## Migration Guide

### Untuk Developer

**Sebelum:**
```jsx
// Old way - Modal popup
<JenisSurat />
// Contains both list and form in modal
```

**Sesudah:**
```jsx
// New way - Separate pages

// List page
<Route path="/admin/jenis-surat" element={<JenisSurat />} />

// Add page
<Route path="/admin/jenis-surat/tambah" element={<FormJenisSurat />} />

// Edit page
<Route path="/admin/jenis-surat/edit/:id" element={<FormJenisSurat />} />
```

### Untuk User

**Tidak ada breaking changes** - Flow tetap sama:
1. Lihat daftar
2. Klik tambah/edit
3. Isi form
4. Simpan

Hanya tampilan yang lebih rapi dan nyaman.

---

## Testing Checklist

- [ ] List page loads correctly
- [ ] Filter works (Semua, Aktif, Non-Aktif)
- [ ] Tambah button navigates to form page
- [ ] Form tambah berfungsi
- [ ] Form edit berfungsi dan load data
- [ ] Tips collapse/expand works
- [ ] Template presets works
- [ ] Insert field buttons works
- [ ] Preview button works (if implemented)
- [ ] Simpan button works
- [ ] Update button works
- [ ] Redirect after save works
- [ ] Delete confirmation works
- [ ] Delete action works
- [ ] Responsive on mobile

---

## Future Enhancements

- [ ] Add preview modal in form page
- [ ] Add template syntax highlighting
- [ ] Add live preview panel (split screen)
- [ ] Add field validation preview
- [ ] Add duplicate jenis surat feature
- [ ] Add export/import jenis surat
- [ ] Add version history
- [ ] Add collaborative editing

---

**Created:** 2025-10-28  
**Last Updated:** 2025-10-28  
**Version:** 2.0
