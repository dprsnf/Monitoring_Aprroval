# 🚀 Quick Reference - DocumentViewer

## 📌 Fitur Baru (What's New)

| Feature | Icon | Fungsi | Cara Pakai |
|---------|------|--------|------------|
| **Text Box** | `T` | Tambah teks ke PDF | Klik tool → Klik PDF → Ketik teks |
| **Stamp** | 🖼️ | Upload PNG/JPG stempel | Klik tool → Upload file → Klik PDF |
| **Pencil** | ✏️ | Gambar bebas | Klik tool → Drag di PDF |
| **Eraser** | 🧹 | Hapus anotasi | Klik tool → Drag di PDF |

---

## ⚡ Quick Actions

### Tambah Teks
```
1. Klik [T]
2. Klik di PDF
3. Ketik teks
4. Pilih size (14/18/24/32px)
5. Klik "Tambah"
```

### Tambah Stempel
```
1. Klik [🖼️]
2. Pilih PNG file
3. Klik di PDF
4. Done!
```

### Save PDF
```
1. Buat anotasi
2. Klik "Save PDF"
3. File auto download
```

---

## 🎨 Customization

| Option | Values | Applies To |
|--------|--------|------------|
| **Color** | 🔴 🔵 🟢 ⚫ 🟠 | Pencil, Text |
| **Thickness** | 3px, 5px, 8px, 12px | Pencil |
| **Font Size** | 14px, 18px, 24px, 32px | Text |
| **Stamp Size** | 100x100px (default) | Stamp |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| PDF tidak muncul | Refresh (Ctrl+F5) |
| Worker error | Check `/js/pdf.worker.min.mjs` |
| Stamp tidak upload | Pastikan PNG/JPG < 5MB |
| Text modal tidak muncul | Klik tool Text dulu |
| Anotasi hilang | Check Save dulu sebelum close |

---

## 📍 Important Files

```
public/
  js/pdf.worker.min.mjs  ← Worker file (CRITICAL!)
  signature-generator.html  ← Tool buat tanda tangan

Documentation/
  RINGKASAN.md  ← Quick summary (Bahasa)
  DOCUMENTVIEWER_IMPROVEMENTS.md  ← Technical details
  TESTING_GUIDE.md  ← Test scenarios
```

---

## ✅ Pre-flight Checklist

Sebelum pakai, pastikan:
- [ ] Worker file ada di `/public/js/`
- [ ] Dev server running (`npm run dev`)
- [ ] Browser support (Chrome/Edge/Firefox)
- [ ] PDF file valid dan bisa dibuka

---

## 🎯 Common Use Cases

### Approval Flow
```
Review → Add notes (Text) → Add signature (Stamp) → Approve
```

### Revision Flow
```
Review → Mark errors (Pencil) → Add comments (Text) → Return
```

### Multi-reviewer Flow
```
Reviewer 1 → Stamp + Notes → Reviewer 2 → Stamp + Notes → Final
```

---

## 💡 Pro Tips

1. **Text Position**: Klik tepat dimana mau taruh teks
2. **Stamp Transparency**: Gunakan PNG transparan untuk hasil terbaik
3. **Color Contrast**: Pilih warna yang kontras dengan PDF
4. **Font Size**: 24px ideal untuk catatan, 18px untuk detail
5. **Multiple Stamps**: Bisa tambah > 1 stamp di dokumen sama
6. **Save Often**: Klik Save PDF berkala untuk backup

---

## 🔥 Shortcuts

| Action | Shortcut |
|--------|----------|
| Clear All | Click "Clear" button |
| Next Page | Click "→" or arrow right |
| Prev Page | Click "←" or arrow left |
| Save PDF | Click "Save PDF" button |

---

## 📊 Limits & Specs

| Item | Limit/Spec |
|------|------------|
| Max Annotations | Unlimited (reasonable use) |
| Stamp File Size | < 5MB recommended |
| Stamp Format | PNG (preferred), JPG |
| Text Length | Unlimited |
| Font Sizes | 14, 18, 24, 32px |
| Colors | 5 preset colors |
| PDF Pages | Unlimited |

---

## 🌐 Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Full Support | Recommended |
| Edge | ✅ Full Support | Chromium-based |
| Firefox | ✅ Full Support | Latest version |
| Safari | ⚠️ Limited | Test needed |
| Mobile | ⚠️ Basic | Touch may vary |

---

## 📞 Need Help?

### Quick Checks:
1. **Console Errors**: Press F12, check Console tab
2. **Network Issues**: Check Network tab for failed requests
3. **Worker Status**: Look for "Using local PDF worker" log

### Common Fixes:
- Refresh: `Ctrl + F5`
- Clear Cache: `Ctrl + Shift + Delete`
- Restart Server: `Ctrl + C` → `npm run dev`

### Documentation:
- Technical: `DOCUMENTVIEWER_IMPROVEMENTS.md`
- Testing: `TESTING_GUIDE.md`
- Summary: `RINGKASAN.md` (this file)

---

## 🎓 Learning Path

### Beginner
1. Open PDF
2. Try Pencil tool
3. Try Text tool
4. Try Stamp tool
5. Save PDF

### Intermediate
1. Multi-page annotations
2. Mix different tools
3. Use different colors
4. Upload custom stamps

### Advanced
1. Create custom signatures
2. Complex annotation workflows
3. Review collaboration
4. Optimize performance

---

## 🔄 Workflow Examples

### Simple Approval
```
Open PDF → Review → Add "APPROVED" text → Add stamp → Save
```

### Detailed Review
```
Open PDF → Mark issues (Red pencil) → Add comments (Text) 
→ Add summary (Text at bottom) → Save
```

### Vendor Revision
```
Open returned PDF → Review markups → Fix issues 
→ Mark fixed (Green pencil) → Add "Fixed" text → Submit
```

---

## ⭐ Best Practices

### Text Annotations
- Use clear, concise language
- Use appropriate font size
- Choose contrasting colors
- Position strategically

### Stamps
- Use high-quality PNG
- Transparent background preferred
- Consistent size across documents
- Place in standard location

### General
- Save frequently
- Review before submit
- Clear when restarting
- Test export before final submit

---

## 🎨 Color Guide

| Color | Best For | Use Case |
|-------|----------|----------|
| 🔴 Red | Errors, Issues | "Perlu diperbaiki" |
| 🔵 Blue | Info, Notes | "Catatan tambahan" |
| 🟢 Green | Approved, OK | "Sudah diperbaiki" |
| ⚫ Black | General | "APPROVED" |
| 🟠 Orange | Warning | "Perhatian khusus" |

---

## 🏁 Quick Start (30 seconds)

```bash
# Terminal
npm run dev

# Browser
http://localhost:3000

# Login → Open PDF → Test Tools → Done!
```

---

**🎉 You're ready to go!**

Bookmark this page for quick reference.

---

*Updated: 29 Dec 2025*
*Version: 2.0*
