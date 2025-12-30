# Backend Update: Support Annotations in Review Endpoints

## Problem
Review endpoints (dalkon-review, engineering-review, manager-review) masih pakai `FileInterceptor` dan expect PDF file upload. Frontend sekarang kirim annotations sebagai JSON.

## Solution
Update semua review endpoints untuk:
1. Terima annotations sebagai JSON (tidak perlu file upload)
2. Jika ada annotations, merge ke PDF di server
3. Save hasil merge sebagai file baru

## Implementation

### 1. Update `document.controller.ts`

Ganti semua review endpoints dari `FileInterceptor` menjadi terima JSON body biasa:

```typescript
// BEFORE (OLD - MASIH PAKAI FILE UPLOAD):
@Patch(':id/dalkon-review')
@UseInterceptors(FileInterceptor('file', { ... }))
async dalkonReview(
  @Request() req,
  @Param('id') id: number,
  @Body() body: { action: string; notes?: string },
  @UploadedFile() file?: Express.Multer.File,
) {
  const annotatedFilePath = file ? `uploads/${file.filename}` : undefined;
  return this.documentService.dalkonReview(
    req.user,
    +id,
    body.action,
    body.notes,
    annotatedFilePath,
  );
}

// AFTER (NEW - TERIMA JSON ANNOTATIONS):
@Patch(':id/dalkon-review')
async dalkonReview(
  @Request() req,
  @Param('id') id: number,
  @Body() body: { 
    action: string; 
    notes?: string;
    annotations?: any[]; // ✅ Tambah field annotations
  },
) {
  return this.documentService.dalkonReview(
    req.user,
    +id,
    body.action,
    body.notes,
    body.annotations, // ✅ Pass annotations ke service
  );
}
```

**Apply to all review endpoints:**

```typescript
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  // ... existing code ...

  // ✅ DALKON REVIEW - Updated
  @Patch(':id/dalkon-review')
  async dalkonReview(
    @Request() req,
    @Param('id') id: number,
    @Body() body: { 
      action: string; 
      notes?: string;
      annotations?: any[];
    },
  ) {
    return this.documentService.dalkonReview(
      req.user,
      +id,
      body.action,
      body.notes,
      body.annotations,
    );
  }

  // ✅ ENGINEERING REVIEW - Updated
  @Patch(':id/engineering-review')
  async engineeringReview(
    @Request() req,
    @Param('id') id: number,
    @Body() body: { 
      action: string; 
      notes?: string;
      annotations?: any[];
    },
  ) {
    return this.documentService.engineeringReview(
      req.user,
      +id,
      body.action,
      body.notes,
      body.annotations,
    );
  }

  // ✅ MANAGER REVIEW - Updated
  @Patch(':id/manager-review')
  async managerReview(
    @Request() req,
    @Param('id') id: number,
    @Body() body: { 
      action: string; 
      notes?: string;
      annotations?: any[];
    },
  ) {
    return this.documentService.managerReview(
      req.user,
      +id,
      body.action,
      body.notes,
      body.annotations,
    );
  }

  // KEEP existing endpoints unchanged:
  // - @Patch(':id/save-annotations') ✅ Already correct
  // - @Post('submit') ✅ Still needs file
  // - @Patch(':id/resubmit') ✅ Still needs file
}
```

### 2. Update `document.service.ts`

Update signature dan logic semua review methods:

