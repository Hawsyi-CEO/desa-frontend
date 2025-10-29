# 🔄 UPDATE: Format Field Baru - Lebih Mudah Dipahami!

## ❌ Format Lama (Membingungkan)
```
Yang bertanda tangan di bawah ini menerangkan bahwa [nama] dengan NIK [nik]...
```
**Masalah**: Simbol `[]` terlihat seperti kode array atau placeholder teknis

---

## ✅ Format Baru (Mudah Dipahami)
```
Yang bertanda tangan di bawah ini menerangkan bahwa (nama) dengan NIK (nik)...
```
**Kelebihan**: 
- ✅ Lebih natural seperti teks biasa
- ✅ Simbol `()` lebih familiar dan tidak mengganggu
- ✅ Mudah dibaca bahkan oleh non-teknis

---

## 📝 Perubahan Format

| Elemen | Format Lama | Format Baru |
|--------|-------------|-------------|
| **Field Template** | `[nama]` | `(nama)` |
| **Field di Editor** | `[nik]` | `(nik)` |
| **Field Helper Button** | Insert `[field]` | Insert `(field)` |
| **Preview** | Menampilkan `[Label]` | Menampilkan **Label tebal** |
| **Format Nomor** | `{nomor}/{kode}/{bulan}/{tahun}` | `NOMOR/KODE/BULAN/TAHUN` |

---

## 🎯 Cara Menggunakan Format Baru

### 1. Di Pop-up Tambah Jenis Surat

#### Tambah Field:
1. Klik **"+ Field"**
2. Isi **Name**: `nama` (huruf kecil, pakai underscore)
3. Isi **Label**: `Nama Lengkap`
4. Pilih **Type**: Text
5. Centang **Required** jika wajib diisi

#### Buat Template:
**Cara 1 - Gunakan Template Preset:**
- Klik tombol preset: **"📋 Surat Keterangan Domisili"**
- Template otomatis terisi dengan format `(field)`
- Sesuaikan jika perlu

**Cara 2 - Klik Button Field:**
- Klik tombol field yang tersedia (misal: **"nama"**)
- Otomatis insert `(nama)` ke cursor position
- Lanjutkan menulis template

**Cara 3 - Ketik Manual:**
- Ketik langsung di editor: `(nama)`, `(nik)`, `(alamat)`
- Pastikan nama field sesuai dengan name di field list

#### Format Nomor Surat:
- **Default**: `NOMOR/KODE/BULAN/TAHUN` → 001/SKD/10/2025
- **Custom**: `KODE-NOMOR/TAHUN` → SKD-001/2025
- **Custom**: `NOMOR/Ket/KODE/TAHUN` → 001/Ket/SKD/2025

**Kata kunci yang bisa digunakan:**
- `NOMOR` - Nomor urut (001, 002, 003...)
- `KODE` - Kode surat (SKD, SKU, SKTM...)
- `BULAN` - Bulan 2 digit (01-12)
- `TAHUN` - Tahun 4 digit (2025)

---

## 📋 Contoh Template Lengkap

### Surat Keterangan Domisili

**Fields yang diperlukan:**
```
name: nama          | label: Nama Lengkap      | type: text
name: nik           | label: NIK               | type: text
name: tempat_lahir  | label: Tempat Lahir      | type: text
name: tanggal_lahir | label: Tanggal Lahir     | type: date
name: alamat        | label: Alamat            | type: textarea
name: rt            | label: RT                | type: text
name: rw            | label: RW                | type: text
```

**Template:**
```
Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:

(nama) dengan NIK (nik), lahir di (tempat_lahir) pada tanggal (tanggal_lahir), 
beralamat di (alamat) RT (rt) RW (rw), benar adalah warga yang berdomisili 
di wilayah kami.

Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan 
sebagaimana mestinya.
```

**Format Nomor:**
```
NOMOR/SKD/BULAN/TAHUN
```

**Preview di layar akan tampil:**
```
Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:

Ahmad Suryadi dengan NIK 3201150304680003, lahir di Bogor pada tanggal 
15 Desember 2003, beralamat di Jl. Raya Ciampea No. 123 RT 001 RW 001, 
benar adalah warga yang berdomisili di wilayah kami.

Demikian surat keterangan domisili ini dibuat untuk dapat dipergunakan 
sebagaimana mestinya.
```
*(Data yang diisi warga ditampilkan dengan **tebal**)*

---

## 🔄 Backward Compatibility

Sistem masih **mendukung format lama** untuk template yang sudah ada:

