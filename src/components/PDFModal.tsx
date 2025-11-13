// "use client";

// import { useEffect, useRef, useState } from "react";
// import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import * as pdfjsLib from "pdfjs-dist/build/pdf";

// interface PDFModalProps {
//   file: File;
//   onClose: () => void;
// }

// export default function PDFModal({ file, onClose }: PDFModalProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [pageNum, setPageNum] = useState(1);
//   const [numPages, setNumPages] = useState(0);
//   const [scale, setScale] = useState(1.2);
//   const [loading, setLoading] = useState(true);
//   const renderTaskRef = useRef<any>(null);

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       setLoading(true);
//       pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

//       const fileUrl = URL.createObjectURL(file);
//       const loadingTask = pdfjs.getDocument(fileUrl);
//       const pdf = await loadingTask.promise;

//       if (cancelled) return;

//       setNumPages(pdf.numPages);

//       const page = await pdf.getPage(1);
//       const viewport = page.getViewport({ scale });
//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       const context = canvas.getContext("2d")!;
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       const renderContext = { canvasContext: context, viewport };
//       const renderTask = page.render(renderContext);
//       renderTaskRef.current = renderTask;

//       await renderTask.promise;
//       setLoading(false);
//     })();

//     return () => {
//       cancelled = true;
//       if (renderTaskRef.current) {
//         renderTaskRef.current.cancel();
//       }
//     };
//   }, [file, scale]);

//   const goToPage = async (page: number) => {
//     if (!window.pdfDoc) return;
//     setLoading(true);
//     const pdfPage = await window.pdfDoc.getPage(page);
//     const viewport = pdfPage.getViewport({ scale });
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const context = canvas.getContext("2d")!;
//     canvas.height = viewport.height;
//     canvas.width = viewport.width;

//     if (renderTaskRef.current) renderTaskRef.current.cancel();
//     const renderTask = pdfPage.render({ canvasContext: context, viewport });
//     renderTaskRef.current = renderTask;
//     await renderTask.promise;
//     setPageNum(page);
//     setLoading(false);
//   };

//   // Simpan pdfDoc di window sementara
//   useEffect(() => {
//     (window as any).pdfDoc = null;
//     return () => {
//       (window as any).pdfDoc = null;
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
//       <div
//         className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <h3 className="text-lg font-semibold truncate max-w-md">{file.name}</h3>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="w-5 h-5" />
//           </Button>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 border-b">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => goToPage(Math.max(1, pageNum - 1))}
//             disabled={pageNum <= 1 || loading}
//           >
//             <ChevronLeft className="w-4 h-4" />
//           </Button>
//           <span className="text-sm font-medium min-w-24 text-center">
//             {loading ? "Loading..." : `Halaman ${pageNum} / ${numPages}`}
//           </span>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => goToPage(Math.min(numPages, pageNum + 1))}
//             disabled={pageNum >= numPages || loading}
//           >
//             <ChevronRight className="w-4 h-4" />
//           </Button>

//           <div className="flex items-center gap-1 ml-4">
//             <Button size="sm" variant="outline" onClick={() => setScale(s => s * 0.8)} disabled={loading}>
//               <ZoomOut className="w-4 h-4" />
//             </Button>
//             <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
//             <Button size="sm" variant="outline" onClick={() => setScale(s => s * 1.25)} disabled={loading}>
//               <ZoomIn className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         {/* PDF Canvas */}
//         <div className="flex-1 overflow-auto bg-gray-100 p-4">
//           <div className="mx-auto">
//             {loading && (
//               <div className="flex items-center justify-center h-96">
//                 <div className="text-gray-500">Memuat PDF...</div>
//               </div>
//             )}
//             <canvas
//               ref={canvasRef}
//               className="shadow-lg mx-auto block border border-gray-300"
//               style={{ maxWidth: "100%", height: "auto" }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }