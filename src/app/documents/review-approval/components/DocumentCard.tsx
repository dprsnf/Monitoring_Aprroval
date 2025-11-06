"use client";

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
  XCircle,
} from "lucide-react";
import { Document, Status, Division, User } from "@/app/types"; // ✅ Import Tipe

interface DocumentCardProps {
  document: Document;
  onApprove: (document: Document) => void;
  onApproveWithNotes: (document: Document) => void;
  onReject: (document: Document) => void; // Ini akan memetakan ke 'return'
  onPreview: (document: Document) => void;
  getStatusColor: (status: Status) => string;
  getStatusText: (status: Status) => string;
  currentUser: User | null; // ✅ Diperlukan untuk logika tombol
  activeTab: "new" | "results"; // ✅ Diperlukan untuk logika tombol
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
  // ✅ Ambil progress terakhir dari array
  const latestProgress =
    document.progress && document.progress.length > 0
      ? document.progress[document.progress.length - 1]
      : "N/A";

  const canReview =
    currentUser &&
    (currentUser.division === Division.Dalkon ||
      currentUser.division === Division.Engineer ||
      currentUser.division === Division.Manager);

  return (
    <Card
      key={document.id}
      className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border border-white/30"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
              <h4 className="text-lg font-bold text-gray-900">
                {document.name}
              </h4>
              <Badge
                className={`${getStatusColor(document.status)} whitespace-nowrap`}
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
                  {document.latestVersion} • {/* ✅ Gunakan latestVersion */}
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
              Progress: {latestProgress} {/* ✅ Tampilkan progress terakhir */}
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
                    {new Date(document.updatedAt).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-auto lg:min-w-[200px]">
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => onPreview(document)}
                className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Document
              </Button>
              <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              {/* Tombol Aksi hanya muncul di tab "new" & untuk reviewer */}
              {activeTab === "new" && canReview && (
                <>
                  {/* Dalkon: bisa approve (submitted) atau (approvedWithNotes) */}
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

                  {/* Engineer: bisa approve (inReviewEngineering) */}
                  {currentUser?.division === Division.Engineer &&
                    document.status === Status.inReviewEngineering && (
                      <Button
                        onClick={() => onApprove(document)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}

                  {/* Manager: bisa approve (inReviewManager) */}
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

                  {/* Engineer: bisa 'Approve with Notes' */}
                  {currentUser?.division === Division.Engineer &&
                    document.status === Status.inReviewEngineering && (
                      <Button
                        onClick={() => onApproveWithNotes(document)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm mt-2"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Approve with Notes
                      </Button>
                    )}

                  {/* Semua Reviewer bisa 'Reject' (Return) */}
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
      </CardContent>
    </Card>
  );
}