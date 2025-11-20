"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Pencil,
  Eraser,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import api from "@/lib/axios";
import { PDFDocument } from "pdf-lib";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `/js/pdf.worker.min.mjs`;

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  page: number;
  type: "draw";
  path: Point[];
  color: string;
  thickness: number;
}

interface DocumentViewerModalProps {
  documentId: number;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (blob: Blob) => void; // ← UNTUK LANGSUNG SUBMIT REVISI
}

export default function DocumentViewerModal({
  documentId,
  documentName,
  isOpen,
  onClose,
  onSave,
}: DocumentViewerModalProps) {
  const [pdfFile, setPdfFile] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const currentPathRef = useRef<Point[]>([]);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [color, setColor] = useState("#ff0000");
  const [thickness, setThickness] = useState(4);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const loadFile = useCallback(async () => {
    if (!documentId || !isOpen) return;
    setIsLoading(true);
    setError(null);
    setAnnotations([]);
    setPageNumber(1);
    Object.values(canvasRefs.current).forEach((c) =>
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
    );

    try {
      const { data } = await api.get(`/documents/${documentId}/file`, {
        responseType: "arraybuffer",
      });
      setPdfFile(data);
    } catch (err) {
      setError("Gagal memuat dokumen. Pastikan file tersedia.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, isOpen]);

  useEffect(() => {
    if (isOpen) loadFile();
    return () => {
      setPdfFile(null);
      setAnnotations([]);
    };
  }, [isOpen, loadFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement>,
    page: number
  ) => {
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, page: number) => {
    if (!isDrawing) return;
    const canvas = canvasRefs.current[page];
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
    if (!isDrawing || currentPathRef.current.length < 2) {
      currentPathRef.current = [];
      setIsDrawing(false);
      return;
    }

    if (tool === "pencil") {
      setAnnotations((prev) => [
        ...prev,
        {
          page,
          type: "draw",
          path: [...currentPathRef.current],
          color,
          thickness,
        },
      ]);
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
        ctx.lineWidth = ann.thickness;
        ctx.strokeStyle = ann.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ann.path.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
        );
        ctx.stroke();
      });
  };

  const handleSave = async () => {
    if (!pdfFile || annotations.length === 0) return;
    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfFile);
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
        tempCtx.lineWidth = ann.thickness;
        tempCtx.strokeStyle = ann.color;
        tempCtx.lineCap = "round";
        tempCtx.lineJoin = "round";
        tempCtx.beginPath();
        ann.path.forEach((p, i) =>
          i === 0 ? tempCtx.moveTo(p.x, p.y) : tempCtx.lineTo(p.x, p.y)
        );
        tempCtx.stroke();

        const png = await pdfDoc.embedPng(tempCanvas.toDataURL());
        page.drawImage(png, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

      if (onSave) {
        onSave(blob); // ← LANGSUNG SUBMIT KE PARENT (VendorUploadPage)
        onClose();
      } else {
        // Fallback: download biasa
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${documentName}_revisi.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan revisi PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setAnnotations([]);
    Object.values(canvasRefs.current).forEach((c) =>
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">
              {documentName}
            </DialogTitle>
            <p className="text-sm text140 text-gray-500">
              Coret-coret lalu submit revisi
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tools */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <Button
                size="icon"
                variant={tool === "pencil" ? "default" : "ghost"}
                onClick={() => setTool("pencil")}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={tool === "eraser" ? "default" : "ghost"}
                onClick={() => setTool("eraser")}
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </div>

            {/* Warna */}
            <div className="flex gap-1">
              {["#ff0000", "#0000ff", "#00ff00", "#000000", "#ffa500"].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-9 h-9 rounded-full border-2 transition-all",
                      color === c
                        ? "border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-400"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: c }}
                  />
                )
              )}
            </div>

            {/* Ketebalan */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[3, 5, 8, 12].map((t) => (
                <button
                  key={t}
                  onClick={() => setThickness(t)}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
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

            <Button size="sm" variant="outline" onClick={clearAll}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>

            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={isLoading || annotations.length === 0}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {onSave ? "Submit Revisi" : "Download"}
            </Button>

            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-50 p-6">
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
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <div className="flex justify-center">
                <div className="relative shadow-2xl bg-white">
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
                          overlay.style.width = canvas.width + "px";
                          overlay.style.height = canvas.height + "px";
                          redrawAnnotations(pageNumber);
                        }
                      }, 150);
                    }}
                  />
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[pageNumber] = el;
                    }}
                    className="absolute top-0 left-0 cursor-crosshair z-50"
                    style={{ background: "transparent" }}
                    onMouseDown={(e) => startDrawing(e, pageNumber)}
                    onMouseMove={(e) => draw(e, pageNumber)}
                    onMouseUp={() => stopDrawing(pageNumber)}
                    onMouseLeave={() => stopDrawing(pageNumber)}
                  />
                </div>
              </div>
            </Document>
          )}
        </div>

        {numPages > 0 && (
          <DialogFooter className="border-t bg-white p-4 justify-between">
            <p className="text-sm text-gray-600">
              Halaman <strong>{pageNumber}</strong> dari{" "}
              <strong>{numPages}</strong>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
