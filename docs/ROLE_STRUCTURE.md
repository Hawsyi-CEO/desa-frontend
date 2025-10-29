# Struktur Role & Workflow Verifikasi

## Role dalam Sistem

### 1. **super_admin**
- **Akses**: Penuh ke seluruh sistem
- **Fungsi**: 
  - Kelola semua user (CRUD)
  - Kelola jenis surat
  - Kelola konfigurasi sistem
  - Lihat semua data

### 2. **admin** (Admin Desa)
- **Akses**: Approve final surat setelah RT/RW
- **Fungsi**:
  - Approve/Reject surat yang sudah diverifikasi RT/RW
  - Lihat semua surat
  - Kelola data warga (terbatas)

### 3. **verifikator** (RT/RW)
- **Akses**: Verifikasi surat bertingkat berdasarkan RT/RW
- **Fungsi**:
  - Verifikasi surat dari warga di RT/RW yang sama
  - Multi-level verification (RT → RW)
  - Lihat surat di wilayahnya saja

### 4. **warga**
- **Akses**: Mengajukan dan melihat surat sendiri
- **Fungsi**:
  - Ajukan surat
  - Lihat status surat
  - Edit profile

---

## Workflow Verifikasi Surat

```
WARGA (Pengajuan)
    ↓
VERIFIKATOR RT (Verifikasi Level 1)
    ↓
VERIFIKATOR RW (Verifikasi Level 2)
    ↓
ADMIN DESA (Approval Final)
    ↓
SELESAI (Surat Approved)
```

### Detail Status:
1. **pending** - Baru diajukan warga, menunggu RT
2. **verified_rt** - Sudah diverifikasi RT, menunggu RW
3. **verified_rw** - Sudah diverifikasi RW, menunggu Admin Desa
4. **approved** - Sudah diapprove Admin Desa (Final)
5. **rejected** - Ditolak (bisa di level manapun)

---

## Perbedaan Admin vs Verifikator

| Aspek | Admin Desa | Verifikator RT/RW |
|-------|------------|-------------------|
| Scope | Seluruh desa | RT/RW tertentu |
| Verifikasi | Final approval | Verifikasi bertingkat |
| Data Warga | Semua warga | Warga di RT/RW-nya |
| Kelola User | Tidak bisa | Tidak bisa |
| Kelola Surat | Ya (approve final) | Ya (verify RT/RW) |

---

## Field RT/RW pada User

Setiap user memiliki field:
- `rt` - Nomor RT (misal: "001", "002")
- `rw` - Nomor RW (misal: "001", "005")

**Verifikator** harus memiliki RT/RW yang jelas untuk menentukan:
- Surat mana yang bisa dia verifikasi
- Data warga mana yang bisa dia lihat

**Admin** tidak perlu RT/RW karena scope-nya seluruh desa.

---

## Catatan Penting

⚠️ **JANGAN HAPUS ROLE VERIFIKATOR!**
- Role `verifikator` adalah bagian penting dari workflow multi-level
- Berbeda dengan `admin` yang approve final
- Jika dihapus, sistem verifikasi bertingkat RT/RW tidak akan berfungsi

✅ **Role Structure yang Benar:**
- `super_admin` - Full access
- `admin` - Admin Desa (final approval)
- `verifikator` - RT/RW (multi-level verification)
- `warga` - User biasa

