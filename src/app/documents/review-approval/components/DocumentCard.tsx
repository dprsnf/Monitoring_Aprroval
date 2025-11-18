// components/DocumentCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare, // <-- Pastikan ini di-import
} from "lucide-react";
import { Document, Status, Division, User } from "@/app/types";
import DocumentViewerModal from "./DocumentViewerModal"; // <-- Import modal baru
import api from "@/lib/axios";

interface DocumentCardProps {
  document: Document;
  onApprove: (document: Document) => void;
  onApproveWithNotes: (document: Document) => void;
  onReject: (document: Document) => void;
  onPreview: (document: Document) => void; // Ini untuk 'DetailModal'
  getStatusColor: (status: Status) => string;
  getStatusText: (status: Status) => string;
  currentUser: User | null;
  activeTab: "new" | "results";
}

export default function DocumentCard({
  document,
  onApprove,
  onApproveWithNotes,
  onReject,
  onPreview,
  getStatusColor,
  getStatusText,
  currentUser,
  activeTab,
}: DocumentCardProps) {
  // State untuk modal viewer baru
  const [showViewerModal, setShowViewerModal] = useState(false);

  const latestProgress =
    document.progress && document.progress.length > 0
      ? document.progress[document.progress.length - 1]
      : "N/A";

  const canReview =
    currentUser &&
    (currentUser.division === Division.Dalkon ||
      currentUser.division === Division.Engineer ||
      currentUser.division === Division.Manager);

  // Fungsi untuk download file asli dari endpoint
  const handleDownload = async () => {
    try {
      const response = await api.get(`/documents/${document.id}/file`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // ✅ PERBAIKAN: Gunakan window.document untuk menghindari konflik nama
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.name.replace(/[^a-z0-9]/gi, "_")}.pdf`;

      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download file:", error);
      alert("Gagal mengunduh file.");
    }
  };

  return (
    <>
      <Card className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
        <CardContent className="p-4 sm:p-6">
          {/* Hapus ref dari div ini */}
          <div>
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    {document.name}
                  </h4>
                  <Badge
                    className={`${getStatusColor(
                      document.status,
                    )} whitespace-nowrap`}
                  >
                    {getStatusText(document.status)}
                  </Badge>
                  {document.documentType && (
                    <Badge variant="outline" className="whitespace-nowrap">
                      {document.documentType}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#14a2ba]" />
                    <span>
                      {document.filePath.split(".").pop()?.toUpperCase()} • v
                      {document.latestVersion} •{" "}
                      {new Date(document.updatedAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#14a2ba]" />
                    <span>
                      Created:{" "}
                      {new Date(document.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Progress: {latestProgress}
                </p>

                {document.remarks && (
                  <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#14a2ba]">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Remarks:</strong>
                    </p>
                    <p className="text-sm text-gray-600">{document.remarks}</p>
                    {document.reviewedBy && document.updatedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed by {document.reviewedBy.name} on{" "}
                        {new Date(document.updatedAt).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-auto lg:min-w-[200px]">
                <div className="flex flex-col gap-2">
                  {/* Tombol ini sekarang membuka DocumentViewerModal */}
                  <Button
                    onClick={() => setShowViewerModal(true)}
                    className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Document
                  </Button>

                  {/* Tombol ini memanggil handleDownload */}
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  {/* Tombol ini membuka DetailModal (info, bukan preview file) */}
                  <Button
                    onClick={() => onPreview(document)}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {/* Logika tombol-tombol approval */}
                  {activeTab === "new" && canReview && (
                    <>
                      {currentUser?.division === Division.Dalkon &&
                        (document.status === Status.submitted ||
                          document.status === Status.approvedWithNotes) && (
                          <Button
                            onClick={() => onApprove(document)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {document.status === Status.submitted
                              ? "Forward to Engineer"
                              : "Forward to Manager"}
                          </Button>
                        )}

                      {currentUser?.division === Division.Engineer &&
                        document.status === Status.inReviewEngineering && (
                          <>
                            <Button
                              onClick={() => onApprove(document)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => onApproveWithNotes(document)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Approve with Notes
                            </Button>
                          </>
                        )}

                      {currentUser?.division === Division.Manager &&
                        document.status === Status.inReviewManager && (
                          <Button
                            onClick={() => onApprove(document)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}

                      <Button
                        onClick={() => onReject(document)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm mt-2"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Return (Reject)
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal ini sekarang adalah DocumentViewerModal yang baru */}
      {showViewerModal && (
        <DocumentViewerModal
          documentId={document.id}
          documentName={document.name}
          isOpen={showViewerModal}
          onClose={() => setShowViewerModal(false)}
        />
      )}
    </>
  );
}