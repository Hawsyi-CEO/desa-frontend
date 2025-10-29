# 📋 Panduan Fitur Jenis Surat

## Fitur-Fitur Unggulan

### 1. **Template Builder yang User-Friendly** ✨

Fitur baru ini memudahkan pembuatan template surat dengan:

#### **Template Siap Pakai**
- Surat Keterangan Umum
- Surat Keterangan Usaha
- Surat Keterangan Domisili
- Surat Keterangan Tidak Mampu

Tinggal klik template yang diinginkan, template akan otomatis terisi!

#### **Live Preview** 👁️
- Lihat preview template secara real-time
- Tag yang valid akan ditampilkan sebagai `[Label Field]`
- Tag yang tidak valid akan ditandai dengan highlight kuning
- Membantu memastikan template sudah benar sebelum disimpan

#### **Insert Field dengan Satu Klik**
- Tambahkan field terlebih dahulu
- Field akan muncul sebagai tombol yang bisa diklik
- Klik tombol field untuk memasukkan tag `{{field_name}}` ke template
- Tidak perlu mengetik manual, mengurangi kesalahan penulisan

### 2. **Dynamic Fields** 🏷️

Buat form yang fleksibel dengan berbagai tipe field:

- **text** - Input teks biasa (nama, NIK, dll)
- **textarea** - Input teks panjang (alamat, keterangan)
- **number** - Input angka (tahun, jumlah)
- **date** - Input tanggal (tanggal lahir, dll)
- **select** - Dropdown pilihan (jenis kelamin, dll)

### 3. **Preview Surat Resmi** 📄

- Preview surat dengan format resmi lengkap dengan:
  - Kop surat Desa Cibadak
  - Logo desa
  - Nomor surat otomatis
  - Format yang rapi dan profesional
  - Tombol print untuk cetak langsung
  
## Cara Menggunakan

### Langkah 1: Tambah Jenis Surat Baru

1. Login sebagai **Super Admin**
2. Klik menu **"Jenis Surat"**
3. Klik tombol **"+ Tambah Jenis Surat"**

### Langkah 2: Isi Informasi Dasar

```
Nama Surat : Surat Keterangan Domisili
Kode Surat : SKD
Deskripsi  : Surat keterangan tempat tinggal warga
```

### Langkah 3: Tambah Fields

Tambahkan field yang dibutuhkan satu per satu:

| Name | Label | Type | Required |
|------|-------|------|----------|
| nama | Nama Lengkap | text | ✓ |
| nik | NIK | text | ✓ |
| tempat_lahir | Tempat Lahir | text | ✓ |
| tanggal_lahir | Tanggal Lahir | date | ✓ |
| alamat | Alamat | textarea | ✓ |
| rt | RT | text | ✓ |
| rw | RW | text | ✓ |

### Langkah 4: Buat Template

#### **Cara Mudah (Gunakan Template Siap Pakai)**
1. Klik **"▶ Tampilkan Helper"**
2. Pilih salah satu dari **"Template Siap Pakai"**
3. Template akan otomatis terisi
4. Sesuaikan jika diperlukan

#### **Cara Manual (Buat Sendiri)**
1. Ketik template di editor sebelah kiri
2. Untuk memasukkan field, klik tombol field yang tersedia
3. Tag `{{field_name}}` akan otomatis dimasukkan
4. Lihat preview di sebelah kanan untuk memastikan

**Contoh Template:**
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak Kecamatan Ciampea Kabupaten Bogor, dengan ini menerangkan bahwa:

Nama             : {{nama}}
NIK              : {{nik}}
Tempat/Tgl Lahir : {{tempat_lahir}}, {{tanggal_lahir}}
Alamat           : {{alamat}}
RT/RW            : {{rt}}/{{rw}}

