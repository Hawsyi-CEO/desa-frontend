# Custom Kalimat Pembuka Surat

## Overview
Fitur ini memungkinkan admin untuk mengcustom **kalimat pembuka** setiap jenis surat sesuai kebutuhan.

Sebelumnya, kalimat pembuka bersifat statis:
```
"Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :"
```

Sekarang, setiap **Jenis Surat** bisa memiliki kalimat pembuka yang berbeda-beda.

---

## Cara Menggunakan

### 1. Login sebagai Super Admin
- Username: `superadmin`
- Password: `admin123`

### 2. Masuk ke Menu "Jenis Surat"

### 3. Tambah/Edit Jenis Surat
Saat membuat atau mengedit jenis surat, akan ada field:

```
┌──────────────────────────────────────────────────┐
│ Kalimat Pembuka *                                │
│ ┌──────────────────────────────────────────────┐ │
│ │ Yang bertanda tangan di bawah ini, Kepala    │ │
│ │ Desa Cibadak, dengan ini menerangkan bahwa : │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 💡 Kalimat pembuka akan muncul sebelum isi      │
│    surat. Anda bisa custom sesuai kebutuhan     │
│    masing-masing jenis surat.                   │
│                                                  │
│ Contoh lain:                                     │
│ "Yang bertanda tangan di bawah ini Lurah        │
│ Cibadak, Kecamatan Ciampea, dengan ini          │
│ menerangkan bahwa :"                             │
└──────────────────────────────────────────────────┘
```

---

## Contoh Penggunaan

### Surat Keterangan Domisili
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :
```

### Surat Keterangan Tidak Mampu
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, Kecamatan Ciampea, Kabupaten Bogor, dengan ini menerangkan dengan sebenarnya bahwa :
```

### Surat Pengantar SKCK
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini memberikan pengantar kepada :
```

### Surat Keterangan Usaha
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa yang namanya tersebut di bawah ini :
```

### Surat Keterangan Ahli Waris
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, menerangkan bahwa benar orang-orang yang namanya tercantum di bawah ini :
```

### Surat Izin Keramaian
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini memberikan izin kepada :
```

---

## Struktur Surat yang Dihasilkan

```
┌─────────────────────────────────────────┐
│         [KOP SURAT]                     │
│  PEMERINTAH KABUPATEN BOGOR             │
│  KECAMATAN CIAMPEA                      │
│  DESA CIBADAK                           │
├─────────────────────────────────────────┤
│                                         │
│  SURAT KETERANGAN DOMISILI              │
│  Nomor : 001/SKD/10/2025                │
│                                         │
│  [KALIMAT PEMBUKA - CUSTOM PER JENIS]   │  ← DI SINI
│  Yang bertanda tangan di bawah ini,     │
│  Kepala Desa Cibadak, dengan ini        │
│  menerangkan bahwa :                    │
│                                         │
│  Nama     : Ahmad Fauzi                 │
│  NIK      : 3201012312980001            │
│  ...                                    │
│                                         │
│  [ISI SURAT - DARI TEMPLATE]            │
│                                         │
│  [TANDA TANGAN]                         │
└─────────────────────────────────────────┘
```

---

## Database Schema

Tabel `jenis_surat` memiliki kolom baru:
```sql
kalimat_pembuka TEXT
```

Default value:
```
Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :
```

---

## API Changes

### Create Jenis Surat
**Endpoint:** `POST /admin/jenis-surat`

**Request Body:**
```json
{
  "nama_surat": "Surat Keterangan Domisili",
  "kode_surat": "SKD",
  "format_nomor": "NOMOR/KODE/BULAN/TAHUN",
  "kalimat_pembuka": "Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :",
  "template_konten": "...",
  "fields": [...],
  "require_verification": true
}
```

### Update Jenis Surat
**Endpoint:** `PUT /admin/jenis-surat/:id`

**Request Body:** *(sama seperti create)*

### Get All Surat (untuk preview)
Response akan include `kalimat_pembuka`:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama_surat": "Surat Keterangan Domisili",
      "kalimat_pembuka": "Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :",
      ...
    }
  ]
}
```

---

## Frontend Components

### JenisSurat.jsx
- Tambah textarea untuk `kalimat_pembuka`
- Validasi required
- Default value saat create/reset

### PreviewSurat.jsx (Preview Component)
- Render `kalimat_pembuka` dari `pengajuan.jenis_surat.kalimat_pembuka`
- Fallback ke default jika tidak ada

---

## Tips & Best Practices

### ✅ DO
- Gunakan kalimat formal dan baku
- Sesuaikan dengan jenis surat (keterangan, pengantar, izin, dll)
- Akhiri dengan tanda titik dua (:)
- Gunakan jabatan yang sesuai

### ❌ DON'T
- Jangan terlalu panjang (maksimal 2-3 baris)
- Hindari kalimat tidak formal
- Jangan lupa tanda baca
- Jangan gunakan singkatan yang tidak jelas

---

## Migration

File SQL: `database/add_kalimat_pembuka.sql`

```sql
-- Tambah kolom
ALTER TABLE jenis_surat 
ADD COLUMN kalimat_pembuka TEXT 
AFTER format_nomor;

-- Update existing records
UPDATE jenis_surat 
SET kalimat_pembuka = 'Yang bertanda tangan di bawah ini, Kepala Desa Cibadak, dengan ini menerangkan bahwa :' 
WHERE kalimat_pembuka IS NULL OR kalimat_pembuka = '';
```

Jalankan:
```powershell
& "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" -u root surat_desa < database/add_kalimat_pembuka.sql
```

---

## Testing

### Test Case 1: Create dengan Custom Kalimat Pembuka
1. Login sebagai superadmin
2. Buat jenis surat baru
3. Isi kalimat pembuka custom
4. Simpan dan preview
5. Verifikasi kalimat pembuka muncul di preview

### Test Case 2: Edit Kalimat Pembuka
1. Edit jenis surat existing
2. Ubah kalimat pembuka
3. Simpan dan preview
4. Verifikasi perubahan tersimpan

### Test Case 3: Backward Compatibility
1. Jenis surat lama tanpa kalimat_pembuka
2. Harus muncul default kalimat pembuka
3. Tidak error

---

## Troubleshooting

### Kalimat pembuka tidak muncul di preview
**Solusi:**
- Pastikan backend mengirim `kalimat_pembuka` di response
- Check query SQL include kolom `js.kalimat_pembuka`
- Restart backend setelah update

### Error saat simpan
**Solusi:**
- Pastikan kolom `kalimat_pembuka` sudah ditambah ke database
- Jalankan migration SQL
- Check backend log untuk error detail

---

## Future Enhancements

Possible improvements:
- [ ] Template kalimat pembuka (preset untuk berbagai jenis)
- [ ] Variable replacement (e.g., `{jabatan}`, `{nama_desa}`)
- [ ] Multi-language support
- [ ] Rich text editor untuk format kalimat

---

## Related Files

### Backend
- `backend/controllers/adminController.js` - Create/Update jenis surat
- `backend/controllers/verifikatorController.js` - Get surat untuk preview

### Frontend
- `frontend/src/pages/SuperAdmin/JenisSurat.jsx` - Form input
- `frontend/src/components/PreviewSurat.jsx` - Preview component

### Database
- `database/add_kalimat_pembuka.sql` - Migration script

---

**Created:** 2025-10-28  
**Last Updated:** 2025-10-28  
**Version:** 1.0
