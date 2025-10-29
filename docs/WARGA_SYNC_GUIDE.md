# PANDUAN SINKRONISASI DATA WARGA

## Deskripsi
Panduan ini menjelaskan cara mengimport data warga dari database backup dan mensinkronisasikannya dengan sistem login menggunakan NIK.

## Fitur
- ✅ Login warga menggunakan NIK (16 digit)
- ✅ Password default: `password123`
- ✅ Halaman Data Warga untuk Admin & Super Admin
- ✅ Filter data berdasarkan RT/RW untuk Admin
- ✅ Fitur ganti password untuk warga
- ✅ Update profile warga

## Langkah-langkah Import

### 1. Import Tabel Warga ke Database
Gunakan salah satu cara berikut:

**Cara 1: Melalui phpMyAdmin**
1. Buka phpMyAdmin (http://localhost/phpmyadmin)
2. Pilih database `surat_desa`
3. Klik tab "Import"
4. Pilih file `u390486773_cibadak.sql`
5. Klik "Go"

**Cara 2: Melalui Command Line**
```powershell
cd C:\laragon\www\desa
mysql -u root -p surat_desa < u390486773_cibadak.sql
```

**Cara 3: Import Hanya Tabel Warga**
Jika file terlalu besar, extract hanya tabel warga:
```sql
-- Buka file u390486773_cibadak.sql
-- Cari baris yang dimulai dengan:
-- CREATE TABLE `warga` ...
-- INSERT INTO `warga` ...
-- Copy semua query tersebut dan jalankan di phpMyAdmin
```

### 2. Jalankan Script Sinkronisasi

Script ini akan:
- Menambahkan kolom tambahan ke tabel users (jika belum ada)
- Membuat akun user untuk setiap warga
- Set password default: `password123` (bcrypt hashed)
- Menyimpan informasi lengkap warga

**Jalankan script:**
```powershell
cd C:\laragon\www\desa\backend
node sync-warga.js
```

**Output yang diharapkan:**
```
🚀 SINKRONISASI DATA WARGA KE USERS
====================================

✓ Terhubung ke database
✓ Password hash dibuat: $2b$10$...
✓ Kolom tambahan berhasil ditambahkan
✓ Ditemukan 78 data warga

🔄 Memulai sinkronisasi...

✅ SINKRONISASI SELESAI
========================
📥 Data baru ditambahkan: 78
📝 Data diupdate: 0
❌ Error: 0
📊 Total data warga: 78

📈 STATISTIK USER WARGA
========================
👥 Total user warga: 78
🏘️  Total RT: 12
🏘️  Total RW: 5

🔑 INFORMASI LOGIN
========================
Username: NIK warga (16 digit)
Password: password123
Contoh: NIK 3201155206690002 / password123
```

### 3. Verifikasi Data

**Cek di database:**
```sql
SELECT COUNT(*) FROM users WHERE role = 'warga';
SELECT nik, nama, rt, rw FROM users WHERE role = 'warga' LIMIT 10;
```

**Test login:**
1. Buka http://localhost:5176
2. Login dengan NIK salah satu warga: `3201155206690002`
3. Password: `password123`

## Cara Menggunakan Sistem

### Login Sebagai Warga
1. Buka halaman login
2. Masukkan **NIK** (16 digit) di field "Email / NIK"
3. Masukkan password: `password123`
4. Klik "Masuk"

### Login Sebagai Admin/Super Admin
Tetap menggunakan email:
- Super Admin: `superadmin@desa.com` / `admin123`
- Admin RT/RW: `admin@desa.com` / `admin123`

### Melihat Data Warga (Admin/Super Admin)
1. Login sebagai admin atau super admin
2. Klik menu "Data Warga" di sidebar
3. Super Admin: Dapat melihat semua warga
4. Admin: Hanya melihat warga di RT/RW nya

### Fitur Data Warga
- 🔍 **Search**: Cari berdasarkan NIK, nama, atau alamat
- 🏘️ **Filter**: Filter berdasarkan RT/RW
- 📊 **Statistik**: Total warga, laki-laki, perempuan, KK
- 👁️ **Detail**: Lihat informasi lengkap warga
- ✏️ **Edit**: Update data warga (nama, alamat, dll)
- 📱 **Responsive**: Tampilan optimal di mobile/tablet/desktop

### Ganti Password (Warga)
1. Login sebagai warga
2. Klik menu "Profile" di sidebar
3. Klik tab "Ubah Password"
4. Masukkan password lama: `password123`
5. Masukkan password baru (minimal 6 karakter)
6. Klik "Ubah Password"

## Struktur Tabel Users (Setelah Sinkronisasi)

```sql
CREATE TABLE `users` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `nik` varchar(20) UNIQUE NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','verifikator','warga') DEFAULT 'warga',
  `no_telepon` varchar(15),
  `alamat` text,
  `rt` varchar(5),
  `rw` varchar(5),
  
  -- Kolom tambahan dari data warga
  `tempat_lahir` varchar(50),
  `tanggal_lahir` date,
  `jenis_kelamin` enum('Laki-laki','Perempuan'),
  `pekerjaan` varchar(50),
  `agama` varchar(20),
  `status_perkawinan` varchar(50),
  `kewarganegaraan` varchar(50),
  `pendidikan` varchar(50),
  `golongan_darah` varchar(5),
  `dusun` varchar(50),
  `no_kk` varchar(20),
  `nama_kepala_keluarga` varchar(100),
  `hubungan_keluarga` varchar(50),
  
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints Baru

### Admin/Super Admin
```
GET    /admin/warga              - Get all warga (with pagination, search, filter)
GET    /admin/warga/statistik    - Get statistics
GET    /admin/warga/:id          - Get warga detail
PUT    /admin/warga/:id          - Update warga data
```

**Query Parameters untuk GET /admin/warga:**
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah per halaman (default: 10)
- `search`: Search NIK, nama, atau alamat
- `rt`: Filter RT
- `rw`: Filter RW

**Response Example:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 78,
    "page": 1,
    "limit": 10,
    "totalPages": 8
  }
}
```

### Warga
```
GET    /warga/profile            - Get logged in warga profile
PUT    /warga/profile            - Update profile
POST   /warga/change-password    - Change password
```

## Troubleshooting

### Error: Table 'warga' doesn't exist
**Solusi:** Pastikan sudah mengimport tabel warga dari file SQL

### Error: Duplicate entry for key 'nik'
**Solusi:** NIK sudah terdaftar. Script akan skip data yang sudah ada.

### Error: Cannot read property 'role' of undefined
**Solusi:** Logout dan login kembali agar JWT token diperbarui dengan data lengkap

### Warga tidak bisa login
**Periksa:**
1. Apakah NIK sudah ada di tabel users?
   ```sql
   SELECT * FROM users WHERE nik = 'NIK_ANDA';
   ```
2. Apakah status user aktif?
   ```sql
   SELECT status FROM users WHERE nik = 'NIK_ANDA';
   ```
3. Apakah password benar? Default: `password123`

### Data warga tidak muncul di halaman admin
**Periksa:**
1. Role admin: Hanya bisa lihat warga di RT/RW nya
2. Super admin: Bisa lihat semua warga
3. Filter RT/RW: Pastikan tidak salah pilih filter

## File yang Ditambahkan/Diubah

### Backend
```
✅ backend/sync-warga.js                    - Script sinkronisasi
✅ backend/controllers/wargaController.js   - Added functions
✅ backend/controllers/authController.js    - Support NIK login
✅ backend/routes/admin.js                  - Added warga routes
✅ backend/routes/warga.js                  - Added profile & password routes
```

### Frontend
```
✅ frontend/src/pages/SuperAdmin/DataWarga.jsx    - Data warga page
✅ frontend/src/pages/Warga/ChangePassword.jsx    - Change password page
✅ frontend/src/pages/Login.jsx                   - Support NIK login
✅ frontend/src/components/Sidebar.jsx            - Added Data Warga menu
✅ frontend/src/App.jsx                           - Added routes
```

### Database
```
✅ database/sync_warga_to_users.sql        - SQL script sinkronisasi
```

## Security Notes

⚠️ **PENTING:**
1. Password default `password123` **HARUS DIGANTI** oleh setiap warga
2. Warga disarankan untuk segera mengganti password setelah login pertama kali
3. Password di-hash menggunakan bcrypt (10 rounds)
4. NIK bersifat unik dan tidak boleh duplikat
5. Admin hanya bisa melihat/edit warga di wilayahnya (RT/RW)

## Kontak
Jika ada pertanyaan atau kendala, silakan hubungi admin sistem.

---
**Last Updated:** 2024
**Version:** 1.0
