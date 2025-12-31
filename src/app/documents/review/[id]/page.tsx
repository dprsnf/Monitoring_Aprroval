"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentReviewPage from "./components/DocumentReviewPage";
import { decodeDocumentId } from "@/lib/idCodec";

export default function DocumentReviewRoute() {
  const params = useParams();
  const router = useRouter();
  const [documentData, setDocumentData] = useState<{
    documentId: number;
    documentName: string;
    userDivision?: any;
    initialAction?: "approve" | "approveWithNotes" | "returnForCorrection" | null;
  } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    // Get data from sessionStorage (passed from card click)
    const storedData = sessionStorage.getItem("documentReviewData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setDocumentData(parsed);
      setRouteError(null);
    } else if (params.id) {
      const rawParam = Array.isArray(params.id) ? params.id[0] : params.id;
      const decodedId = decodeDocumentId(String(rawParam));

      if (decodedId !== null) {
        setDocumentData({
          documentId: decodedId,
          documentName: "Document",
          userDivision: undefined,
          initialAction: null,
        });
        setRouteError(null);
      } else {
        setDocumentData(null);
        setRouteError("Link dokumen tidak valid atau sudah kadaluarsa.");
      }
    }
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

  return (
    <DocumentReviewPage
      documentId={documentData.documentId}
      documentName={documentData.documentName}
      userDivision={documentData.userDivision}
      onClose={handleClose}
      onSubmitSuccess={handleSubmitSuccess}
      initialAction={documentData.initialAction}
    />
  );
}
