# Multi-Level Verification System
## Sistem Verifikasi Bertingkat: RT → RW → Admin (OPTIONAL)

---

## 📋 Workflow Overview

### 🔀 Decision Tree: Flexible Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  WARGA SUBMIT SURAT                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  Check Jenis Surat      │
         │  Settings               │
         └────────┬────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    │ BUTUH VERIFIKASI?         │ TIDAK BUTUH VERIFIKASI
    │ (RT/RW/Both)              │
    │                           │
    ▼                           ▼
┌─────────────┐         ┌──────────────────┐
│ RT Required?│         │ Warga → Admin    │
│             │         │ (Langsung Setuju)│
│  YES → RT   │         └──────────────────┘
│  NO  → RW?  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ RW Required?│
│             │
│  YES → RW   │
│  NO  → Admin│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Super Admin │
│ (Final)     │
└─────────────┘
```

### ✅ APPROVAL FLOW (Jika Butuh Verifikasi RT + RW)

```
Warga Submit → RT Verify → RW Verify → Admin → Cetak
```

### ⚠️ REJECTION FLOW (Kembali ke Level Sebelumnya)

```
RT Reject → Kembali ke Warga (edit & submit ulang)
RW Reject → Kembali ke RT (verifikasi ulang)
Admin Reject → Kembali ke RW (verifikasi ulang)
```

### 🚀 FAST TRACK (Tanpa Verifikasi)

```
Warga Submit → Admin Langsung Setuju → Cetak
```

**Contoh Surat:**
- **Butuh RT + RW**: Surat Kematian, Surat Pindah, Surat Domisili
- **Tanpa Verifikasi**: Surat Pengantar Sederhana, Surat Keterangan Umum

---

## 🎯 Status Progression

| Step | Status | Level | Action By | Next Status |
|------|--------|-------|-----------|-------------|
| 1 | `menunggu_verifikasi_rt` | `rt` | Verifikator RT | Approve → `menunggu_verifikasi_rw`<br>Reject → `revisi_rt` (kembali ke warga) |
| 2 | `menunggu_verifikasi_rw` | `rw` | Verifikator RW | Approve → `menunggu_admin`<br>Reject → `menunggu_verifikasi_rt` (kembali ke RT) |
| 3 | `menunggu_admin` | `admin` | Super Admin | Approve → `disetujui`<br>Reject → `menunggu_verifikasi_rw` (kembali ke RW) |
| 4 | `disetujui` | `completed` | Super Admin | Print → `selesai` |

---

## 👥 Role & Permissions

### 1. Warga
- ✅ Ajukan surat
- ✅ Lihat status verifikasi (RT/RW/Admin)
- ✅ Edit & submit ulang jika ditolak RT
- ✅ Download surat jika sudah `selesai`

### 2. Verifikator RT (level='rt', assigned_rt='001')
- ✅ Lihat surat dari warga di RT yang ditugaskan
- ✅ Approve/Reject dengan catatan
- ✅ Lihat history verifikasi
- ❌ Tidak bisa approve surat dari RT lain

### 3. Verifikator RW (level='rw', assigned_rw='001')
- ✅ Lihat surat yang sudah diapprove RT di RW yang ditugaskan
- ✅ Approve/Reject dengan catatan
- ✅ Lihat history verifikasi
- ❌ Tidak bisa approve surat dari RW lain

### 4. Super Admin
- ✅ Lihat semua surat yang sudah diapprove RW
- ✅ Final approve/reject
- ✅ Generate & print surat
- ✅ Manage jenis surat (setting: require RT/RW verification)
- ✅ Manage users (assign verifikator ke RT/RW)

---

## 🗄️ Database Schema

### Table: `users`
```sql
- verifikator_level: ENUM('rt', 'rw') 
  → Level verifikator: RT atau RW
```

**Example:**
```sql
-- Verifikator RT 001
INSERT INTO users (nama, role, verifikator_level, rt, rw) 
VALUES ('Pak RT 001', 'verifikator', 'rt', '001', '001');

-- Verifikator RW 001
INSERT INTO users (nama, role, verifikator_level, rw) 
VALUES ('Pak RW 001', 'verifikator', 'rw', '001');
```

### Table: `jenis_surat`
```sql
- require_rt_verification: BOOLEAN DEFAULT TRUE
- require_rw_verification: BOOLEAN DEFAULT TRUE
```

**Example:**
```sql
-- Surat Kematian: butuh RT + RW
UPDATE jenis_surat 
SET require_rt_verification=TRUE, require_rw_verification=TRUE
WHERE kode_surat='SKM';

-- Surat Pengantar: tidak butuh RT/RW
UPDATE jenis_surat 
SET require_rt_verification=FALSE, require_rw_verification=FALSE
WHERE kode_surat='SP';
```

### Table: `pengajuan_surat`
```sql
- status_surat: ENUM(
    'draft',
    'menunggu_verifikasi_rt',
    'menunggu_verifikasi_rw',
    'menunggu_admin',
    'disetujui',
    'ditolak',
    'revisi_rt',
    'revisi_rw',
    'selesai'
  )
