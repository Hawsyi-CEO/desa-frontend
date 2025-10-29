# Update Form - Gunakan Placeholder, Bukan Default Value

## Tanggal: 28 Oktober 2025

## Perubahan yang Dilakukan:

### 1. KonfigurasiSurat.jsx
**Sebelum:**
```javascript
const [formData, setFormData] = useState({
  nama_kabupaten: 'PEMERINTAH KABUPATEN BOGOR',
  nama_kecamatan: 'KECAMATAN CIAMPEA',
  nama_desa: 'DESA CIBADAK',
  // ... dst dengan default value
});
```

**Sesudah:**
```javascript
const [formData, setFormData] = useState({
  nama_kabupaten: '',
  nama_kecamatan: '',
  nama_desa: '',
  // ... semua field kosong
});
```

**Benefit:**
- Form tidak menampilkan data contoh di field
- User harus mengisi data sebenarnya dari desa mereka
- Lebih profesional dan tidak membingungkan

### 2. FormJenisSurat.jsx
**Sebelum:**
```javascript
kalimat_pembuka: 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :'
```

**Sesudah:**
```javascript
kalimat_pembuka: ''
```

**Placeholder tetap ada:**
```html
<textarea
  placeholder="Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :"
/>
```

### 3. Default Config untuk Preview
**Tetap dipertahankan di:**
- `FormJenisSurat.jsx` → `getDefaultConfig()`
- `PreviewSurat.jsx` → `getDefaultConfig()`

**Alasan:**
- Diperlukan sebagai fallback jika API gagal
- Untuk preview sementara sebelum konfigurasi diisi
- Tidak muncul di form, hanya di preview internal

## UX Flow:

### Pertama Kali Install:
1. Admin login ke sistem
2. Buka halaman "Konfigurasi Surat"
3. Semua field kosong dengan placeholder sebagai panduan
4. Admin wajib mengisi data desa mereka sendiri
5. Simpan → Data tersimpan ke database

### Tambah Jenis Surat:
1. Form kosong untuk nama surat, kode, dll
2. Placeholder memberikan contoh format
3. Admin mengisi sesuai kebutuhan desa mereka
4. Preview menggunakan config yang sudah tersimpan

## Placeholder yang Tersedia:

### Konfigurasi Surat:
- Nama Kabupaten: "PEMERINTAH KABUPATEN ..."
- Nama Kecamatan: "KECAMATAN ..."
- Nama Desa: "DESA ..."
- Alamat: "Alamat lengkap kantor desa..."
- Kota: "Kota - Provinsi"
- Kode Pos: "16620"
- Telepon: "0251-1234567"
- Email: "desa@email.com"
- Jabatan: "Kepala Desa ..."
- Nama: "Nama kepala desa..."

### Jenis Surat:
- Nama Surat: "Contoh: Surat Keterangan Domisili"
- Kode Surat: "Contoh: SKD"
- Format Nomor: "NOMOR/KODE/BULAN/TAHUN"
- Kalimat Pembuka: "Yang bertanda tangan di bawah ini..."
- Template Konten: Contoh lengkap dengan format

## Testing:

✅ Form konfigurasi menampilkan field kosong
✅ Placeholder terlihat sebagai hint
✅ User dapat mengisi dengan data asli
✅ Data tersimpan ke database
✅ Preview tetap berfungsi dengan default config
✅ Setelah save, data asli muncul di form

## File yang Dimodifikasi:

```
frontend/src/pages/SuperAdmin/
  ├── KonfigurasiSurat.jsx (UPDATED - empty initial state)
  └── FormJenisSurat.jsx (UPDATED - empty kalimat_pembuka)
```

## Catatan:
- Default config di `getDefaultConfig()` TIDAK dihapus
- Hanya digunakan untuk preview internal
- Tidak muncul sebagai value di form input
- User tidak bisa submit tanpa mengisi field required
