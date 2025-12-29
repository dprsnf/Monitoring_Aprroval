# Document Review - Full Page Implementation

## Overview
Semua dokumen yang sebelumnya menggunakan `DocumentViewerModal` (dalam Dialog) sekarang menggunakan **full page view** di route `/documents/review/[id]`.

## Perubahan Utama

### 1. **Route Baru**
- **Path**: `/documents/review/[id]`
- **File**: `src/app/documents/review/[id]/page.tsx`
- **Component**: `src/app/documents/review/[id]/components/DocumentReviewPage.tsx`

### 2. **Navigasi dengan sessionStorage**
Semua komponen yang sebelumnya membuka modal sekarang menggunakan:

```typescript
const data = {
  documentId: doc.id,
  documentName: doc.name,
  userDivision: user?.division,
  initialAction: null, // atau "approve" | "approveWithNotes" | "returnForCorrection"
};
sessionStorage.setItem("documentReviewData", JSON.stringify(data));
router.push(`/documents/review/${doc.id}`);
```

### 3. **File yang Diupdate**

#### ✅ `DocumentCard.tsx` (review-approval)
- Removed: `DocumentViewerModal` import
- Added: `useRouter` from next/navigation
- Changed: All action buttons now navigate to page

#### ✅ `ManagerDocumentCard.tsx` (review-manager)
- Removed: `DocumentViewerModal` import
- Added: `useRouter` and `handleOpenPage` function
- Changed: "Preview & Coret" button navigates to page

#### ✅ `DocumentCard.tsx` (review-dalkon)
- Removed: `DocumentViewerModal` import
- Added: `useRouter` and `handleOpenPage` function
- Changed: "Review Dokumen" button navigates to page

#### ✅ `VendorUploadPage.tsx` (upload-drawing)
- Removed: `DocumentViewerModal` import and state
- Added: `useRouter`
- Changed: "Preview Dokumen" button navigates to page

## Keuntungan Full Page

### ✅ Tidak Ada Warning Dialog
- Tidak ada "Missing Description" warning
- Tidak ada Dialog accessibility issues
- Tidak ada Dialog lifecycle problems

### ✅ Lebih Stabil
- Tidak ada hydration errors
- Tidak ada modal stacking issues
- Lifecycle lebih sederhana

### ✅ Better UX
- Full screen untuk review dokumen
- Back button browser works
- URL shareable
- Better mobile experience

### ✅ Lebih Clean
- Tidak perlu manage modal state
- Tidak perlu prop drilling untuk modal
- Simpler component structure

## Cara Menggunakan

### Dari Komponen Lain
```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Untuk preview saja (tanpa action)
const handlePreview = () => {
  const data = {
    documentId: document.id,
    documentName: document.name,
    userDivision: currentUser?.division,
    initialAction: null,
  };
  sessionStorage.setItem("documentReviewData", JSON.stringify(data));
  router.push(`/documents/review/${document.id}`);
};

// Untuk langsung approve
const handleApprove = () => {
  const data = {
    documentId: document.id,
    documentName: document.name,
    userDivision: currentUser?.division,
    initialAction: "approve",
  };
  sessionStorage.setItem("documentReviewData", JSON.stringify(data));
  router.push(`/documents/review/${document.id}`);
};
```

### Callback Setelah Submit
Ketika user klik "Back" atau setelah submit sukses, page akan otomatis `router.back()` dan sessionStorage akan dibersihkan.

## Fitur yang Sama

Semua fitur dari modal tetap ada di full page:

### ✅ PDF Viewing
- Multi-page navigation
- Zoom controls
- Canvas overlay untuk annotation

### ✅ Annotation Tools
- ✏️ Pencil (menggambar)
- 🧹 Eraser (hapus)
- 📝 Text (tambah teks dengan font size)
- 🖼️ Stamp (upload PNG/JPG untuk stempel)

### ✅ Review Actions
- Approve
- Approve with Notes
- Return for Correction
- Submit Revision (vendor)

### ✅ Export
- Save PDF dengan anotasi
- Download hasil review

## Technical Details

### Worker Setup
```typescript
import { pdfjs } from "react-pdf";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = 
    `https://unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs`;
}
```

### Dynamic Imports
```typescript
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
```

### State Management
Page mengambil data dari sessionStorage saat mount:
```typescript
useEffect(() => {
  const storedData = sessionStorage.getItem("documentReviewData");
  if (storedData) {
    setDocumentData(JSON.parse(storedData));
  }
}, [params.id]);
```

## Migration Notes

### Old Way (Modal)
```typescript
const [showModal, setShowModal] = useState(false);

<DocumentViewerModal
  documentId={doc.id}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  // ...props
/>
```

### New Way (Page)
```typescript
const router = useRouter();

const handleOpen = () => {
  sessionStorage.setItem("documentReviewData", JSON.stringify({
    documentId: doc.id,
    documentName: doc.name,
    userDivision: user?.division,
  }));
  router.push(`/documents/review/${doc.id}`);
};
```

## Future Improvements

### Potential Enhancements
- [ ] Add URL query params untuk initial action
- [ ] Add breadcrumb navigation
- [ ] Add keyboard shortcuts
- [ ] Add touch gestures untuk mobile
- [ ] Add collaborative review (multiple users)
- [ ] Add version comparison

### Performance
- [ ] Lazy load annotations
- [ ] Virtual scrolling untuk banyak halaman
- [ ] Image optimization untuk stamps
- [ ] Cache PDF di IndexedDB

## Troubleshooting

### Issue: Page tidak load data
**Solusi**: Pastikan sessionStorage diset sebelum router.push()

### Issue: Back button tidak berfungsi
**Solusi**: Gunakan router.back() bukan router.push('/previous')

### Issue: Worker error masih muncul
**Solusi**: Pastikan pdfjs-dist version match (5.4.394)

## Testing Checklist

- [x] Preview dokumen dari DocumentCard
- [x] Approve flow dari DALKON
- [x] Engineer review flow
- [x] Manager review flow
- [x] Vendor resubmit flow
- [x] Text annotation
- [x] Stamp upload
- [x] PDF export dengan anotasi
- [x] Back navigation
- [x] Refresh setelah submit

## Support

Jika ada issue atau pertanyaan:
1. Check console untuk error messages
2. Check sessionStorage untuk data
3. Check Network tab untuk API calls
4. Verify pdfjs-dist version matches worker URL

---

**Status**: ✅ Production Ready
**Last Updated**: December 29, 2025
**Version**: 2.0.0 (Full Page Implementation)
