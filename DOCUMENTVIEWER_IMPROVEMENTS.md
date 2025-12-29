# DocumentViewer Improvements

## Ringkasan Perubahan

DocumentViewerModal telah ditingkatkan dengan fitur-fitur baru untuk anotasi PDF yang lebih lengkap, termasuk:

1. ✅ **Perbaikan PDF Worker** - Worker sekarang berfungsi setiap saat dengan fallback ke CDN
2. ✅ **Text Box Annotation** - Kemampuan menambahkan teks ke PDF
3. ✅ **Stamp/Signature** - Kemampuan menambahkan gambar PNG sebagai stempel/tanda tangan

---

## 🔧 Perbaikan PDF Worker

### Masalah Sebelumnya
- Worker sering gagal karena salah ekstensi file (mencari `.js` padahal file `.mjs`)
- Tidak ada fallback yang proper jika file lokal tidak ditemukan

### Solusi
```typescript
const localWorker = `${baseUrl}/js/pdf.worker.min.mjs`; // Sesuaikan dengan file asli
const cdnWorker = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

// Try local worker first
const response = await fetch(localWorker, { method: "HEAD" });
if (response.ok) {
  pdfjs.GlobalWorkerOptions.workerSrc = localWorker;
} else {
  // Fallback to CDN
  pdfjs.GlobalWorkerOptions.workerSrc = cdnWorker;
}
```

### File Worker
- **Lokasi**: `/public/js/pdf.worker.min.mjs`
- **Backup**: `/public/js/pdf.worker.min.js` (untuk kompatibilitas)
- Worker akan otomatis menggunakan file lokal, atau fallback ke CDN jika gagal

---

## 📝 Text Box Annotation

### Fitur
- Menambahkan teks ke halaman PDF
- Pilihan ukuran font: 14px, 18px, 24px, 32px
- Warna teks dapat disesuaikan dengan color picker
- Posisi teks dapat dipilih dengan klik pada PDF

### Cara Menggunakan
1. Klik tombol **Text** (icon "A") di toolbar
2. Klik pada posisi di PDF dimana teks akan ditambahkan
3. Modal akan muncul untuk input teks
4. Pilih ukuran font
5. Klik "Tambah" untuk menempatkan teks

### Contoh Kode
```typescript
// State untuk text
const [textInput, setTextInput] = useState("");
const [fontSize, setFontSize] = useState(20);
const [showTextModal, setShowTextModal] = useState(false);

// Handler untuk menambah teks
const handleAddText = () => {
  setAnnotations((prev) => [
    ...prev,
    {
      page: textPosition.page,
      type: "text",
      text: textInput,
      position: { x: textPosition.x, y: textPosition.y },
      color,
      fontSize,
    },
  ]);
};
```

---

## 🖼️ Stamp/Signature (Stempel PNG)

### Fitur
- Upload gambar PNG/JPG sebagai stempel
- Berguna untuk tanda tangan digital, stempel perusahaan, dll
- Ukuran default: 100x100px (dapat disesuaikan)
- Posisi dapat dipilih dengan klik pada PDF

### Cara Menggunakan
1. Klik tombol **Stamp** (icon gambar) di toolbar
2. Pilih file gambar (PNG/JPG) dari komputer
3. Setelah upload, klik pada posisi di PDF untuk menempatkan stempel
4. Stempel akan muncul pada posisi yang diklik

### Format Gambar yang Didukung
- PNG (direkomendasikan untuk transparansi)
- JPG/JPEG

### Best Practices untuk Stempel
- Gunakan PNG dengan background transparan untuk hasil terbaik
- Ukuran file sebaiknya < 1MB
- Resolusi gambar 300x300px atau 500x500px untuk kualitas optimal

### Contoh Penggunaan
```typescript
// Handler upload stempel
const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = event.target?.result as string;
    setStampImage(result);
    setTool("stamp");
  };
  reader.readAsDataURL(file);
};

// Menambahkan stempel ke PDF
setAnnotations((prev) => [
  ...prev,
  {
    page,
    type: "stamp",
    position: { x, y },
    stampImage,
    width: 100,
    height: 100,
  },
]);
```

---

## 🎨 Toolbar yang Ditingkatkan

### Tools Tersedia
1. **Pencil (Pensil)** - Menggambar garis bebas
2. **Eraser (Penghapus)** - Menghapus anotasi
3. **Text (Teks)** - Menambahkan teks ⭐ BARU
4. **Stamp (Stempel)** - Menambahkan gambar/tanda tangan ⭐ BARU

### Color Picker
- 5 warna tersedia: Merah, Biru, Hijau, Hitam, Orange
- Berlaku untuk pensil dan teks

### Thickness Selector
- 4 ketebalan: 3px, 5px, 8px, 12px
- Untuk garis pensil

### Font Size Selector
- 4 ukuran: 14px, 18px, 24px, 32px
- Untuk teks

---

## 💾 Export ke PDF

### Fitur
Semua anotasi (gambar, teks, stempel) akan di-embed ke PDF final:

