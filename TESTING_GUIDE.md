# 🧪 Testing Guide - DocumentViewer Improvements

## Quick Start Testing

### 1. Persiapan
```bash
# Pastikan dependencies sudah terinstall
npm install

# Jalankan development server
npm run dev
```

### 2. Akses Aplikasi
Buka browser dan akses: `http://localhost:3000`

---

## Test Case 1: PDF Worker ✅

### Tujuan
Memastikan PDF worker berfungsi dengan baik dan PDF dapat dibuka setiap saat

### Langkah-langkah
1. Login ke aplikasi
2. Navigasi ke halaman review dokumen
3. Klik untuk membuka PDF
4. Buka Browser Console (F12)

### Expected Result
✅ Di console muncul log:
```
Using local PDF worker: http://localhost:3000/js/pdf.worker.min.mjs
```

✅ PDF tampil dengan lancar tanpa error
✅ Tidak ada error "Worker failed to load" di console

### Jika Worker Gagal
1. Cek file ada di `/public/js/pdf.worker.min.mjs`
2. Restart dev server: `Ctrl+C` lalu `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh halaman (Ctrl+F5)

---

## Test Case 2: Drawing Tool (Existing) ✅

### Tujuan
Memastikan drawing tool masih berfungsi seperti sebelumnya

### Langkah-langkah
1. Buka PDF di viewer
2. Pilih tool "Pencil"
3. Pilih warna (merah)
4. Pilih thickness (5px)
5. Gambar garis di PDF

### Expected Result
✅ Garis muncul dengan warna merah
✅ Ketebalan garis sesuai (5px)
✅ Garis smooth tanpa lag

---

## Test Case 3: Text Annotation ⭐ NEW

### Tujuan
Menguji fitur baru untuk menambahkan teks ke PDF

### Langkah-langkah
1. Buka PDF di viewer
2. Klik tombol **"T"** (Type) di toolbar
3. Klik pada posisi di PDF dimana teks akan ditambahkan
4. Modal input teks akan muncul
5. Ketik: **"APPROVED - 29 Des 2025"**
6. Pilih font size: **24px**
7. Klik tombol **"Tambah"**

### Expected Result
✅ Modal muncul setelah klik pada PDF
✅ Teks muncul di posisi yang diklik
✅ Font size 24px terlihat jelas
✅ Warna teks sesuai dengan color picker

### Advanced Test
- Tambah beberapa teks dengan ukuran berbeda
- Test dengan warna berbeda
- Test di halaman berbeda
- Test posisi di sudut PDF

---

## Test Case 4: Stamp/Signature ⭐ NEW

### Tujuan
Menguji fitur upload dan penambahan stempel PNG

### Persiapan
1. Buat tanda tangan menggunakan `signature-generator.html`
   - Buka: `http://localhost:3000/signature-generator.html`
   - Gambar tanda tangan
   - Download sebagai PNG
2. Atau gunakan file PNG tanda tangan yang sudah ada

### Langkah-langkah
1. Buka PDF di viewer
2. Klik tombol **Image Icon** di toolbar
3. Dialog file picker akan muncul
4. Pilih file PNG tanda tangan
5. Alert muncul: "Klik pada PDF untuk menempatkan stempel"
6. Klik pada posisi di PDF

### Expected Result
✅ File picker muncul
✅ Setelah upload, alert muncul
✅ Stempel muncul di posisi klik
✅ Ukuran stempel proporsional (100x100px)
✅ Transparansi PNG terjaga

### Advanced Test
- Upload PNG dengan background transparan
- Upload JPG (tanpa transparansi)
- Test multiple stamps di berbagai posisi
- Test stamp di berbagai halaman

---

## Test Case 5: Mixed Annotations

### Tujuan
Menguji kombinasi semua fitur anotasi

### Langkah-langkah
1. Buka PDF di viewer
2. Gambar garis dengan Pencil (warna merah)
3. Tambah teks "REVIEWED" (font 24px, warna hitam)
4. Tambah teks "Date: 29/12/2025" (font 18px, warna biru)
5. Tambah stempel tanda tangan di bawah
6. Gambar lingkaran dengan Pencil di sekitar area penting

### Expected Result
✅ Semua anotasi muncul dengan benar
✅ Tidak ada overlap issue
✅ Semua warna terlihat jelas
✅ Stempel tidak menutupi teks

---

## Test Case 6: Multi-Page PDF

