import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, PlayCircle, CheckCircle, Clock} from "lucide-react";
import { ProgressDocument } from "@/app/types/progressTypes";

interface ProgressDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ProgressDocument | null;
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

export default function ProgressDocumentModal({
  open,
  onOpenChange,
  document,
}: ProgressDocumentModalProps) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-3xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            Document Progress Details
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
                {/* <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-15">Priority:</span>
                  {getPriorityBadge(document.priority)}
                </div> */}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                <PlayCircle className="w-4 h-4 mr-2 text-[#14a2ba]" />
                Progress Status
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Uploaded:</span>
                  <span className="text-gray-900">
                    {new Date(document.uploadDate).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Status:</span>
                  <Badge
                    className={`${
                      document.status === "on_revision"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {document.status === "on_revision" ? "On Revision" : "In Progress"}
                  </Badge>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <span className="font-medium text-gray-700 min-w-20">Progress:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(
                          (document.currentStep / document.totalSteps) * 100
                        )}`}
                        style={{
                          width: `${(document.currentStep / document.totalSteps) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {document.currentStep}/{document.totalSteps}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">
              Description
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 bg-linear-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
              {document.description}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">
              Progress Steps
            </h4>
            <div className="space-y-3">
              {document.progressSteps.map((step, index) => (
                <div key={step.step} className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "current"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : step.status === "current" ? (
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        step.step
                      )}
                    </div>
                    {index < document.progressSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 sm:h-12 ml-3 sm:ml-4 mt-1 ${
                          step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-medium text-gray-900">
                      {step.title}
                    </h5>
                    {step.description && (
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                      {step.completedDate && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Completed: {new Date(step.completedDate).toLocaleDateString("id-ID")}
                        </span>
                      )}
                      {step.reviewer && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {step.reviewer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          {document.comments && document.comments.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                Comments & Updates
              </h4>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {document.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      comment.type === "approval"
                        ? "bg-green-50 border-green-500"
                        : comment.type === "warning"
                        ? "bg-yellow-50 border-yellow-500"
                        : comment.type === "rejection"
                        ? "bg-red-50 border-red-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{comment.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button className="flex-1 bg-linear-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Download Document
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm"
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Add Comment
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}