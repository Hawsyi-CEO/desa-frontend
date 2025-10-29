# 📱 Mobile Hamburger Menu Implementation

## Overview
Sidebar sekarang menggunakan hamburger menu di mobile untuk UX yang lebih baik.

---

## ✨ Fitur Hamburger Menu

### 1. **Hamburger Button**
- 📍 **Posisi:** Fixed top-left (top-4 left-4)
- 🎨 **Style:** bg-slate-800 dengan shadow-lg
- 📱 **Visibility:** Hanya muncul di mobile (lg:hidden)
- 🔄 **State:** Muncul saat sidebar tertutup, hilang saat terbuka

```jsx
<button
  onClick={() => setIsOpen(true)}
  className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-3 rounded-lg shadow-lg"
>
  <FiMenu className="w-6 h-6" />
</button>
```

### 2. **Close Button**
- 📍 **Posisi:** Di dalam sidebar header (kanan atas)
- 🎨 **Style:** Minimal, hover:bg-slate-700
- 📱 **Visibility:** Hanya muncul di mobile (lg:hidden)
- ⚡ **Icon:** FiX (Close icon)

```jsx
<button
  onClick={() => setIsOpen(false)}
  className="lg:hidden text-white hover:bg-slate-700 p-2 rounded-lg"
>
  <FiX className="w-6 h-6" />
</button>
```

### 3. **Overlay/Backdrop**
- 🎨 **Style:** bg-black bg-opacity-50
- 📱 **Visibility:** Hanya di mobile (lg:hidden)
- ⚡ **Animation:** animate-fade-in
- 🖱️ **Interaction:** Click untuk close sidebar
- 🔢 **Z-index:** 40 (di bawah sidebar z-50)

```jsx
{isOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
    onClick={() => setIsOpen(false)}
  />
)}
```

---

## 🎯 Behavior

### Mobile (< 1024px)
1. **Default State:** Sidebar tertutup (`-translate-x-full`)
2. **Hamburger Button:** Muncul di kiri atas
3. **Click Hamburger:** 
   - Sidebar slide in dari kiri (`translate-x-0`)
   - Overlay muncul dengan fade animation
4. **Close Options:**
   - Click tombol X di header
   - Click overlay/backdrop
   - Click menu item (auto-close)

### Desktop (≥ 1024px)
1. **Default State:** Sidebar terbuka
2. **Hamburger Button:** Hidden
3. **Toggle Button:** Muncul di sidebar edge
4. **Behavior:** Collapse/expand (w-64 ↔ w-20)

---

## 🔧 Technical Implementation

### Sidebar State Management
```jsx
const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);  // Close on mobile
    } else {
      setIsOpen(true);   // Open on desktop
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Sidebar Transform Classes
```jsx
className={`
  fixed top-0 left-0 z-50 h-screen transition-all duration-300
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  ${isOpen ? 'w-64' : 'lg:w-20'}
`}
```

**Explanation:**
- `translate-x-0`: Sidebar visible
- `-translate-x-full`: Sidebar hidden (off-screen left)
- `lg:translate-x-0`: Always visible on desktop
- `w-64`: Full width when open
- `lg:w-20`: Collapsed width on desktop

### Auto-close on Menu Click (Mobile)
```jsx
<Link
  to={item.path}
  onClick={() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }}
>
```

---

## 🎨 Animation

### Fade In (Overlay)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

### Slide In (Sidebar)
```css
/* Handled by Tailwind */
transition-all duration-300
translate-x-0        /* Visible */
-translate-x-full    /* Hidden */
```

---

## 📐 Z-Index Hierarchy

```
Hamburger Button: z-50
Sidebar:          z-50
Overlay:          z-40
Content:          z-0
```

---

## ♿ Accessibility

1. **ARIA Labels:**
   ```jsx
   <button aria-label="Open Menu">
   <button aria-label="Close Menu">
   ```

2. **Keyboard Navigation:**
   - ESC key to close (TODO)
   - Tab navigation within sidebar
   - Focus trap when open (TODO)

3. **Screen Readers:**
   - Proper semantic HTML
   - Icon buttons with labels

---

## 🧪 Testing Checklist

### Mobile
- [ ] Hamburger button muncul saat page load
- [ ] Click hamburger membuka sidebar
- [ ] Sidebar slide in dari kiri dengan smooth
- [ ] Overlay muncul dengan fade animation
- [ ] Click overlay menutup sidebar
- [ ] Click tombol X menutup sidebar
- [ ] Click menu item menutup sidebar
- [ ] Sidebar tidak menutupi content saat tertutup

### Tablet
- [ ] Behavior sama seperti mobile di < 1024px
- [ ] Transition ke desktop mode di ≥ 1024px

### Desktop
- [ ] Hamburger button tidak muncul
- [ ] Sidebar selalu visible
- [ ] Toggle button berfungsi (collapse/expand)
- [ ] Overlay tidak muncul

### Responsive
- [ ] Resize dari mobile ke desktop: sidebar auto-open
- [ ] Resize dari desktop ke mobile: sidebar auto-close
- [ ] No layout shift saat resize

---

## 🐛 Known Issues & Solutions

### Issue 1: Content Jump
**Problem:** Content bergeser saat sidebar open/close
**Solution:** 
```jsx
// Layout.jsx - No ml offset on mobile
<main className={`
  transition-all duration-300 
  ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}  // Only on desktop
`}>
```

### Issue 2: Body Scroll
**Problem:** Background scrollable saat sidebar open
**Solution:** (TODO)
```jsx
useEffect(() => {
  if (isOpen && window.innerWidth < 1024) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}, [isOpen]);
```

---

## 🚀 Future Enhancements

1. **Swipe Gestures:**
   - Swipe right to open
   - Swipe left to close

2. **Keyboard Support:**
   - ESC to close
   - Focus trap

3. **Persistent State:**
   - Remember user preference (localStorage)

4. **Animation:**
   - Stagger menu item animations
   - Bounce effect

5. **Bottom Navigation:**
   - Alternative navigation for mobile
   - Tab bar style

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
