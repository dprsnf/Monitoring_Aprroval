"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

// CSS bawaan react-pdf tetap diperlukan untuk styling dasar Page
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
}

export default function DocumentViewerModal({
  documentId,
  documentName,
  isOpen,
  onClose,
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
  const [thickness, setThickness] = useState(3);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const loadFile = useCallback(async () => {
    if (!documentId || !isOpen) return;
    setIsLoading(true);
    setError(null);
    setPageNumber(1);
    setNumPages(0);
    setAnnotations([]);
    currentPathRef.current = [];
    Object.values(canvasRefs.current).forEach((c) =>
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
    );

    try {
      const { data } = await api.get(`/documents/${documentId}/file`, {
        responseType: "arraybuffer",
      });
      setPdfFile(data);
    } catch (err) {
      setError("Gagal memuat dokumen.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId, isOpen]);

  useEffect(() => {
    if (isOpen) loadFile();
    return () => setPdfFile(null);
  }, [isOpen, loadFile]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));

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
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoint = { x, y };

    const path = currentPathRef.current;
    if (path.length === 0) return;

    const lastPoint = path[path.length - 1];

    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
    ctx.lineWidth = thickness;
    ctx.strokeStyle = tool === "eraser" ? "#000000" : color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(newPoint.x, newPoint.y);
    ctx.stroke();

    currentPathRef.current.push(newPoint);
  };

  const stopDrawing = (page: number) => {
    const path = currentPathRef.current;

    if (!isDrawing || path.length < 2) {
      currentPathRef.current = [];
      setIsDrawing(false);
      return;
    }

    if (tool === "pencil") {
      setAnnotations((prev) => [
        ...prev,
        { page, type: "draw", path: path, color, thickness },
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
    ctx.globalCompositeOperation = "source-over";

    annotations
      .filter((a) => a.page === page)
      .forEach((ann) => {
        ctx.lineWidth = ann.thickness;
        ctx.strokeStyle = ann.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ann.path.forEach((p, i) => {
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      });
  };

  const handleSaveAndDownload = async () => {
    if (!pdfFile) return;
    setIsLoading(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfFile);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageNum = i + 1;
        const canvas = canvasRefs.current[pageNum];
        const hasAnnotation = annotations.some((a) => a.page === pageNum);
        if (!canvas || !hasAnnotation) continue;

        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = pdfWidth;
        tempCanvas.height = pdfHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) continue;

        const scaleX = pdfWidth / canvas.width;
        const scaleY = pdfHeight / canvas.height;
        tempCtx.scale(scaleX, scaleY);

        annotations
          .filter((a) => a.page === pageNum)
          .forEach((ann) => {
            tempCtx.lineWidth = ann.thickness;
            tempCtx.strokeStyle = ann.color;
            tempCtx.lineCap = "round";
            tempCtx.lineJoin = "round";
            tempCtx.beginPath();
            ann.path.forEach((p, i) => {
              i === 0 ? tempCtx.moveTo(p.x, p.y) : tempCtx.lineTo(p.x, p.y);
            });
            tempCtx.stroke();
          });

        const pngUrl = tempCanvas.toDataURL("image/png");
        const pngImage = await pdfDoc.embedPng(pngUrl);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pdfWidth,
          height: pdfHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentName.replace(/[^a-z0-9]/gi, "_")}_annotated.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal menyimpan anotasi:", err);
      alert("Gagal menyimpan anotasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    Object.values(canvasRefs.current).forEach((c) => {
      if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] w-full max-w-6xl p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle className="truncate max-w-md">
                {documentName}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Coret-coret dan simpan PDF.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border rounded-md">
                <Button
                  size="icon"
                  variant={tool === "pencil" ? "default" : "ghost"}
                  onClick={() => setTool("pencil")}
                  className="rounded-r-none"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Button>
                <Button
                  size="icon"
                  variant={tool === "eraser" ? "default" : "ghost"}
                  onClick={() => setTool("eraser")}
                  className="rounded-l-none"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M15 9l-6 6m0-6l6 6" />
                  </svg>
                </Button>
              </div>

              <div className="flex items-center gap-1 border rounded-md p-1">
                {["#ff0000", "#0000ff", "#00ff00", "#000000"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      color === c
                        ? "border-gray-800 scale-110"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 border rounded-md p-1">
                {[2, 4, 6, 8].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThickness(t)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      thickness === t ? "bg-primary text-white" : "bg-gray-200"
                    )}
                  >
                    <div
                      className="bg-current rounded-full"
                      style={{ width: t, height: t }}
                    />
                  </button>
                ))}
              </div>

              <Button size="sm" variant="outline" onClick={clearAnnotations}>
                <Trash2 className="w-4 h-4 mr-1" /> Clear
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveAndDownload}
                disabled={isLoading || annotations.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isLoading && !pdfFile && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {error && <p className="p-4 text-center text-red-600">{error}</p>}

          {pdfFile && !error && (
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
              <div className="flex justify-center">
                <div className="relative inline-block shadow-lg">
                  <Page
                    pageNumber={pageNumber}
                    width={800}
                    className="border"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onRenderSuccess={() => {
                      requestAnimationFrame(() => {
                        const pdfCanvas = document.querySelector(
                          `.react-pdf__Page[data-page-number="${pageNumber}"] canvas`
                        ) as HTMLCanvasElement | null;
                        if (!pdfCanvas) return;

                        const overlay = canvasRefs.current[pageNumber];
                        if (!overlay) return;

                        const rect = pdfCanvas.getBoundingClientRect();
                        overlay.width = rect.width;
                        overlay.height = rect.height;
                        overlay.style.width = `${rect.width}px`;
                        overlay.style.height = `${rect.height}px`;

                        redrawAnnotations(pageNumber);
                      });
                    }}
                  />
                  <canvas
                    ref={(el) => {
                      if (el) canvasRefs.current[pageNumber] = el;
                    }}
                    className="absolute left-0 top-0 cursor-crosshair pointer-events-auto z-50"
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
          <DialogFooter className="border-t bg-gray-50 p-3 flex justify-between items-center">
            section-separator:{" "}
            <p className="text-sm text-gray-600">
              Halaman {pageNumber} dari {numPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
