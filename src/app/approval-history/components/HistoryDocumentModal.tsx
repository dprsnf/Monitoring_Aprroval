import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HistoryDocument } from "@/app/types/documentTypes";
import { getStatusBadge, getPriorityBadge } from "./HistoryUtils";
import { FileText, Calendar, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: HistoryDocument | null;
}

export default function HistoryDocumentModal({
  open,
  onOpenChange,
  document,
}: HistoryDocumentModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            Document Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
                File Information
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Name:</span>
                  <span className="text-gray-900 break-all">{document.fileName}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Type:</span>
                  <span className="text-gray-900">{document.fileType}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Size:</span>
                  <span className="text-gray-900">{document.fileSize}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Category:</span>
                  <span className="text-gray-900">{document.category}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Priority:</span>
                  {getPriorityBadge(document.priority)}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Review Status
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Uploaded:</span>
                  <span className="text-gray-900">{new Date(document.uploadDate).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Status:</span>
                  {getStatusBadge(document.status)}
                </div>
                {document.reviewDate && (
                  <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                    <span className="font-medium text-gray-700 min-w-20">Reviewed:</span>
                    <span className="text-gray-900">{new Date(document.reviewDate).toLocaleString('id-ID')}</span>
                  </div>
                )}
                {document.reviewedBy && (
                  <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                    <span className="font-medium text-gray-700 min-w-20">By:</span>
                    <span className="text-gray-900">{document.reviewedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Description</h4>
            <p className="text-xs sm:text-sm text-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
              {document.description}
            </p>
          </div>

          {document.reviewNotes && (
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Review Notes</h4>
              <div className="bg-linear-to-r from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{document.reviewNotes}</p>
              </div>
            </div>
          )}

          {/* <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button className="flex-1 bg-linear-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Download Document
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Preview
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}