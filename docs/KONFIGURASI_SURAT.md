# Panduan Konfigurasi Surat

## Fitur Konfigurasi Surat

Sistem Surat Digital Desa sekarang dilengkapi dengan fitur konfigurasi surat yang memudahkan admin untuk mengatur tampilan dan format surat secara user-friendly, **tanpa perlu coding!**

## Akses Halaman Konfigurasi

1. Login sebagai **Super Admin**
2. Klik menu **"Konfigurasi Surat"** di sidebar
3. Isi semua konfigurasi yang tersedia
4. Klik **"Preview"** untuk melihat hasil
5. Klik **"Simpan Konfigurasi"** untuk menyimpan

## Bagian-Bagian Konfigurasi

### 1. 🏛️ Kop Surat

Konfigurasi untuk header/kepala surat resmi:

- **Nama Kabupaten**: Contoh: "PEMERINTAH KABUPATEN BOGOR"
- **Nama Kecamatan**: Contoh: "KECAMATAN CIAMPEA"
- **Nama Desa**: Contoh: "DESA CIBADAK"
- **Alamat Kantor Desa**: Alamat lengkap kantor desa
- **Kota/Provinsi**: Contoh: "Jawa Barat"
- **Kode Pos**: Contoh: "16620"
- **Telepon**: Nomor telepon kantor desa
- **Email**: Email resmi desa
- **Website**: Website desa (jika ada)

### 2. 🖼️ Logo & Stempel

Upload dan konfigurasi logo serta stempel:

**Logo Desa:**
- Upload file gambar logo (PNG, JPG)
- Atur lebar dan tinggi logo dalam pixel
- Logo akan muncul di kiri atas surat

**Stempel:**
- Centang "Gunakan Stempel" jika ingin menggunakan stempel
- Upload gambar stempel (format PNG dengan background transparan lebih baik)
- Stempel akan muncul di area tanda tangan

### 3. ✍️ Pejabat Penandatangan

Informasi pejabat yang menandatangani surat:

- **Jabatan**: Contoh: "Kepala Desa Cibadak"
- **Nama Lengkap**: Nama dan gelar lengkap
- **NIP**: Nomor Induk Pegawai (opsional)
- **Jabatan Verifikator**: Contoh: "Ketua RT/RW"

### 4. 📋 Format Nomor Surat

Konfigurasi cara penomoran surat:

- **Format Nomor**: Template format nomor surat
  - Gunakan variabel: `{{nomor}}`, `{{kode}}`, `{{bulan}}`, `{{tahun}}`
  - Contoh: `{{nomor}}/{{kode}}/{{bulan}}/{{tahun}}`
  - Hasil: `001/SKD/10/2025`
  
- **Nomor Urut Awal**: Nomor mulai (biasanya 1)
- **Reset Nomor Tiap Tahun**: Centang jika nomor direset setiap tahun baru

### 5. 🎨 Gaya Surat

Kustomisasi tampilan visual surat:

