# Verifikator Login Credentials

## Overview
Total Verifikator Accounts: **26 accounts** (Normalized Format)
- RT Verifikator: **18 accounts**
- RW Verifikator: **8 accounts**

**Default Password (all accounts):** `verifikator123`

**Format Normalization:**
- All RT/RW now use **2-digit format** (01, 02, 03, etc.)
- Duplicates removed (01 = 1 = 001)
- Null values excluded

---

## RT Verifikator Accounts

RT Verifikator can verify surat from warga in their specific RT.

| Email | RT | RW | Level |
|-------|----|----|-------|
| rt01.rw01@verifikator.desa | 01 | 01 | RT |
| rt02.rw01@verifikator.desa | 02 | 01 | RT |
| rt03.rw01@verifikator.desa | 03 | 01 | RT |
| rt04.rw01@verifikator.desa | 04 | 01 | RT |
| rt05.rw01@verifikator.desa | 05 | 01 | RT |
| rt06.rw01@verifikator.desa | 06 | 01 | RT |
| rt01.rw02@verifikator.desa | 01 | 02 | RT |
| rt02.rw02@verifikator.desa | 02 | 02 | RT |
| rt03.rw02@verifikator.desa | 03 | 02 | RT |
| rt04.rw02@verifikator.desa | 04 | 02 | RT |
| rt01.rw03@verifikator.desa | 01 | 03 | RT |
| rt02.rw03@verifikator.desa | 02 | 03 | RT |
| rt04.rw04@verifikator.desa | 04 | 04 | RT |
| rt02.rw06@verifikator.desa | 02 | 06 | RT |
| rt03.rw06@verifikator.desa | 03 | 06 | RT |
| rt04.rw07@verifikator.desa | 04 | 07 | RT |
| rt02.rw08@verifikator.desa | 02 | 08 | RT |
| rt01.rw12@verifikator.desa | 01 | 12 | RT |

---

## RW Verifikator Accounts

RW Verifikator can verify surat from all RT in their RW (after RT approval).

| Email | RW | Level |
|-------|-----|-------|
| rw01@verifikator.desa | 01 | RW |
| rw02@verifikator.desa | 02 | RW |
| rw03@verifikator.desa | 03 | RW |
| rw04@verifikator.desa | 04 | RW |
| rw06@verifikator.desa | 06 | RW |
| rw07@verifikator.desa | 07 | RW |
| rw08@verifikator.desa | 08 | RW |
| rw12@verifikator.desa | 12 | RW |

---

## Testing Login

### Example 1: Login as RT Verifikator
```
Email: rt01.rw01@verifikator.desa
Password: verifikator123
```
This account will see surat from **RT 01, RW 01** only.

### Example 2: Login as RW Verifikator
```
Email: rw01@verifikator.desa
Password: verifikator123
```
This account will see surat from **all RT in RW 01** (after RT verification).

---

## Multi-Level Verification Flow

### Full Verification Flow (RT → RW → Admin):
1. **Warga** submits surat
2. **RT Verifikator** (e.g., rt1.rw1@verifikator.desa) approves/rejects
3. **RW Verifikator** (e.g., rw1@verifikator.desa) approves/rejects
4. **Admin** gives final approval & generates surat number

### Partial Flow (RT only → Admin):
1. **Warga** submits surat (if jenis_surat.require_rw_verification = false)
2. **RT Verifikator** approves/rejects
3. **Admin** gives final approval

### Partial Flow (RW only → Admin):
1. **Warga** submits surat (if jenis_surat.require_rt_verification = false)
2. **RW Verifikator** approves/rejects
3. **Admin** gives final approval

### No Verification Flow (Direct to Admin):
1. **Warga** submits surat (if both require_rt/rw_verification = false)
2. **Admin** gives final approval immediately

---

## How to Re-run Script

If you need to normalize RT/RW and recreate verifikator accounts:

```bash
cd backend
node normalize-verifikator.js
```

This script will:
- Normalize all warga RT/RW to 2-digit format (01, 02, 03...)
- Delete existing verifikator accounts
- Recreate verifikator accounts based on normalized data
- Remove duplicates (01 = 1 = 001)
- Skip null/empty values

**One-time setup only:**
```bash
node add-verifikator-role.js  # Add 'verifikator' to role ENUM (if not done)
```

---

## Database Structure

### Users Table (Verifikator Fields)
- `role`: 'verifikator'
- `verifikator_level`: 'rt' or 'rw'
- `rt`: RT assignment (NULL for RW verifikator)
- `rw`: RW assignment
- `nik`: Format `99[RW][RT]0000000001` (16 digits)
- `email`: `rt{RT}.rw{RW}@verifikator.desa` or `rw{RW}@verifikator.desa`

---

## Next Steps

1. [DONE] Backend controllers implemented
2. [DONE] Verifikator accounts created
3. [DONE] Frontend verifikator dashboard
4. [TODO] Frontend admin approval page
5. [TODO] Frontend warga verification progress
6. [TODO] Jenis surat RT/RW settings UI
