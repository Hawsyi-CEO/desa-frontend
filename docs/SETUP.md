# Panduan Setup & Instalasi
# Sistem Pelayanan Surat Digital Desa

## Prerequisites
- Node.js v18 atau lebih tinggi (https://nodejs.org/)
- MySQL (sudah terinstall di Laragon)
- Laragon

## Langkah-Langkah Setup

### 1. Setup Database

1. Buka Laragon dan start MySQL
2. Buka HeidiSQL atau phpMyAdmin
3. Import file database:
   - Lokasi: `database/surat_desa.sql`
   - Atau jalankan query SQL di file tersebut

### 2. Setup Backend (Node.js + Express)

```bash
# Buka terminal di folder backend
cd backend

# Install dependencies
npm install

# File .env sudah ada, sesuaikan jika perlu
# Edit .env jika password MySQL berbeda

# Jalankan server
npm run dev
```

Server akan berjalan di: http://localhost:5000

### 3. Setup Frontend (React + Vite)

```bash
# Buka terminal baru di folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: http://localhost:5173

### 4. Akses Aplikasi

Buka browser dan akses: http://localhost:5173

**Default Login:**

Super Admin:
- Email: superadmin@desa.com
- Password: admin123

Admin RT/RW:
- Email: admin@desa.com
- Password: admin123

Warga:
- Email: warga@desa.com
- Password: warga123

## Troubleshooting

### Port sudah digunakan

Backend (5000):
```bash
# Edit file backend/.env
PORT=5001
```

Frontend (5173):
```bash
# Edit file frontend/vite.config.js
server: {
  port: 3000
}
```

### Database connection error

1. Pastikan MySQL di Laragon sudah running
2. Cek kredensial di `backend/.env`:
   - DB_HOST=localhost
   - DB_USER=root
   - DB_PASSWORD= (kosongkan jika tidak ada password)
   - DB_NAME=surat_desa

### CORS Error

Pastikan `FRONTEND_URL` di `backend/.env` sesuai dengan port frontend:
```
FRONTEND_URL=http://localhost:5173
```

## Struktur Folder

```
desa/
├── backend/              # API Server (Node.js + Express)
│   ├── config/          # Konfigurasi database
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & upload middleware
│   ├── routes/          # API routes
│   ├── uploads/         # File uploads
│   └── server.js        # Entry point
│
├── frontend/            # React Application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React Context
│   │   ├── pages/       # Pages
│   │   └── services/    # API services
│   └── index.html
│
└── database/            # SQL files
```

## Development Workflow

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm run dev`
3. Buka http://localhost:5173
4. Login dengan salah satu akun demo

## Build untuk Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Hasil build ada di folder dist/
```

## Catatan Penting

1. **Password Default**: Ubah password default setelah login pertama kali
2. **Environment Variables**: Jangan commit file .env ke git
3. **Upload Folder**: Pastikan folder `backend/uploads` memiliki permission write
4. **Database Backup**: Backup database secara berkala

## Fitur yang Sudah Tersedia

✅ Authentication & Authorization (JWT)
✅ Role-based access control (Super Admin, Admin, Warga)
✅ Database schema lengkap
✅ API endpoints lengkap
✅ Frontend routing & navigation
✅ Login & Register pages
✅ Dashboard untuk setiap role
✅ Profile & change password

## Fitur yang Perlu Dikembangkan

📝 CRUD Jenis Surat dengan form builder
📝 Form pengajuan surat dinamis
📝 Verifikasi surat oleh RT/RW
📝 Approval surat oleh Super Admin
📝 Print surat (PDF generation)
📝 Upload lampiran
📝 Notifikasi real-time
📝 Export data & laporan

## Support

Jika ada pertanyaan atau masalah, silakan buat issue atau hubungi developer.

Happy coding! 🚀
