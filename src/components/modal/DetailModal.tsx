"use client";

import {
  FileText,
  CheckCircle,
  Clock,
  HardDrive,
  Download,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Status, ApprovalType, DetailModalProps } from "@/app/types";
import { Badge } from "@/components/ui/badge";

export default function DetailModal({
  selectedDocument,
  isLoading,
  onClose,
}: DetailModalProps) {
  // Tampilkan loading atau jika tidak ada dokumen
  if (isLoading || !selectedDocument) {
    return (
      <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl flex-shrink-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">
              Document Review Detail
            </h2>
          </div>
          <div className="p-10 text-center">
            {isLoading ? "Loading details..." : "Document not found."}
          </div>
          <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusText = (status: Status) => {
    const statusMap = {
      [Status.submitted]: "Submitted",
      [Status.inReviewConsultant]: "In Review Consultant",
      [Status.inReviewEngineering]: "In Review Engineering",
      [Status.inReviewManager]: "In Review Manager",
      [Status.approved]: "Approved",
      [Status.approvedWithNotes]: "Approved with Notes",
      [Status.returnForCorrection]: "Return for Correction",
      [Status.rejected]: "Rejected",
      [Status.overdue]: "Overdue",
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type?: ApprovalType) => {
    if (!type) return "Not Specified";
    return type === ApprovalType.protection ? "Protection" : "Civil";
  };

  const getStatusBadge = (status: Status) => {
    // Anda bisa mengganti ini dengan fungsi getStatusColor global jika diimpor
    return <Badge>{getStatusText(status)}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">
                Document Review Detail
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                ID: {selectedDocument.id}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Document Info */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
              <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Document Name
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {selectedDocument.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Document Type
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {getTypeText(selectedDocument.documentType)}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {getStatusText(selectedDocument.status)}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Latest Version
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {selectedDocument.latestVersion}{" "}
                    {/* ✅ FIX: Menggunakan latestVersion */}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Submitted By
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {selectedDocument.submittedBy.name}
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-600">
                    Submission Date
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {new Date(selectedDocument.createdAt).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>

              {selectedDocument.overallDeadline && (
                <div className="mt-3 sm:mt-4">
                  <label className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Overall Deadline
                  </label>
                  <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                    {new Date(selectedDocument.overallDeadline).toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              )}

              <div className="mt-3 sm:mt-4">
                <label className="text-xs sm:text-sm font-medium text-gray-600">
                  Remarks
                </label>
                <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                  {selectedDocument.remarks || "Tidak ada keterangan tambahan"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          {selectedDocument.contract && (
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                  Contract Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Contract Number
                    </label>
                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                      {selectedDocument.contract.contractNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-600">
                      Contract Date
                    </label>
                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                      {new Date(
                        selectedDocument.contract.contractDate
                      ).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ BARU: File Versions (Riwayat Patch) */}
          {selectedDocument.versions &&
            selectedDocument.versions.length > 0 && (
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                  <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                    <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                    File Versions (History)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-3">
                  {selectedDocument.versions
                    .sort((a, b) => b.version - a.version) // Tampilkan dari terbaru
                    .map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-800">
                              Version {version.version}
                              {version.version ===
                                selectedDocument.latestVersion && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800">
                                  Latest
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded by {version.uploadedBy?.name} on{" "}
                              {new Date(version.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          // onClick={() => window.open(`http://localhost:3001/${version.filePath}`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

          {/* ✅ BARU: Approval History */}
          {selectedDocument.approvals &&
            selectedDocument.approvals.length > 0 && (
              <Card className="shadow-lg border border-gray-200">
                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                  <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                    Approval History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="relative space-y-4 border-l-2 border-gray-200 pl-6">
                    {selectedDocument.approvals.map((approval) => (
                      <div key={approval.id} className="relative">
                        <div className="absolute -left-[33px] top-1 w-4 h-4 bg-gray-300 rounded-full border-4 border-white"></div>
                        <p className="font-semibold text-gray-800">
                          {approval.approvedBy.name}
                        </p>
                        <div className="my-1">
                          {getStatusBadge(approval.status)}
                        </div>
                        {approval.notes && (
                          <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded-md border">
                            {approval.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(approval.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          <div />
        </div>

        {/* Modal Footer */}
        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:cursor-pointer text-sm sm:text-base py-2"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
