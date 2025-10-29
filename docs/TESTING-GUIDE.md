# Testing Guide - Multi-Level Verification System

## System Status
- **Backend**: Running on http://localhost:5000
- **Frontend**: Running on http://localhost:5176
- **Database**: MySQL (surat_desa)

---

## Login Credentials

### 1. Super Admin
```
Email: superadmin@desa.com
Password: admin123
Role: super_admin
Access: Full system access
```

### 2. Admin RT/RW (Legacy)
```
Email: admin@desa.com
Password: admin123
Role: admin
Access: Verifikator dashboard + Data Warga
```

### 3. Verifikator RT (18 accounts)
Login sebagai Admin RT yang bisa verifikasi surat dari RT tertentu.

**Contoh Login RT:**
```
Email: rt01.rw01@verifikator.desa
Password: verifikator123
Role: verifikator
Level: RT
RT/RW: RT 01 / RW 01
```

**Semua Akun RT Verifikator:**
- rt01.rw01@verifikator.desa (RT 01, RW 01)
- rt02.rw01@verifikator.desa (RT 02, RW 01)
- rt03.rw01@verifikator.desa (RT 03, RW 01)
- rt04.rw01@verifikator.desa (RT 04, RW 01)
- rt05.rw01@verifikator.desa (RT 05, RW 01)
- rt06.rw01@verifikator.desa (RT 06, RW 01)
- rt01.rw02@verifikator.desa (RT 01, RW 02)
- rt02.rw02@verifikator.desa (RT 02, RW 02)
- rt03.rw02@verifikator.desa (RT 03, RW 02)
- rt04.rw02@verifikator.desa (RT 04, RW 02)
- rt01.rw03@verifikator.desa (RT 01, RW 03)
- rt02.rw03@verifikator.desa (RT 02, RW 03)
- rt04.rw04@verifikator.desa (RT 04, RW 04)
- rt02.rw06@verifikator.desa (RT 02, RW 06)
- rt03.rw06@verifikator.desa (RT 03, RW 06)
- rt04.rw07@verifikator.desa (RT 04, RW 07)
- rt02.rw08@verifikator.desa (RT 02, RW 08)
- rt01.rw12@verifikator.desa (RT 01, RW 12)

### 4. Verifikator RW (8 accounts)
Login sebagai Admin RW yang bisa verifikasi surat dari semua RT dalam RW tertentu.

**Contoh Login RW:**
```
Email: rw01@verifikator.desa
Password: verifikator123
Role: verifikator
Level: RW
RW: RW 01
```

**Semua Akun RW Verifikator:**
- rw01@verifikator.desa (RW 01)
- rw02@verifikator.desa (RW 02)
- rw03@verifikator.desa (RW 03)
- rw04@verifikator.desa (RW 04)
- rw06@verifikator.desa (RW 06)
- rw07@verifikator.desa (RW 07)
- rw08@verifikator.desa (RW 08)
- rw12@verifikator.desa (RW 12)

### 5. Warga
```
Email: warga@desa.com
Password: warga123
Role: warga
RT/RW: RT 01 / RW 01
```

---

## Testing Scenarios

### Scenario 1: Full Verification Flow (RT → RW → Admin)
**Requirement**: Surat yang memerlukan verifikasi RT dan RW

**Steps:**

1. **Login sebagai Warga**
   - URL: http://localhost:5176/login
   - Email: `warga@desa.com`
   - Password: `warga123`
   - Navigate to: Ajukan Surat Baru
   - Pilih jenis surat yang memerlukan verifikasi RT+RW
   - Isi semua field dan submit
   - Status awal: `menunggu_verifikasi_rt`

2. **Login sebagai RT Verifikator**
   - Logout dari akun warga
   - Login dengan: `rt01.rw01@verifikator.desa` / `verifikator123`
   - Navigate to: Surat Masuk
   - Lihat surat yang baru diajukan warga dari RT 01/RW 01
   - Klik "Detail" untuk melihat informasi pemohon
   - Klik "Setujui" dan submit approval
   - Status berubah: `menunggu_verifikasi_rw`

3. **Login sebagai RW Verifikator**
   - Logout dari akun RT
   - Login dengan: `rw01@verifikator.desa` / `verifikator123`
   - Navigate to: Surat Masuk
   - Lihat surat yang sudah disetujui RT (dari semua RT di RW 01)
   - Klik "Detail" untuk melihat informasi
   - Klik "Setujui" dan submit approval
   - Status berubah: `menunggu_admin`