### Tujuan
Menguji anotasi di berbagai halaman

### Langkah-langkah
1. Buka PDF dengan minimal 3 halaman
2. **Halaman 1**: Tambah teks "Page 1 - Checked"
3. Klik "Next" untuk ke halaman 2
4. **Halaman 2**: Tambah stamp
5. Klik "Next" untuk ke halaman 3
6. **Halaman 3**: Gambar garis dengan pencil
7. Navigate kembali ke halaman 1, 2, 3

### Expected Result
✅ Anotasi tetap ada di halaman yang benar
✅ Tidak ada anotasi hilang saat pindah halaman
✅ Tidak ada anotasi "pindah" ke halaman lain
✅ Canvas ukuran tetap konsisten

---

## Test Case 7: Save PDF

### Tujuan
Menguji export PDF dengan anotasi permanent

### Langkah-langkah
1. Buka PDF di viewer
2. Tambahkan berbagai anotasi:
   - 2-3 garis dengan pencil
   - 2-3 teks berbeda
   - 1-2 stamp
3. Klik tombol **"Save PDF"**
4. PDF akan terdownload
5. Buka PDF downloaded dengan PDF reader (Adobe, Chrome, dll)

### Expected Result
✅ PDF terdownload dengan format: `{nama}_reviewed.pdf`
✅ Semua anotasi terlihat di PDF downloaded
✅ Anotasi permanent (tidak bisa dihapus)
✅ Kualitas PDF tetap bagus
✅ File size tidak terlalu besar (< 5MB untuk PDF biasa)

### Verify di PDF Reader
- Buka dengan Adobe Acrobat Reader
- Buka dengan Chrome PDF Viewer
- Buka dengan Edge PDF Viewer
- Pastikan semua anotasi terlihat sama

---

## Test Case 8: Clear All

### Tujuan
Menguji fungsi clear untuk menghapus semua anotasi

### Langkah-langkah
1. Buka PDF di viewer
2. Tambahkan berbagai anotasi (garis, teks, stamp)
3. Klik tombol **"Clear"**
4. Confirm action

### Expected Result
✅ Semua anotasi hilang
✅ Canvas kembali bersih
✅ PDF tetap ditampilkan dengan baik
✅ Bisa mulai anotasi baru

---

## Test Case 9: Submit with Annotations (Reviewer)

### Tujuan
Menguji workflow lengkap review dengan anotasi

### Langkah-langkah (untuk Dalkon/Engineer/Manager)
1. Buka dokumen untuk review
2. Tambahkan anotasi:
   - Coret bagian yang perlu direvisi
   - Tambah teks keterangan: "Perlu diperbaiki"
   - Tambah stamp approval
3. Pilih action: **"Return for Correction"**
4. Isi notes: "Perbaiki bagian yang dicoret"
5. Klik **"Return Revisi"**

### Expected Result
✅ PDF dengan anotasi ter-upload ke server
✅ Vendor menerima PDF yang sudah dianotasi
✅ Notes tersimpan di database
✅ Status dokumen berubah

---

## Test Case 10: Submit Revision (Vendor)

### Tujuan
Menguji workflow vendor submit revisi dengan anotasi

### Langkah-langkah (untuk Vendor)
1. Buka dokumen yang dikembalikan untuk revisi
2. Review anotasi dari reviewer
3. Coret atau tandai bagian yang sudah diperbaiki
4. Tambah teks: "Sudah diperbaiki"
5. Klik **"Submit Revisi"**

### Expected Result
✅ PDF revisi dengan anotasi ter-upload
✅ Reviewer menerima PDF dengan anotasi vendor
✅ Status dokumen berubah ke "Waiting Review"

---

## Test Case 11: Performance Test

### Tujuan
Menguji performa dengan banyak anotasi

### Langkah-langkah
1. Buka PDF di viewer
2. Tambahkan 10 teks berbeda
3. Tambahkan 5 stamp
4. Gambar 20 garis dengan pencil
5. Navigate antar halaman
6. Klik Save PDF

### Expected Result
✅ Aplikasi tetap responsive
✅ Tidak ada lag saat menggambar
✅ Navigate halaman smooth
✅ Save PDF selesai < 10 detik
✅ File size reasonable (< 10MB)

---

## Test Case 12: Browser Compatibility

### Tujuan
Memastikan kompatibilitas di berbagai browser

### Browser yang Ditest
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (latest)
- ✅ Firefox (latest)
- ⚠️ Safari (jika ada Mac)

