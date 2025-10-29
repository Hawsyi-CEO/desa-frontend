# Bulk Delete Feature - Surat Management

## 📋 Overview
Fitur bulk delete memungkinkan Super Admin untuk menghapus satu atau beberapa surat sekaligus dengan checkbox selection.

## ✨ Features
1. **Checkbox Selection**
   - Select individual surat dengan checkbox di setiap row
   - Select all surat di halaman saat ini dengan checkbox di header

2. **Bulk Actions Bar**
   - Muncul otomatis ketika ada surat yang dipilih
   - Menampilkan jumlah surat yang dipilih
   - Tombol "Batal Pilih" untuk clear selection
   - Tombol "Hapus X Surat" untuk bulk delete

3. **Individual Delete**
   - Tombol hapus individual di setiap row
   - Icon trash dengan warna merah

4. **Confirmation Modal**
   - Konfirmasi sebelum menghapus
   - Pesan berbeda untuk single dan bulk delete
   - Mencegah penghapusan tidak disengaja

5. **Loading States**
   - Tombol disabled selama proses delete
   - Loading indicator untuk UX yang lebih baik

6. **Auto Refresh**
   - Data otomatis reload setelah delete
   - Selection otomatis clear setelah bulk delete

## 🎨 UI/UX Design
- **Color Scheme**: Red gradient untuk destructive action
- **Theme**: Konsisten dengan Navy & Slate theme aplikasi
- **Icons**: Lucide React trash icon
- **Transitions**: Smooth hover effects

## 🔧 Technical Implementation

### Frontend (React)
**File**: `frontend/src/pages/SuperAdmin/Surat.jsx`

**State Management**:
```jsx
const [selectedIds, setSelectedIds] = useState([]);  // Track selected IDs
const [isDeleting, setIsDeleting] = useState(false); // Loading state
```

**Handler Functions**:
1. `handleSelectAll(e)` - Toggle all checkboxes on current page
2. `handleSelectOne(id)` - Toggle individual checkbox
3. `handleDeleteSurat(id)` - Delete single surat
4. `handleBulkDelete()` - Delete multiple surat

**UI Components**:
- Bulk actions bar (conditional rendering)
- Table header checkbox (select all)
- Row checkboxes (individual selection)
- Individual delete button in actions column

### Backend (Node.js + Express)
**Routes File**: `backend/routes/admin.js`

**Endpoints**:
```javascript
// Delete single surat - Super Admin only
router.delete('/surat/:id', roleMiddleware('super_admin'), adminController.deleteSurat);

// Bulk delete surat - Super Admin only
router.post('/surat/bulk-delete', roleMiddleware('super_admin'), adminController.bulkDeleteSurat);
```

**Controller File**: `backend/controllers/adminController.js`

**Functions**:

1. **deleteSurat**
   - Check if surat exists
   - Delete from database
   - Return success message

2. **bulkDeleteSurat**
   - Validate IDs array
   - Use database transaction for atomicity
   - Delete all surat with given IDs
   - Rollback on error
   - Return count of deleted items

## 🔐 Security
- **Permission Check**: Only Super Admin can delete surat
- **Middleware**: `roleMiddleware('super_admin')` enforced
- **Confirmation**: Modal prevents accidental deletion
- **Transaction**: Atomic bulk delete (all or nothing)
- **Validation**: Input validation for IDs array

## 📡 API Endpoints

### DELETE /admin/surat/:id
Delete single surat by ID

**Request**:
```
DELETE /admin/surat/123
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "message": "Surat berhasil dihapus"
}
```

### POST /admin/surat/bulk-delete
Delete multiple surat

**Request**:
```json
POST /admin/surat/bulk-delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response**:
```json
{
  "success": true,
  "message": "5 surat berhasil dihapus",
  "deletedCount": 5
}
```

## 🧪 Testing Checklist

### Functional Testing
- [ ] Select individual checkbox works
- [ ] Select all checkbox works
- [ ] Unselect individual checkbox works
- [ ] Unselect all checkbox works
- [ ] Bulk actions bar appears when items selected
- [ ] Bulk actions bar shows correct count
- [ ] "Batal Pilih" clears selection
- [ ] Individual delete shows confirmation
- [ ] Bulk delete shows confirmation
- [ ] Confirmation modal shows correct message
- [ ] Cancel button in modal works
- [ ] Confirm button triggers delete
- [ ] Single delete removes correct surat
- [ ] Bulk delete removes all selected surat
- [ ] Data refreshes after delete
- [ ] Selection clears after bulk delete
- [ ] Loading state shows during deletion
- [ ] Buttons disabled during deletion
- [ ] Success toast appears after delete
- [ ] Error toast appears on failure

### Permission Testing
- [ ] Super Admin can delete surat
- [ ] Admin cannot delete surat (403 forbidden)
- [ ] Warga cannot delete surat (403 forbidden)
- [ ] Unauthenticated users cannot delete (401)

### Edge Cases
- [ ] Delete when only 1 surat exists
- [ ] Delete all surat on page
- [ ] Try bulk delete with empty array
- [ ] Try bulk delete with invalid IDs
- [ ] Try delete non-existent surat
- [ ] Network error handling
- [ ] Database error handling

### UI/UX Testing
- [ ] Red theme applied correctly
- [ ] Hover effects work
- [ ] Icons display properly
- [ ] Responsive design works
- [ ] Loading indicators visible
- [ ] Transitions smooth

## 📝 User Flow

### Single Delete
1. User navigates to Surat management page
2. User clicks "Hapus" button on specific row
3. Confirmation modal appears
4. User clicks "Ya, Hapus"
5. Loading indicator shows
6. Surat deleted from database
7. Success toast appears
8. Table refreshes
9. Deleted surat removed from view

### Bulk Delete
1. User navigates to Surat management page
2. User selects multiple surat with checkboxes
3. Bulk actions bar appears showing count
4. User clicks "Hapus X Surat"
5. Confirmation modal appears with count
6. User clicks "Ya, Hapus Semua"
7. Loading indicator shows
8. All selected surat deleted (atomic operation)
9. Success toast appears with count
10. Selection clears
11. Table refreshes
12. Deleted surat removed from view

## 🎯 Benefits
1. **Efficiency**: Delete multiple items at once
2. **Safety**: Confirmation prevents accidents
3. **Feedback**: Clear loading and success states
4. **UX**: Intuitive checkbox selection
5. **Performance**: Transaction ensures data integrity
6. **Security**: Permission-based access control

## 🔄 Future Enhancements (Optional)
- [ ] Soft delete with restore functionality
- [ ] Bulk operations log/audit trail
- [ ] Export deleted surat before deletion
- [ ] Filter selection by status/jenis
- [ ] Keyboard shortcuts (Ctrl+A for select all)
- [ ] Undo delete functionality
- [ ] Archive instead of hard delete
