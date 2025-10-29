# 🚀 Quick Start Guide

## Instalasi Cepat (3 Langkah)

### 1️⃣ Setup Database
```sql
-- Buka HeidiSQL/phpMyAdmin dan jalankan:
CREATE DATABASE surat_desa;
USE surat_desa;
-- Kemudian import file: database/surat_desa.sql
```

### 2️⃣ Install & Run Backend
```bash
cd backend
npm install
npm run dev
```
✅ Backend running di: http://localhost:5000

### 3️⃣ Install & Run Frontend
```bash
# Buka terminal baru
cd frontend
npm install
npm run dev
```
✅ Frontend running di: http://localhost:5173

## 🔐 Login Demo

Buka: http://localhost:5173

**Super Admin** (Kelola semua)
```
Email: superadmin@desa.com
Password: admin123
```

**Admin RT/RW** (Verifikasi surat)
```
Email: admin@desa.com
Password: admin123
```

**Warga** (Ajukan surat)
```
Email: warga@desa.com
Password: warga123
```

## 📋 Fitur Utama

### Super Admin:
- ✅ Dashboard statistik
- ✅ Buat & kelola template surat
- ✅ Approve/reject surat yang sudah diverifikasi
- ✅ Print surat yang disetujui
- ✅ Kelola users

### Admin (RT/RW):
- ✅ Dashboard verifikasi
- ✅ Verifikasi surat dari warga
- ✅ Approve/reject untuk diteruskan ke super admin

### Warga:
- ✅ Ajukan surat baru
- ✅ Lihat history pengajuan
- ✅ Update profile
- ✅ Ubah password

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React.js + Vite
- **Database**: MySQL
- **UI**: Tailwind CSS
- **Auth**: JWT

## 📁 Struktur Proyek

```
desa/
├── backend/         # API Server
├── frontend/        # React App
├── database/        # SQL files
├── README.md        # Info proyek
└── SETUP.md         # Panduan lengkap
```

## ⚠️ Troubleshooting

**Database connection error?**
- Pastikan MySQL di Laragon sudah running
- Cek `backend/.env` untuk kredensial database

**Port sudah digunakan?**
- Backend: Edit `PORT` di `backend/.env`
- Frontend: Edit `server.port` di `frontend/vite.config.js`

**CORS error?**
- Pastikan `FRONTEND_URL` di `backend/.env` = `http://localhost:5173`

## 📚 Dokumentasi Lengkap

Lihat file `SETUP.md` untuk dokumentasi lengkap.

## 🎯 Next Steps

Setelah berhasil running:

1. Login sebagai Super Admin
2. Buat template surat baru di menu "Jenis Surat"
3. Login sebagai Warga dan coba ajukan surat
4. Login sebagai Admin RT/RW untuk verifikasi
5. Login kembali sebagai Super Admin untuk approve

---

**Happy Coding! 🎉**
