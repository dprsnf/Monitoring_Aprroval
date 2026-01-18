"use client"

import { Eye, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadedFile } from "@/app/types/uploadFIle"

interface FileReviewListProps {
  files: UploadedFile[]
  onPreview: (id: string) => void
  onRemove: (id: string) => void
  onBackToUpload: () => void
  onProceedToSubmit: () => void
}

export default function FileReviewList({
  files,
  onPreview,
  onRemove,
  onBackToUpload,
  onProceedToSubmit,
}: FileReviewListProps) {
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("dwg") || type.includes("dxf")) return "📐"
    if (type.includes("image")) return "🖼️"
    return "📁"
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Review Files Sebelum Submit</h3>
          <p className="text-gray-600 text-sm">
            Review dan preview file yang sudah diupload. Pastikan semua file sudah benar sebelum melanjutkan.
          </p>
        </div>
        {/* <Button
          type="button"
          variant="outline"
          onClick={onBackToUpload}
          className="bg-[#efe62f] border-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Upload More Files</span>
          <span className="sm:hidden">Upload</span>
        </Button> */}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="bg-linear-to-r from-white to-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl sm:text-3xl">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-lg">{file.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium w-fit">
                      File #{index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Size:</span> {file.size}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </div>
                    <div className="hidden sm:block">
                      <span className="font-medium">Uploaded:</span> {file.uploadTime.split(" ")[1]}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-1 text-blue-600 font-semibold">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => onPreview(file.id)}
                  className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md hover:shadow-lg font-medium transition-all duration-200 text-sm px-3 py-2"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onRemove(file.id)}
                  className="bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-md hover:shadow-lg font-medium transition-all duration-200 text-sm px-3 py-2"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-linear-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1 drop-shadow-sm text-sm sm:text-base">
            {files.length} file(s) ready untuk submit
          </h4>
          <p className="text-xs sm:text-sm text-gray-700">Semua file sudah berhasil diupload dan siap untuk direview</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={onProceedToSubmit}
            className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Lanjut ke Submit</span>
            <span className="sm:hidden">Submit</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
