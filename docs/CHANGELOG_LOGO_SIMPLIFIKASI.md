# Update Konfigurasi Surat - Simplifikasi & Logo Baku

## Tanggal: 28 Oktober 2025

## Perubahan yang Dilakukan:

### 1. Database
- ✅ Hapus kolom: `logo_url`, `stempel_url`, `gunakan_stempel`, `logo_width`, `logo_height`
- ✅ Tambah kolom: `nama_sekretaris`, `nip_sekretaris`
- ✅ File SQL: `database/remove_logo_stempel.sql` & `database/add_sekretaris_desa.sql`

### 2. Backend (`backend/controllers/konfigurasiController.js`)
- ✅ Update `updateKonfigurasi()` - hapus parameter logo dan stempel
- ✅ Update `updateKonfigurasi()` - tambah parameter sekretaris
- ⚠️ Hapus route upload logo (tidak perlu lagi)

### 3. Frontend - Halaman Konfigurasi
File: `frontend/src/pages/SuperAdmin/KonfigurasiSurat.jsx`

**Simplifikasi halaman hanya menampilkan 2 section:**
- ✅ Kop Surat (nama kabupaten, kecamatan, desa, alamat, kota, kode pos, telp, email)
- ✅ Pejabat Penandatangan:
  - Kepala Desa (jabatan, nama, NIP)
  - Sekretaris Desa (nama, NIP)

**Dihapus:**
- ❌ Upload logo
- ❌ Upload stempel  
- ❌ Konfigurasi format nomor
- ❌ Konfigurasi style (border, font, dll)
- ❌ Footer text
- ❌ Preview modal

### 4. Preview Surat
File: 
- `frontend/src/pages/SuperAdmin/FormJenisSurat.jsx`
- `frontend/src/components/PreviewSurat.jsx`

**Perubahan:**
- ✅ Logo baku dari `/assets/Lambang_Kabupaten_Bogor.png`
- ✅ Ukuran logo fix 90x90px
- ✅ Hapus bagian stempel dari tanda tangan
- ✅ Perbaiki alignment kop surat (margin-right: 90px untuk centering)
- ✅ Font Arial baku dengan ukuran standar
- ✅ Tanda tangan tanpa stempel (akan basah manual)

### 5. Logo Asset
- ✅ Logo tersimpan di: `frontend/src/assets/Lambang_Kabupaten_Bogor.png`
- ✅ Fallback path jika gagal load dari `/assets/`

## Format Tanda Tangan Sekretaris (Coming Next)

Jika Kepala Desa berhalangan, saat cetak surat akan ada opsi untuk memilih penandatangan:

**Kepala Desa (Normal):**
```
Cibadak, 28 Oktober 2025

Kepala Desa Cibadak


LIYA MULIYA, S.Pd.I., M.Pd.
NIP. 123456789
```

**Sekretaris Desa (A.n):**
```
Cibadak, 28 Oktober 2025

a.n Kepala Desa Cibadak
Sekretaris Desa


NAMA SEKRETARIS DESA
NIP. 987654321
```

## Testing yang Perlu Dilakukan:

1. ✅ Cek halaman Konfigurasi Surat (hanya 2 section)
2. ⏳ Update data sekretaris
3. ⏳ Preview jenis surat - logo tampil & centered
4. ⏳ Preview pengajuan surat - logo tampil & centered
5. ⏳ Print surat - logo tampil dengan baik
6. ⏳ Implementasi opsi pilih penandatangan saat approve

## File yang Dimodifikasi:

```
database/
  ├── remove_logo_stempel.sql (NEW)
  └── add_sekretaris_desa.sql (NEW)

backend/controllers/
  └── konfigurasiController.js (UPDATED)

frontend/src/pages/SuperAdmin/
  ├── KonfigurasiSurat.jsx (REPLACED - simplified)
  ├── KonfigurasiSurat.backup.jsx (BACKUP)
  └── FormJenisSurat.jsx (UPDATED - logo path & alignment)

frontend/src/components/
  └── PreviewSurat.jsx (UPDATED - logo path & no stempel)

frontend/src/assets/
  └── Lambang_Kabupaten_Bogor.png (EXISTS)
```

## Next Steps:

1. ⏳ Tambah fungsi pilih penandatangan (Kepala Desa / Sekretaris) saat approve surat
2. ⏳ Update tampilan tanda tangan dengan format a.n jika yang TTD adalah sekretaris
3. ⏳ Testing print untuk memastikan tanda tangan basah/stempel ditambahkan manual

## Catatan Penting:

- Logo dan stempel sekarang tidak di-upload ke sistem
- Logo baku dari file assets
- Tanda tangan dan stempel harus ditambahkan manual (basah) setelah print
- Sekretaris desa bisa menandatangani dengan format "a.n Kepala Desa"
