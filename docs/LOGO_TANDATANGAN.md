# Panduan Logo dan Tanda Tangan Surat

## Logo Desa

### File Logo Baku
- **Lokasi**: `frontend/src/assets/Lambang_Kabupaten_Bogor.png`
- **Ukuran Standard**: 90px × 90px
- **Format**: PNG dengan background transparan

### Cara Mengganti Logo
Jika Anda ingin mengganti logo dengan logo desa Anda sendiri:

1. Siapkan file logo dalam format PNG dengan background transparan
2. Ukuran yang direkomendasikan: minimal 500x500 pixels
3. Ganti file `Lambang_Kabupaten_Bogor.png` di folder `frontend/src/assets/`
4. Atau rename file logo Anda menjadi `Lambang_Kabupaten_Bogor.png`

**Penting**: Logo akan otomatis muncul di semua surat tanpa perlu upload di system.

---

## Tanda Tangan dan Stempel

### Proses Penandatanganan
System ini **TIDAK** menyimpan tanda tangan atau stempel digital karena:

1. **Keabsahan Dokumen**: Surat resmi harus ditandatangani secara manual
2. **Keamanan**: Tanda tangan dan stempel asli tidak boleh disimpan di system digital
3. **Legalitas**: Dokumen pemerintahan memerlukan tanda tangan dan stempel basah

### Alur Kerja:
1. Warga mengajukan surat melalui system
2. Verifikator memeriksa dan memverifikasi data
3. Admin mencetak surat yang sudah disetujui
4. **Kepala Desa menandatangani dan membubuhkan stempel secara manual**
5. Surat yang sudah ditandatangani diserahkan kepada pemohon

### Format Cetak
Surat sudah diformat dengan ruang kosong untuk:
- Tanda tangan: 70mm dari nama jabatan
- Lokasi: Pojok kanan bawah
- Cukup ruang untuk stempel di atas nama

---

## Konfigurasi Surat

### Data yang Disimpan di Database (tabel `konfigurasi_surat`):

```sql
- nama_kabupaten      : Nama Kabupaten
- nama_kecamatan      : Nama Kecamatan  
- nama_desa           : Nama Desa
- alamat_kantor       : Alamat Kantor Desa
- kota                : Kota
- kode_pos            : Kode Pos
- telepon             : Nomor Telepon (opsional)
- email               : Email (opsional)
- jabatan_ttd         : Jabatan Penandatangan (contoh: "Kepala Desa")
- nama_ttd            : Nama Lengkap Penandatangan
- nip_ttd             : NIP Penandatangan (opsional)
```

### Data yang TIDAK Disimpan:
- ❌ Logo (menggunakan file baku)
- ❌ Tanda tangan digital
- ❌ Stempel digital

---

## Migrasi dari Versi Lama

Jika Anda mengupgrade dari versi yang memiliki upload logo/stempel:

1. Jalankan script SQL: `database/remove_logo_stempel.sql`
2. Logo dan stempel yang sudah diupload akan otomatis diabaikan
3. System akan menggunakan logo baku dari folder assets

---

## Keuntungan Sistem Ini

✅ **Lebih Aman**: Tidak ada risiko penyalahgunaan tanda tangan/stempel digital
✅ **Lebih Sederhana**: Tidak perlu upload dan manage file logo untuk setiap surat
✅ **Konsisten**: Semua surat menggunakan logo yang sama
✅ **Legal**: Memenuhi requirement dokumen resmi yang harus ditandatangani basah
✅ **Praktis**: Cukup ganti 1 file logo di assets untuk update semua surat
