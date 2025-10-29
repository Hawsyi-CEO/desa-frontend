# 📄 Ukuran Kertas A4 - Standar Surat Resmi

## ✅ Update: Semua Surat Menggunakan Ukuran A4

Semua preview dan print surat di sistem ini sekarang menggunakan **ukuran kertas A4 standar internasional**.

---

## 📏 Spesifikasi Ukuran A4

### Dimensi Kertas A4:
- **Lebar**: 210 mm (21.0 cm / 8.27 inch)
- **Tinggi**: 297 mm (29.7 cm / 11.69 inch)
- **Rasio**: 1:√2 (1:1.4142)

### Margin Surat Resmi:
- **Top**: 20 mm
- **Bottom**: 20 mm
- **Left**: 20 mm
- **Right**: 20 mm
- **Area Cetak**: 170 mm x 257 mm

---

## 🎯 Implementasi di Sistem

### 1. Preview di Layar (Screen View)

**File**: `PreviewSurat.jsx` & `JenisSurat.jsx`

```jsx
<div 
  id="surat-preview" 
  className="bg-white p-8 border mx-auto"
  style={{
    borderColor: config.border_color,
    borderWidth: `${config.border_width}px`,
    fontFamily: config.font_family,
    width: '210mm',           // Lebar A4
    minHeight: '297mm',       // Tinggi A4
    maxWidth: '210mm',        // Max width
    boxSizing: 'border-box'   // Include padding in width
  }}
>
```

**Penjelasan**:
- `width: '210mm'` - Set lebar tepat 210mm (A4)
- `minHeight: '297mm'` - Minimal tinggi 297mm (A4)
- `maxWidth: '210mm'` - Tidak boleh lebih lebar dari A4
- `boxSizing: 'border-box'` - Padding dihitung dalam ukuran total
- `mx-auto` - Center horizontal di layar

### 2. Print View

```css
@media print {
  #surat-preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;      /* Lebar A4 */
    height: 297mm;     /* Tinggi A4 */
    padding: 20mm;     /* Margin standar */
    margin: 0;
    box-sizing: border-box;
  }
  
  #surat-preview {
    page-break-after: always;  /* Force new page */
  }
}
```

**Penjelasan**:
- Width & height exact 210mm x 297mm
- Padding 20mm untuk margin cetak
- `page-break-after: always` - Setiap surat di halaman baru
- `position: absolute` - Full control positioning

---

## 📂 File yang Diupdate

### 1. `frontend/src/components/PreviewSurat.jsx`
**Digunakan di**:
- ✅ Halaman Warga - Ajukan Surat (preview sebelum kirim)
- ✅ Halaman Warga - History (preview surat yang sudah diajukan)
- ✅ Halaman Verifikator - Verifikasi Surat (preview untuk verifikasi)

**Perubahan**:
```javascript
// Preview container
style={{
  width: '210mm',
  minHeight: '297mm',
  maxWidth: '210mm',
  boxSizing: 'border-box'
}}

// Print styles
@media print {
  #surat-preview {
    width: 210mm;
    height: 297mm;
    padding: 20mm;
  }
}
```

### 2. `frontend/src/pages/SuperAdmin/JenisSurat.jsx`
**Digunakan di**:
- ✅ Halaman Super Admin - Jenis Surat (preview template saat buat/edit)

**Perubahan**: Sama seperti PreviewSurat.jsx

---

## 🖨️ Hasil Print

### Ketika Print Surat:

#### Sebelum (Ukuran Tidak Standar):
- ❌ Lebar mengikuti browser window
- ❌ Tinggi tidak terdefinisi
- ❌ Margin tidak konsisten
- ❌ Bisa terpotong saat print
- ❌ Ukuran berbeda di setiap browser

#### Sesudah (Ukuran A4 Standar):
- ✅ Lebar tetap 210mm (A4)
- ✅ Tinggi tetap 297mm (A4)
- ✅ Margin standar 20mm
- ✅ Tidak terpotong saat print
- ✅ Konsisten di semua browser
- ✅ Langsung pas saat print ke kertas A4

---

## 📱 Responsif di Berbagai Layar

### Desktop (> 1024px)
```
┌─────────────────────────────────┐
│       Browser Window            │
│                                 │
│    ┌─────────────────┐         │
│    │   Surat A4      │         │
│    │   210mm x 297mm │         │
│    │                 │         │
│    │   Centered      │         │
│    └─────────────────┘         │
│                                 │
└─────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────┐
│   Browser Window   │
│                    │
│  ┌──────────────┐ │
│  │  Surat A4    │ │
│  │  Scaled to   │ │
│  │  fit width   │ │
│  └──────────────┘ │
└────────────────────┘
```