4. **Login sebagai Admin (Final Approval)**
   - Logout dari akun RW
   - Login dengan: `admin@desa.com` / `admin123`
   - Navigate to: Surat (menunggu approval)
   - Lihat surat yang sudah disetujui RT dan RW
   - Approve dan generate nomor surat
   - Status berubah: `disetujui` → `selesai`

5. **Verify as Warga**
   - Login kembali sebagai warga
   - Navigate to: Riwayat Pengajuan
   - Lihat surat dengan status "Selesai"
   - Download surat PDF

---

### Scenario 2: RT Only Verification (RT → Admin)
**Requirement**: Surat yang hanya memerlukan verifikasi RT

**Steps:**

1. **Setup Jenis Surat** (as Super Admin)
   - Login: `superadmin@desa.com` / `admin123`
   - Navigate to: Konfigurasi Surat
   - Edit/Create jenis surat
   - Set: `require_rt_verification = true`
   - Set: `require_rw_verification = false`

2. **Submit as Warga**
   - Login sebagai warga
   - Ajukan surat jenis ini
   - Status awal: `menunggu_verifikasi_rt`

3. **Approve as RT**
   - Login sebagai RT verifikator
   - Approve surat
   - Status langsung ke: `menunggu_admin` (skip RW)

4. **Final Approve as Admin**
   - Login sebagai admin
   - Final approval
   - Status: `disetujui` → `selesai`

---

### Scenario 3: RW Only Verification (RW → Admin)
**Requirement**: Surat yang hanya memerlukan verifikasi RW

**Steps:**

1. **Setup Jenis Surat** (as Super Admin)
   - Set: `require_rt_verification = false`
   - Set: `require_rw_verification = true`

2. **Submit as Warga**
   - Status awal: `menunggu_verifikasi_rw`

3. **Approve as RW**
   - Login sebagai RW verifikator
   - Approve surat
   - Status: `menunggu_admin`

4. **Final Approve as Admin**
   - Final approval
   - Status: `disetujui` → `selesai`

---

### Scenario 4: No Verification (Direct to Admin)
**Requirement**: Surat yang tidak memerlukan verifikasi RT/RW

**Steps:**

1. **Setup Jenis Surat** (as Super Admin)
   - Set: `require_rt_verification = false`
   - Set: `require_rw_verification = false`

2. **Submit as Warga**
   - Status awal: `menunggu_admin` (langsung ke admin)

3. **Final Approve as Admin**
   - Final approval
   - Status: `disetujui` → `selesai`

---

### Scenario 5: Rejection Flow (RT Rejects)

**Steps:**

1. **Submit as Warga**
   - Ajukan surat (RT+RW verification)
   - Status: `menunggu_verifikasi_rt`

2. **Reject as RT**
   - Login sebagai RT verifikator
   - Navigate to: Surat Masuk
   - Klik "Tolak" pada surat
   - Isi keterangan penolakan (WAJIB)
   - Submit rejection
   - Status berubah: `revisi_rt`

3. **Check as Warga**
   - Login sebagai warga
   - Navigate to: Riwayat Pengajuan
   - Lihat surat dengan status "Revisi RT"
   - Baca keterangan dari RT
   - Perbaiki dan submit ulang
   - Status kembali: `menunggu_verifikasi_rt`

---

### Scenario 6: Rejection Flow (RW Rejects)

**Steps:**

1. **RT Approves**
   - RT verifikator approve surat
   - Status: `menunggu_verifikasi_rw`

2. **RW Rejects**
   - Login sebagai RW verifikator
   - Tolak surat dengan keterangan
   - Status berubah: `revisi_rw`

3. **Check as Warga**
   - Lihat status "Revisi RW"
   - Baca keterangan dari RW
   - Perbaiki dan submit ulang
   - Status: `menunggu_verifikasi_rt` (mulai dari awal)

---

## Features to Test

### Verifikator Dashboard
- [x] Login sebagai RT/RW verifikator
- [x] Stats menampilkan jumlah surat menunggu
- [x] Stats menampilkan jumlah diverifikasi hari ini
- [x] Stats menampilkan jumlah ditolak hari ini
- [x] Info card menampilkan RT/RW assignment