| Format | Status | Keterangan |
|--------|--------|------------|
| `(field)` | ✅ **RECOMMENDED** | Format baru, lebih mudah |
| `[field]` | ✅ Supported | Format lama masih berfungsi |
| `{{field}}` | ✅ Supported | Format sangat lama masih berfungsi |

**Rekomendasi:**
- Template **baru** gunakan `(field)`
- Template **lama** bisa tetap pakai `[field]` atau `{{field}}`
- Tidak perlu update semua template lama, bisa bertahap

---

## 🎨 Live Preview

### Di Editor Template:
- Field **valid** (ada di field list) → Ditampilkan **tebal**
- Field **tidak valid** (belum dibuat) → Ditampilkan dengan **background kuning**

**Contoh:**
```
Template: (nama) adalah warga (desa_asal)

Preview jika field 'nama' ada, tapi 'desa_asal' belum dibuat:
```
```
Nama Lengkap adalah warga (desa_asal)
                          ^^^^^^^^^^
                        (kuning = belum ada fieldnya)
```

---

## 📂 File yang Diupdate

| File | Perubahan |
|------|-----------|
| `JenisSurat.jsx` | - `insertFieldTag()`: Insert `(field)` bukan `[field]`<br>- Template presets: Semua pakai `(field)`<br>- Placeholder text: Update ke `(field)`<br>- `getLivePreview()`: Support `(field)` + backward compatible<br>- `renderTemplate()`: Support semua format |
| `PreviewSurat.jsx` | - `renderTemplate()`: Support `(field)`, `[field]`, `{{field}}`<br>- Tampilkan semua format dengan **tebal** |
| Database | - No change needed (template disimpan as-is) |
| Backend | - No change needed (hanya menyimpan string) |

---

## ✨ Keuntungan Format Baru

### Untuk Admin:
✅ Lebih mudah dibaca  
✅ Tidak terlihat seperti kode  
✅ Natural saat menulis  
✅ Lebih cepat dipahami  

### Untuk User/Warga:
✅ Jika melihat template, lebih jelas  
✅ Preview lebih informatif  
✅ Tidak bingung dengan simbol aneh  

### Untuk Developer:
✅ Clean code  
✅ Backward compatible  
✅ Mudah di-maintain  
✅ Regex lebih simple  

---

## 🚀 Migration Guide (Opsional)

Jika ingin update template lama ke format baru:

### Manual:
1. Buka **Jenis Surat**
2. Klik **Edit** pada surat yang ingin diupdate
3. Di editor, replace:
   - `[nama]` → `(nama)`
   - `[nik]` → `(nik)`
   - dst...
4. Klik **Simpan**

### Automatic (SQL - untuk banyak template):
```sql
-- Backup dulu!
CREATE TABLE jenis_surat_backup AS SELECT * FROM jenis_surat;

-- Replace [field] dengan (field)
UPDATE jenis_surat 
SET template_konten = REPLACE(
  REPLACE(
    REPLACE(template_konten, '[nama]', '(nama)'),
    '[nik]', '(nik)'
  ),
  '[alamat]', '(alamat)'
);
-- Sesuaikan dengan field yang ada
```

**Catatan:** Migration **tidak wajib**, format lama masih berfungsi normal!

---

## 💡 Tips Penggunaan

### 1. Konsisten dengan Name Field
```
❌ SALAH:
Field name: tempat_lahir
Template:   (tempatLahir)  → Tidak akan ter-replace!

✅ BENAR:
Field name: tempat_lahir
Template:   (tempat_lahir) → Perfect!
```

### 2. Gunakan Underscore untuk Multi-kata
```
✅ BENAR:  (tanggal_lahir), (nama_usaha), (alamat_usaha)
❌ SALAH:  (tanggalLahir), (Nama Usaha), (alamat-usaha)
```

### 3. Huruf Kecil Semua
```
✅ BENAR:  (nama), (nik), (rt)
❌ SALAH:  (Nama), (NIK), (RT)
```

### 4. Preview Sebelum Simpan
Selalu klik **Preview** untuk memastikan semua field ter-replace dengan benar!

---

## 📞 Support

Jika ada field yang tidak muncul di preview:
1. Cek nama field (harus exact match)
2. Pastikan field sudah ditambahkan di field list
3. Refresh halaman
4. Coba Edit → Save lagi

---

**Format baru `(field)` lebih mudah, lebih jelas, lebih user-friendly!** 🎉

Selamat membuat template surat dengan format baru!
