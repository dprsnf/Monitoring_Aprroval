"use client"

import { Check, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadedFile } from "@/app/types/uploadFIle"

interface UploadedFilesListProps {
  files: UploadedFile[]
  onRemove: (id: string) => void
}

export default function UploadedFilesList({ files, onRemove }: UploadedFilesListProps) {
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("dwg") || type.includes("dxf")) return "📐"
    if (type.includes("image")) return "🖼️"
    return "📁"
  }

  if (files.length === 0) return null

  return (
    <div className="mt-4 sm:mt-6">
      <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
        Uploading Files ({files.length})
      </h4>
      <div className="space-y-2 sm:space-y-3">
        {files.map((file) => (
          <div key={file.id} className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="text-xl sm:text-2xl">{getFileIcon(file.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{file.name}</p>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span>{file.size}</span>
                    <span className="hidden sm:inline">{file.uploadTime}</span>
                    {file.status === "uploading" && file.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-xs">{Math.round(file.progress)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {file.status === "uploading" && (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {file.status === "completed" && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                {file.status === "error" && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemove(file.id)}
                  className="border-red-200 hover:bg-red-50 text-red-600 px-2 py-1"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
