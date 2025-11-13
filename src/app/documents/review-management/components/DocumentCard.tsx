import { Document, Division, Status } from "@/app/types"
import { Button } from "@/components/ui/button"
import StatusBadge from "./StatusBadge"
import { Eye, ThumbsUp, Send, XCircle } from "lucide-react"

interface DocumentCardProps {
  doc: Document
  currentUser: { division: Division } | null
  activeTab: "new" | "results"
  onDetailClick: (doc: Document) => void
  onReviewClick: (doc: Document) => void
  onReturnClick: (doc: Document) => void
  // onRejectClick: (doc: Document) => void
}

export default function DocumentCard({
  doc,
  currentUser,
  activeTab,
  onDetailClick,
  onReviewClick,
  onReturnClick,
  // onRejectClick,
}: DocumentCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div className="flex-1 mb-4 sm:mb-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
            <StatusBadge status={doc.status} />
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Vendor:</span>{" "}
              {doc.submittedBy?.name}
            </p>
            <p>
              <span className="font-medium">Type:</span>{" "}
              {doc.documentType?.toUpperCase()}
            </p>
            {doc.contract && (
              <p>
                <span className="font-medium">Contract:</span>{" "}
                {doc.contract.contractNumber}
              </p>
            )}
            {doc.overallDeadline && (
              <p>
                <span className="font-medium">Deadline:</span>{" "}
                {new Date(doc.overallDeadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Button
            onClick={() => onDetailClick(doc)}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Eye className="w-4 h-4 mr-2" />
            Detail
          </Button>
          {activeTab === "new" && (
            <>
              {currentUser?.division === Division.Dalkon &&
                (doc.status === Status.submitted ||
                  doc.status === Status.approvedWithNotes) && (
                  <Button
                    onClick={() => onReviewClick(doc)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {doc.status === Status.submitted
                      ? "Forward to Engineer"
                      : "Forward to Manager"}
                  </Button>
                )}

              {currentUser?.division === Division.Engineer &&
                doc.status === Status.inReviewEngineering && (
                  <Button
                    onClick={() => onReviewClick(doc)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}

              {currentUser?.division === Division.Manager &&
                doc.status === Status.inReviewManager && (
                  <Button
                    onClick={() => onReviewClick(doc)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}

              <Button
                onClick={() => onReturnClick(doc)}
                size="sm"
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-600 whitespace-nowrap"
              >
                <Send className="w-4 h-4 mr-2" />
                Return
              </Button>

              {/* {currentUser?.division === Division.Dalkon &&
                doc.status === Status.submitted && (
                  <Button
                    onClick={() => onRejectClick(doc)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600 whitespace-nowrap"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                )} */}
            </>
          )}
        </div>
      </div>
    </div>
  )
}