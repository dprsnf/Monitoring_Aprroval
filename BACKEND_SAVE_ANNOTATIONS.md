# Backend Implementation: Save Annotations

## Endpoint Baru

### PATCH /documents/:id/save-annotations

Endpoint ini menerima annotations dalam format JSON dan merge ke PDF yang sudah ada di server.

## Implementation

### 1. Update `document.controller.ts`

```typescript
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  // ... existing code ...

  @Patch(':id/save-annotations')
  async saveAnnotations(
    @Param('id') id: string,
    @Body() body: { annotations: any[]; documentName: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.documentService.saveAnnotations(
      userId,
      parseInt(id),
      body.annotations,
      body.documentName,
    );
  }
}
```

### 2. Update `document.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async saveAnnotations(
    userId: number,
    docId: number,
    annotations: any[],
    documentName: string,
  ) {
    // 1. Find document
    const document = await this.prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // 2. Read existing PDF file
    const filePath = path.join(
      process.cwd(),
      'uploads',
      path.basename(document.filePath),
    );

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on server');
    }

    const existingPdfBytes = fs.readFileSync(filePath);

    // 3. Load PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // 4. Process annotations and embed to PDF
    for (const ann of annotations) {
      const page = pages[ann.page - 1];
      if (!page) continue;

      const { width, height } = page.getSize();

      if (ann.type === 'draw' && ann.path) {
        // Create canvas untuk render annotation
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.lineWidth = ann.thickness || 4;
        ctx.strokeStyle = ann.color || '#ff0000';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        ann.path.forEach((p: any, i: number) => {
          if (i === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        });
        ctx.stroke();

        // Convert canvas to PNG and embed
        const pngImage = await pdfDoc.embedPng(canvas.toDataURL());
        page.drawImage(pngImage, { x: 0, y: 0, width, height });
      } else if (ann.type === 'text' && ann.text && ann.position) {
        // Draw text directly on PDF
        page.drawText(ann.text, {
          x: ann.position.x,
          y: height - ann.position.y, // Flip Y coordinate
          size: ann.fontSize || 20,
          color: this.hexToRgb(ann.color || '#000000'),
        });
      } else if (ann.type === 'stamp' && ann.stampImage && ann.position) {
        // Decode base64 stamp image
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

    // 5. Save modified PDF
    const pdfBytes = await pdfDoc.save();
    const newFilename = `annotated-${Date.now()}-${path.basename(
      document.filePath,
    )}`;
    const newFilePath = path.join(process.cwd(), 'uploads', newFilename);

    fs.writeFileSync(newFilePath, pdfBytes);

    // 6. Update database with new file path
    await this.prisma.document.update({
      where: { id: docId },
      data: {
        filePath: newFilePath,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Annotations saved successfully',
      filePath: newFilePath,
    };
  }

  // Helper function to convert hex color to RGB
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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

### 3. Install Dependencies

```bash
npm install pdf-lib canvas
npm install -D @types/node
```

## How It Works

1. **Frontend sends JSON**:
   ```json
   {
     "annotations": [
       {
         "page": 1,
         "type": "draw",
         "path": [{ "x": 100, "y": 200 }, ...],
         "color": "#ff0000",
         "thickness": 4
       }
     ],
     "documentName": "document.pdf"
   }
   ```

2. **Backend processes**:
   - Load existing PDF dari disk
   - Iterate annotations
   - Render ke canvas (untuk draw)
   - Embed canvas sebagai PNG ke PDF
   - Save modified PDF dengan nama baru
   - Update database dengan path baru

3. **Benefits**:
   - ✅ No download needed di frontend
   - ✅ Faster (hanya kirim JSON ~KB vs PDF ~MB)
   - ✅ Less memory usage di browser
   - ✅ Backend handle heavy lifting

## Alternative: Store Annotations in Database

Jika ingin lebih flexible, simpan annotations sebagai JSON di database:

```typescript
// Add to Prisma schema
model Document {
  // ... existing fields ...
  annotations Json? // Store annotations as JSON
}

// Service method
async saveAnnotations(userId: number, docId: number, annotations: any[]) {
  return this.prisma.document.update({
    where: { id: docId },
    data: {
      annotations: annotations,
      updatedAt: new Date(),
    },
  });
}

// Generate PDF with annotations on-demand
async getDocumentFile(docId: number) {
  const doc = await this.prisma.document.findUnique({ where: { id: docId } });
  
  if (doc.annotations) {
    // Merge annotations ke PDF saat di-request
    return this.generatePdfWithAnnotations(doc.filePath, doc.annotations);
  }
  
  // Return original PDF
  return fs.createReadStream(doc.filePath);
}
```

## Testing

```bash
# Frontend
curl -X PATCH http://localhost:3000/documents/1/save-annotations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "annotations": [
      {
        "page": 1,
        "type": "draw",
        "path": [{"x": 100, "y": 200}],
        "color": "#ff0000",
        "thickness": 4
      }
    ],
    "documentName": "test.pdf"
  }'
```

## Notes

- Canvas library diperlukan untuk render annotations di Node.js
- pdf-lib untuk manipulasi PDF
- Coordinate system: frontend uses top-left origin, PDF uses bottom-left (need flip Y)
- Backup original file sebelum overwrite (optional)