Adalah benar warga kami yang berdomisili di wilayah kami.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
```

### Langkah 5: Atur Pengaturan

- ✓ **Perlu Verifikasi RT/RW** - Centang jika surat perlu verifikasi
- **Status** - Pilih "Aktif" agar bisa digunakan

### Langkah 6: Preview & Simpan

1. Klik **"👁️ Preview"** untuk melihat contoh surat
2. Jika sudah sesuai, klik **"Simpan"**

## Tips & Trik 💡

### 1. Urutan Kerja yang Efisien
```
1. Isi informasi dasar (Nama, Kode, Deskripsi)
2. Tambahkan semua fields terlebih dahulu
3. Gunakan template siap pakai atau buat sendiri
4. Klik tombol field untuk insert tag
5. Cek live preview
6. Preview surat final
7. Simpan
```

### 2. Penamaan Field yang Baik
- Gunakan nama yang jelas dan konsisten
- Huruf kecil semua, tanpa spasi
- Gunakan underscore untuk pemisah: `tempat_lahir`, `nama_usaha`
- Hindari karakter spesial

### 3. Membuat Template yang Baik
- Gunakan spasi yang konsisten untuk alignment
- Gunakan format yang mudah dibaca
- Pastikan semua tag field sudah ada di list fields
- Cek preview untuk memastikan format sudah benar

### 4. Testing
- Setelah membuat jenis surat, test dengan membuat pengajuan
- Login sebagai warga dan coba ajukan surat
- Pastikan semua field muncul dengan benar
- Cek preview surat apakah sudah sesuai

## Workflow Lengkap

### A. Untuk Super Admin (Membuat Jenis Surat)
```
Super Admin Dashboard 
  → Jenis Surat 
  → + Tambah Jenis Surat
  → Isi Form (Nama, Kode, Fields, Template)
  → Preview 
  → Simpan
```

### B. Untuk Warga (Mengajukan Surat)
```
Warga Dashboard 
  → Ajukan Surat
  → Pilih Jenis Surat
  → Isi Data (form otomatis muncul sesuai fields)
  → Preview Surat
  → Ajukan
```

### C. Untuk Verifikator (Verifikasi)
```
Verifikator Dashboard 
  → Surat Masuk
  → Lihat Detail
  → Preview Surat
  → Verifikasi/Tolak
```

### D. Untuk Super Admin (Approval Final)
```
Admin Dashboard 
  → Surat
  → Lihat Detail
  → Preview Surat
  → Setujui (Nomor surat otomatis tergenerate)
```

## Troubleshooting

### Template tidak muncul dengan benar?
- Pastikan nama field di tag sama persis dengan nama di fields
- Cek apakah ada typo di nama field
- Gunakan live preview untuk melihat tag mana yang belum valid (ditandai kuning)

### Field tidak muncul di form warga?
- Pastikan jenis surat statusnya "Aktif"
- Refresh halaman
- Cek apakah fields sudah tersimpan dengan benar

### Preview surat kosong?
- Pastikan sudah mengisi data di form
- Cek apakah required fields sudah terisi
- Pastikan template konten tidak kosong

## Keunggulan Sistem

### ✅ User-Friendly
- Interface yang mudah dipahami
- Visual feedback yang jelas
- Template siap pakai untuk memulai cepat

### ✅ Fleksibel
- Bisa membuat jenis surat apapun
- Dynamic fields sesuai kebutuhan
- Template bisa disesuaikan

### ✅ Aman
- Validasi di frontend dan backend
- Required fields untuk memastikan data lengkap
- Role-based access control

### ✅ Profesional
- Format surat resmi
- Kop surat dan logo desa
- Nomor surat otomatis
- Siap print

## Contoh Kasus Penggunaan

### Kasus 1: Surat Keterangan Usaha
```
Fields:
- nama (text, required)
- nik (text, required)  
- alamat (textarea, required)
- nama_usaha (text, required)
- jenis_usaha (text, required)
- alamat_usaha (textarea, required)
- tahun_berdiri (number, required)

Template: Gunakan "Surat Keterangan Usaha" dari template siap pakai
```

### Kasus 2: Surat Pengantar Nikah
```
Fields:
- nama_pria (text, required)
- nik_pria (text, required)
- nama_wanita (text, required)
- nik_wanita (text, required)
- tempat_nikah (text, required)
- tanggal_nikah (date, required)

Template: Buat custom sesuai kebutuhan
```

## Update & Maintenance

### Mengubah Jenis Surat
1. Klik tombol **"Edit"** pada jenis surat yang ingin diubah
2. Lakukan perubahan
3. Preview untuk memastikan
4. Simpan

### Menonaktifkan Jenis Surat
1. Edit jenis surat
2. Ubah status menjadi **"Non-Aktif"**
3. Simpan
4. Jenis surat tidak akan muncul di pilihan warga

### Menghapus Jenis Surat
⚠️ **Hati-hati!** Menghapus jenis surat akan mempengaruhi surat yang sudah ada.

---

## Support

Jika mengalami kendala, hubungi administrator sistem atau buka issue di repository.

**Selamat menggunakan fitur Jenis Surat! 🎉**
