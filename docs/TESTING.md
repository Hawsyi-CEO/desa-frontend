# Panduan Testing Fitur Jenis Surat dan Verifikasi

## Flow Testing Lengkap

### Persiapan
1. Pastikan database sudah direset dengan kredensial baru (jalankan `.\reset-database.ps1`)
2. Jalankan backend: `cd backend; npm run dev`
3. Jalankan frontend: `cd frontend; npm run dev`
4. Buka browser di `http://localhost:5173`

---

## FLOW 1: Super Admin - Buat Jenis Surat

### 1. Login sebagai Super Admin
- Email: `superadmin@desa.com`
- Password: `admin123`

### 2. Buat Jenis Surat Baru
1. Klik menu **Jenis Surat**
2. Klik tombol **+ Tambah Jenis Surat**
3. Isi form:
   - **Nama Surat**: Surat Keterangan Kelakuan Baik
   - **Kode Surat**: SKKB
   - **Deskripsi**: Surat keterangan berkelakuan baik
   - **Template Konten**:
     ```
     Yang bertanda tangan di bawah ini, Kepala Desa, menerangkan bahwa:
     
     Nama: {{nama}}
     NIK: {{nik}}
     Tempat/Tanggal Lahir: {{tempat_lahir}}/{{tanggal_lahir}}
     Pekerjaan: {{pekerjaan}}
     Alamat: {{alamat}}
     
     Adalah benar warga kami yang berkelakuan baik dan tidak pernah terlibat tindak kriminal.
     
     Demikian surat keterangan ini dibuat untuk {{keperluan}}.
     ```
   - **Perlu Verifikasi RT/RW**: ✅ Checked
   - **Status**: Aktif

4. Tambahkan Fields:
   | Name | Label | Type | Required |
   |------|-------|------|----------|
   | nama | Nama Lengkap | text | ✅ |
   | nik | NIK | text | ✅ |
   | tempat_lahir | Tempat Lahir | text | ✅ |
   | tanggal_lahir | Tanggal Lahir | date | ✅ |
   | pekerjaan | Pekerjaan | text | ✅ |
   | alamat | Alamat | textarea | ✅ |
   | keperluan | Keperluan | text | ✅ |

5. Klik **Simpan**
6. Verifikasi jenis surat muncul di tabel

---

## FLOW 2: Warga - Ajukan Surat

### 1. Logout dan Login sebagai Warga
- Logout dari Super Admin
- Login sebagai Warga:
  - Email: `warga@desa.com`
  - Password: `warga123`

### 2. Ajukan Surat
1. Klik menu **Ajukan Surat**
2. Pilih jenis surat yang baru dibuat (atau yang sudah ada)
3. Isi semua field yang diminta:
   - Nama Lengkap: Budi Santoso
   - NIK: 3234567890123456
   - Tempat Lahir: Jakarta
   - Tanggal Lahir: 1990-01-15
   - Pekerjaan: Wiraswasta
   - Alamat: Jl. Merdeka No. 10
   - Keperluan: Melamar pekerjaan
4. Upload lampiran (jika ada)
5. Klik **Ajukan Surat**
6. Verifikasi surat muncul di **History** dengan status "Menunggu Verifikasi"

---

## FLOW 3: Verifikator/Admin - Verifikasi Surat

### 1. Logout dan Login sebagai Admin/Verifikator
- Logout dari Warga
- Login sebagai Admin RT/RW:
  - Email: `admin@desa.com`
  - Password: `admin123`

### 2. Verifikasi Surat
1. Dashboard akan menampilkan jumlah surat menunggu verifikasi
2. Klik menu **Verifikasi Surat**
3. Lihat list surat yang perlu diverifikasi
4. Klik **Lihat Detail** pada surat yang ingin diverifikasi
5. Review semua informasi:
   - Data pemohon
   - Data surat yang diisi
   - Lampiran (jika ada)
6. Isi **Catatan Verifikasi** (opsional)
7. Pilih aksi:
   - **Setujui**: Surat akan dikirim ke Super Admin untuk approval
   - **Tolak**: Surat akan ditolak dengan catatan

**Testing Approve:**
- Isi catatan: "Data sudah sesuai"
- Klik **Setujui**
- Verifikasi surat hilang dari list "Menunggu Verifikasi"
- Cek di **Riwayat** untuk melihat surat yang sudah diverifikasi

---

## FLOW 4: Super Admin - Approve Surat

### 1. Login sebagai Super Admin
- Email: `superadmin@desa.com`
- Password: `admin123`

### 2. Approve Surat
1. Klik menu **Surat**
2. Filter status: **Diverifikasi**
3. Lihat surat yang sudah diverifikasi RT/RW
4. Klik **Lihat Detail**
5. Review semua informasi termasuk:
   - Data pemohon
   - Data surat
   - Informasi verifikasi dari RT/RW
