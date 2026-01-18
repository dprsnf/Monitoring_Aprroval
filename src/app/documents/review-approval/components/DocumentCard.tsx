"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  MessageSquare,
  Send,
  Upload,
} from "lucide-react";
import { Document, Status, Division, User } from "@/app/types";
import api from "@/lib/axios";
import RevisionUploadModal from "@/components/modal/RevisionUploadModal";
import { encodeDocumentId } from "@/lib/idCodec";

interface DocumentCardProps {
  document: Document;
  onApprove: (document: Document) => void;
  onApproveWithNotes: (document: Document) => void;
  onReject: (document: Document) => void;
  onPreview: (document: Document) => void;
  getStatusColor: (status: Status) => string;
  getStatusText: (status: Status) => string;
  currentUser: User | null;
  activeTab: "new" | "results";
  onRefresh?: () => void; // ✅ Tambahkan prop untuk refresh
}

export default function EngineerDocumentCard({
  document,
  onApprove,
  onApproveWithNotes,
  onReject,
  onPreview,
  getStatusColor,
  getStatusText,
  currentUser,
  activeTab,
  onRefresh, // ✅ Terima prop refresh
}: DocumentCardProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const latestProgress =
    document.progress && document.progress.length > 0
      ? document.progress[document.progress.length - 1]
      : "N/A";

  const canReview =
    currentUser &&
    (currentUser.division === Division.Dalkon ||
      currentUser.division === Division.Engineer ||
      currentUser.division === Division.Manager);

  const handleDownload = async () => {
    try {
      const response = await api.get(`/documents/${document.id}/file`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

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

  // ✅ Handler untuk navigate ke page dengan action tertentu
  const handleOpenPageWithAction = (action: "approve" | "approveWithNotes" | "returnForCorrection" | null = null) => {
    const data = {
      documentId: document.id,
      documentName: document.name,
      userDivision: currentUser?.division,
      initialAction: action,
    };
    sessionStorage.setItem("documentReviewData", JSON.stringify(data));
    const encodedId = encodeDocumentId(document.id);
    router.push(`/documents/review/${encodedId}`);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
        <CardContent className="p-4 sm:p-6">
          <div>
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    {document.name}
                  </h4>
                  <Badge
                    className={`${getStatusColor(
                      document.status
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
                  {document.contract?.contractNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#14a2ba]" />
                      <span>Contract: {document.contract.contractNumber}</span>
                    </div>
                  )}
                  {document.contract?.contractDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#14a2ba]" />
                      <span>
                        Contract Date:{" "}
                        {new Date(document.contract.contractDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Catatan: {latestProgress}
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
                          "id-ID"
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-auto lg:min-w-50">
                <div className="flex flex-col gap-2">
                  {/* Preview tanpa action (hanya lihat) */}
                  <Button
                    onClick={() => handleOpenPageWithAction(null)}
                    className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Document
                  </Button>

                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  <Button
                    onClick={() => onPreview(document)}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {/* Upload & review with PDF + notes (Dalkon/Engineer/Manager) */}
                  {canReview && (
                    <Button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="w-full bg-[#0e7490] hover:bg-[#0c5f78] text-white text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload PDF & Review
                    </Button>
                  )}

                  {/* ✅ Tombol approval dengan modal action */}
                  {activeTab === "new" && canReview && (
                    <>
                      {/* DALKON */}
                      {currentUser?.division === Division.Dalkon &&
                        (document.status === Status.submitted ||
                          document.status === Status.approvedWithNotes) && (
                          <>
                            <Button
                              onClick={() => handleOpenPageWithAction("approve")}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {document.status === Status.submitted
                                ? "Forward to Engineer"
                                : "Forward to Manager"}
                            </Button>

                            <Button
                              onClick={() => handleOpenPageWithAction("returnForCorrection")}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Return for Correction
                            </Button>
                          </>
                        )}

                      {/* ENGINEER */}
                      {currentUser?.division === Division.Engineer &&
                        document.status === Status.inReviewEngineering && (
                          <>
                            <Button
                              onClick={() => handleOpenPageWithAction("approve")}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>

                            <Button
                              onClick={() => handleOpenPageWithAction("approveWithNotes")}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Approve with Notes
                            </Button>

                            <Button
                              onClick={() => handleOpenPageWithAction("returnForCorrection")}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Return for Correction
                            </Button>
                          </>
                        )}

                      {/* MANAGER */}
                      {currentUser?.division === Division.Manager &&
                        document.status === Status.inReviewManager && (
                          <>
                            <Button
                              onClick={() => handleOpenPageWithAction("approve")}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>

                            <Button
                              onClick={() => handleOpenPageWithAction("returnForCorrection")}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Return for Correction
                            </Button>
                          </>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RevisionUploadModal
        documentId={document.id}
        documentName={document.name}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userDivision={currentUser?.division}
        onSubmitSuccess={() => {
          onRefresh?.();
          setIsUploadModalOpen(false);
        }}
      />
    </>
  );
}