```typescript
const generateAnnotatedPDF = async () => {
  const pdfDoc = await PDFDocumentLib.load(pdfFile.data);
  
  for (const ann of annotations) {
    if (ann.type === "draw") {
      // Draw paths
    } else if (ann.type === "text") {
      // Add text
      tempCtx.fillText(ann.text, ann.position.x, ann.position.y);
    } else if (ann.type === "stamp") {
      // Add image stamp
      tempCtx.drawImage(img, ann.position.x, ann.position.y, ann.width, ann.height);
    }
  }
  
  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes], `${documentName}_reviewed.pdf`);
};
```

---

## 📚 Referensi

### Repository GitHub
- [Firebase-WV11](https://github.com/DocRog-maker/Firebase-WV11.git)
- Menggunakan PDFTron WebViewer sebagai referensi konsep
- Dimodifikasi untuk react-pdf dan pdf-lib

### Video Tutorial
- [YouTube Tutorial](https://youtu.be/bSQlIVDdbIE?si=IKiK7r8zCylgToLq)

### Libraries yang Digunakan
- **react-pdf** - Rendering PDF
- **pdf-lib** - Manipulasi dan export PDF
- **pdfjs-dist** - PDF.js worker
- **lucide-react** - Icons

---

## 🚀 Cara Testing

### 1. Test PDF Worker
```bash
# Buka browser console
# Seharusnya muncul log:
"Using local PDF worker: http://localhost:3000/js/pdf.worker.min.mjs"
```

### 2. Test Text Annotation
1. Buka PDF viewer
2. Klik tombol Text
3. Klik pada PDF
4. Input teks "TEST ANNOTATION"
5. Pilih font size 24px
6. Klik Tambah
7. Teks harus muncul di PDF

### 3. Test Stamp/Signature
1. Siapkan file PNG tanda tangan (misalnya `signature.png`)
2. Klik tombol Stamp
3. Pilih file PNG
4. Klik pada PDF untuk menempatkan stempel
5. Stempel harus muncul di PDF

### 4. Test Export
1. Tambahkan beberapa anotasi (gambar, teks, stempel)
2. Klik tombol "Save PDF"
3. Download PDF
4. Buka PDF dengan PDF reader (Adobe, Chrome, dll)
5. Semua anotasi harus permanent di PDF

---

## 🐛 Troubleshooting

### Worker Tidak Berfungsi
**Gejala**: PDF tidak muncul, error di console
**Solusi**:
1. Cek file ada di `/public/js/pdf.worker.min.mjs`
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Periksa console untuk log worker

### Stempel Tidak Muncul
**Gejala**: Setelah upload, stempel tidak muncul saat klik
**Solusi**:
1. Pastikan file adalah PNG/JPG valid
2. Cek ukuran file < 5MB
3. Coba refresh page dan upload ulang

### Teks Tidak Terlihat
**Gejala**: Teks ditambahkan tapi tidak terlihat di PDF
**Solusi**:
1. Pilih warna yang kontras (hitam untuk PDF putih)
2. Cek ukuran font tidak terlalu kecil
3. Pastikan posisi klik di dalam area PDF

---

## 📝 Notes untuk Developer

### Interface Annotation
```typescript
interface Annotation {
  page: number;
  type: "draw" | "text" | "stamp";
  
  // For draw
  path?: Point[];
  color?: string;
  thickness?: number;
  
  // For text
  text?: string;
  fontSize?: number;
  position?: Point;
  
  // For stamp
  stampImage?: string; // Base64
  width?: number;
  height?: number;
}
```

### Tools State
```typescript
const [tool, setTool] = useState<"pencil" | "eraser" | "text" | "stamp">("pencil");
```

### Performance Tips
- Canvas drawing menggunakan `requestAnimationFrame` untuk smooth rendering
- Stamps di-cache sebagai base64 string
- PDF export menggunakan async/await untuk prevent blocking

---

## ✅ Checklist Implementasi

- [x] Fix PDF worker dengan .mjs extension
- [x] Tambah fallback ke CDN
- [x] Implementasi text annotation
- [x] Text input modal dengan font size selector
- [x] Implementasi stamp/signature upload
- [x] Handle PNG image rendering
- [x] Update toolbar dengan icon baru
- [x] Integrate text & stamp ke PDF export
- [x] Testing di berbagai browser
- [x] Documentation

---

## 🎯 Future Improvements

Beberapa ide untuk pengembangan lebih lanjut:

1. **Drag & Resize** - Kemampuan untuk drag dan resize text/stamp setelah ditempatkan
2. **Multiple Signatures** - Save beberapa signature untuk reuse
3. **Undo/Redo** - Implementasi history untuk undo/redo
4. **Font Selection** - Pilihan font family (Arial, Times, etc)
5. **Rotation** - Rotate stamp/text
6. **Highlight Tool** - Semi-transparent highlight
7. **Shape Tools** - Rectangle, circle, arrow
8. **Cloud Storage** - Save signatures ke cloud

---

## 📧 Support

Jika ada pertanyaan atau masalah, silakan buat issue atau hubungi tim development.

**Happy Annotating! 🎉**
