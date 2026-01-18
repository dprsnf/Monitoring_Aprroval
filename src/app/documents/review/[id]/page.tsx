"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentReviewPage from "./components/DocumentReviewPage";
import { decodeDocumentId } from "@/lib/idCodec";
import api from "@/lib/axios";

export default function DocumentReviewRoute() {
  const params = useParams();
  const router = useRouter();
  const [documentData, setDocumentData] = useState<{
    documentId: number;
    documentName: string;
    userDivision?: any;
    initialAction?: "approve" | "approveWithNotes" | "returnForCorrection" | null;
    status?: string; // ✅ Add status field
  } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);

  useEffect(() => {
    const loadDocumentData = async () => {
      setIsLoadingDocument(true);
      
      // Get data from sessionStorage (passed from card click)
      const storedData = sessionStorage.getItem("documentReviewData");
      let documentId: number | null = null;
      
      if (storedData) {
        const parsed = JSON.parse(storedData);
        documentId = parsed.documentId;
        setDocumentData(parsed);
      } else if (params.id) {
        const rawParam = Array.isArray(params.id) ? params.id[0] : params.id;
        const decodedId = decodeDocumentId(String(rawParam));

        if (decodedId !== null) {
          documentId = decodedId;
          setDocumentData({
            documentId: decodedId,
            documentName: "Document",
            userDivision: undefined,
            initialAction: null,
          });
        } else {
          setRouteError("Link dokumen tidak valid atau sudah kadaluarsa.");
          setIsLoadingDocument(false);
          return;
        }
      }

      // ✅ Fetch document status from API
      if (documentId) {
        try {
          const response = await api.get(`/documents/${documentId}`);
          const document = response.data;
          
          setDocumentData((prev) => ({
            ...prev!,
            documentName: document.name || prev?.documentName || "Document",
            status: document.status, // ✅ Add status from API
          }));
          
          console.log("📄 Document loaded:", {
            id: documentId,
            name: document.name,
            status: document.status,
          });
        } catch (err: any) {
          console.error("❌ Error loading document:", err);
          
          // ✅ PERBAIKAN: Jika dokumen tidak ditemukan di endpoint umum,
          // tetap lanjutkan dengan data yang ada (mungkin dokumen returnForCorrection)
          // hanya tersedia di endpoint khusus vendor
          if (err.response?.status === 404) {
            console.warn("⚠️ Document not found in main endpoint, using session data");
            // Tetap gunakan data dari sessionStorage tanpa error
          } else {
            // Untuk error lain (network, 500, dll), tampilkan error
            setRouteError(err.response?.data?.message || "Gagal memuat dokumen");
          }
        }
      }
      
      setIsLoadingDocument(false);
    };

    loadDocumentData();
  }, [params.id]);

  const handleClose = () => {
    sessionStorage.removeItem("documentReviewData");
    router.back();
  };

  const handleSubmitSuccess = () => {
    sessionStorage.removeItem("documentReviewData");
    router.back();
  };

  if (routeError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-700 font-medium">{routeError}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#125d72] text-white rounded-md"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (isLoadingDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document details...</p>
        </div>
      </div>
    );
  }

  return (
    <DocumentReviewPage
      documentId={documentData.documentId}
      documentName={documentData.documentName}
      userDivision={documentData.userDivision}
      status={documentData.status} // ✅ Pass status prop
      onClose={handleClose}
      onSubmitSuccess={handleSubmitSuccess}
      initialAction={documentData.initialAction}
    />
  );
}
