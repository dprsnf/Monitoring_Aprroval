"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectInfoForm from "@/components/ProjectInfoForm"
import FileDropzone from "@/components/file/FileDropZone"
import UploadedFilesList from "@/components/file/UploadFileList"
import FileReviewList from "@/components/FileReviewList"
import AdditionalNotes from "@/components/AdditionalNotes"
import SubmitSection from "@/components/SubmitSection"
import type { UploadedFile, UploadFormData } from "@/app/types/uploadFIle"
import Header from "@/components/common/Header"
import { Role } from "@/app/types"

export default function VendorUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showReviewStep, setShowReviewStep] = useState(false)
  const submitSectionRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<UploadFormData>({
    projectTitle: "",
    category: "",
    noContract: "",
    notes: "",
    contractDate: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Upload logic
  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return
    setIsUploading(true)

    files.forEach((file, index) => {
      const fileId = `file-${Date.now()}-${index}`
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || getFileTypeFromExtension(file.name),
        uploadTime: new Date().toLocaleString(),
        status: "uploading",
        progress: 0,
      }

      setUploadedFiles((prev) => [...prev, newFile])

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 100) {
          clearInterval(interval)
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "completed", progress: 100 } : f)),
          )
          setIsUploading(false)
          // Auto go to review once all files complete
          if (
            [...uploadedFiles, { ...newFile, progress: 100, status: "completed" }].every(
              (f) => f.status === "completed",
            )
          ) {
            setTimeout(() => setShowReviewStep(true), 800)
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f)),
          )
        }
      }, 500)
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (uploadedFiles.length === 1) setShowReviewStep(false)
  }

  const handlePreviewFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file) {
      alert(
        `Preview file: ${file.name}\n\nNote: Ini adalah simulasi preview. Dalam implementasi nyata, file akan dibuka di viewer atau tab baru.`,
      )
    }
  }

  const goBackToUpload = () => setShowReviewStep(false)

  const proceedToSubmit = () => {
    const allCompleted = uploadedFiles.every((file) => file.status === "completed")
    if (!allCompleted) {
      alert("Pastikan semua file sudah berhasil diupload sebelum melanjutkan.")
      return
    }
    setShowReviewStep(false)
    submitSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    console.log("Uploaded Files:", uploadedFiles)

    alert("Drawing berhasil disubmit untuk review!")

    setFormData({
      projectTitle: "",
      category: "",
      noContract: "",
      notes: "",
      contractDate: "",
    })
    setUploadedFiles([])
    setShowReviewStep(false)
  }

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      <Header title="Upload Drawing" currentUser={{
              id: 0,
              email: "",
              name: "",
              role: Role.Manager
          }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Drawing Teknis</h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Upload dan submit drawing teknis untuk review dan approval PLN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <CardHeader className="px-6 py-4 border-b border-gray-300">
              <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">Informasi Proyek</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <ProjectInfoForm formData={formData} onChange={(e) => handleInputChange(e)} />
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <CardHeader className="px-6 py-4 border-b border-gray-300">
              <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">Upload Drawing Files</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!showReviewStep ? (
                <>
                  <FileDropzone
                    isDragOver={isDragOver}
                    setIsDragOver={setIsDragOver}
                    onFilesSelected={handleFilesSelected}
                  />

                  <UploadedFilesList files={uploadedFiles} onRemove={removeFile} />

                  {uploadedFiles.length > 0 && uploadedFiles.every((f) => f.status === "completed") && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                            {uploadedFiles.length} file(s) berhasil diupload!
                          </h4>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Klik "Review Files" untuk melihat preview dan melanjutkan ke submit
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowReviewStep(true)}
                          className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-md"
                        >
                          Review Files
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <FileReviewList
                  files={uploadedFiles}
                  onPreview={handlePreviewFile}
                  onRemove={removeFile}
                  onBackToUpload={goBackToUpload}
                  onProceedToSubmit={proceedToSubmit}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <div className="border-b border-gray-300 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-black font-semibold text-base sm:text-lg drop-shadow-sm">Catatan Tambahan</h3>
            </div>
            <CardContent className="p-4 sm:p-6">
              <AdditionalNotes notes={formData.notes} onChange={(e) => handleInputChange(e)} />
            </CardContent>
          </Card>

          <Card
            ref={submitSectionRef}
            className="shadow-xl border border-white/30 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm"
            data-submit-section
          >
            <CardContent className="p-4 sm:p-6">
              <SubmitSection canSubmit={showReviewStep && uploadedFiles.length > 0 && !isUploading} />
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}

// Helpers
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function getFileTypeFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "pdf":
      return "application/pdf"
    case "dwg":
      return "application/dwg"
    case "dxf":
      return "application/dxf"
    case "png":
    case "jpg":
    case "jpeg":
      return "image"
    default:
      return "application/octet-stream"
  }
}
