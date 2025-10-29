# 🎯 PANDUAN TEMPLATE BUILDER - MUDAH TANPA CODING!

## ✨ Update Terbaru: Format Baru yang Lebih User-Friendly!

### ❌ SEBELUM (Membingungkan):
```
Yang bertanda tangan di bawah ini menerangkan bahwa {{nama}} dengan NIK {{nik}}...
```
**Masalah**: Simbol `{{}}` membingungkan dan terlihat seperti code!

### ✅ SEKARANG (Mudah & Jelas):
```
Yang bertanda tangan di bawah ini menerangkan bahwa [nama] dengan NIK [nik]...
```
**Kelebihan**: Jelas, simpel, dan tidak terlihat seperti code!

---

## 📝 Cara Membuat Template Surat

### Langkah 1: Buat Jenis Surat Baru

1. Login sebagai Super Admin
2. Buka menu **"Jenis Surat"**
3. Klik **"+ Tambah Jenis Surat"**

### Langkah 2: Isi Informasi Dasar

- **Nama Surat**: Contoh: "Surat Keterangan Domisili"
- **Kode Surat**: Contoh: "SKD"  
- **Deskripsi**: Penjelasan singkat tentang surat

### Langkah 3: Tambahkan Fields

Fields adalah data yang akan diisi oleh warga. Contoh:

| Name Field  | Label Field       | Type    |
|-------------|-------------------|---------|
| nama        | Nama Lengkap      | Text    |
| nik         | NIK               | Text    |
| tempat_lahir| Tempat Lahir      | Text    |
| tanggal_lahir| Tanggal Lahir    | Date    |
| alamat      | Alamat Lengkap    | Textarea|
| rt          | RT                | Text    |
| rw          | RW                | Text    |

**Klik "+ Field"** untuk setiap data yang Anda butuhkan.

### Langkah 4: Buat Template Konten

#### Opsi A: Gunakan Template Siap Pakai

Klik salah satu tombol template siap pakai:
- 📋 Surat Keterangan Umum
- 📋 Surat Keterangan Usaha  
- 📋 Surat Keterangan Domisili
- 📋 Surat Keterangan Tidak Mampu

Template akan otomatis terisi!

#### Opsi B: Buat Template Manual

1. Klik tombol **"▶ Tampilkan Helper"**
2. Lihat field yang tersedia
3. **Klik tombol field** untuk insert ke template
4. Atau ketik manual dengan format `[nama_field]`

### Contoh Template:

```
Yang bertanda tangan di bawah ini menerangkan bahwa:

[nama] dengan NIK [nik], lahir di [tempat_lahir] pada tanggal [tanggal_lahir], 
beralamat di [alamat] RT [rt] RW [rw], adalah benar warga yang berdomisili 
di wilayah kami.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
```

---

## 🎨 Format Field yang Benar

### ✅ BENAR:
- `[nama]` - Field name dengan huruf kecil
- `[nik]` - Tanpa spasi
- `[tempat_lahir]` - Pakai underscore untuk pemisah
- `[tanggal_lahir]` - Konsisten dengan name field

### ❌ SALAH:
- `{{nama}}` - Jangan pakai kurung kurawal ganda
- `[Nama]` - Jangan pakai huruf kapital
- `[tempat lahir]` - Jangan pakai spasi
- `nama` - Harus pakai tanda `[]`

---

## 📋 Contoh Lengkap

### 1. Surat Keterangan Domisili

**Fields yang diperlukan:**
- nama (Nama Lengkap)
- nik (NIK)
- tempat_lahir (Tempat Lahir)
- tanggal_lahir (Tanggal Lahir)
- alamat (Alamat Lengkap)
- rt (RT)
- rw (RW)

**Template:**
```
Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:

[nama] dengan NIK [nik], lahir di [tempat_lahir] pada tanggal [tanggal_lahir], 
beralamat di [alamat] RT [rt] RW [rw], benar adalah warga yang berdomisili 
di wilayah kami.

Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan 
sebagaimana mestinya.
```

### 2. Surat Keterangan Usaha

**Fields yang diperlukan:**
- nama (Nama Lengkap)
- nik (NIK)
- alamat (Alamat)
- rt (RT)
- rw (RW)
- nama_usaha (Nama Usaha)
- jenis_usaha (Jenis Usaha)
- alamat_usaha (Alamat Usaha)
- tahun_berdiri (Tahun Berdiri)

**Template:**
```
Yang bertanda tangan di bawah ini menerangkan bahwa:

[nama] dengan NIK [nik], beralamat di [alamat] RT [rt] RW [rw], 
adalah benar memiliki usaha dengan data sebagai berikut:

Nama Usaha: [nama_usaha]
Jenis Usaha: [jenis_usaha]
Alamat Usaha: [alamat_usaha]
Berdiri Sejak: Tahun [tahun_berdiri]

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
```

### 3. Surat Keterangan Tidak Mampu

