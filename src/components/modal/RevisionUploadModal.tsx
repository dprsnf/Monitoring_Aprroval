"use client"

import React, { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, X, CheckCircle, MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { Division } from "@/app/types"

interface RevisionUploadModalProps {
  documentId: number
  documentName: string
  isOpen: boolean
  onClose: () => void
  userDivision?: Division
  onSubmitSuccess?: () => void
}

export default function RevisionUploadModal({
  documentId,
  documentName,
  isOpen,
  onClose,
  userDivision,
  onSubmitSuccess,
}: RevisionUploadModalProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <RevisionUploadModalContent {...{ documentId, documentName, isOpen, onClose, userDivision, onSubmitSuccess }} />
  )
}

function RevisionUploadModalContent({
  documentId,
  documentName,
  isOpen,
  onClose,
  userDivision,
  onSubmitSuccess,
}: RevisionUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [action, setAction] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isReviewer = [Division.Dalkon, Division.Engineer, Division.Manager].includes(userDivision!)

  useEffect(() => {
    if (isOpen) {
      api.get(`/documents/${documentId}`)
        .then(res => setStatus(res.data.status))
        .catch(err => console.error("Failed to fetch status:", err))
    }
  }, [isOpen, documentId])

  const canReview = () => {
    if (!status) return false
    if (userDivision === Division.Engineer) {
      return status === "inReviewEngineering" || status === "submitted"
    }
    if (userDivision === Division.Manager) {
      return status === "inReviewManager"
    }
    if (userDivision === Division.Dalkon) {
      return ["submitted", "approved", "approvedWithNotes", "inReviewConsultant", "inReviewManager"].includes(status)
    }
    return false
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      } else {
        alert("Hanya file PDF yang diperbolehkan")
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
      } else {
        alert("Hanya file PDF yang diperbolehkan")
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    // 1. Validasi File
    if (!file) {
      alert("Pilih file PDF terlebih dahulu")
      return
    }

    // 2. Validasi Reviewer
    if (isReviewer) {
      if (!action) {
        alert("Pilih aksi terlebih dahulu")
        return
      }
      if (!canReview()) {
        alert("Dokumen tidak dapat direview saat ini berdasarkan statusnya")
        return
      }
    } else {
      // Validasi Vendor
      if (status !== "returnForCorrection") {
        alert("Hanya dokumen dengan status 'returnForCorrection' yang dapat diresubmit")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      let endpoint = ""

      if (isReviewer) {
        // --- LOGIC UNTUK REVIEWER (DALKON/ENGINEER/MANAGER) ---
        
        // Append data wajib untuk endpoint *-review-upload
        formData.append("action", action)
        if (notes.trim()) {
          formData.append("notes", notes.trim())
        }

        // Mapping Division ke URL prefix yang sesuai di Controller
        const roleMap: Record<Division, string> = {
          [Division.Dalkon]: "dalkon",
          [Division.Engineer]: "engineering", // Perhatikan: di controller pakai 'engineering', bukan 'engineer'
          [Division.Manager]: "manager",
          [Division.Vendor]: "vendor", // Fallback
        }
        
        const role = roleMap[userDivision!] || "dalkon"
        
        // MENGGUNAKAN ENDPOINT BARU YANG ANDA BUAT (Berakhiran -review-upload)
        endpoint = `/documents/${documentId}/${role}-review-upload`
        
      } else {
        // --- LOGIC UNTUK VENDOR ---
        // Menggunakan endpoint vendor-review yang menerima file upload
        // Endpoint /resubmit TIDAK menyimpan file yang diupload!
        formData.append("action", "submit_revision")
        endpoint = `/documents/${documentId}/vendor-review`
      }

      console.log("📤 [RevisionUpload] Submitting to:", endpoint)
      console.log("📤 [RevisionUpload] FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`   - ${key}:`, value instanceof File ? `File(${value.name})` : value)
      }

      // IMPORTANT: Jangan set Content-Type manual untuk FormData!
      // Axios akan set otomatis dengan boundary yang benar
      const response = await api.patch(endpoint, formData, {
        timeout: 120000,
      })

      console.log("✅ [RevisionUpload] Success:", response.data)
      alert(isReviewer ? "Review berhasil disubmit!" : "Revisi berhasil diupload!")
      
      onSubmitSuccess?.()
      onClose()

    } catch (err: any) {
      console.error("❌ [RevisionUpload] Error:", err)
      
      let errorMsg = "Gagal upload file"
      
      if (err.response?.data?.message) {
        // Jika error array (biasanya dari class-validator), ambil yang pertama
        errorMsg = Array.isArray(err.response.data.message) 
          ? err.response.data.message[0] 
          : err.response.data.message
      } else if (err.message) {
        errorMsg = err.message
      }
      
      alert(`Error: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setAction("")
    setNotes("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  const descriptionId = `revision-upload-description-${documentId}`

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" aria-describedby={descriptionId}>
        <div id={descriptionId} className="sr-only">
          Upload file PDF revisi untuk dokumen {documentName}
        </div>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Upload Revisi: {documentName}</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {isReviewer ? "Upload file PDF dan pilih aksi review" : "Upload file PDF yang sudah direvisi"}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-gray-400",
              file && "border-green-500 bg-green-50",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" hidden onChange={handleFileSelect} />

            {!file ? (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">Drag and drop file PDF</p>
                  <p className="text-sm text-gray-600">atau klik untuk memilih file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <p className="font-semibold text-green-900 text-center">{file.name}</p>
                  <p className="text-sm text-green-700 text-center">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="mt-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            )}
          </div>

          {isReviewer && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Pilih Aksi Review</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih aksi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="approveWithNotes">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        Approve with Notes
                      </div>
                    </SelectItem>
                    <SelectItem value="returnForCorrection">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-orange-600" />
                        Return for Correction
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Catatan Reviewer (opsional)
                  </label>
                  <Textarea
                    placeholder="Masukkan catatan... (opsional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-24"
                  />
                </div>
              )}
            </div>
          )}

          {(file || notes || action) && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <p className="text-sm font-semibold text-gray-800">Live Preview</p>
              {file && <p className="text-sm text-gray-700">File: {file.name}</p>}
              {action && (
                <p className="text-sm"><span className="font-semibold">Action:</span> {action}</p>
              )}
              {notes && (
                <div>
                  <p className="text-sm font-semibold text-gray-800">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isSubmitting || (isReviewer && !action) || !status}
            className={cn(
              isReviewer && action === "approve" && "bg-green-600 hover:bg-green-700",
              isReviewer && action === "approveWithNotes" && "bg-blue-600 hover:bg-blue-700",
              isReviewer && action === "returnForCorrection" && "bg-orange-600 hover:bg-orange-700",
              !isReviewer && "bg-blue-600 hover:bg-blue-700",
            )}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isReviewer ? "Submit Review" : "Upload Revisi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}