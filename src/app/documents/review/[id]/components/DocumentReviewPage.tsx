"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eraser,
  Send,
  CheckCircle,
  MessageSquare,
  Trash2,
  Save,
  Type,
  Image as ImageIcon,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";
import { Division } from "@/app/types";
import api from "@/lib/axios";

// Import CSS
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Dynamic import untuk react-pdf components
import dynamic from "next/dynamic";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// Ensure pdfjs uses the bundled worker from /public to avoid fake-worker warnings
if (typeof window !== "undefined") {
  // Force absolute root path so it won't follow the current route
  const workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
  if (pdfjs.GlobalWorkerOptions.workerSrc !== workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }
  
  // ✅ PERBAIKAN: Add error handler for Worker errors
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('error', (event) => {
      // Suppress DataCloneError dari PDF Worker (tidak critical)
      if (event.message && event.message.includes('DataCloneError')) {
        console.warn('PDF Worker DataCloneError (suppressed):', event.message);
        event.preventDefault();
        return false;
      }
    });
  }
}

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: string; // Unique ID for each annotation
  page: number;
  type: "draw" | "text" | "stamp";
  path?: Point[];
  color?: string;
  thickness?: number;
  text?: string;
  fontSize?: number;
  position?: Point;
  stampImage?: string;
  width?: number;
  height?: number;
}

interface DocumentReviewPageProps {
  documentId: number;
  documentName: string;
  onClose: () => void;
  userDivision?: Division;
  onSubmitSuccess?: () => void;
  initialAction?: "approve" | "approveWithNotes" | "returnForCorrection" | null;
  status?: string; // Status dokumen saat ini untuk menentukan action yang tersedia
}

