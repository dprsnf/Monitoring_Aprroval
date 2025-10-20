import {
  Eye,
  CheckCircle,
  XCircle,
  Download,
  User,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Document, Status } from "@/app/types";
import { JSX } from "react";

interface ManagementListProps {
  data: Document[];
  activeTab: "new" | "results";
  onDetailClick: (document: Document) => void;
  onApproveClick: (document: Document) => void;
  onRejectClick: (document: Document) => void;
  getStatusBadge: (status: Status) => JSX.Element | null;
  currentUserRole: string;
}

export default function ManagementList({
  data,
  activeTab,
  onDetailClick,
  onApproveClick,
  onRejectClick,
  getStatusBadge,
  currentUserRole,
}: ManagementListProps) {
  if (data.length === 0) {
    return (
      <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === "new" ? (
              <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            ) : (
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {activeTab === "new" ? "No new documents" : "No review results"}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            {activeTab === "new"
              ? "Belum ada dokumen baru yang memerlukan review."
              : "Belum ada hasil review dari tim."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const canTakeAction = (document: Document) => {
    // Manager can review submitted documents and return for correction
    if (currentUserRole === "Manager") {
      return (
        document.status === Status.submitted ||
        document.status === Status.returnForCorrection
      );
    }
    return false;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {data.map((document) => (
        <Card
          key={document.id}
          className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-200"
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {document.name}
                  </h3>
                  {getStatusBadge(document.status)}
                  {document.documentType && (
                    <Badge variant="outline" className="text-xs">
                      {document.documentType}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                    <span>
                      <strong>Vendor:</strong> {document.submittedBy.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                    <span>
                      <strong>Submit:</strong>{" "}
                      {new Date(document.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                    <span>
                      <strong>Version:</strong> {document.version}
                    </span>
                  </div>
                </div>

                {document.contract && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      <span>
                        <strong>Contract:</strong>{" "}
                        {document.contract.contractNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      <span>
                        <strong>Contract Date:</strong>{" "}
                        {new Date(
                          document.contract.contractDate
                        ).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}

                {document.overallDeadline && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 font-medium">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        Deadline:{" "}
                        {new Date(document.overallDeadline).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg">
                  {document.remarks || "Tidak ada keterangan tambahan"}
                </p>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 justify-end">
                <Button
                  size="sm"
                  onClick={() => onDetailClick(document)}
                  className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md text-xs sm:text-sm px-3 py-2"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Detail</span>
                </Button>

                {activeTab === "new" && canTakeAction(document) && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onApproveClick(document)}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md text-xs sm:text-sm px-3 py-2"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Review</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRejectClick(document)}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-md text-xs sm:text-sm px-3 py-2"
                    >
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Return</span>
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#efe62f] text-gray-900 hover:bg-[#efe62f] shadow-md text-xs sm:text-sm px-3 py-2"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
