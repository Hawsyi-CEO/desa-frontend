# Sistem Pelayanan Surat Digital Desa

Aplikasi pelayanan surat digital untuk desa dengan 3 role: Super Admin, Admin (RT/RW), dan Warga.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React.js + Vite
- **Database**: MySQL
- **UI Framework**: Tailwind CSS
- **Authentication**: JWT (JSON Web Token)

## Fitur

### Super Admin
- Dashboard dengan data statistik
- Membuat dan mengelola jenis/template surat pelayanan
- Approve/Reject surat yang telah diverifikasi admin
- Print surat yang telah disetujui
- Management data users

### Admin (RT/RW)
- Dashboard verifikasi surat
- Verifikasi surat dari warga
- Approve/Reject surat untuk diteruskan ke super admin

### Warga
- Mengajukan surat menggunakan template yang tersedia
- Melihat history pengajuan surat
- Update profile dan ubah password

## Struktur Proyek

```
desa/
├── backend/          # Node.js + Express API
│   ├── config/       # Konfigurasi database, JWT, dll
│   ├── controllers/  # Logic untuk handle request
│   ├── middleware/   # Authentication, authorization
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── utils/        # Helper functions
│   └── server.js     # Entry point backend
│
└── frontend/         # React.js Application
    ├── public/       # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Pages untuk setiap role
        ├── context/      # React Context (Auth, dll)
        ├── services/     # API services
        ├── utils/        # Helper functions
        └── App.jsx       # Main App component
```

## Setup dan Instalasi

### Prerequisites
- Node.js (v18 atau lebih tinggi)
- MySQL
- Laragon (sudah terinstall)

### Backend Setup

```bash
cd backend
npm install
```

Buat file `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=surat_desa
JWT_SECRET=your_jwt_secret_key_here
```

Jalankan server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

Import file `database/surat_desa.sql` ke MySQL Anda.

## Default Login

**Super Admin:**
- Email: superadmin@desa.com
- Password: admin123

**Admin (RT/RW):**
- Email: admin@desa.com
- Password: admin123

**Warga:**
- Email: warga@desa.com
- Password: warga123

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user baru
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get user profile

### Super Admin
- GET `/api/admin/dashboard` - Dashboard stats
- GET `/api/admin/jenis-surat` - Get semua jenis surat
- POST `/api/admin/jenis-surat` - Buat jenis surat baru
- PUT `/api/admin/jenis-surat/:id` - Update jenis surat
- DELETE `/api/admin/jenis-surat/:id` - Hapus jenis surat
- GET `/api/admin/surat` - Get semua pengajuan surat
- PUT `/api/admin/surat/:id/approve` - Approve surat
- PUT `/api/admin/surat/:id/reject` - Reject surat
- GET `/api/admin/surat/:id/print` - Print surat

### Admin (RT/RW)
- GET `/api/verifikator/dashboard` - Dashboard verifikasi
- GET `/api/verifikator/surat` - Get surat perlu verifikasi
- PUT `/api/verifikator/surat/:id/verify` - Verifikasi surat

### Warga
- POST `/api/warga/surat` - Ajukan surat baru
- GET `/api/warga/surat` - Get history surat
- GET `/api/warga/surat/:id` - Get detail surat
- PUT `/api/warga/profile` - Update profile
- PUT `/api/warga/password` - Ubah password

## Development

```bash
# Backend (port 5000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

## License

MIT
