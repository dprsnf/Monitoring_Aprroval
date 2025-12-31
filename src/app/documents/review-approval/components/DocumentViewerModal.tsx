  "use client";

  import { useEffect, useState, useRef, useCallback, useMemo } from "react";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
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
  } from "lucide-react";
  import { pdfjs } from "react-pdf";
  import { cn } from "@/lib/utils";
  import { Division } from "@/app/types";
  import api from "@/lib/axios";

  import "react-pdf/dist/Page/AnnotationLayer.css";
  import "react-pdf/dist/Page/TextLayer.css";

  // ✅ Dynamic import untuk react-pdf components
  import dynamic from "next/dynamic";

  const Document = dynamic(
    () => import("react-pdf").then((mod) => mod.Document),
    { ssr: false }
  );

  const Page = dynamic(
    () => import("react-pdf").then((mod) => mod.Page),
    { ssr: false }
  );

  // Ensure pdfjs uses the bundled worker from /public to avoid fake-worker warnings
  if (typeof window !== "undefined") {
    const workerSrc = `${window.location.origin}/pdf.worker.mjs`;
    if (pdfjs.GlobalWorkerOptions.workerSrc !== workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    }
  }

  interface Point {
    x: number;
    y: number;
  }

  interface Annotation {
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

  interface DocumentViewerModalProps {
    documentId: number;
    documentName: string;
    isOpen: boolean;
    onClose: () => void;
    userDivision?: Division;
    onSubmitSuccess?: () => void;
    initialAction?: "approve" | "approveWithNotes" | "returnForCorrection" | null;
  }

  function DocumentViewerModalContent({
    documentId,
    documentName,
    isOpen,
    onClose,
    userDivision,
    onSubmitSuccess,
    initialAction = null,
  }: DocumentViewerModalProps) {
    const [pdfFile, setPdfFile] = useState<{ data: Uint8Array } | null>(null);
    const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    const [isDrawing, setIsDrawing] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const currentPathRef = useRef<Point[]>([]);
    const [tool, setTool] = useState<"pencil" | "eraser" | "text" | "stamp">("pencil");
    const [color, setColor] = useState("#ff0000");
    const [thickness, setThickness] = useState(4);
    const [fontSize, setFontSize] = useState(20);
    const [textInput, setTextInput] = useState("");
    const [showTextModal, setShowTextModal] = useState(false);
    const [textPosition, setTextPosition] = useState<{page: number, x: number, y: number} | null>(null);
    const [stampImage, setStampImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

    const [action, setAction] = useState<string>(initialAction || "");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const needsNotes =
      action === "approveWithNotes" || action === "returnForCorrection";

    const loadFile = useCallback(async () => {
      if (!documentId || !isOpen) return;
      setIsLoading(true);
      setError(null);

      if (pdfFile && currentDocumentId === documentId) {
        // Skip reloading file, just reset other states
        setAnnotations([]);
        setPageNumber(1);
        setAction(initialAction || "");
        setNotes("");
        setIsLoading(false);
        return;
      }

      // Reset states for new load
      setAnnotations([]);
      setPageNumber(1);
      setAction(initialAction || "");
      setNotes("");

      try {
        const { data } = await api.get(`/documents/${documentId}/file`, {
          responseType: "arraybuffer",
        });

        const uint8Array = new Uint8Array(data);
        setPdfFile({ data: uint8Array });
        setCurrentDocumentId(documentId);
      } catch (err) {
        setError("Gagal memuat dokumen.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, [documentId, isOpen, initialAction, pdfFile, currentDocumentId]);

    useEffect(() => {
      if (isOpen) {
        loadFile();
      } else {
        // Don't setPdfFile(null) here to keep it for reopen, but reset others
        setAnnotations([]);
        setAction("");
        setNotes("");
        canvasRefs.current = {};
      }
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
      
      if (tool === "text") {
        setTextPosition({ page, x, y });
        setShowTextModal(true);
        return;
      }
      
      if (tool === "stamp" && stampImage) {
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
        return;
      }
      
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
            ctx.font = `${ann.fontSize}px Arial`;
            ctx.fillStyle = ann.color!;
            ctx.fillText(ann.text, ann.position.x, ann.position.y);
          } else if (ann.type === "stamp" && ann.stampImage && ann.position) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, ann.position!.x, ann.position!.y, ann.width || 100, ann.height || 100);
            };
            img.src = ann.stampImage;
          }
        });
    };

    const clearAll = () => {
      setAnnotations([]);
      Object.values(canvasRefs.current).forEach((c) =>
        c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
      );
    };

    const handleAddText = () => {
      if (!textInput.trim() || !textPosition) return;
      
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
      if (!pdfFile) return null;

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
                    (ann.width || 100),
                    (ann.height || 100)
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
          new Uint8Array(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength)
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
        const file = await generateAnnotatedPDF();
        if (file) {
          const url = URL.createObjectURL(file);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          alert("PDF berhasil disimpan!");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal menyimpan PDF.");
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

        const formData = new FormData();

        const fileToSend = await generateAnnotatedPDF();
        if (fileToSend) {
          formData.append("file", fileToSend);
        }

        if (notes.trim()) {
          formData.append("notes", notes.trim());
        }
        formData.append("action", action);

        await api.patch(`/documents/${documentId}/${role}-review`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

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

    // Memoize pdfFile to prevent unnecessary reloads
    const memoizedPdfFile = useMemo(() => pdfFile, [pdfFile?.data]);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="border-b bg-white p-4 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {documentName}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {isReviewer
                  ? "Review dokumen dan pilih aksi di bawah"
                  : "Coret dokumen lalu submit revisi"}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-3">
              {(isReviewer || userDivision === Division.Vendor) && (
                <>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                    <Button
                      size="icon"
                      variant={tool === "pencil" ? "default" : "ghost"}
                      onClick={() => setTool("pencil")}
                      title="Pensil"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={tool === "eraser" ? "default" : "ghost"}
                      onClick={() => setTool("eraser")}
                      title="Penghapus"
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={tool === "text" ? "default" : "ghost"}
                      onClick={() => setTool("text")}
                      title="Tambah Teks"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={tool === "stamp" ? "default" : "ghost"}
                      onClick={() => fileInputRef.current?.click()}
                      title="Tambah Stempel/Tanda Tangan"
                    >
                      <ImageIcon className="w-4 h-4" />
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
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving || annotations.length === 0}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    Save PDF
                  </Button>
                </>
              )}

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
              <Document
                key={documentId}
                file={memoizedPdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  </div>
                }
              >
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
            <DialogFooter className="border-t bg-white p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center w-full">
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
                    onClick={() =>
                      setPageNumber((p) => Math.min(numPages, p + 1))
                    }
                    disabled={pageNumber >= numPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isReviewer && (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center gap-4">
                    <Select value={action} onValueChange={setAction}>
                      <SelectTrigger className="w-72">
                        <SelectValue placeholder="Pilih aksi..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Approve
                          </div>
                        </SelectItem>
                        <SelectItem value="approveWithNotes">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            Approve with Notes
                          </div>
                        </SelectItem>
                        <SelectItem value="returnForCorrection">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-orange-600" />
                            Return for Correction
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="lg"
                      className={cn(
                        "min-w-56 font-semibold",
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
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
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
                        className="min-h-28 resize-none"
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
                    size="lg"
                    onClick={handleSubmitRevision}
                    disabled={isLoading || annotations.length === 0}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    Submit Revisi
                  </Button>
                </div>
              )}
            </DialogFooter>
          )}
        </DialogContent>
        
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
                <label className="block text-sm font-medium mb-2">Ukuran Font</label>
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
                <Button
                  onClick={handleAddText}
                  disabled={!textInput.trim()}
                >
                  Tambah
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    );
  }

  // ✅ Wrapper dengan client-only check untuk menghindari hydration error
  export default function DocumentViewerModal(props: DocumentViewerModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return null;
    }

    return <DocumentViewerModalContent {...props} />;
  }