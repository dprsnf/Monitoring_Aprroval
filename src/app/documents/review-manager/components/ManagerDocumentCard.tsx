"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, FileText } from "lucide-react"
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
    try {
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
      })
      const blob = new Blob([res.data], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${doc.name.replace(/[^a-z0-9]/gi, "_")}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert("Gagal download file.")
    }
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
          <div className="flex flex-col gap-3 min-w-[220px]">
            <Button onClick={handleOpenPage} className="bg-[#125d72] hover:bg-[#14a2ba]">
              <Eye className="w-4 h-4 mr-2" />
              Preview & Coret
            </Button>

            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button onClick={() => setShowRevisionModal(true)} className="bg-green-600 hover:bg-green-700">
              <FileText className="w-4 h-4 mr-2" />
              Review & Upload
            </Button>
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
    </>
  )
}