### Surat Masuk Page
- [x] List surat filtered by RT/RW level
- [x] RT verifikator hanya lihat surat dari RT mereka
- [x] RW verifikator lihat surat dari semua RT dalam RW mereka
- [x] Detail modal menampilkan data pemohon
- [x] Approve modal (green theme, keterangan optional)
- [x] Reject modal (red theme, keterangan WAJIB)
- [x] Preview surat PDF
- [x] Status badge dengan warna berbeda

### Riwayat Page
- [x] List surat yang sudah diverifikasi
- [x] Status badge (approved/rejected)
- [x] Keterangan verifikasi ditampilkan
- [x] Timestamp verifikasi

### Sidebar Display
- [x] RT verifikator: "Admin RT 01 / RW 01"
- [x] RW verifikator: "Admin RW 01"
- [x] Menu sesuai role

### Toast Notifications
- [x] Success notification saat approve
- [x] Success notification saat reject
- [x] Error notification saat gagal
- [x] No crashes (toast null reference fixed)

---

## Database Validation

### Check Verification Flow
```sql
-- Lihat verification flow untuk surat tertentu
SELECT 
  vf.*,
  u.nama as verifier_name
FROM verification_flow vf
LEFT JOIN users u ON vf.verifier_id = u.id
WHERE vf.pengajuan_id = 1
ORDER BY vf.sequence_order;
```

### Check Pengajuan Status
```sql
-- Lihat status surat dan verification level
SELECT 
  ps.id,
  ps.nomor_pengajuan,
  ps.status,
  ps.current_verification_level,
  u.nama as pemohon,
  u.rt,
  u.rw,
  js.nama_surat,
  js.require_rt_verification,
  js.require_rw_verification
FROM pengajuan_surat ps
JOIN users u ON ps.user_id = u.id
JOIN jenis_surat js ON ps.jenis_surat_id = js.id
ORDER BY ps.created_at DESC
LIMIT 10;
```

### Check Verifikator Accounts
```sql
-- Lihat semua verifikator
SELECT 
  id,
  nama,
  email,
  role,
  verifikator_level,
  rt,
  rw
FROM users
WHERE role = 'verifikator'
ORDER BY rw, rt;
```

---

## Common Issues & Solutions

### Issue 1: Toast shows "Cannot read properties of null"
**Solution**: Already fixed with optional chaining (`toast?.show`)

### Issue 2: Verifikator tidak bisa login
**Solution**: 
- Pastikan role ENUM sudah include 'verifikator'
- Run: `node backend/add-verifikator-role.js`

### Issue 3: RT/RW format tidak konsisten
**Solution**:
- Run: `node backend/normalize-verifikator.js`
- Semua RT/RW akan dinormalisasi ke format 2-digit

### Issue 4: Surat tidak muncul di dashboard verifikator
**Check**:
- Apakah RT/RW warga sama dengan RT/RW verifikator?
- Apakah status surat sesuai level? (RT: menunggu_verifikasi_rt, RW: menunggu_verifikasi_rw)
- Apakah jenis_surat setting benar? (require_rt/rw_verification)

### Issue 5: Backend error EADDRINUSE
**Solution**: 
```powershell
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]
```

---

## Next Development Tasks

1. [ ] Create Admin Approval Page (frontend)
   - List surat with menunggu_admin status
   - Show verification history
   - Approve with nomor surat generation
   - Reject with option to return to RT/RW

2. [ ] Add Verification Progress to Warga Page
   - Visual timeline (RT → RW → Admin)
   - Checkmarks for completed stages
   - Current status highlight
   - Show rejection notes

3. [ ] Add RT/RW Settings to FormJenisSurat
   - Checkbox: "Memerlukan Verifikasi RT"
   - Checkbox: "Memerlukan Verifikasi RW"
   - Help text explaining workflow
   - Save to database

4. [ ] Email Notifications
   - Notify verifikator when surat masuk
   - Notify warga when status changes
   - Notify warga when rejected

5. [ ] Advanced Filtering
   - Filter by status
   - Filter by date range
   - Search by nama pemohon
   - Search by nomor pengajuan

---

## Support

Untuk pertanyaan atau issue:
- Check MULTI-LEVEL-VERIFICATION-DESIGN.md
- Check VERIFIKATOR-CREDENTIALS.md
- Check database structure di migrations

**Happy Testing!** 🚀