```typescript
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  // ✅ Helper method to merge annotations to PDF (reuse from saveAnnotations)
  private async mergeAnnotationsToPdf(
    documentId: number,
    annotations: any[],
  ): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads',
      path.basename(document.filePath),
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // Process annotations (same logic as saveAnnotations)
    for (const ann of annotations) {
      const page = pages[ann.page - 1];
      if (!page) continue;

      const { width, height } = page.getSize();

      if (ann.type === 'draw' && ann.path) {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.lineWidth = ann.thickness || 4;
        ctx.strokeStyle = ann.color || '#ff0000';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        ann.path.forEach((p: any, i: number) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        const pngImage = await pdfDoc.embedPng(canvas.toDataURL());
        page.drawImage(pngImage, { x: 0, y: 0, width, height });
      } else if (ann.type === 'text' && ann.text && ann.position) {
        const rgbColor = this.hexToRgb(ann.color || '#000000');
        page.drawText(ann.text, {
          x: ann.position.x,
          y: height - ann.position.y,
          size: ann.fontSize || 20,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        });
      } else if (ann.type === 'stamp' && ann.stampImage && ann.position) {
        const base64Data = ann.stampImage.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        let stampImg;
        if (ann.stampImage.includes('image/png')) {
          stampImg = await pdfDoc.embedPng(imageBuffer);
        } else {
          stampImg = await pdfDoc.embedJpg(imageBuffer);
        }

        page.drawImage(stampImg, {
          x: ann.position.x,
          y: height - ann.position.y - (ann.height || 100),
          width: ann.width || 100,
          height: ann.height || 100,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const newFilename = `annotated-${Date.now()}-${path.basename(
      document.filePath,
    )}`;
    const newFilePath = path.join(process.cwd(), 'uploads', newFilename);

    fs.writeFileSync(newFilePath, pdfBytes);

    return `uploads/${newFilename}`;
  }

  // ✅ DALKON REVIEW - Updated signature
  async dalkonReview(
    user: any,
    docId: number,
    action: string,
    notes?: string,
    annotations?: any[], // ✅ Changed from annotatedFilePath to annotations
  ) {
    if (user.division !== Division.Dalkon)
      throw new ForbiddenException('Only Dalkon');

    const doc = await this.prisma.document.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundException();

    // ✅ Merge annotations if provided
    let annotatedFilePath: string | undefined;
    if (annotations && annotations.length > 0) {
      annotatedFilePath = await this.mergeAnnotationsToPdf(docId, annotations);
    }

    let newStatus: Status;
    let logMessage = '';

    if (action === 'approve') {
      if (doc.status === Status.submitted) {
        newStatus = Status.inReviewEngineering;
        logMessage = 'Forwarded to Engineering';
      } else if (
        [Status.approved, Status.approvedWithNotes].includes(doc.status as any)
      ) {
        newStatus = Status.inReviewManager;
        logMessage = 'Forwarded to Manager';
      } else {
        throw new BadRequestException('Invalid status for approve');
      }
    } else if (action === 'returnForCorrection') {
      newStatus = Status.returnForCorrection;
      logMessage = notes || 'Returned by Dalkon';
    } else if (action === 'reject') {
      newStatus = Status.rejected;
      logMessage = notes || 'Rejected by Dalkon';
    } else {
      throw new BadRequestException('Invalid action');
    }

    const updated = await this.prisma.document.update({
      where: { id: docId },
      data: {
        status: newStatus,
        reviewedById: user.id,
        returnRequestedBy:
          action === 'returnForCorrection' ? Division.Dalkon : undefined,
        progress: { push: logMessage },
      },
    });

    if (annotatedFilePath) {
      await this.saveReviewerAnnotation(
        docId,
        annotatedFilePath,
        user.id,
        Division.Dalkon,
      );
    }

    return updated;
  }

  // ✅ ENGINEERING REVIEW - Updated signature
  async engineeringReview(
    user: any,
    docId: number,
    action: string,
    notes?: string,
    annotations?: any[], // ✅ Changed
  ) {
    if (user.division !== Division.Engineer)
      throw new ForbiddenException('Only Engineer');

    const doc = await this.prisma.document.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundException();

    // ✅ Merge annotations if provided
    let annotatedFilePath: string | undefined;
    if (annotations && annotations.length > 0) {
      annotatedFilePath = await this.mergeAnnotationsToPdf(docId, annotations);
    }

    let newStatus: Status;
    let logMessage = '';

    switch (action) {
      case 'approve':
        newStatus = Status.approved;
        logMessage = notes || 'Approved by Engineer';
        break;
      case 'approveWithNotes':
        newStatus = Status.approvedWithNotes;
        logMessage = notes || 'Approved with notes';
        break;
      case 'returnForCorrection':
        newStatus = Status.returnForCorrection;
        logMessage = notes || 'Returned by Engineer';
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    const updated = await this.prisma.document.update({
      where: { id: docId },
      data: {
        status: newStatus,
        reviewedById: user.id,
        returnRequestedBy:
          action === 'returnForCorrection' ? Division.Engineer : undefined,
        progress: { push: logMessage },
      },
    });

    if (annotatedFilePath) {
      await this.saveReviewerAnnotation(
        docId,
        annotatedFilePath,
        user.id,
        Division.Engineer,
      );
    }

    return updated;
  }

  // ✅ MANAGER REVIEW - Updated signature
  async managerReview(
    user: any,
    docId: number,
    action: string,
    notes?: string,
    annotations?: any[], // ✅ Changed
  ) {
    if (user.division !== Division.Manager)
      throw new ForbiddenException('Only Manager');

    const doc = await this.prisma.document.findUnique({ where: { id: docId } });
    if (!doc || doc.status !== Status.inReviewManager)
      throw new BadRequestException('Document not in manager review');

    // ✅ Merge annotations if provided
    let annotatedFilePath: string | undefined;
    if (annotations && annotations.length > 0) {
      annotatedFilePath = await this.mergeAnnotationsToPdf(docId, annotations);
    }

    let newStatus: Status;
    let logMessage = '';

    if (action === 'approve') {
      newStatus = Status.approved;
      logMessage = notes || 'Approved by Manager';
    } else if (action === 'returnForCorrection') {
      newStatus = Status.returnForCorrection;
      logMessage = notes || 'Returned by Manager';
    } else {
      throw new BadRequestException('Invalid action');
    }

    const updated = await this.prisma.document.update({
      where: { id: docId },
      data: {
        status: newStatus,
        reviewedById: user.id,
        returnRequestedBy:
          action === 'returnForCorrection' ? Division.Manager : undefined,
        progress: { push: logMessage },
      },
    });

    if (annotatedFilePath) {
      await this.saveReviewerAnnotation(
        docId,
        annotatedFilePath,
        user.id,
        Division.Manager,
      );
    }

    return updated;
  }

  // Keep existing hexToRgb helper
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  }
}
```