export default function DocumentReviewPage({
  documentId,
  documentName,
  onClose,
  userDivision,
  onSubmitSuccess,
  initialAction = null,
  status,
}: DocumentReviewPageProps) {
  const STORAGE_KEY = `annotations_${documentId}`;
  
  const [pdfFile, setPdfFile] = useState<{ data: Uint8Array } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0); // Zoom level

  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const currentPathRef = useRef<Point[]>([]);
  const [tool, setTool] = useState<"pencil" | "eraser" | "text" | "stamp">(
    "pencil"
  );
  const [color, setColor] = useState("#ff0000");
  const [thickness, setThickness] = useState(4);
  const [fontSize, setFontSize] = useState(20);
  const [textInput, setTextInput] = useState("");
  const [showTextModal, setShowTextModal] = useState(false);
  const [textPosition, setTextPosition] = useState<{
    page: number;
    x: number;
    y: number;
  } | null>(null);
  const [stampImage, setStampImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  // Dragging state
  const [draggingAnnotation, setDraggingAnnotation] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  
  // File type detection
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [action, setAction] = useState<string>(initialAction || "");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReloadingAfterSave, setIsReloadingAfterSave] = useState(false);

  const needsNotes =
    action === "approveWithNotes" || action === "returnForCorrection" || action === "reject";

  // Persist annotations to localStorage
  useEffect(() => {
    if (annotations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    }
  }, [annotations, STORAGE_KEY]);

  // Auto-redraw annotations when they change (for real-time preview)
  useEffect(() => {
    if (isPdfReady && pageNumber) {
      redrawAnnotations(pageNumber);
    }
  }, [annotations, pageNumber, isPdfReady]);

  const loadFile = useCallback(async (retryCount = 0) => {
    if (!documentId) return;
    
    // ✅ PERBAIKAN: Cleanup old state sebelum load baru
    setIsLoading(true);
    setIsPdfReady(false);
    setError(null);
    setPdfFile(null); // Clear old PDF file to release ArrayBuffer
    
    // Cleanup old image URL if exists
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }

    try {
      const { data } = await api.get(`/documents/${documentId}/file`, {
        responseType: "arraybuffer",
        timeout: 120000, // 2 minutes for large PDFs
      });

      // ✅ PERBAIKAN: Clone ArrayBuffer untuk avoid detached error
      const uint8Array = new Uint8Array(data);
      const clonedArray = new Uint8Array(uint8Array.length);
      clonedArray.set(uint8Array);
      
      const first4Bytes = Array.from(clonedArray.slice(0, 4)).map(b => String.fromCharCode(b)).join('');
      console.log("File loaded successfully", { 
        byteLength: clonedArray.byteLength,
        first4Bytes
      });
      
      // ✅ Detect file type from magic bytes
      if (first4Bytes === '%PDF') {
        // PDF file - gunakan cloned array
        setFileType('pdf');
        setPdfFile({ data: clonedArray });
        setIsPdfReady(true);
      } else if (clonedArray[0] === 0xFF && clonedArray[1] === 0xD8) {
        // JPG file (starts with FFD8)
        setFileType('image');
        const blob = new Blob([clonedArray], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsPdfReady(true);
        setNumPages(1); // Image has only 1 "page"
      } else if (clonedArray[0] === 0x89 && clonedArray[1] === 0x50 && clonedArray[2] === 0x4E && clonedArray[3] === 0x47) {
        // PNG file (starts with 89504E47)
        setFileType('image');
        const blob = new Blob([clonedArray], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsPdfReady(true);
        setNumPages(1); // Image has only 1 "page"
      } else {
        throw new Error('Unsupported file format. Expected PDF, JPG, or PNG.');
      }
      
      setIsLoading(false); // ✅ Set loading false on success
    } catch (err: any) {
      console.error("Load file error:", err);
      
      // Retry logic for timeout errors
      if ((err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message?.includes('timeout')) && retryCount < 3) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => {
          loadFile(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s, 4s
        return;
      }
      
      setError("Gagal memuat dokumen. Coba refresh halaman.");
      setIsPdfReady(false);
      setIsLoading(false);
    }
  }, [documentId, imageUrl]);

  useEffect(() => {
    loadFile();
    
    // ✅ Cleanup on unmount
    return () => {
      // Cleanup image URL
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      // ✅ PERBAIKAN: Clear PDF state untuk release ArrayBuffer
      setPdfFile(null);
      setIsPdfReady(false);
    };
  }, [loadFile]);

  // ✅ PERBAIKAN: Separate effect untuk cleanup imageUrl saat berubah
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // ✅ Helper function untuk konversi koordinat mouse ke canvas coordinates
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ): Point => {
    const rect = canvas.getBoundingClientRect();
    
    // Hitung scale factor antara canvas internal size dan display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Konversi koordinat mouse ke canvas coordinates
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement>,
    page: number
  ) => {
    // Check if clicking on existing annotation for dragging
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    // Check if clicking on text or stamp annotation (reverse order to get topmost)
    const clickedAnnotation = [...annotations].reverse().find((ann) => {
      if (ann.page !== page) return false;
      if ((ann.type === "text" || ann.type === "stamp") && ann.position) {
        const pos = ann.position;
        const width = ann.type === "stamp" ? (ann.width || 100) : 200;
        const height = ann.type === "stamp" ? (ann.height || 100) : (ann.fontSize || 20) + 5;
        return (
          x >= pos.x &&
          x <= pos.x + width &&
          y >= pos.y - height &&
          y <= pos.y + 5
        );
      }
      return false;
    });

    if (clickedAnnotation && (clickedAnnotation.type === "text" || clickedAnnotation.type === "stamp")) {
      setDraggingAnnotation(clickedAnnotation.id);
      setDragOffset({
        x: x - clickedAnnotation.position!.x,
        y: y - clickedAnnotation.position!.y,
      });
      return;
    }

    if (tool === "text") {
      setTextPosition({ page, x, y });
      setShowTextModal(true);
      return;
    }

    if (tool === "stamp" && stampImage) {
      const newAnnotation: Annotation = {
        id: `stamp-${Date.now()}-${Math.random()}`,
        page,
        type: "stamp",
        position: { x, y },
        stampImage,
        width: 100,
        height: 100,
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      return;
    }

    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, page: number) => {
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    // Update hover state for cursor feedback
    if (!isDrawing && !draggingAnnotation) {
      const hoveredAnn = [...annotations].reverse().find((ann) => {
        if (ann.page !== page) return false;
        if ((ann.type === "text" || ann.type === "stamp") && ann.position) {
          const pos = ann.position;
          const width = ann.type === "stamp" ? (ann.width || 100) : 200;
          const height = ann.type === "stamp" ? (ann.height || 100) : (ann.fontSize || 20) + 5;
          return (
            x >= pos.x &&
            x <= pos.x + width &&
            y >= pos.y - height &&
            y <= pos.y + 5
          );
        }
        return false;
      });

      setHoveredAnnotation(hoveredAnn?.id || null);
    }

    // Handle dragging annotation
    if (draggingAnnotation) {
      setAnnotations((prev) =>
        prev.map((ann) =>
          ann.id === draggingAnnotation && ann.position
            ? {
                ...ann,
                position: {
                  x: x - dragOffset.x,
                  y: y - dragOffset.y,
                },
              }
            : ann
        )
      );
      return;
    }

    if (!isDrawing) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    currentPathRef.current.push({ x, y });

    const last = currentPathRef.current[currentPathRef.current.length - 2];
    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
    ctx.lineWidth = thickness;
    ctx.strokeStyle = tool === "eraser" ? "#000" : color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (page: number) => {
    // Stop dragging
    if (draggingAnnotation) {
      setDraggingAnnotation(null);
      return;
    }

    if (!isDrawing || currentPathRef.current.length < 2) {
      currentPathRef.current = [];
      setIsDrawing(false);
      return;
    }

    if (tool === "pencil") {
      const newAnnotation: Annotation = {
        id: `draw-${Date.now()}-${Math.random()}`,
        page,
        type: "draw",
        path: [...currentPathRef.current],
        color,
        thickness,
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
    }
    currentPathRef.current = [];
    setIsDrawing(false);
  };

  const redrawAnnotations = (page: number) => {
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    annotations
      .filter((a) => a.page === page)
      .forEach((ann) => {
        const isHovered = ann.id === hoveredAnnotation;
        const isDragging = ann.id === draggingAnnotation;
        
        if (ann.type === "draw" && ann.path) {
          ctx.lineWidth = ann.thickness!;
          ctx.strokeStyle = ann.color!;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ann.path.forEach((p, i) =>
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          );
          ctx.stroke();
        } else if (ann.type === "text" && ann.text && ann.position) {
          // Draw selection box if hovered or dragging
          if (isHovered || isDragging) {
            ctx.strokeStyle = isDragging ? "#2563eb" : "#94a3b8";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const textWidth = ctx.measureText(ann.text).width;
            ctx.strokeRect(
              ann.position.x - 2,
              ann.position.y - ann.fontSize! - 2,
              textWidth + 4,
              ann.fontSize! + 8
            );
            ctx.setLineDash([]);
          }
          
          ctx.font = `${ann.fontSize}px Arial`;
          ctx.fillStyle = ann.color!;
          ctx.fillText(ann.text, ann.position.x, ann.position.y);
        } else if (ann.type === "stamp" && ann.stampImage && ann.position) {
          const img = new Image();
          img.onload = () => {
            // Draw selection box if hovered or dragging
            if (isHovered || isDragging) {
              ctx.strokeStyle = isDragging ? "#2563eb" : "#94a3b8";
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(
                ann.position!.x - 2,
                ann.position!.y - 2,
                (ann.width || 100) + 4,
                (ann.height || 100) + 4
              );
              ctx.setLineDash([]);
            }
            
            ctx.drawImage(
              img,
              ann.position!.x,
              ann.position!.y,
              ann.width || 100,
              ann.height || 100
            );
          };
          img.src = ann.stampImage;
        }
      });
  };

  const clearAll = () => {
    setAnnotations([]);
    localStorage.removeItem(STORAGE_KEY);
    Object.values(canvasRefs.current).forEach((c) =>
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
    );
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPosition) return;

    const newAnnotation: Annotation = {
      id: `text-${Date.now()}-${Math.random()}`,
      page: textPosition.page,
      type: "text",
      text: textInput,
      position: { x: textPosition.x, y: textPosition.y },
      color,
      fontSize,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);

    setTextInput("");
    setShowTextModal(false);
    setTextPosition(null);
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (PNG/JPG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setStampImage(result);
      setTool("stamp");
      alert("Klik pada PDF untuk menempatkan stempel");
    };
    reader.readAsDataURL(file);
  };

  const generateAnnotatedPDF = async (): Promise<File | null> => {
    // ✅ Validasi PDF sudah ready dan loaded
    if (!isPdfReady || !pdfFile || !pdfFile.data) {
      console.error("❌ PDF not ready or not loaded", { 
        isPdfReady, 
        pdfFile: !!pdfFile, 
        hasData: !!pdfFile?.data,
        fileType,
        documentId
      });
      alert("⚠️ PDF belum selesai dimuat.\n\nTunggu hingga PDF muncul di layar, lalu coba lagi.");
      return null;
    }

    // Validate PDF data (Uint8Array uses byteLength)
    if (pdfFile.data.byteLength === 0) {
      console.error("❌ PDF data is empty", { 
        byteLength: pdfFile.data.byteLength,
        fileType,
        documentId,
        isPdfReady
      });
      alert("⚠️ Data PDF kosong!\n\nSOLUSI:\n1. Klik tombol SAVE dulu\n2. Tunggu sampai PDF ter-reload (3-5 detik)\n3. Baru klik Submit Revisi");
      return null;
    }

    console.log("Generating annotated PDF", { 
      dataSize: pdfFile.data.byteLength, 
      annotationsCount: annotations.length 
    });

    try {
      const { PDFDocument: PDFDocumentLib } = await import("pdf-lib");
      const pdfDoc = await PDFDocumentLib.load(pdfFile.data);

      if (annotations.length > 0) {
        const pages = pdfDoc.getPages();

        for (const ann of annotations) {
          const page = pages[ann.page - 1];
          if (!page) continue;
          const canvas = canvasRefs.current[ann.page];
          if (!canvas) continue;

          const { width, height } = page.getSize();
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) continue;

          const scaleX = width / canvas.width;
          const scaleY = height / canvas.height;
          tempCtx.scale(scaleX, scaleY);

          if (ann.type === "draw" && ann.path) {
            tempCtx.lineWidth = ann.thickness!;
            tempCtx.strokeStyle = ann.color!;
            tempCtx.lineCap = "round";
            tempCtx.lineJoin = "round";
            tempCtx.beginPath();
            ann.path.forEach((p, i) =>
              i === 0 ? tempCtx.moveTo(p.x, p.y) : tempCtx.lineTo(p.x, p.y)
            );
            tempCtx.stroke();
          } else if (ann.type === "text" && ann.text && ann.position) {
            tempCtx.font = `${ann.fontSize! * scaleX}px Arial`;
            tempCtx.fillStyle = ann.color!;
            tempCtx.fillText(ann.text, ann.position.x, ann.position.y);
          } else if (ann.type === "stamp" && ann.stampImage && ann.position) {
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = () => {
                tempCtx.drawImage(
                  img,
                  ann.position!.x,
                  ann.position!.y,
                  ann.width || 100,
                  ann.height || 100
                );
                resolve(null);
              };
              img.src = ann.stampImage!;
            });
          }

          const png = await pdfDoc.embedPng(tempCanvas.toDataURL());
          page.drawImage(png, { x: 0, y: 0, width, height });
        }
      }

      const pdfBytes = await pdfDoc.save();

      const buffer = new ArrayBuffer(pdfBytes.byteLength);
      const view = new Uint8Array(buffer);
      view.set(
        new Uint8Array(
          pdfBytes.buffer,
          pdfBytes.byteOffset,
          pdfBytes.byteLength
        )
      );

      const blob = new Blob([buffer], { type: "application/pdf" });

      return new File([blob], `${documentName}_reviewed.pdf`, {
        type: "application/pdf",
      });
    } catch (error) {
      console.error("❌ Error generating annotated PDF:", error);
      alert(`Gagal mengedit PDF  ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleSave = async (): Promise<boolean> => {
    if (annotations.length === 0) {
      alert("Tidak ada perubahan untuk disimpan.");
      return false;
    }

    // Validasi untuk vendor: dokumen harus dalam status returnForCorrection
    if (userDivision === Division.Vendor && status !== "returnForCorrection") {
      alert("⚠️ Vendor hanya dapat menyimpan anotasi pada dokumen yang dikembalikan untuk koreksi.");
      return false;
    }

    setIsSaving(true);
    setIsReloadingAfterSave(true);
    
    try {
      // Kirim annotations sebagai JSON - backend yang merge ke PDF
      const payload = {
        annotations: annotations,
        documentName: documentName,
      };

      console.log("💾 Saving annotations...", { documentId, annotationsCount: annotations.length, userDivision });

      const response = await api.patch(`/documents/${documentId}/save-annotations`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 1 minute timeout for annotation merging
      });

      console.log("✅ Annotations saved successfully:", response.data);

      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEY);
      
      // ✅ Clear annotations state (PDF di server sudah ter-merge)
      setAnnotations([]);
      
      alert("✅ Perubahan berhasil disimpan!\n\nPDF sedang di-reload dari server...\nTunggu beberapa detik.");
      
      // ✅ PERBAIKAN: Reload PDF dari server agar state fresh untuk submit
      console.log("🔄 Reloading PDF after save...");
      
      // ✅ Clear old PDF state dulu sebelum reload
      setPdfFile(null);
      setIsPdfReady(false);
      
      // ✅ Return promise yang resolve setelah reload selesai
      return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await loadFile();
            console.log("✅ PDF reloaded successfully");
            setIsReloadingAfterSave(false);
            resolve(true);
          } catch (reloadErr) {
            console.error("⚠️ Warning: PDF reload failed:", reloadErr);
            setIsReloadingAfterSave(false);
            resolve(false);
          }
        }, 3000); // 3 second delay untuk memastikan backend selesai
      });
      
    } catch (err: any) {
      console.error("❌ Error saving annotations:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMsg = "Gagal menyimpan perubahan ke server.";
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMsg = "File tidak ditemukan di server. Backend mungkin sedang memproses file sebelumnya.\n\nSolusi:\n1. Tunggu beberapa detik\n2. Refresh halaman (F5)\n3. Buka dokumen ini lagi\n4. Coba save ulang";
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(`ERROR SAVE!\n\n${errorMsg}\n\nTroubleshooting:\n- Pastikan koneksi internet stabil\n- Coba refresh halaman dan ulangi\n- Jika error 'File not found', tunggu beberapa detik lalu refresh\n- Hubungi admin jika masalah berlanjut`);
      return false;
    } finally {
      setIsSaving(false);
      setIsReloadingAfterSave(false);
    }
  };

  const handleSubmit = async () => {
    if (!action) {
      alert("Pilih aksi terlebih dahulu.");
      return;
    }

    if (needsNotes && !notes.trim()) {
      alert("Notes wajib diisi untuk aksi ini.");
      return;
    }

    // ✅ Validasi status sesuai division
    if (userDivision === Division.Engineer) {
      if (status !== "inReviewEngineering" && status !== "submitted") {
        alert(
          `Status tidak valid, Dokumen ini tidak dapat direview oleh Engineer.`
        );
        return;
      }
    }

    if (userDivision === Division.Manager) {
      if (status !== "inReviewManager") {
        alert(
          `Status tidak valid, Dokumen ini tidak dapat direview oleh Manager.`
        );
        return;
      }
    }

    // Konfirmasi untuk action penting
    if (action === "reject" || (action === "approve" && status === "inReviewManager")) {
      const confirmText = action === "reject" 
        ? "PERHATIAN!\\n\\nAnda akan REJECT dokumen ini.\\nDokumen yang di-reject tidak dapat diresubmit.\\n\\nLanjutkan?"
        : "FINAL APPROVAL\\n\\nAnda akan melakukan final approval.\\nSetelah ini dokumen akan selesai diproses.\\n\\nLanjutkan?";
      
      if (!confirm(confirmText)) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const roleMap: Record<Division, string> = {
        [Division.Dalkon]: "dalkon",
        [Division.Engineer]: "engineering",
        [Division.Manager]: "manager",
        [Division.Vendor]: "vendor",
      };
      const role = roleMap[userDivision!] || "dalkon";

      // ✅ Kirim sebagai FormData agar kompatibel dengan FileInterceptor di backend
      const formData = new FormData();
      formData.append("action", action);

      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      // Kirim annotations sebagai JSON string
      if (annotations.length > 0) {
        formData.append("annotations", JSON.stringify(annotations));
      }

      // Log untuk debugging
      console.log("📤 Submitting document review:", {
        documentId,
        action,
        role,
        hasNotes: !!notes.trim(),
        hasAnnotations: annotations.length > 0,
        status
      });

      await api.patch(`/documents/${documentId}/${role}-review`, formData, {
        timeout: 300000, // 5 minutes for annotation merging
      });

      // Clear localStorage after successful submit
      localStorage.removeItem(STORAGE_KEY);

      // Success message berdasarkan action dan role
      let successMessage = "✅ Dokumen berhasil diproses!";

      if (userDivision === Division.Dalkon) {
        if (action === "approve") {
          if (status === "submitted") {
            successMessage = "📤 BERHASIL!\\n\\nDokumen telah dikirim ke Engineering untuk review teknis.\\n\\nStatus: submitted → inReviewEngineering";
          } else if (status === "approved" || status === "approvedWithNotes") {
            successMessage = "📤 BERHASIL!\\n\\nDokumen telah dikirim ke Manager untuk review manajemen.\\n\\nStatus: approved → inReviewManager";
          } else if (status === "inReviewManager") {
            successMessage = "🎉 FINAL APPROVAL BERHASIL!\\n\\nDokumen telah diselesaikan dan disetujui.\\n\\nStatus: inReviewManager → approved (SELESAI)";
          }
        } else if (action === "returnForCorrection") {
          successMessage = "🔄 DOKUMEN DIKEMBALIKAN\\n\\nDokumen telah dikembalikan ke Dalkon untuk review.\\n\\nDalkon akan menentukan langkah selanjutnya.";
        } else if (action === "reject") {
          successMessage = "❌ DOKUMEN DITOLAK\\n\\nDokumen telah ditolak secara permanen.\\n\\nStatus: submitted → rejected";
        }
      } else if (userDivision === Division.Engineer) {
        if (action === "approve") {
          successMessage = "✅ APPROVE BERHASIL!\\n\\nDokumen telah disetujui dan dikembalikan ke Dalkon.\\n\\nStatus: inReviewEngineering → approved";
        } else if (action === "approveWithNotes") {
          successMessage = "📝 APPROVE DENGAN CATATAN\\n\\nDokumen disetujui dengan catatan dan dikembalikan ke Dalkon.\\n\\nStatus: inReviewEngineering → approvedWithNotes";
        } else if (action === "returnForCorrection") {
          successMessage = "🔄 DOKUMEN DIKEMBALIKAN\\n\\nDokumen dikembalikan ke Dalkon untuk review.\\n\\nDalkon akan menentukan apakah perlu dikembalikan ke Vendor.";
        }
      } else if (userDivision === Division.Manager) {
        if (action === "approve") {
          successMessage = "✅ APPROVE BERHASIL!\\n\\nDokumen telah disetujui. Menunggu final approval dari Dalkon.\\n\\nStatus: tetap di inReviewManager";
        } else if (action === "returnForCorrection") {
          successMessage = "🔄 DOKUMEN DIKEMBALIKAN\\n\\nDokumen dikembalikan ke Dalkon untuk review.\\n\\nDalkon akan menentukan apakah perlu dikembalikan ke Vendor.";
        }
      }

      alert(successMessage);
      
      // Reset form
      setAction("");
      setNotes("");
      
      // Callback dan close
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("❌ Error submitting document:", err);
      
      const errorMessage = err.response?.data?.message || err.message || "Gagal mengirim dokumen.";
      alert(`ERROR!\\n\\n${errorMessage}\\n\\nSilakan coba lagi.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRevision = async () => {
    // ✅ Validasi status dokumen
    if (status !== "returnForCorrection") {
      alert("⚠️ Dokumen tidak dalam status 'Return for Correction'.\n\nHanya dokumen yang dikembalikan yang dapat diresubmit.");
      return;
    }

    // ✅ Cek apakah ada unsaved annotations
    if (annotations.length > 0) {
      const confirmSaveFirst = confirm(
        "⚠️ ANOTASI BELUM TERSIMPAN!\n\n" +
        "Anda memiliki anotasi yang belum di-SAVE.\n" +
        "Anotasi harus di-SAVE terlebih dahulu sebelum submit.\n\n" +
        "Klik OK untuk SAVE otomatis dan lanjut submit.\n" +
        "Klik Cancel untuk batalkan."
      );
      
      if (!confirmSaveFirst) {
        return;
      }
      
      // ✅ PERBAIKAN: Auto-save dan tunggu hingga reload selesai
      console.log("💾 Auto-saving before submit...");
      const saveSuccess = await handleSave();
      
      if (!saveSuccess) {
        alert("❌ Gagal menyimpan anotasi!\n\nSilakan coba SAVE manual dulu, tunggu PDF reload, baru submit.");
        return;
      }
      
      console.log("✅ Auto-save completed, PDF reloaded");
    }

    // ✅ Validasi PDF sudah dimuat dan tidak sedang reload
    if (!isPdfReady || isReloadingAfterSave) {
      alert("⚠️ PDF sedang di-reload setelah save.\n\nTunggu beberapa detik hingga reload selesai, lalu coba lagi.");
      return;
    }

    const confirmSubmit = confirm(
      "📤 SUBMIT REVISI\n\n" +
      "Dokumen akan diresubmit ke Dalkon untuk review ulang.\n\n" +
      "Lanjutkan?"
    );
    
    if (!confirmSubmit) return;

    setIsLoading(true);
    try {
      console.log("📤 Submitting vendor revision...", { documentId, status });
      
      // ✅ PERBAIKAN: Tidak perlu upload file karena sudah di-merge via saveAnnotations
      // Backend hanya perlu update status dokumen dari returnForCorrection → submitted
      await api.patch(`/documents/${documentId}/vendor-resubmit`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      alert("✅ REVISI BERHASIL DIKIRIM!\n\nDokumen telah diresubmit ke Dalkon.\nStatus: returnForCorrection → submitted");
      
      // Clear localStorage after successful submit
      localStorage.removeItem(STORAGE_KEY);
      
      onSubmitSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("❌ Error submitting vendor revision:", err);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code
      });
      
      // ✅ PERBAIKAN: Pesan error yang lebih akurat dan helpful
      let errorMessage = "Gagal mengirim revisi ke server.";
      let troubleshooting = "";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "Endpoint tidak ditemukan (404).";
        troubleshooting = "\n\nKemungkinan:\n- Backend API belum tersedia\n- Hubungi admin untuk update backend";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || "Bad Request - Data tidak valid";
        troubleshooting = "\n\nKemungkinan:\n- File dummy tidak diterima backend\n- Status dokumen tidak valid\n- Hubungi admin untuk pengecekan";
      } else if (err.response?.status === 500) {
        errorMessage = "Internal Server Error - Backend mengalami masalah";
        troubleshooting = "\n\nKemungkinan:\n- File PDF corrupt\n- Database error\n- Check backend logs\n- Hubungi admin";
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = "Request timeout - Server terlalu lama merespons";
        troubleshooting = "\n\nSolusi:\n- Pastikan koneksi internet stabil\n- Coba lagi dalam beberapa saat";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`❌ ERROR SUBMIT REVISI!\n\n${errorMessage}${troubleshooting}\n\n📋 Technical Details:\nStatus: ${err.response?.status || 'N/A'}\nCode: ${err.code || 'N/A'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isReviewer = [
    Division.Dalkon,
    Division.Engineer,
    Division.Manager,
  ].includes(userDivision!);

  // ✅ Helper: Check if user can review document based on status
  const canReviewDocument = useCallback((): boolean => {
    if (!isReviewer) return false;
    
    // Dalkon can review at multiple stages
    if (userDivision === Division.Dalkon) {
      return [
        "submitted",
        "approved", 
        "approvedWithNotes",
        "inReviewConsultant",
        "inReviewManager"
      ].includes(status || "");
    }
    
    // Engineer can only review inReviewEngineering or submitted (edge case)
    if (userDivision === Division.Engineer) {
      return status === "inReviewEngineering" || status === "submitted";
    }
    
    // Manager can only review inReviewManager
    if (userDivision === Division.Manager) {
      return status === "inReviewManager";
    }
    
    return false;
  }, [isReviewer, userDivision, status]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 DocumentReviewPage Debug:", {
      userDivision,
      isReviewer,
      status,
      documentId,
      canReview: canReviewDocument(),
      isDalkon: userDivision === Division.Dalkon,
      isEngineer: userDivision === Division.Engineer,
      isManager: userDivision === Division.Manager,
      isVendor: userDivision === Division.Vendor,
    });
  }, [userDivision, isReviewer, status, documentId, canReviewDocument]);

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header - More Compact */}
      <div className="border-b bg-white p-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-base font-bold">{documentName}</h1>
            <p className="text-xs text-gray-500">
              {!isPdfReady ? (
                <span className="text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading PDF...
                </span>
              ) : isReviewer ? (
                "Review dokumen, tambahkan anotasi (text/gambar bisa di-drag), lalu pilih aksi"
              ) : (
                "Tambahkan anotasi (text/gambar bisa di-drag), lalu submit revisi"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(isReviewer || userDivision === Division.Vendor) && (
            <>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="icon"
                  variant={tool === "pencil" ? "default" : "ghost"}
                  onClick={() => setTool("pencil")}
                  title="Pensil"
                  className="h-7 w-7"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={tool === "eraser" ? "default" : "ghost"}
                  onClick={() => setTool("eraser")}
                  title="Penghapus"
                  className="h-7 w-7"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={tool === "text" ? "default" : "ghost"}
                  onClick={() => setTool("text")}
                  title="Tambah Teks (klik untuk letakkan, drag untuk geser)"
                  className="h-7 w-7"
                >
                  <Type className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={tool === "stamp" ? "default" : "ghost"}
                  onClick={() => fileInputRef.current?.click()}
                  title="Tambah Stempel/Tanda Tangan (klik untuk letakkan, drag untuk geser)"
                  className="h-7 w-7"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  style={{ display: "none" }}
                  onChange={handleStampUpload}
                />
              </div>

              <div className="flex gap-1">
                {["#ff0000", "#0000ff", "#00ff00", "#000000", "#ffa500"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        color === c
                          ? "border-gray-900 scale-110 ring-2 ring-offset-1 ring-gray-400"
                          : "border-gray-300"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>

              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[3, 5, 8, 12].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThickness(t)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center",
                      thickness === t ? "bg-primary text-white" : "bg-white"
                    )}
                  >
                    <div
                      className="bg-current rounded-full"
                      style={{ width: t, height: t }}
                    />
                  </button>
                ))}
              </div>

              <Button size="sm" variant="outline" onClick={clearAll} className="h-7 text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || annotations.length === 0}
                title="Simpan annotations ke server (tidak perlu load PDF)"
                className="h-7 text-xs"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF Viewer with Zoom Controls */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4 relative">
        {/* Helper Tooltip */}
        {(annotations.some(a => a.type === "text" || a.type === "stamp") && !draggingAnnotation) && (
          <div className="absolute top-4 left-4 z-10 bg-blue-50 border border-blue-200 rounded-lg shadow-lg px-3 py-2 text-xs text-blue-700 max-w-xs">
            💡 <strong>Tip:</strong> Hover pada text/foto untuk melihat highlight, klik dan drag untuk menggeser posisi
          </div>
        )}
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            disabled={scale >= 3}
            className="h-8 w-8"
            title="Zoom In"
          >
            <span className="text-lg font-bold">+</span>
          </Button>
          <div className="text-xs font-semibold text-center text-gray-600 px-1">
            {Math.round(scale * 100)}%
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            disabled={scale <= 0.5}
            className="h-8 w-8"
            title="Zoom Out"
          >
            <span className="text-lg font-bold">-</span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setScale(1)}
            className="h-8 w-8 text-xs"
            title="Reset Zoom"
          >
            1:1
          </Button>
        </div>

        {isLoading && !pdfFile && !imageUrl && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 p-8">
            <p className="text-xl font-semibold">{error}</p>
          </div>
        )}

        {/* PDF Viewer */}
        {fileType === 'pdf' && pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error("PDF load error:", error);
              // ✅ PERBAIKAN: Jika DataCloneError, coba reload sekali lagi
              if (error.message && error.message.includes('detached')) {
                console.log("🔄 Detected ArrayBuffer detached error, reloading...");
                setTimeout(() => {
                  loadFile();
                }, 500);
              }
            }}
            loading={
              <div className="flex h-full items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            }
          >
            <div className="flex justify-center">
              <div className="relative shadow-2xl bg-white" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                                <Page
                  pageNumber={pageNumber}
                  width={900}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  canvasRef={(canvas) => {
                    // Sync overlay canvas size immediately when PDF canvas is ready
                    if (canvas) {
                      const overlay = canvasRefs.current[pageNumber];
                      if (overlay) {
                        const rect = canvas.getBoundingClientRect();
                        // ✅ PERBAIKAN: Force canvas internal size to 900px width
                        // Ini memastikan koordinat selalu dalam skala 900px (matching backend)
                        const aspectRatio = canvas.height / canvas.width;
                        overlay.width = 900; // Fixed internal width
                        overlay.height = Math.round(900 * aspectRatio);
                        // Display size tetap match dengan PDF canvas display
                        overlay.style.width = `${rect.width}px`;
                        overlay.style.height = `${rect.height}px`;
                        overlay.style.position = 'absolute';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        redrawAnnotations(pageNumber);
                      }
                    }
                  }}
                  onRenderSuccess={() => {
                    // Double-check after render completes
                    requestAnimationFrame(() => {
                      const pageEl = document.querySelector(
                        `.react-pdf__Page[data-page-number="${pageNumber}"]`
                      );
                      const canvas = pageEl?.querySelector("canvas") as HTMLCanvasElement;
                      const overlay = canvasRefs.current[pageNumber];
                      if (canvas && overlay) {
                        const rect = canvas.getBoundingClientRect();
                        // ✅ PERBAIKAN: Force 900px internal width
                        const aspectRatio = canvas.height / canvas.width;
                        overlay.width = 900;
                        overlay.height = Math.round(900 * aspectRatio);
                        overlay.style.width = `${rect.width}px`;
                        overlay.style.height = `${rect.height}px`;
                        redrawAnnotations(pageNumber);
                      }
                    });
                  }}
                />
                <canvas
                  ref={(el) => {
                    canvasRefs.current[pageNumber] = el;
                  }}
                  className="absolute top-0 left-0 z-50"
                  style={{ 
                    background: "transparent",
                    cursor: draggingAnnotation 
                      ? "grabbing" 
                      : hoveredAnnotation 
                      ? "grab" 
                      : tool === "pencil" 
                      ? "crosshair"
                      : tool === "eraser"
                      ? "pointer"
                      : tool === "text" || tool === "stamp" 
                      ? "crosshair" 
                      : "default"
                  }}
                  onMouseDown={(e) => startDrawing(e, pageNumber)}
                  onMouseMove={(e) => draw(e, pageNumber)}
                  onMouseUp={() => stopDrawing(pageNumber)}
                  onMouseLeave={() => {
                    stopDrawing(pageNumber);
                    setHoveredAnnotation(null);
                  }}
                />
              </div>
            </div>
          </Document>
        )}
        
        {/* Image Viewer (for JPG/PNG) */}
        {fileType === 'image' && imageUrl && (
          <div className="flex justify-center">
            <div className="relative shadow-2xl bg-white" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
              <img 
                src={imageUrl} 
                alt="Document" 
                style={{ maxWidth: '900px', width: '100%', height: 'auto' }}
                onLoad={() => {
                  console.log("✅ Image loaded successfully");
                }}
              />
              {/* Canvas overlay for annotations - same as PDF */}
              <canvas
                ref={(el) => {
                  if (el) canvasRefs.current[1] = el;
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  cursor:
                    tool === "pencil"
                      ? "crosshair"
                      : tool === "eraser"
                      ? "not-allowed"
                      : tool === "text"
                      ? "text"
                      : tool === "stamp"
                      ? "copy"
                      : hoveredAnnotation
                      ? "move"
                      : "default"
                }}
                onMouseDown={(e) => startDrawing(e, 1)}
                onMouseMove={(e) => draw(e, 1)}
                onMouseUp={() => stopDrawing(1)}
                onMouseLeave={() => {
                  stopDrawing(1);
                  setHoveredAnnotation(null);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer - More Compact */}
      {numPages > 0 && (
        <div className="border-t bg-white p-3 flex flex-col gap-3 shadow-sm">
          <div className="flex justify-between items-center w-full">
            <p className="text-xs text-gray-600">
              Halaman <strong>{pageNumber}</strong> dari{" "}
              <strong>{numPages}</strong>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="h-7"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="h-7"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Review Form - untuk Dalkon, Engineer, Manager */}
          {canReviewDocument() && (
            <div className="flex flex-col gap-3 w-full">
              {/* Debug: Show which division */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">
                  🔧 Debug: {userDivision} dapat melakukan review
                </p>
              )}
              <div className="flex items-center gap-3">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="w-64 h-8 text-sm">
                    <SelectValue placeholder="Pilih aksi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Dalkon: approve (forward), returnForCorrection, reject (only at submitted) */}
                    {userDivision === Division.Dalkon && (
                      <>
                        <SelectItem value="approve">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm">
                              {status === "submitted" && "Forward ke Engineer"}
                              {(status === "approved" || status === "approvedWithNotes") && "Forward ke Manager"}
                              {status === "inReviewManager" && "Final Approval"}
                              {!status && "Approve"}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="returnForCorrection">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-sm">Return for Correction</span>
                          </div>
                        </SelectItem>
                        {status === "submitted" && (
                          <SelectItem value="reject">
                            <div className="flex items-center gap-2">
                              <X className="w-3.5 h-3.5 text-red-600" />
                              <span className="text-sm">Reject</span>
                            </div>
                          </SelectItem>
                        )}
                      </>
                    )}

                    {/* Engineer: approve, approveWithNotes, returnForCorrection */}
                    {userDivision === Division.Engineer && (
                      <>
                        <SelectItem value="approve">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm">Approve</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="approveWithNotes">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-sm">Approve with Notes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="returnForCorrection">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-sm">Return for Correction</span>
                          </div>
                        </SelectItem>
                      </>
                    )}

                    {/* Manager: approve, returnForCorrection */}
                    {userDivision === Division.Manager && (
                      <>
                        <SelectItem value="approve">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-sm">Approve</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="returnForCorrection">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-sm">Return for Correction</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  size="default"
                  className={cn(
                    "min-w-48 font-semibold h-8 text-sm",
                    action === "approve" && "bg-green-600 hover:bg-green-700",
                    action === "approveWithNotes" &&
                      "bg-blue-600 hover:bg-blue-700",
                    action === "returnForCorrection" &&
                      "bg-orange-600 hover:bg-orange-700",
                    action === "reject" && "bg-red-600 hover:bg-red-700",
                    (!action || (needsNotes && !notes.trim())) &&
                      "bg-gray-400 cursor-not-allowed"
                  )}
                  onClick={handleSubmit}
                  disabled={
                    isLoading || !action || (needsNotes && !notes.trim())
                  }
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {action === "approve" && userDivision === Division.Dalkon && (
                    <>
                      {status === "submitted" && "Forward ke Engineer"}
                      {(status === "approved" || status === "approvedWithNotes") && "Forward ke Manager"}
                      {status === "inReviewManager" && "Final Approval"}
                      {!status && "Approve"}
                    </>
                  )}
                  {action === "approve" && userDivision !== Division.Dalkon && "Approve Dokumen"}
                  {action === "approveWithNotes" && "Approve + Notes"}
                  {action === "returnForCorrection" && "Return Revisi"}
                  {action === "reject" && "Reject Dokumen"}
                  {!action && "Pilih Aksi Dulu"}
                </Button>
              </div>

              {needsNotes && (
                <div className="w-full">
                  <Textarea
                    placeholder={
                      action === "approveWithNotes"
                        ? "Tulis catatan tambahan..."
                        : action === "reject"
                        ? "Jelaskan alasan penolakan..."
                        : "Jelaskan revisi yang diperlukan..."
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-20 resize-none text-sm"
                    autoFocus
                  />
                  {notes.trim() === "" && (
                    <p className="text-xs text-orange-600 mt-1">
                      Catatan wajib diisi
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info message if cannot review */}
          {isReviewer && !canReviewDocument() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-semibold mb-1">Dokumen tidak dapat direview saat ini</p>
                  <p>
                    {userDivision === Division.Engineer && (
                      <>Status dokumen: <strong>{status}</strong>. Engineer hanya dapat review dokumen dengan status <strong>inReviewEngineering</strong>.</>
                    )}
                    {userDivision === Division.Manager && (
                      <>Status dokumen: <strong>{status}</strong>. Manager hanya dapat review dokumen dengan status <strong>inReviewManager</strong>.</>
                    )}
                    {userDivision === Division.Dalkon && (
                      <>Status dokumen: <strong>{status}</strong>. Dokumen belum siap untuk review.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isReviewer && userDivision === Division.Vendor && (
            <div className="flex flex-col gap-2">
              {(isSaving || isReloadingAfterSave) && (
                <div className="flex items-center justify-end gap-2 text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>
                    {isSaving && "Menyimpan anotasi..."}
                    {isReloadingAfterSave && !isSaving && "Memuat ulang PDF..."}
                  </span>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  size="default"
                  onClick={handleSubmitRevision}
                  disabled={isLoading || isSaving || isReloadingAfterSave}
                  className="h-8 text-sm"
                  title={isReloadingAfterSave ? "Tunggu hingga PDF selesai di-reload" : "Submit revisi ke Dalkon"}
                >
                  {(isLoading || isSaving || isReloadingAfterSave) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isReloadingAfterSave ? "Loading PDF..." : "Submit Revisi"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Tambah Teks</h3>
            <Textarea
              placeholder="Ketik teks di sini..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="mb-4 min-h-24"
              autoFocus
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Ukuran Font
              </label>
              <div className="flex gap-2">
                {[14, 18, 24, 32].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      "px-3 py-1 rounded border",
                      fontSize === size
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-gray-300"
                    )}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput("");
                  setTextPosition(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleAddText} disabled={!textInput.trim()}>
                Tambah
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