**Fields yang diperlukan:**
- nama (Nama Lengkap)
- nik (NIK)
- tempat_lahir (Tempat Lahir)
- tanggal_lahir (Tanggal Lahir)
- pekerjaan (Pekerjaan)
- alamat (Alamat)
- rt (RT)
- rw (RW)

**Template:**
```
Yang bertanda tangan di bawah ini menerangkan bahwa:

[nama] dengan NIK [nik], lahir di [tempat_lahir] pada tanggal [tanggal_lahir], 
bekerja sebagai [pekerjaan], beralamat di [alamat] RT [rt] RW [rw], 
adalah benar warga kami yang tergolong keluarga kurang mampu.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
```

---

## 👀 Preview Surat

Setelah membuat template:

1. Klik tombol **"👁️ Preview"**
2. Sistem akan menampilkan surat dengan:
   - ✅ Kop surat dari konfigurasi
   - ✅ Logo desa (jika sudah diupload)
   - ✅ Data contoh dari fields
   - ✅ Format profesional

3. Jika belum sesuai, klik **"Tutup"** dan edit template
4. Preview lagi hingga sempurna
5. Klik **"Simpan"**

---

## 💡 Tips & Tricks

### 1. Konsisten dengan Name Field
Pastikan `[nama_field]` di template sesuai dengan **name** field, bukan label!

**Contoh:**
- Field name: `tempat_lahir`
- Field label: "Tempat Lahir"
- Di template pakai: `[tempat_lahir]` ✅
- Jangan pakai: `[Tempat Lahir]` ❌

### 2. Gunakan Template Siap Pakai
Untuk mempermudah, gunakan template siap pakai yang sudah disediakan, 
lalu sesuaikan dengan kebutuhan Anda.

### 3. Klik Field untuk Insert
Daripada ketik manual, klik tombol field yang tersedia untuk insert otomatis 
ke template. Lebih cepat dan tidak akan salah ketik!

### 4. Preview Sebelum Simpan
Selalu preview sebelum simpan untuk memastikan hasil surat sudah sesuai.

### 5. Edit Kapan Saja
Jenis surat bisa diedit kapan saja jika ada yang perlu disesuaikan.

---

## 🎯 Hasil Akhir

Dengan template yang Anda buat, ketika warga mengajukan surat:

### Input Warga:
- Nama Lengkap: Ahmad Suryadi
- NIK: 3201150304680003
- Tempat Lahir: Bogor
- Tanggal Lahir: 15 Desember 2003
- Alamat: Jl. Raya Ciampea No. 123
- RT: 001
- RW: 001

### Output Surat:
```
PEMERINTAH KABUPATEN BOGOR
KECAMATAN CIAMPEA
DESA CIBADAK
------------------------------------------

SURAT KETERANGAN DOMISILI
Nomor: 001/SKD/10/2025

Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:

Ahmad Suryadi dengan NIK 3201150304680003, lahir di Bogor pada 
tanggal 15 Desember 2003, beralamat di Jl. Raya Ciampea No. 123 
RT 001 RW 001, benar adalah warga yang berdomisili di wilayah kami.

Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan 
sebagaimana mestinya.

                    Cibadak, 28 Oktober 2025
                    Kepala Desa Cibadak
                    
                    [Tanda Tangan & Stempel]
                    
                    LIYA MULIYA, S.Pd.I., M.Pd.
```

**Rapi, Profesional, dan Otomatis!** 🎉

---

## 🚀 Keuntungan Sistem Baru

### Untuk Admin:
✅ Tidak perlu coding  
✅ Tidak perlu edit file PHP/HTML  
✅ Tinggal klik dan isi form  
✅ Preview real-time  
✅ Bisa edit kapan saja  

### Untuk Warga:
✅ Form otomatis sesuai jenis surat  
✅ Preview sebelum kirim  
✅ Hasil surat profesional  
✅ Proses cepat dan mudah  

### Untuk Sistem:
✅ Konsisten dan terstandar  
✅ Mudah maintenance  
✅ Flexible dan scalable  
✅ Professional output  

---

## ❓ FAQ

**Q: Apakah bisa menggunakan format lama `{{field}}`?**  
A: Ya, sistem mendukung kedua format `[field]` dan `{{field}}`, tapi disarankan pakai `[field]` karena lebih jelas.

**Q: Bagaimana jika salah ketik nama field?**  
A: Preview akan menampilkan `[Data nama_field]` jika field tidak ditemukan. Perbaiki nama field-nya.

**Q: Bisa membuat template dengan format tabel?**  
A: Saat ini lebih baik pakai format sederhana. Format tabel bisa ditambahkan di update selanjutnya.

**Q: Apakah template bisa diubah setelah disimpan?**  
A: Ya, bisa edit kapan saja. Tapi perubahan hanya berlaku untuk pengajuan surat baru, tidak mengubah surat yang sudah disetujui.

---

**Selamat mencoba! Sistem sekarang jauh lebih mudah digunakan!** 🎉

Jika ada pertanyaan, silakan hubungi admin sistem.
