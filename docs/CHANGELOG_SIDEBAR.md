# Update UI - Navbar ke Sidebar

## Tanggal: 28 Oktober 2025

## Perubahan Besar:

### 1. Komponen Baru

#### `Sidebar.jsx`
- **Location**: `frontend/src/components/Sidebar.jsx`
- **Features**:
  - Fixed sidebar di desktop (lg+)
  - Collapsible di mobile dengan overlay
  - Auto-close setelah navigate di mobile
  - Gradient background: indigo-700 to indigo-900
  - Active state dengan background putih dan shadow
  - Menu dinamis berdasarkan role user
  - User info card dengan avatar
  - Logout button dengan warna merah

**Menu per Role:**
- **SuperAdmin**: Dashboard, Users, Jenis Surat, Semua Surat, Konfigurasi
- **Admin**: Dashboard, Users, Semua Surat
- **Verifikator**: Dashboard, Perlu Verifikasi, Riwayat
- **Warga**: Dashboard, Ajukan Surat, Riwayat Surat, Profil

#### `Layout.jsx`
- **Location**: `frontend/src/components/Layout.jsx`
- **Purpose**: Wrapper component untuk semua halaman
- **Features**:
  - Sidebar included
  - Main content dengan margin-left 256px (64 unit) di desktop
  - Padding konsisten: 4-6-8 (responsive)
  - Background gray-50

### 2. Update Semua Halaman

**Files Updated** (12 files):
```
frontend/src/pages/
├── SuperAdmin/
│   ├── Dashboard.jsx ✅
│   ├── JenisSurat.jsx ✅
│   ├── FormJenisSurat.jsx ✅
│   ├── KonfigurasiSurat.jsx ✅
│   ├── Surat.jsx ✅
│   └── Users.jsx ✅
├── Verifikator/
│   ├── Dashboard.jsx ✅
│   ├── Surat.jsx ✅
│   └── Riwayat.jsx ✅
└── Warga/
    ├── Dashboard.jsx ✅
    ├── Surat.jsx ✅
    ├── History.jsx ✅
    └── Profile.jsx ✅
```

**Change Pattern:**
```jsx
// BEFORE
import Navbar from '../../components/Navbar';
return (
  <>
    <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* content */}
    </div>
  </>
);

// AFTER
import Layout from '../../components/Layout';
return (
  <Layout>
    {/* content - no wrapper div needed */}
  </Layout>
);
```

### 3. Icon System

Menggunakan **Feather Icons** (`react-icons/fi`):
- `FiHome` - Dashboard
- `FiUsers` - Users
- `FiFileText` - Surat/Documents
- `FiList` - Jenis Surat
- `FiSettings` - Konfigurasi
- `FiClock` - Menunggu/Pending
- `FiCheckCircle` - Approved/Riwayat
- `FiPlusCircle` - Ajukan/Create
- `FiUser` - Profile
- `FiLogOut` - Logout
- `FiMenu` - Mobile menu toggle
- `FiX` - Close

### 4. Responsive Design

**Desktop (lg+):**
- Sidebar fixed, always visible (w-64)
- Content margin-left 64 (256px)
- No toggle button

**Mobile (<lg):**
- Sidebar overlay dengan backdrop
- Toggle button kiri atas
- Auto-close after navigate
- Full-screen sidebar

### 5. Styling Details

**Sidebar:**
- Width: 256px (w-64)
- Background: Gradient indigo-700 → indigo-900
- Shadow: 2xl
- Border: indigo-600 (dividers)

**Active Menu:**
- Background: white
- Text: indigo-700
- Shadow: lg
- Font: semibold

**Inactive Menu:**
- Text: indigo-100
- Hover: bg-indigo-600 + text-white
- Transition: 200ms

**Logout Button:**
- Background: red-500
- Hover: red-600
- Full width
- Bottom positioned

### 6. Layout Structure

```
┌─────────────────────────────────────┐
│  Sidebar (fixed, 256px)             │
│  ┌─────────────────────┐            │
│  │ Logo + App Name     │            │
│  ├─────────────────────┤            │
│  │ User Info Card      │            │
│  ├─────────────────────┤            │
│  │ Navigation Menu     │            │
│  │   • Dashboard       │            │
│  │   • Menu 1          │            │
│  │   • Menu 2          │            │
│  │   • ...             │            │
│  ├─────────────────────┤            │
│  │ Logout Button       │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘
        ↑
    Main Content
    (margin-left: 256px)
```

### 7. Script Automation

**File**: `update-navbar-to-layout.ps1`
- Automatically replace Navbar import with Layout
- Update JSX structure
- Process 12 files in batch
- Success: All files updated ✅

### 8. Benefits

✅ **Better UX:**
- Persistent navigation (no scroll away)
- Clear visual hierarchy
- Easy access to all menu

✅ **Modern Design:**
- Gradient background
- Smooth transitions
- Professional look

✅ **Responsive:**
- Works on all screen sizes
- Touch-friendly on mobile

✅ **Maintainable:**
- Single Layout component
- Centralized navigation logic
- Easy to add/remove menu

### 9. Testing Checklist

- [x] Sidebar tampil di semua halaman
- [x] Menu sesuai role user
- [x] Active state berfungsi
- [x] Mobile toggle berfungsi
- [x] Auto-close di mobile
- [x] Logout berfungsi
- [x] Responsive di semua ukuran
- [x] No console errors
- [x] Icons tampil dengan baik

### 10. Migration Notes

**Jika ada halaman baru:**
```jsx
// Template
import Layout from '../../components/Layout';

const NewPage = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1>Page Title</h1>
        {/* content */}
      </div>
    </Layout>
  );
};

export default NewPage;
```

**Loading State:**
```jsx
if (loading) {
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </Layout>
  );
}
```

## Files Modified:

```
frontend/src/
├── components/
│   ├── Sidebar.jsx (NEW) ✨
│   └── Layout.jsx (NEW) ✨
└── pages/
    ├── SuperAdmin/ (6 files updated)
    ├── Verifikator/ (3 files updated)
    └── Warga/ (4 files updated)

update-navbar-to-layout.ps1 (NEW) ✨
```

## Breaking Changes:

⚠️ **Navbar.jsx tidak digunakan lagi**
- Semua import harus diganti ke Layout
- Struktur JSX berubah (no fragment wrapper)
- Padding/margin sudah di-handle Layout

## Next Steps:

1. ✅ Test semua menu navigasi
2. ✅ Test di mobile & desktop
3. ✅ Verify active state
4. ⏳ Add breadcrumbs (optional)
5. ⏳ Add notification badge (optional)
