import { Division } from "@/app/types"
import { User, FileText, CheckCircle, Download, ArrowRight } from "lucide-react"

interface WorkflowHeaderProps {
  currentUser: { division: Division } | null
}

export default function WorkflowHeader({ currentUser }: WorkflowHeaderProps) {
  return (
    <div className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-linear-to-br from-[#125d72] to-[#14a2ba] rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentUser?.division === Division.Dalkon && "Document Review Center"}
            {currentUser?.division === Division.Engineer && "Engineering Review"}
            {currentUser?.division === Division.Manager && "Manager Review Center"}
          </h2>
          <p className="text-sm text-[#125d72] font-medium">
            {currentUser?.division === Division.Dalkon &&
              "Review dokumen dari vendor sebelum dikirim ke tim teknis"}
            {currentUser?.division === Division.Engineer &&
              "Review teknis dokumen dari Dalkon"}
            {currentUser?.division === Division.Manager &&
              "Final review dan approval"}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-[#125d72] font-medium">
            <User className="w-4 h-4" />
            <span>Vendor</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div
            className={`flex items-center gap-1 font-semibold ${
              currentUser?.division === Division.Dalkon
                ? "text-blue-600"
                : "text-[#125d72]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dalkon</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div
            className={`flex items-center gap-1 font-semibold ${
              currentUser?.division === Division.Engineer
                ? "text-blue-600"
                : "text-[#125d72]"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Engineer</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div
            className={`flex items-center gap-1 font-medium ${
              currentUser?.division === Division.Manager
                ? "text-blue-600"
                : "text-[#125d72]"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Manager</span>
          </div>
        </div>
      </div>
    </div>
  )
}