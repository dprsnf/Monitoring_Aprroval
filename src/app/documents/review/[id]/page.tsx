"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentReviewPage from "./components/DocumentReviewPage";

export default function DocumentReviewRoute() {
  const params = useParams();
  const router = useRouter();
  const [documentData, setDocumentData] = useState<{
    documentId: number;
    documentName: string;
    userDivision?: any;
    initialAction?: "approve" | "approveWithNotes" | "returnForCorrection" | null;
  } | null>(null);

  useEffect(() => {
    // Get data from sessionStorage (passed from card click)
    const storedData = sessionStorage.getItem("documentReviewData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setDocumentData(parsed);
    } else if (params.id) {
      // Fallback: just use ID from URL
      setDocumentData({
        documentId: Number(params.id),
        documentName: "Document",
        userDivision: undefined,
        initialAction: null,
      });
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
