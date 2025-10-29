# API Endpoints Reference

Base URL: `http://localhost:5000/api`

## Authentication

### Register
```
POST /auth/register
Content-Type: application/json

{
  "nik": "1234567890123456",
  "nama": "Nama Lengkap",
  "email": "email@example.com",
  "password": "password123",
  "no_telepon": "08123456789",
  "alamat": "Alamat lengkap",
  "rt": "001",
  "rw": "001"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer {token}
```

### Update Profile
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama": "Nama Baru",
  "no_telepon": "08123456789",
  "alamat": "Alamat baru",
  "rt": "001",
  "rw": "001"
}
```

### Change Password
```
PUT /auth/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "password_lama",
  "newPassword": "password_baru"
}
```

---

## Super Admin Endpoints

**Required Role:** `super_admin`

### Dashboard
```
GET /admin/dashboard
Authorization: Bearer {token}
```

### Jenis Surat (Template)

**Get All**
```
GET /admin/jenis-surat
Authorization: Bearer {token}
```

**Get Single**
```
GET /admin/jenis-surat/:id
Authorization: Bearer {token}
```

**Create**
```
POST /admin/jenis-surat
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama_surat": "Surat Keterangan Domisili",
  "kode_surat": "SKD",
  "deskripsi": "Surat keterangan tempat tinggal",
  "template_konten": "Template dengan {{variables}}",
  "fields": [
    {
      "name": "nama",
      "label": "Nama Lengkap",
      "type": "text",
      "required": true
    }
  ],
  "require_verification": true
}
```

**Update**
```
PUT /admin/jenis-surat/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama_surat": "...",
  "status": "aktif"
}
```

**Delete**
```
DELETE /admin/jenis-surat/:id
Authorization: Bearer {token}
```

### Surat Management

**Get All Surat**
```
GET /admin/surat?status=diverifikasi&jenis=1
Authorization: Bearer {token}
```

**Get Surat Detail**
```
GET /admin/surat/:id
Authorization: Bearer {token}
```

**Approve Surat**
```
PUT /admin/surat/:id/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "catatan": "Surat disetujui",
  "tanggal_surat": "2025-10-28"
}
```

**Reject Surat**
```
PUT /admin/surat/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "catatan": "Alasan penolakan"
}
```

### User Management

**Get All Users**
```
GET /admin/users?role=warga&status=aktif
Authorization: Bearer {token}
```

**Update User Status**
```
PUT /admin/users/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "aktif" // or "nonaktif"
}
```

---

## Verifikator (Admin RT/RW) Endpoints

**Required Role:** `admin`

### Dashboard
```
GET /verifikator/dashboard
Authorization: Bearer {token}
```

### Surat Verification

**Get Surat Need Verification**
```
GET /verifikator/surat
Authorization: Bearer {token}
```

**Get Surat Detail**
```
GET /verifikator/surat/:id
Authorization: Bearer {token}
```

**Verify Surat (Approve/Reject)**
```
PUT /verifikator/surat/:id/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "approve", // or "reject"
  "catatan": "Catatan verifikasi"
}
```

**Get Riwayat Verifikasi**
```
GET /verifikator/riwayat
Authorization: Bearer {token}
```

---

## Warga Endpoints

**Required Role:** `warga`

### Dashboard
```
GET /warga/dashboard
Authorization: Bearer {token}
```

### Jenis Surat (Read Only)
```
GET /warga/jenis-surat
Authorization: Bearer {token}
```

### Pengajuan Surat

**Create Pengajuan**
```
POST /warga/surat
Authorization: Bearer {token}
Content-Type: application/json

{
  "jenis_surat_id": 1,
  "data_surat": {
    "nama": "Nama Lengkap",
    "nik": "1234567890123456",
    "alamat": "Alamat lengkap"
  },
  "keperluan": "Untuk keperluan ..."
}
```

**Get History**
```
GET /warga/surat?status=disetujui
Authorization: Bearer {token}
```

**Get Detail**
```
GET /warga/surat/:id
Authorization: Bearer {token}
```

**Delete Draft**
```
DELETE /warga/surat/:id
Authorization: Bearer {token}
```

**Update Profile**
```
PUT /warga/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "nama": "Nama Baru",
  "no_telepon": "08123456789",
  "alamat": "Alamat baru",
  "rt": "001",
  "rw": "001"
}
```

---

## Status Surat

- `draft` - Draft, belum diajukan
- `menunggu_verifikasi` - Menunggu verifikasi RT/RW
- `diverifikasi` - Sudah diverifikasi RT/RW, menunggu approval super admin
- `disetujui` - Disetujui dan memiliki nomor surat
- `ditolak` - Ditolak oleh verifikator atau super admin

---

## Error Responses

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (token invalid/expired)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error