### Test di Setiap Browser
1. Open PDF
2. Add text annotation
3. Add stamp
4. Draw with pencil
5. Save PDF

### Expected Result
✅ Semua fitur berfungsi di semua browser
✅ UI terlihat konsisten
✅ Tidak ada browser-specific bugs

---

## Test Case 13: Error Handling

### Test 13.1: Upload Invalid File for Stamp
1. Klik tombol Stamp
2. Pilih file PDF (bukan image)

**Expected**: Alert "Harap pilih file gambar (PNG/JPG)"

### Test 13.2: Save Without Annotations
1. Buka PDF
2. Langsung klik "Save PDF" tanpa anotasi

**Expected**: Alert "Tidak ada perubahan untuk disimpan"

### Test 13.3: PDF Load Error
1. Coba buka dokumen yang tidak valid
2. Check error handling

**Expected**: Error message "Gagal memuat dokumen"

---

## Test Case 14: Mobile Responsiveness (Bonus)

### Tujuan
Test di mobile devices atau responsive mode

### Langkah-langkah
1. Buka Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Pilih device: iPhone 12 Pro
4. Test semua fitur

### Expected Result
⚠️ Note: Mobile support mungkin terbatas
- Touch drawing berfungsi
- Toolbar tetap accessible
- Modal text input responsive

---

## Troubleshooting Guide

### Issue: PDF Tidak Muncul
```
Symptom: Loading spinner terus muncul
Solutions:
1. Check console untuk error
2. Verify worker setup
3. Check network tab untuk download PDF
4. Clear cache dan reload
```

### Issue: Anotasi Tidak Tersimpan di PDF
```
Symptom: Save PDF berhasil tapi anotasi hilang
Solutions:
1. Check pdf-lib version compatible
2. Verify generateAnnotatedPDF function
3. Check console untuk error saat save
```

### Issue: Stamp Tidak Muncul
```
Symptom: Upload berhasil tapi stamp tidak terlihat
Solutions:
1. Verify file adalah valid PNG/JPG
2. Check stampImage state
3. Verify redrawAnnotations includes stamp rendering
```

### Issue: Text Modal Tidak Muncul
```
Symptom: Klik text tool tapi modal tidak show
Solutions:
1. Check showTextModal state
2. Verify textPosition set correctly
3. Check z-index modal tidak tertutup
```

---

## Performance Benchmarks

### Target Performance
- **PDF Load Time**: < 3 seconds
- **Add Text Annotation**: < 100ms
- **Add Stamp**: < 200ms
- **Drawing Lag**: < 16ms (60fps)
- **Save PDF**: < 5 seconds (untuk PDF 5MB)
- **Navigate Page**: < 500ms

### Monitoring
Gunakan Chrome DevTools Performance tab untuk monitoring:
1. Open DevTools (F12)
2. Go to Performance tab
3. Record while using features
4. Analyze flame graph

---

## Checklist Sebelum Deploy

- [ ] Semua test case passed
- [ ] No console errors
- [ ] PDF worker berfungsi setiap saat
- [ ] Text annotation berfungsi
- [ ] Stamp upload berfungsi
- [ ] Save PDF menghasilkan file yang benar
- [ ] UI responsive dan user-friendly
- [ ] Performance acceptable
- [ ] Browser compatibility checked
- [ ] Error handling proper
- [ ] Documentation complete

---

## Bug Report Template

Jika menemukan bug, gunakan format ini:

```markdown
## Bug: [Judul Singkat]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**:
Apa yang seharusnya terjadi

**Actual Result**:
Apa yang benar-benar terjadi

**Screenshots**:
[Attach screenshots]

**Browser**: Chrome 120 / Edge 120 / Firefox 121

**Console Errors**:
```
[Paste console errors]
```

**Additional Context**:
Informasi tambahan yang relevan
```

---

## Success Criteria

### ✅ Feature Complete
- [x] PDF worker reliable
- [x] Text annotation working
- [x] Stamp upload working
- [x] All tools integrated
- [x] Export PDF with annotations

### ✅ Quality
- [x] No console errors
- [x] Smooth performance
- [x] Good UX
- [x] Proper error handling

### ✅ Documentation
- [x] Code documented
- [x] User guide created
- [x] Test cases defined
- [x] Troubleshooting guide

---

**Happy Testing! 🚀**

Jika menemukan issue atau ada pertanyaan, silakan hubungi tim development.
