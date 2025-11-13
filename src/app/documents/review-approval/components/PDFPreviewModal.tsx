"use client";

import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { X, Download, RotateCw } from "lucide-react";

interface PDFPreviewModalProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PDFPreviewModal({
  contentRef,
  documentName,
  isOpen,
  onClose,
}: PDFPreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generatePDF = async () => {
    if (!contentRef.current || !isOpen) return;

    setLoading(true);
    try {
      // JANGAN clone manual → biarkan html2canvas yang handle
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Tambahkan ini: pastikan elemen terlihat
        windowWidth: contentRef.current.scrollWidth,
        windowHeight: contentRef.current.scrollHeight,
        // Fix warna lab() → gunakan onclone
        onclone: (clonedDoc) => {
          // Di dalam iframe, ganti warna lab()
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el: any) => {
            const style = el.style;
            const computed = clonedDoc.defaultView?.getComputedStyle(el);

            if (!computed) return;

            ["color", "backgroundColor", "borderColor"].forEach((prop) => {
              const value = computed.getPropertyValue(prop);
              if (
                value &&
                (value.includes("lab") ||
                  value.includes("lch") ||
                  value.includes("oklab"))
              ) {
                if (prop === "color") style.color = "#1f2937";
                else style.setProperty(prop, "transparent");
              }
            });
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Gagal membuat PDF. Coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) generatePDF();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [isOpen, contentRef]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${documentName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold">Preview PDF - {documentName}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={generatePDF}
              disabled={loading}
            >
              <RotateCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              disabled={!pdfUrl}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RotateCw className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-sm text-gray-600">Membuat PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-red-600">
              Gagal membuat PDF.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
