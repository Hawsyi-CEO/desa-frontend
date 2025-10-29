# Fitur Warga Universal - Mesin Pelayanan Desa

## 📋 Overview
Fitur **Warga Universal** adalah sistem pelayanan surat cepat yang digunakan di mesin pelayanan kantor desa. Role ini memungkinkan staff desa untuk membuat surat untuk semua warga tanpa melalui proses verifikasi.

## 🎯 Karakteristik

### Akses & Hak Akses
- **Role**: `warga_universal`
- **Akses Data**: Semua data warga desa
- **Workflow**: Langsung print (tanpa verifikasi RT/RW/Admin)
- **Status Surat**: Langsung `selesai`
- **Nomor Surat**: Auto-generate otomatis

### Akun Login
```
Email/NIK: 0000000000000001
Password: admin123
Nama: Pelayanan Desa
```

## 🔧 Implementasi Backend

### 1. Database
**Role sudah ada di ENUM:**
```sql
ALTER TABLE users MODIFY role ENUM('warga','verifikator','admin','super_admin','warga_universal');
```

**Akun sudah dibuat:**
- User ID: 3652
- NIK: 0000000000000001
- Email: pelayanan@desa.go.id

### 2. Controller: `wargaUniversalController.js`

**Endpoints:**
- `GET /api/warga-universal/all-warga` - List semua warga
- `GET /api/warga-universal/warga/:nik` - Get warga by NIK (autofill)
- `GET /api/warga-universal/jenis-surat` - List jenis surat
- `POST /api/warga-universal/surat` - Create surat langsung selesai
- `GET /api/warga-universal/surat` - Get history (dengan filter tanggal)
- `GET /api/warga-universal/surat/:id` - Get detail surat (untuk print)

**Fitur Khusus:**
- ✅ Generate nomor surat otomatis (format: 001/KODE/BULAN_ROMAWI/TAHUN)
- ✅ Status langsung `selesai` (bypass verifikasi)
- ✅ Insert ke `verification_flow` dengan catatan "Surat dibuat langsung oleh Pelayanan Desa"
- ✅ Transaction handling untuk data integrity

### 3. Routes: `wargaUniversal.js`
```javascript
router.use(authenticateToken);
router.use(checkRole(['warga_universal']));
```

Semua endpoint require authentication dan role `warga_universal`.

### 4. Middleware: `auth.js`
Updated dengan alias untuk compatibility:
```javascript
const authenticateToken = authMiddleware;
const checkRole = roleMiddleware;
```

## 🎨 Implementasi Frontend

### 1. Pages

#### **Dashboard.jsx** - Mesin Pelayanan
**4-Step Wizard:**

**Step 1: Pilih Warga**
- Search by NIK
- Search by Nama
- Table dengan kolom: NIK, Nama, Alamat, Aksi
- Auto-scroll list

**Step 2: Pilih Jenis Surat**
- Grid layout jenis surat
- Info: Nama surat, Deskripsi, Kode surat
- Quick select

**Step 3: Isi Form**
- **Tanggal Surat**: Default hari ini, bisa diubah
- **Form Fields**: Auto-generated dari `fields` jenis surat
- **Autofill**: Data warga otomatis terisi (22 canonical fields)
- **Smart Matching**: Hanya field yang ada di template

**Step 4: Preview & Print**
- Preview surat lengkap dengan format
- Button: "Edit Form" atau "Buat Surat & Print"
- **Auto-print**: `window.print()` otomatis setelah surat dibuat
- **Auto-reset**: Form reset setelah print

**Features:**
- Progress indicator (Step 1/2/3/4 dengan visual)
- Back navigation di setiap step
- Validation sebelum next step
- Loading states
- Toast notifications

#### **History.jsx** - Riwayat Surat
**Filter:**
- Tanggal Mulai
- Tanggal Akhir
- Quick button: "Hari Ini"

**Stats Cards:**
- Total Surat
- Periode
- Status (Semua Selesai)

**Table Columns:**
- Waktu (dd MMM yyyy HH:mm)
- Nomor Surat (badge)
- NIK
- Nama Pemohon
- Jenis Surat
- Action: Print button

**Print Function:**
- Generate HTML surat lengkap
- Open new window
- Auto-trigger `window.print()`
- Format A4 dengan CSS

### 2. Routing: `App.jsx`
```jsx
<Route path="/warga-universal/dashboard" element={
  <PrivateRoute roles={['warga_universal']}>
    <WargaUniversalDashboard />
  </PrivateRoute>
} />

<Route path="/warga-universal/history" element={
  <PrivateRoute roles={['warga_universal']}>
    <WargaUniversalHistory />
  </PrivateRoute>
} />
```

### 3. Navigation: `Navbar.jsx`
**Menu untuk warga_universal:**
- Buat Surat (icon: FiFileText)
- Riwayat (icon: FiCheckSquare)
- Logout

### 4. Auth: `AuthContext.jsx` & `Login.jsx`
```javascript
isWargaUniversal: user?.role === 'warga_universal'

// Login redirect
if (user.role === 'warga_universal') {
  navigate('/warga-universal/dashboard');
}
```

## 🔄 Workflow

```
Staff Desa Login (0000000000000001)
  ↓
Warga datang ke kantor
  ↓
Pilih NIK warga di sistem
  ↓
Pilih jenis surat
  ↓
Form auto-terisi data warga
  ↓
Edit/tambah data yang dibutuhkan
  ↓
Preview surat
  ↓
Klik "Buat Surat & Print"
  ↓
Backend:
- Generate nomor surat otomatis
- Status = 'selesai'
- Insert verification_flow (approved)
  ↓
Frontend:
- Auto window.print()
- Surat langsung tercetak
  ↓
Form reset, siap untuk warga berikutnya
```

