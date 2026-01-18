"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Download, FileText, CheckCircle, Send, Loader2 } from "lucide-react"
import { type Document, Division } from "@/app/types"
import api from "@/lib/axios"
import RevisionUploadModal from "@/components/modal/RevisionUploadModal"
import { encodeDocumentId } from "@/lib/idCodec"

interface ManagerDocumentCardProps {
  document: Document
  onRefresh: () => void
}

export default function ManagerDocumentCard({ document: doc, onRefresh }: ManagerDocumentCardProps) {
  const router = useRouter();
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "returnForCorrection" | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleOpenPage = () => {
    const data = {
      documentId: doc.id,
      documentName: doc.name,
      userDivision: Division.Manager,
      initialAction: null,
    };
    sessionStorage.setItem("documentReviewData", JSON.stringify(data));
    const encodedId = encodeDocumentId(doc.id);
    router.push(`/documents/review/${encodedId}`);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      console.log("📥 Downloading document:", doc.id);
      
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
        timeout: 120000, // 2 minutes timeout untuk file besar
      })
      
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${doc.name.replace(/[^a-z0-9]/gi, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log("✅ Download successful");
    } catch (error: any) {
      console.error("❌ Download error:", error);
      
      let errorMessage = "Gagal mendownload file.";
      if (error.response?.status === 404) {
        errorMessage = "File tidak ditemukan di server.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Timeout - File terlalu besar atau koneksi lambat.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`ERROR DOWNLOAD!\n\n${errorMessage}\n\nSilakan coba lagi atau hubungi admin.`);
    } finally {
      setIsDownloading(false);
    }
  }

  const handleOpenActionModal = (type: "approve" | "returnForCorrection") => {
    setActionType(type)
    setNotes("")
    setShowActionModal(true)
  }

  const handleSubmitAction = async () => {
    if (!actionType) return

    // Validasi notes untuk return for correction
    if (actionType === "returnForCorrection" && !notes.trim()) {
      alert("Notes wajib diisi untuk Return for Correction")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("action", actionType)
      
      if (notes.trim()) {
        formData.append("notes", notes.trim())
      }

      await api.patch(`/documents/${doc.id}/manager-review`, formData, {
        timeout: 300000,
      })

      let successMessage = "Dokumen berhasil diproses!"
      if (actionType === "approve") {
        successMessage = "Dokumen berhasil diapprove! Menunggu final approval dari Dalkon."
      } else if (actionType === "returnForCorrection") {
        successMessage = "Dokumen berhasil dikembalikan ke Vendor untuk perbaikan."
      }

      alert(successMessage)
      setShowActionModal(false)
      onRefresh()
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || "Gagal memproses dokumen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getActionModalConfig = () => {
    if (actionType === "approve") {
      return {
        title: "Approve Dokumen",
        description: "Anda akan menyetujui dokumen ini. Status akan tetap di 'Manager Review' dan menunggu final approval dari Dalkon.",
        buttonText: "Approve",
        buttonClass: "bg-green-600 hover:bg-green-700",
        icon: <CheckCircle className="w-5 h-5" />,
        notesRequired: false,
        notesPlaceholder: "Catatan tambahan (opsional)...",
      }
    } else if (actionType === "returnForCorrection") {
      return {
        title: "Return for Correction",
        description: "Dokumen akan dikembalikan ke Vendor untuk perbaikan. Jelaskan revisi yang diperlukan.",
        buttonText: "Return ke Vendor",
        buttonClass: "bg-orange-600 hover:bg-orange-700",
        icon: <Send className="w-5 h-5" />,
        notesRequired: true,
        notesPlaceholder: "Jelaskan revisi yang diperlukan (wajib)...",
      }
    }
    return null
  }

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {/* Left Section - Document Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{doc.name}</h3>
              <Badge variant="secondary">{doc.status}</Badge>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Vendor: <strong>{doc.submittedBy?.name || "-"}</strong>
              </p>
              <p>
                Type: <strong>{doc.documentType || "-"}</strong>
              </p>
              {doc.contract && (
                <p>
                  Contract: <strong>{doc.contract.contractNumber}</strong>
                </p>
              )}
              <p className="text-xs mt-2 text-gray-500">
                Update: {new Date(doc.updatedAt).toLocaleDateString("id-ID")}
              </p>
            </div>

            {doc.progress?.length && (
              <p className="mt-4 text-sm italic text-gray-700 border-l-4 border-cyan-500 pl-3">
                "{doc.progress[doc.progress.length - 1]}"
              </p>
            )}
          </div>

          {/* Right Section - Actions */}
          <div className="flex flex-col gap-3 min-w-55">
            <Button onClick={handleOpenPage} className="bg-[#125d72] hover:bg-[#14a2ba]">
              <Eye className="w-4 h-4 mr-2" />
              Preview & Coret
            </Button>

            <Button 
              onClick={handleDownload} 
              variant="outline"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>

            <Button onClick={() => setShowRevisionModal(true)} className="bg-cyan-600 hover:bg-cyan-700">
              <FileText className="w-4 h-4 mr-2" />
              Review & Upload
            </Button>

            <div className="border-t pt-3 mt-2">
              <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions:</p>
              <Button 
                onClick={() => handleOpenActionModal("approve")} 
                className="w-full mb-2 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>

              <Button 
                onClick={() => handleOpenActionModal("returnForCorrection")} 
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Return for Correction
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRevisionModal && (
        <RevisionUploadModal
          documentId={doc.id}
          documentName={doc.name}
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          userDivision={Division.Manager}
          onSubmitSuccess={() => {
            setShowRevisionModal(false)
            onRefresh()
          }}
        />
      )}

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getActionModalConfig()?.icon}
              {getActionModalConfig()?.title}
            </DialogTitle>
            <DialogDescription>
              {getActionModalConfig()?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Dokumen:</p>
              <p className="text-sm text-gray-600">{doc.name}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Notes {getActionModalConfig()?.notesRequired && <span className="text-red-500">*</span>}
              </label>
              <Textarea
                placeholder={getActionModalConfig()?.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />
              {getActionModalConfig()?.notesRequired && !notes.trim() && (
                <p className="text-xs text-orange-600 mt-1">
                  Notes wajib diisi untuk action ini
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowActionModal(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmitAction}
              disabled={
                isSubmitting ||
                (getActionModalConfig()?.notesRequired && !notes.trim())
              }
              className={getActionModalConfig()?.buttonClass}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {getActionModalConfig()?.icon}
                  <span className="ml-2">{getActionModalConfig()?.buttonText}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
