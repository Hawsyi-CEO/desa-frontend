# 📋 Panduan Manajemen Data Warga

## 🎯 Sistem Login Warga

### Kredensial Login
- **Username**: Nomor Induk Kependudukan (NIK) 16 digit
- **Password Default**: `password123`

### Contoh Login
```
Username: 3201010101680001
Password: password123
```

---

## ➕ Menambah Data Warga (Super Admin)

### Akses
- Hanya **Super Admin** yang dapat menambah dan menghapus data warga
- Admin RT/RW hanya dapat melihat dan edit data

### Cara Menambah Warga Baru

1. **Login sebagai Super Admin**
   - Username: `1234567890123456`
   - Password: `admin123`

2. **Buka Halaman Data Warga**
   - Navigasi: Menu → Data Warga

3. **Klik Tombol "Tambah Warga"**
   - Tombol biru di pojok kanan atas

4. **Isi Form Data Warga**
   
   **Data Wajib:**
   - ✅ NIK (16 digit) - akan digunakan sebagai username login
   - ✅ Nama Lengkap
   - ✅ Email

   **Data Opsional:**
   - Password (kosongkan untuk menggunakan default: `password123`)
   - Tempat & Tanggal Lahir
   - Jenis Kelamin (Laki-laki/Perempuan)
   - Agama (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu)
   - Pendidikan (Tidak Sekolah, SD, SMP, SMA/SMK, D3, S1, S2, S3)
   - Pekerjaan (PNS, TNI/Polri, Karyawan Swasta, Wiraswasta, dll)
   - Status Perkawinan
   - Golongan Darah (A, B, AB, O)
   - RT & RW
   - Dusun
   - Alamat Lengkap
   - No. KK (16 digit)
   - Nama Kepala Keluarga
   - Hubungan Keluarga
   - No. Telepon

5. **Klik "Tambah Warga"**
   - Data akan tersimpan di database
   - Status warga: **Aktif**
   - Role: **warga**

---

## 🗑️ Menghapus Data Warga (Super Admin)

### Cara Menghapus Warga

1. **Di Tabel Data Warga**
   - Klik tombol **Hapus** (ikon tempat sampah merah)

2. **Konfirmasi Penghapusan**
   - Sistem akan menampilkan modal konfirmasi
   - Menampilkan data warga yang akan dihapus (Nama, NIK, Alamat)
   - Peringatan: **Data yang sudah dihapus tidak dapat dikembalikan!**

3. **Klik "Ya, Hapus"**
   - Data warga akan terhapus dari database

### ⚠️ Pembatasan Penghapusan

Warga **TIDAK DAPAT DIHAPUS** jika:
- Memiliki pengajuan surat aktif
- Sistem akan menampilkan pesan error
- Saran: **Nonaktifkan akun** sebagai gantinya

---

## 🔐 Setelah Warga Ditambahkan

### Login Pertama Kali
1. Warga dapat login menggunakan:
   - **Username**: NIK yang didaftarkan
   - **Password**: `password123` (default) atau password kustom yang diset admin

2. **Disarankan Ganti Password**
   - Warga sebaiknya mengubah password setelah login pertama
   - Menu: Profile → Ubah Password

### Akses Warga
Setelah login, warga dapat:
- ✅ Mengajukan surat online
- ✅ Melihat riwayat pengajuan
- ✅ Mengupdate profil
- ✅ Mengubah password
- ✅ Download surat yang sudah diverifikasi

---

## 📊 Validasi Data

### NIK (Nomor Induk Kependudukan)
- Harus **16 digit**
- Harus **unik** (tidak boleh duplikat)
- Digunakan sebagai username login

### Email
- Harus format email valid
- Harus **unik** (tidak boleh duplikat)

### Jenis Kelamin
- Pilihan: "Laki-laki" atau "Perempuan"
- Disimpan dalam database sebagai ENUM

---

## 🔄 Workflow Super Admin

```
1. Super Admin Login
   ↓
2. Buka Data Warga
   ↓
3. Klik "Tambah Warga"
   ↓
4. Isi Form (minimal NIK, Nama, Email)
   ↓
5. Submit → Warga Tersimpan
   ↓
6. Warga dapat login dengan NIK + password123
   ↓
7. Warga ganti password (opsional)
   ↓
8. Warga mulai mengajukan surat
```

---

## 📝 Contoh Data Warga

```json
{
  "nik": "3201010101680001",
  "nama": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "1968-01-01",
  "jenis_kelamin": "Laki-laki",
  "agama": "Islam",
  "pendidikan": "S1",
  "pekerjaan": "PNS",
  "status_perkawinan": "Kawin",
  "golongan_darah": "A",
  "rt": "01",
  "rw": "01",
  "dusun": "Dusun Makmur",
  "alamat": "Jl. Merdeka No. 123",
  "no_kk": "3201010101680001",
  "nama_kepala_keluarga": "Budi Santoso",
  "hubungan_keluarga": "Kepala Keluarga",
  "no_telepon": "081234567890"
}
```

---

## 🛡️ Keamanan

- Password di-hash menggunakan **bcrypt** (10 rounds)
- NIK sebagai username untuk menghindari kebocoran data pribadi
- Session menggunakan **JWT token**
- Role-based access control (Super Admin, Admin, Verifikator, Warga)

---

## 📞 Support

Jika ada masalah dalam menambahkan atau menghapus data warga:
1. Cek console browser (F12) untuk error details
2. Cek backend logs untuk error message
3. Pastikan database connection aktif
4. Verifikasi role user adalah **super_admin**