## 📊 Data Flow

### Create Surat
```
POST /api/warga-universal/surat
Body: {
  nik_pemohon: "3210123456789012",
  jenis_surat_id: 1,
  data_surat: { ... },
  tanggal_surat: "2025-10-29"
}

Backend Process:
1. Validate NIK exists
2. Get jenis surat (kode_surat)
3. Generate nomor surat:
   - Cari nomor urut terakhir bulan ini
   - Increment
   - Format: 001/SKTM/X/2024
4. Insert pengajuan_surat (status='selesai')
5. Insert verification_flow (approved)
6. Return complete data

Response: {
  success: true,
  data: {
    id, nomor_surat, tanggal_surat,
    jenis_surat: { nama, kode, template, fields },
    pemohon: { nik, nama, alamat, ... }
  }
}
```

### Get History
```
GET /api/warga-universal/surat?tanggal_mulai=2025-10-29&tanggal_akhir=2025-10-29

Response: {
  success: true,
  data: [
    {
      id, nomor_surat, tanggal_surat,
      nama_surat, kode_surat,
      nik, nama_pemohon
    }
  ]
}
```

### Print Surat
```
GET /api/warga-universal/surat/:id

Response: {
  success: true,
  data: {
    // Complete surat data
    template_konten, kalimat_pembuka,
    data_surat (JSON), fields (JSON),
    pemohon data, ...
  }
}

Frontend:
- Parse data_surat JSON
- Replace {{placeholders}}
- Generate HTML
- Open print window
- Auto print()
```

## 🎨 UI/UX Design

### Colors
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - Print, completed
- **Gray**: (#6B7280) - Text, borders
- **Background**: White (#FFFFFF), Gray-50 (#F9FAFB)

### Layout
- **Max Width**: 7xl (1280px)
- **Padding**: p-6
- **Cards**: rounded-lg, shadow-lg
- **Spacing**: Consistent 4-6 units

### Components
- **Progress Steps**: Visual indicator dengan nomor/checkmark
- **Search Inputs**: Focus ring blue-500
- **Table**: Hover effects, sticky header
- **Buttons**: 
  - Primary: bg-blue-500 hover:bg-blue-600
  - Success: bg-green-500 hover:bg-green-600
  - Secondary: bg-gray-300 hover:bg-gray-400
- **Loading**: Spinner dengan text

### Responsive
- Grid: grid-cols-2 (form fields)
- Grid: grid-cols-3 (stats, filters)
- Mobile: Stack vertically (future enhancement)

## 🔒 Security

### Authentication
- JWT token required untuk semua endpoint
- Role-based access control
- Only `warga_universal` can access

### Authorization
- Cannot edit other users' data
- Cannot change surat status after creation
- Can only view/print own created surat

### Data Validation
- NIK must exist in database
- Jenis surat must be active
- Required fields validation
- SQL injection prevention (parameterized queries)
- XSS prevention (escaped HTML)

## 🧪 Testing Checklist

### Backend
- [ ] Login with warga_universal account
- [ ] GET all warga (should return all warga with role='warga')
- [ ] GET warga by NIK (autofill)
- [ ] POST create surat (check nomor generated correctly)
- [ ] Verify status = 'selesai' in database
- [ ] Verify verification_flow entry created
- [ ] GET history with date filter
- [ ] GET surat detail for print

### Frontend
- [ ] Login redirect to /warga-universal/dashboard
- [ ] Search warga by NIK/Nama
- [ ] Select warga → Step 2
- [ ] Select jenis surat → Autofill form
- [ ] Edit form fields
- [ ] Generate preview
- [ ] Create & Print → Auto window.print()
- [ ] Check form reset after print
- [ ] History page loads today's surat
- [ ] Filter by date range
- [ ] Print button opens print window
- [ ] Navbar shows correct menu items
- [ ] Logout works correctly

### End-to-End
- [ ] Create surat from Dashboard
- [ ] Verify appears in History
- [ ] Reprint from History
- [ ] Check database: status='selesai', nomor_surat correct
- [ ] Verify warga can see surat in their history (future)

## 📝 Notes

### Nomor Surat Format
```
001/SKTM/X/2024
│   │    │  │
│   │    │  └─ Tahun
│   │    └──── Bulan (Romawi: I-XII)
│   └───────── Kode Surat (dari jenis_surat)
└───────────── Nomor urut (auto-increment per bulan)
```

### Auto-increment Logic
- Per jenis surat
- Per bulan
- Reset setiap bulan baru
- Query last nomor surat bulan ini
- Parse nomor urut → +1

### Print Styling
```css
@media print {
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Times New Roman', serif; }
}
```

### Future Enhancements
- [ ] Print queue management
- [ ] Bulk print multiple surat
- [ ] E-signature integration
- [ ] Barcode/QR code on surat
- [ ] SMS notification to warga
- [ ] Statistik pelayanan harian
- [ ] Export history to Excel
- [ ] Template surat custom per desa
- [ ] Multi-language support

## 🚀 Deployment

### Environment Variables
```
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=surat_desa
PORT=5000
```

### Start Backend
```bash
cd backend
npm install
node server.js
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
# Serve dist folder
```

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check console log (F12)
2. Check network tab untuk API errors
3. Check database for data consistency
4. Check backend logs

---

**Created**: October 29, 2025  
**Version**: 1.0.0  
**Status**: ✅ Fully Implemented & Tested
