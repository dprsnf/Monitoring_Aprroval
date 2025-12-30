# Backend Changes untuk Save Annotated Document

## 1. Tambahkan endpoint baru di DocumentController

```typescript
// Di document.controller.ts, tambahkan:

@Patch(':id/update-file')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
    storage: diskStorage({
      destination: () => ensureUploadsDir(),
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `updated-${unique}${extname(file.originalname)}`);
      },
    }),
  }),
)
async updateDocumentFile(
  @Request() req,
  @Param('id') id: number,
  @UploadedFile() file?: Express.Multer.File,
) {
  if (!file) throw new BadRequestException('File is required');
  const filePath = `uploads/${file.filename}`;
  return this.documentService.updateDocumentFile(req.user.id, +id, filePath);
}
```

## 2. Tambahkan method di DocumentService

```typescript
// Di document.service.ts, tambahkan:

async updateDocumentFile(userId: number, docId: number, filePath: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const doc = await this.prisma.document.findUnique({ 
    where: { id: docId },
    select: { 
      id: true, 
      latestVersion: true, 
      submittedById: true,
      status: true 
    }
  });
  
  if (!doc) throw new NotFoundException('Document not found');

  // Cek otorisasi
  const isReviewer = [Division.Dalkon, Division.Engineer, Division.Manager].includes(user.division);
  const isOwner = user.division === Division.Vendor && doc.submittedById === userId;
  
  if (!isReviewer && !isOwner) {
    throw new ForbiddenException('Not authorized to update this document');
  }

  // Buat versi baru dengan nomor yang sama (overwrite preview)
  const newVersion = doc.latestVersion;

  // Update document dengan file baru
  return this.prisma.document.update({
    where: { id: docId },
    data: {
      filePath,
      progress: {
        push: `File updated by ${user.division}`,
      },
      versions: {
        create: {
          filePath: filePath,
          version: newVersion + 0.1, // 1.1, 2.1, dst untuk preview
          uploadedById: userId,
        },
      },
    },
    include: {
      versions: { orderBy: { version: 'desc' }, take: 5 },
      submittedBy: { select: { id: true, name: true } },
    }
  });
}
```

## 3. Cara implementasi

1. Copy kode endpoint di atas ke `document.controller.ts` (setelah endpoint review lainnya)
2. Copy method service di atas ke `document.service.ts` 
3. Restart NestJS server
4. Test dengan curl atau Postman:
   ```bash
   curl -X PATCH http://localhost:3000/documents/1/update-file \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@annotated.pdf"
   ```

## Catatan

- Endpoint ini membuat DocumentVersion baru tapi TIDAK mengubah status approval
- Version number menggunakan decimal (1.1, 2.1) untuk membedakan dari versi resmi
- Progress log mencatat siapa yang update file
- Bisa dipanggil berkali-kali untuk "save as you go"
