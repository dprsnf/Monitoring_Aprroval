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
}

export default function DocumentReviewPage({
  documentId,
  documentName,
  onClose,
  userDivision,
  onSubmitSuccess,
  initialAction = null,
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

  const [action, setAction] = useState<string>(initialAction || "");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const needsNotes =
    action === "approveWithNotes" || action === "returnForCorrection";

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
    setIsLoading(true);
    setIsPdfReady(false);
    setError(null);

    try {
      const { data } = await api.get(`/documents/${documentId}/file`, {
        responseType: "arraybuffer",
        timeout: 120000, // 2 minutes for large PDFs
      });

      const uint8Array = new Uint8Array(data);
      console.log("PDF loaded successfully", { 
        byteLength: uint8Array.byteLength,
        first4Bytes: Array.from(uint8Array.slice(0, 4)).map(b => String.fromCharCode(b)).join('')
      });
      
      setPdfFile({ data: uint8Array });
      setIsPdfReady(true);
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
  }, [documentId]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement>,
    page: number
  ) => {
    // Check if clicking on existing annotation for dragging
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    if (!pdfFile || !pdfFile.data) {
      console.error("PDF file not loaded", { pdfFile });
      return null;
    }

    // Validate PDF data (Uint8Array uses byteLength)
    if (pdfFile.data.byteLength === 0) {
      console.error("PDF data is empty", { byteLength: pdfFile.data.byteLength });
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
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (annotations.length === 0) {
      alert("Tidak ada perubahan untuk disimpan.");
      return;
    }

    setIsSaving(true);
    try {
      // Kirim annotations sebagai JSON - backend yang merge ke PDF
      const payload = {
        annotations: annotations,
        documentName: documentName,
      };

      await api.patch(`/documents/${documentId}/save-annotations`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear localStorage after successful save
      localStorage.removeItem(STORAGE_KEY);
      
      alert("Annotations berhasil disimpan ke server! Anda bisa lanjut edit atau submit.");
      
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan annotations ke server.");
    } finally {
      setIsSaving(false);
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

    setIsLoading(true);

    try {
      const roleMap: Record<Division, string> = {
        [Division.Dalkon]: "dalkon",
        [Division.Engineer]: "engineering",
        [Division.Manager]: "manager",
        [Division.Vendor]: "vendor",
      };
      const role = roleMap[userDivision!] || "dalkon";

      // Kirim annotations sebagai JSON - backend akan merge ke PDF
      const payload: any = {
        action: action,
      };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      // Kirim annotations jika ada
      if (annotations.length > 0) {
        payload.annotations = annotations;
      }

      await api.patch(`/documents/${documentId}/${role}-review`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minutes for annotation merging
      });

      // Clear localStorage after successful submit
      localStorage.removeItem(STORAGE_KEY);

      alert("Dokumen berhasil diproses!");
      onSubmitSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengirim dokumen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRevision = async () => {
    if (annotations.length === 0) {
      alert("Tidak ada perubahan untuk dikirim.");
      return;
    }

    setIsLoading(true);
    try {
      const fileToSend = await generateAnnotatedPDF();
      if (!fileToSend) {
        alert("Gagal membuat PDF.");
        return;
      }

      const formData = new FormData();
      formData.append("file", fileToSend);
      formData.append("action", "submit_revision");

      await api.patch(`/documents/${documentId}/vendor-review`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minutes for PDF generation and upload
      });

      alert("Revisi berhasil dikirim!");
      onSubmitSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengirim revisi.");
    } finally {
      setIsLoading(false);
    }
  };

  const isReviewer = [
    Division.Dalkon,
    Division.Engineer,
    Division.Manager,
  ].includes(userDivision!);

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

        {isLoading && !pdfFile && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 p-8">
            <p className="text-xl font-semibold">{error}</p>
          </div>
        )}

        {pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
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
                  onRenderSuccess={() => {
                    setTimeout(() => {
                      const pageEl = document.querySelector(
                        `.react-pdf__Page[data-page-number="${pageNumber}"]`
                      );
                      const canvas = pageEl?.querySelector("canvas");
                      const overlay = canvasRefs.current[pageNumber];
                      if (canvas && overlay) {
                        overlay.width = canvas.width;
                        overlay.height = canvas.height;
                        overlay.style.width = `${canvas.width}px`;
                        overlay.style.height = `${canvas.height}px`;
                        redrawAnnotations(pageNumber);
                      }
                    }, 150);
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

          {isReviewer && (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="w-64 h-8 text-sm">
                    <SelectValue placeholder="Pilih aksi..." />
                  </SelectTrigger>
                  <SelectContent>
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
                  {action === "approve" && "Approve Dokumen"}
                  {action === "approveWithNotes" && "Approve + Notes"}
                  {action === "returnForCorrection" && "Return Revisi"}
                  {!action && "Pilih Aksi Dulu"}
                </Button>
              </div>

              {needsNotes && (
                <div className="w-full">
                  <Textarea
                    placeholder={
                      action === "approveWithNotes"
                        ? "Tulis catatan tambahan..."
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

          {!isReviewer && userDivision === Division.Vendor && (
            <div className="flex justify-end">
              <Button
                size="default"
                onClick={handleSubmitRevision}
                disabled={isLoading || annotations.length === 0}
                className="h-8 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Revisi
              </Button>
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