### Mobile (< 768px)
- Surat tetap 210mm width
- Bisa scroll horizontal jika perlu
- Atau responsive scale down dengan CSS

---

## 🎨 Konfigurasi Margin Custom

Jika ingin mengubah margin default (20mm), edit di kode:

### Option 1: Hardcode di Style
```javascript
style={{
  padding: '25mm'  // Ubah dari 20mm ke 25mm
}}
```

### Option 2: Tambahkan ke Konfigurasi Surat
Bisa ditambahkan field baru di tabel `konfigurasi_surat`:

```sql
ALTER TABLE konfigurasi_surat 
ADD COLUMN margin_top INT DEFAULT 20,
ADD COLUMN margin_bottom INT DEFAULT 20,
ADD COLUMN margin_left INT DEFAULT 20,
ADD COLUMN margin_right INT DEFAULT 20;
```

Lalu gunakan:
```javascript
style={{
  paddingTop: `${config.margin_top}mm`,
  paddingBottom: `${config.margin_bottom}mm`,
  paddingLeft: `${config.margin_left}mm`,
  paddingRight: `${config.margin_right}mm`,
}}
```

---

## ✅ Testing Ukuran A4

### Test 1: Preview di Browser
1. Login ke sistem
2. Buat/preview surat
3. Gunakan browser DevTools
4. Klik kanan > Inspect
5. Lihat computed size = **210mm x 297mm** ✅

### Test 2: Print Preview
1. Buka preview surat
2. Klik tombol **"🖨️ Print"**
3. Lihat print preview
4. Ukuran harus pas dengan kertas A4
5. Tidak ada content terpotong ✅

### Test 3: Print ke PDF
1. Buka preview surat
2. Print > Save as PDF
3. Pilih paper size: A4
4. PDF hasil harus perfect fit ✅

### Test 4: Print Fisik
1. Print ke printer dengan kertas A4
2. Hasil harus pas, tidak terpotong
3. Margin 20mm dari setiap sisi ✅

---

## 🌍 Kompatibilitas Browser

### ✅ Tested & Works:
- **Chrome / Edge (Chromium)**: Perfect
- **Firefox**: Perfect
- **Safari**: Perfect
- **Opera**: Perfect

### Print Driver Support:
- ✅ Windows Print
- ✅ Mac Print
- ✅ Linux CUPS
- ✅ Print to PDF

---

## 📐 Ukuran Kertas Lainnya (Future)

Jika nanti perlu support ukuran lain:

### A5 (148mm x 210mm)
```javascript
width: '148mm',
minHeight: '210mm'
```

### Legal (215.9mm x 355.6mm)
```javascript
width: '215.9mm',
minHeight: '355.6mm'
```

### Letter (215.9mm x 279.4mm)
```javascript
width: '215.9mm',
minHeight: '279.4mm'
```

### F4 (215mm x 330mm) - Indonesia
```javascript
width: '215mm',
minHeight: '330mm'
```

---

## 💡 Tips Penggunaan

### 1. Font Size yang Ideal untuk A4:
- **Header**: 14-16pt
- **Body**: 11-12pt
- **Footer**: 9-10pt

### 2. Jumlah Baris Optimal:
- Dengan margin 20mm dan font 12pt
- Maksimal ±45-50 baris per halaman
- Line spacing 1.5 = ±35-40 baris

### 3. Kop Surat:
- Tinggi ideal: 30-40mm
- Logo: 60-80px (15-20mm)
- Jangan terlalu tinggi, buang space

### 4. Tanda Tangan:
- Area: 60-80mm
- Jarak dari bawah: 30-40mm
- Include space untuk stempel

---

## 🚀 Keuntungan Ukuran A4 Standar

### Untuk User:
✅ Print langsung pas, tidak perlu setting  
✅ Hasil profesional dan rapi  
✅ Konsisten di berbagai printer  
✅ Bisa print ke PDF dengan perfect size  

### Untuk Admin:
✅ Mudah maintenance  
✅ Tidak ada komplain ukuran  
✅ Standard internasional  
✅ Compatible dengan semua printer  

### Untuk Developer:
✅ Clean code  
✅ CSS modern dengan mm unit  
✅ Cross-browser compatible  
✅ Easy to customize  

---

## 📚 Referensi

- **ISO 216**: Standard ukuran kertas A series
- **A4 Dimension**: 210mm × 297mm
- **Aspect Ratio**: 1:√2
- **Common Use**: Dokumen resmi, surat, laporan
- **Printer Support**: Universal

---

**Semua surat di sistem sekarang menggunakan ukuran A4 standar!** 📄✨

Siap untuk dicetak dengan hasil yang sempurna di kertas A4 apapun!