## Summary of Changes

### Controller Changes:
- ❌ Remove `@UseInterceptors(FileInterceptor(...))` from review endpoints
- ❌ Remove `@UploadedFile() file?: Express.Multer.File` parameter
- ✅ Add `annotations?: any[]` to Body DTO
- ✅ Pass annotations to service instead of filePath

### Service Changes:
- ✅ Add `mergeAnnotationsToPdf()` helper method (extracted from saveAnnotations)
- ✅ Change parameter from `annotatedFilePath?: string` to `annotations?: any[]`
- ✅ Call `mergeAnnotationsToPdf()` if annotations exist
- ✅ Use resulting filePath for `saveReviewerAnnotation()`

## Benefits

| Before | After |
|--------|-------|
| Frontend: Download PDF ~5MB | Frontend: Send JSON ~5KB |
| Frontend: Generate PDF with annotations | Backend: Merge annotations |
| Frontend: Upload PDF ~5MB | Backend: Save merged PDF |
| **Total: ~10MB transfer** | **Total: ~5KB transfer** |

## Testing

```bash
# Test approve with annotations
curl -X PATCH http://localhost:3000/documents/1/dalkon-review \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "approve",
    "notes": "Looks good",
    "annotations": [
      {
        "page": 1,
        "type": "draw",
        "path": [{"x": 100, "y": 200}, {"x": 150, "y": 250}],
        "color": "#ff0000",
        "thickness": 4
      }
    ]
  }'

# Test approve without annotations (masih works)
curl -X PATCH http://localhost:3000/documents/1/engineering-review \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "approve",
    "notes": "Approved"
  }'
```

## Notes

- ✅ Backward compatible: jika tidak ada annotations, workflow tetap jalan
- ✅ Tidak perlu install package baru (sudah ada pdf-lib dan canvas)
- ✅ File annotations disimpan sebagai version dengan nomor 100+ (tidak bentrok dengan version asli)
