import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VendorHistory, HistoryDocument } from "@/app/types/documentTypes";
import { getStatusBadge, getPriorityBadge } from "./HistoryUtils";
import { Building, Calendar, FileText, FolderOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface HistoryVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorHistory | null;
  onDocumentClick: (doc: HistoryDocument) => void;
}

export default function HistoryVendorModal({
  open,
  onOpenChange,
  vendor,
  onDocumentClick,
}: HistoryVendorModalProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            Vendor History Details
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Complete review history for vendor submission
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6">
          {/* Vendor Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <Building className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Project Information
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[80px]">Project:</span>
                  <span className="text-gray-900 break-words">{vendor.projectTitle}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[80px]">Vendor:</span>
                  <span className="text-gray-900 break-words">{vendor.vendorName}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[80px]">Company:</span>
                  <span className="text-gray-900 break-words">{vendor.company}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[80px]">Category:</span>
                  <span className="text-gray-900">{vendor.category}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[80px]">Priority:</span>
                  {getPriorityBadge(vendor.priority)}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Review Summary
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Submitted:</span>
                  <span className="text-gray-900">{new Date(vendor.submissionDate).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Status:</span>
                  {getStatusBadge(vendor.finalStatus)}
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Completed:</span>
                  <span className="text-gray-900">{vendor.completionDate ? new Date(vendor.completionDate).toLocaleString('id-ID') : 'Not completed'}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Reviewer:</span>
                  <span className="text-gray-900">{vendor.reviewer || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
              Project Description
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
              {vendor.description}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-[#14a2ba]" />
              Documents ({vendor.drawings.length})
            </h4>
            <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
              {vendor.drawings.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-medium text-gray-900 break-words">{doc.fileName}</h5>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{doc.fileSize}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">{new Date(doc.uploadDate).toLocaleDateString('id-ID')}</span>
                        {doc.reviewDate && (
                          <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                            Reviewed: {new Date(doc.reviewDate).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0">
                      {getStatusBadge(doc.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDocumentClick(doc)}
                        className="border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white text-xs"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  {doc.reviewNotes && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Review Notes:</p>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{doc.reviewNotes}</p>
                      {doc.reviewedBy && (
                        <p className="text-xs text-gray-500 mt-2 italic">— {doc.reviewedBy}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}