// components/progress/ProgressVendorModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Calendar, User, FileText, Eye } from "lucide-react";

interface ProgressDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  currentStep: number;
  totalSteps: number;
  status: "in_progress" | "on_hold";
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
}

interface VendorProgress {
  id: string;
  vendorName: string;
  company: string;
  projectTitle: string;
  submissionDate: string;
  category: string;
  priority: "high" | "medium" | "low";
  overallProgress: number;
  totalDocuments: number;
  completedDocuments: number;
  inProgressDocuments: number;
  onHoldDocuments: number;
  estimatedCompletion: string;
  assignedReviewer: string;
  description: string;
  drawings: ProgressDocument[];
}

interface ProgressVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: VendorProgress | null;
  onDocumentClick: (doc: ProgressDocument) => void;
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return <Badge className="bg-red-100 text-red-800 border border-red-200">High</Badge>;
    case "medium": return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Medium</Badge>;
    default: return <Badge className="bg-green-100 text-green-800 border border-green-200">Low</Badge>;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
};

export default function ProgressVendorModal({
  open,
  onOpenChange,
  vendor,
  onDocumentClick,
}: ProgressVendorModalProps) {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            Vendor Progress Details
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Complete progress tracking for vendor submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Vendor Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl">
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <Building className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Project Information
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Project:</span>
                  <span className="text-gray-900 wrap-wrap-break-words">{vendor.projectTitle}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Vendor:</span>
                  <span className="text-gray-900 wrap-break-words">{vendor.vendorName}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Company:</span>
                  <span className="text-gray-900 wrap-break-words">{vendor.company}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Category:</span>
                  <span className="text-gray-900">{vendor.category}</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Priority:</span>
                  {getPriorityBadge(vendor.priority)}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Progress Summary
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Submitted:</span>
                  <span className="text-gray-900">
                    {new Date(vendor.submissionDate).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Progress:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(vendor.overallProgress)}`}
                        style={{ width: `${vendor.overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{vendor.overallProgress}%</span>
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Est. Complete:</span>
                  <span className="text-gray-900">
                    {new Date(vendor.estimatedCompletion).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-[100px]">Reviewer:</span>
                  <span className="text-gray-900">{vendor.assignedReviewer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
              Project Description
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
              {vendor.description}
            </p>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
              Documents Progress ({vendor.drawings.length})
            </h4>
            <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
              {vendor.drawings.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onDocumentClick(doc)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-medium text-gray-900 wrap-break-words">
                            {doc.fileName}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            Step {doc.currentStep} of {doc.totalSteps}
                          </span>
                          <span className="font-medium">
                            {Math.round((doc.currentStep / doc.totalSteps) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${getProgressColor(
                              (doc.currentStep / doc.totalSteps) * 100
                            )}`}
                            style={{
                              width: `${(doc.currentStep / doc.totalSteps) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{doc.fileSize}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {new Date(doc.uploadDate).toLocaleDateString("id-ID")}
                        </span>
                        {getPriorityBadge(doc.priority)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={`${
                          doc.status === "on_hold"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {doc.status === "on_hold" ? "On Hold" : "In Progress"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}