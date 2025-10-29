# Kredensial Login Default

## Informasi Penting
File ini berisi kredensial login untuk testing. **JANGAN digunakan di production!**

## Daftar User

### 1. Super Admin
- **Email**: superadmin@desa.com
- **Password**: admin123
- **NIK**: 1234567890123456
- **Role**: super_admin
- **Akses**: 
  - Dashboard Super Admin
  - Kelola Jenis Surat
  - Kelola Semua Surat
  - Kelola Users

### 2. Admin/Verifikator RT/RW
- **Email**: admin@desa.com
- **Password**: admin123
- **NIK**: 2234567890123456
- **Role**: admin
- **Akses**: 
  - Dashboard Verifikator
  - Verifikasi Surat dari RT 01/RW 01
  - Riwayat Verifikasi

### 3. Warga
- **Email**: warga@desa.com
- **Password**: warga123
- **NIK**: 3234567890123456
- **Role**: warga
- **Akses**: 
  - Dashboard Warga
  - Ajukan Surat
  - History Pengajuan
  - Profile

## Cara Reset Database

Jika Anda perlu mereset database dengan kredensial baru:

```bash
# Masuk ke MySQL
mysql -u root -p

# Drop dan buat ulang database
DROP DATABASE IF EXISTS surat_desa;

# Import file SQL
mysql -u root -p < database/surat_desa.sql
```

Atau jika menggunakan phpMyAdmin di Laragon:
1. Buka phpMyAdmin
2. Drop database `surat_desa` jika sudah ada
3. Import file `database/surat_desa.sql`

## Catatan Keamanan

⚠️ **PENTING**: Setelah login pertama kali, segera ubah password default ini!

- Hash password dibuat menggunakan bcrypt dengan salt rounds 10
- Password disimpan dengan aman di database
- Jangan gunakan password default di lingkungan production