- **Warna Border**: Pilih warna garis pembatas (default: hitam #000000)
- **Ketebalan Border**: Dalam pixel (default: 3px)
- **Font Family**: Pilih jenis font
  - Times New Roman (formal)
  - Arial
  - Calibri
  - Georgia
- **Ukuran Font Header**: Ukuran font untuk judul (default: 14px)
- **Ukuran Font Isi**: Ukuran font untuk isi surat (default: 12px)

### 6. 📄 Footer & Keterangan

- **Teks Footer**: Teks yang muncul di bagian bawah surat (opsional)
- **Keterangan**: Catatan internal untuk admin (tidak ditampilkan di surat)

## Cara Menggunakan

### Langkah 1: Setup Awal

1. Masuk ke halaman Konfigurasi Surat
2. Isi semua informasi kop surat (nama kabupaten, kecamatan, desa, dll)
3. Upload logo desa jika ada
4. Isi data pejabat penandatangan
5. Sesuaikan format nomor surat
6. **Simpan konfigurasi**

### Langkah 2: Tes Preview

1. Setelah menyimpan, klik tombol **"👁️ Preview Surat"**
2. Lihat hasil tampilan surat dengan konfigurasi yang telah dibuat
3. Jika belum sesuai, kembali ke form dan ubah konfigurasi
4. Preview lagi hingga sesuai
5. Simpan konfigurasi final

### Langkah 3: Buat Jenis Surat

Setelah konfigurasi tersimpan:

1. Buka menu **"Jenis Surat"**
2. Klik **"Tambah Jenis Surat"**
3. Isi nama surat, kode, deskripsi
4. Gunakan **Template Builder** untuk membuat template konten
5. Tambahkan **Fields** yang diperlukan
6. Klik **"Preview"** untuk melihat contoh surat
7. Surat akan otomatis menggunakan konfigurasi yang sudah disimpan

## Preview Surat

Setiap kali membuat atau melihat surat, preview akan menampilkan:

✅ Kop surat sesuai konfigurasi  
✅ Logo desa (jika sudah diupload)  
✅ Format yang rapi dan profesional  
✅ Informasi pejabat sesuai konfigurasi  
✅ Stempel (jika diaktifkan)  
✅ Style sesuai pilihan (font, warna, dll)  

## Tips & Best Practices

### Logo

- Gunakan file PNG dengan background transparan
- Ukuran file maksimal 2MB
- Resolusi yang disarankan: 300x300px atau lebih
- Rasio logo sebaiknya persegi atau portrait

### Stempel

- Gunakan PNG dengan background transparan
- Scan stempel asli dengan resolusi tinggi
- Hapus background menggunakan tool online atau Photoshop
- Ukuran file maksimal 2MB

### Format Nomor Surat

Beberapa contoh format yang bisa digunakan:

1. **Format Standar**: `{{nomor}}/{{kode}}/{{bulan}}/{{tahun}}`
   - Hasil: `001/SKD/10/2025`

2. **Format Lengkap**: `{{nomor}}/{{kode}}/DESA/{{bulan}}/{{tahun}}`
   - Hasil: `001/SKD/DESA/10/2025`

3. **Format Custom**: `NO.{{nomor}}-{{kode}}-{{tahun}}`
   - Hasil: `NO.001-SKD-2025`

### Font dan Style

- **Untuk Surat Resmi**: Gunakan Times New Roman, font size 12
- **Untuk Surat Modern**: Gunakan Arial atau Calibri
- **Border**: Hitam dengan ketebalan 3-4px untuk kesan formal
- **Warna**: Gunakan warna gelap untuk border (hitam/abu tua)

## Troubleshooting

### Logo Tidak Muncul

- Pastikan file sudah terupload dengan benar
- Cek ukuran file tidak melebihi 2MB
- Refresh halaman browser
- Coba upload ulang dengan format PNG atau JPG

### Preview Tidak Sesuai

- Pastikan sudah klik tombol "Simpan Konfigurasi"
- Refresh halaman setelah menyimpan
- Clear cache browser jika diperlukan

### Nomor Surat Tidak Generate

- Cek format nomor sudah benar
- Pastikan variabel ditulis dengan benar: `{{nomor}}` bukan `{nomor}`
- Simpan konfigurasi sebelum membuat surat baru

## Integrasi dengan Fitur Lain

Konfigurasi surat akan otomatis digunakan di:

- ✅ **Preview Jenis Surat** - Saat membuat template
- ✅ **Pengajuan Surat Warga** - Preview sebelum submit
- ✅ **Verifikasi Surat** - Preview oleh verifikator
- ✅ **Approval Surat** - Preview oleh super admin
- ✅ **Download/Print Surat** - Surat final yang disetujui

## Keamanan

- Hanya **Super Admin** yang bisa mengubah konfigurasi
- Semua user (warga, verifikator) bisa melihat preview dengan konfigurasi yang aktif
- Logo dan stempel disimpan dengan aman di server
- File upload dibatasi ukuran dan tipe untuk keamanan

## Update Konfigurasi

Konfigurasi bisa diubah kapan saja:

1. Masuk ke halaman Konfigurasi Surat
2. Ubah bagian yang ingin diupdate
3. Klik **"Preview"** untuk cek hasil
4. Klik **"Simpan Konfigurasi"**
5. **Semua surat yang dibuat setelahnya akan menggunakan konfigurasi baru**

⚠️ **Catatan**: Surat yang sudah disetujui sebelumnya tidak akan berubah.

## Contoh Hasil

Dengan konfigurasi yang baik, surat akan terlihat seperti:

```
┌────────────────────────────────────────────────┐
│  [LOGO]    PEMERINTAH KABUPATEN BOGOR         │
│            KECAMATAN CIAMPEA                  │
│            DESA CIBADAK                       │
│   Alamat lengkap kantor desa                  │
├────────────────────────────────────────────────┤
│                                               │
│      SURAT KETERANGAN DOMISILI               │
│          Nomor: 001/SKD/10/2025              │
│                                               │
│  Yang bertanda tangan di bawah ini...         │
│  [Isi surat dengan data dari form]           │
│                                               │
│                    Cibadak, 28 Oktober 2025  │
│                    Kepala Desa Cibadak       │
│                                               │
│                    [STEMPEL]                  │
│                                               │
│                    LIYA MULIYA, S.Pd.I.,M.Pd.│
└────────────────────────────────────────────────┘
```

## Support

Jika mengalami kesulitan dalam menggunakan fitur konfigurasi:

1. Baca dokumentasi ini dengan teliti
2. Coba fitur Preview untuk melihat hasil
3. Hubungi admin sistem jika masih ada masalah

---

**Selamat menggunakan fitur Konfigurasi Surat!** 🎉

Dengan fitur ini, Anda bisa membuat surat resmi yang profesional tanpa perlu coding atau design dari awal!