- current_verification_level: ENUM('rt', 'rw', 'admin', 'completed')
```

### Table: `verification_flow` (NEW)
```sql
- pengajuan_id: INT → FK to pengajuan_surat
- level_type: ENUM('rt', 'rw', 'admin')
- sequence_order: INT → 1, 2, 3 (urutan verifikasi)
- verifier_id: INT → user yang verify
- status: ENUM('pending', 'approved', 'rejected')
- keterangan: TEXT → catatan verifikator
- verified_at: TIMESTAMP
```

**Example:**
```sql
-- Surat ID 1: butuh RT + RW + Admin
INSERT INTO verification_flow (pengajuan_id, level_type, sequence_order, status)
VALUES 
  (1, 'rt', 1, 'pending'),
  (1, 'rw', 2, 'pending'),
  (1, 'admin', 3, 'pending');
```

---

## 🔄 API Endpoints (To Be Implemented)

### Verifikator RT
```
GET  /verifikator/surat-masuk        → List surat di RT saya (status: menunggu_verifikasi_rt)
POST /verifikator/approve/:id        → Approve surat (RT → RW)
POST /verifikator/reject/:id         → Reject surat (RT → Warga)
GET  /verifikator/riwayat            → History verifikasi saya
```

### Verifikator RW
```
GET  /verifikator/surat-masuk        → List surat di RW saya (status: menunggu_verifikasi_rw)
POST /verifikator/approve/:id        → Approve surat (RW → Admin)
POST /verifikator/reject/:id         → Reject surat (RW → RT)
GET  /verifikator/riwayat            → History verifikasi saya
```

### Super Admin
```
GET  /admin/surat-masuk              → List surat (status: menunggu_admin)
POST /admin/approve/:id              → Final approve
POST /admin/reject/:id               → Reject (Admin → RW)
POST /admin/generate-surat/:id       → Generate & print PDF
```

---

## 📱 UI Flow

### Warga Dashboard
```
┌─────────────────────────────────────┐
│ Status: Menunggu Verifikasi RT     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✅ Diajukan                        │
│ ⏳ Menunggu RT 001                 │
│ ⚪ Menunggu RW 001                 │
│ ⚪ Menunggu Admin                  │
└─────────────────────────────────────┘
```

### Verifikator RT Dashboard
```
┌─────────────────────────────────────┐
│ 📥 Surat Masuk RT 001 (5)          │
├─────────────────────────────────────┤
│ • Budi Santoso - SK Domisili       │
│   [Lihat] [Approve] [Reject]       │
│                                     │
│ • Ahmad Fauzi - SK Kematian        │
│   [Lihat] [Approve] [Reject]       │
└─────────────────────────────────────┘
```

### Reject Modal (dengan catatan)
```
┌─────────────────────────────────────┐
│ ⚠️  Tolak Surat                     │
├─────────────────────────────────────┤
│ Alasan penolakan:                  │
│ ┌─────────────────────────────────┐│
│ │ Data tidak lengkap, harap      ││
│ │ lampirkan KK dan KTP           ││
│ └─────────────────────────────────┘│
│                                     │
│   [Batal]  [Tolak & Kirim Catatan] │
└─────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Database ✅
- [x] Add verifikator_level to users
- [x] Add require_rt_verification & require_rw_verification to jenis_surat
- [x] Create verification_flow table
- [x] Update status_surat enum
- [x] Add current_verification_level to pengajuan_surat

### Backend 🔄
- [ ] Update wargaController: create verification flow on submit
- [ ] Create verifikatorController: approve/reject logic
- [ ] Update adminController: final approval
- [ ] Add middleware: check verifikator level & assignment
- [ ] Add helper: get next verification level

### Frontend 🔄
- [ ] Update Warga: show verification progress
- [ ] Create Verifikator RT: surat masuk, approve/reject
- [ ] Create Verifikator RW: surat masuk, approve/reject
- [ ] Update Super Admin: final approval
- [ ] Add FormJenisSurat: RT/RW verification settings

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (All Approve)
```
1. Warga submit SK Kematian → status: menunggu_verifikasi_rt
2. RT approve → status: menunggu_verifikasi_rw
3. RW approve → status: menunggu_admin
4. Admin approve → status: disetujui
5. Admin print → status: selesai
```

### Scenario 2: RT Reject
```
1. Warga submit → status: menunggu_verifikasi_rt
2. RT reject (catatan: "Lampirkan KK") → status: revisi_rt
3. Warga edit & resubmit → status: menunggu_verifikasi_rt
4. RT approve → status: menunggu_verifikasi_rw
... continue
```

### Scenario 3: RW Reject
```
1. ... RT approve → status: menunggu_verifikasi_rw
2. RW reject (catatan: "Data alamat tidak sesuai") → status: menunggu_verifikasi_rt
3. RT edit verify ulang → status: menunggu_verifikasi_rw
... continue
```

---

**Apakah workflow ini sudah sesuai?**  
Jika OK, saya lanjutkan implement backend controllers & frontend UI! 🚀