6. Isi form approval:
   - **Tanggal Surat**: Pilih tanggal (required)
   - **Catatan**: Opsional
7. Pilih aksi:
   - **Setujui**: Surat akan disetujui dan diberi nomor surat otomatis
   - **Tolak**: Surat akan ditolak (catatan wajib diisi)

**Testing Approve:**
- Tanggal Surat: Pilih tanggal hari ini
- Catatan: "Surat disetujui"
- Klik **Setujui**
- Akan muncul alert dengan nomor surat, contoh: `001/SURAT-DESA/10/2025`
- Verifikasi surat muncul dengan status "Disetujui"

---

## FLOW 5: Testing Edit/Hapus Jenis Surat

### 1. Edit Jenis Surat
1. Login sebagai Super Admin
2. Menu **Jenis Surat**
3. Klik **Edit** pada jenis surat
4. Ubah nama atau deskripsi
5. Tambah/hapus fields
6. Klik **Simpan**
7. Verifikasi perubahan tersimpan

### 2. Hapus Jenis Surat
1. Klik **Hapus** pada jenis surat
2. Konfirmasi penghapusan
3. Verifikasi jenis surat hilang dari list

**⚠️ Catatan**: Jangan hapus jenis surat yang sudah digunakan untuk pengajuan surat!

---

## FLOW 6: Testing Reject Flow

### Testing Reject di Level Verifikator
1. Login sebagai Warga, ajukan surat baru
2. Login sebagai Admin RT/RW
3. Lihat detail surat
4. Isi catatan: "Data alamat tidak lengkap"
5. Klik **Tolak**
6. Login kembali sebagai Warga
7. Cek **History**, surat akan berstatus "Ditolak" dengan catatan

### Testing Reject di Level Super Admin
1. Pastikan ada surat dengan status "Diverifikasi"
2. Login sebagai Super Admin
3. Menu **Surat**, filter "Diverifikasi"
4. Lihat detail surat
5. Isi catatan: "Dokumen pendukung kurang"
6. Klik **Tolak**
7. Verifikasi surat berstatus "Ditolak"

---

## Checklist Testing

### ✅ Jenis Surat
- [ ] Create jenis surat baru
- [ ] Edit jenis surat
- [ ] Hapus jenis surat
- [ ] View list jenis surat
- [ ] Field builder berfungsi dengan baik
- [ ] Status aktif/nonaktif berfungsi

### ✅ Pengajuan Surat (Warga)
- [ ] Ajukan surat baru
- [ ] Form dinamis sesuai fields jenis surat
- [ ] Upload lampiran
- [ ] View history pengajuan
- [ ] Lihat detail surat yang diajukan

### ✅ Verifikasi (Admin RT/RW)
- [ ] Lihat surat dari wilayah yang sama saja
- [ ] Dashboard menampilkan stats yang benar
- [ ] Approve surat (kirim ke super admin)
- [ ] Reject surat dengan catatan
- [ ] View riwayat verifikasi

### ✅ Approval (Super Admin)
- [ ] Lihat semua surat yang sudah diverifikasi
- [ ] Filter by status
- [ ] Filter by jenis surat
- [ ] Approve surat (generate nomor otomatis)
- [ ] Reject surat dengan catatan
- [ ] View detail lengkap termasuk history

---

## Troubleshooting

### Surat tidak muncul di list verifikator
- Pastikan RT/RW warga sama dengan RT/RW verifikator
- Pastikan status surat "menunggu_verifikasi"
- Pastikan jenis surat memiliki `require_verification = true`

### Nomor surat tidak ter-generate
- Pastikan tanggal surat sudah diisi
- Check console backend untuk error
- Pastikan database tabel pengajuan_surat field no_surat ada

### Form fields tidak muncul
- Pastikan fields di jenis surat sudah di-save dengan format JSON yang benar
- Check console browser untuk error
- Verify fields array di database (field `fields` di tabel `jenis_surat`)

---

## Expected Results

1. **Jenis Surat**: CRUD lengkap berfungsi dengan form builder
2. **Verifikasi**: RT/RW bisa approve/reject surat dari wilayahnya
3. **Approval**: Super admin bisa approve/reject semua surat
4. **Nomor Surat**: Auto-generate dengan format `XXX/SURAT-DESA/MM/YYYY`
5. **History**: Semua aksi tercatat di riwayat_surat
6. **Status Flow**: Draft → Menunggu Verifikasi → Diverifikasi → Disetujui/Ditolak

---

## Next Features to Implement

- [ ] Print/Download surat (PDF)
- [ ] Notifikasi email/WhatsApp
- [ ] Statistik dan laporan
- [ ] Export data ke Excel
- [ ] Template surat yang lebih kaya (header, footer, TTD)
- [ ] Multi-level approval (bisa tambah persetujuan Sekdes, dll)
