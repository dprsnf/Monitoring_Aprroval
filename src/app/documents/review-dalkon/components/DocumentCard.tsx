import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Send,
  Undo2,
  XCircle,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Document, Division, Status } from "@/app/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { encodeDocumentId } from "@/lib/idCodec";

interface DalkonDocumentCardProps {
  document: Document;
  currentUser: { division: Division } | null;
  onDetailClick: (doc: Document) => void;
  onReviewClick: (doc: Document) => void;
  onReturnClick: (doc: Document) => void;
  onRejectClick?: (doc: Document) => void;
}

export default function DalkonDocumentCard({
  document: doc,
  currentUser,
  onDetailClick,
  onReviewClick,
  onReturnClick,
  onRejectClick,
}: DalkonDocumentCardProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleOpenPage = () => {
    const data = {
      documentId: doc.id,
      documentName: doc.name,
      userDivision: currentUser?.division,
      initialAction: null,
    };
    sessionStorage.setItem("documentReviewData", JSON.stringify(data));
    const encodedId = encodeDocumentId(doc.id);
    router.push(`/documents/review/${encodedId}`);
  };

  const isDalkon = currentUser?.division === Division.Dalkon;
  const isEngineer = currentUser?.division === Division.Engineer;
  const isManager = currentUser?.division === Division.Manager;

  // Cek apakah dokumen sudah final approved
  // Final approved = Status approved + reviewed by Dalkon (setelah Manager approve)
  // Flow: Manager approve → inReviewConsultant → Dalkon final approve → approved
  const isFinalApproved = 
    doc.status === Status.approved && 
    doc.reviewedBy?.division === Division.Dalkon;

  // SAFETY CHECK: Jika status approved tapi tidak punya reviewedBy data,
  // anggap sebagai final approved untuk mencegah tampil tombol yang salah
  const isApprovedWithoutReviewer = 
    doc.status === Status.approved && !doc.reviewedBy;

  // DEBUG: Log untuk membantu troubleshoot
  if (doc.status === Status.approved) {
    console.log('📄 Approved Document Debug:', {
      name: doc.name,
      status: doc.status,
      reviewedBy: doc.reviewedBy,
      isFinalApproved,
      isApprovedWithoutReviewer,
    });
  }

  // FIXED: Dalkon dapat forward di 4 tahap:
  // 1. submitted → Engineer
  // 2. approved (dari Engineer) → Manager  
  // 3. inReviewConsultant (Manager sudah approve) → Final approval
  // KECUALI: Jika sudah final approved atau tidak ada data reviewer, jangan tampilkan tombol
  const canForward =
    !isFinalApproved && 
    !isApprovedWithoutReviewer && (
      (isDalkon &&
        (doc.status === Status.submitted ||         // Kirim ke Engineer
         doc.status === Status.approved ||          // Kirim ke Manager
         doc.status === Status.approvedWithNotes || // Kirim ke Manager (with notes)
         doc.status === Status.inReviewConsultant)) || // ✅ TAMBAH: Final approval (dari Manager)
      (isEngineer && doc.status === Status.inReviewEngineering) ||
      (isManager && doc.status === Status.inReviewManager)
    );

  const canReturnToVendor =
    !isFinalApproved && 
    !isApprovedWithoutReviewer && // ✅ Safety check
    isDalkon &&
    (doc.status === Status.submitted ||
     doc.status === Status.approved ||
     doc.status === Status.approvedWithNotes ||
     doc.status === Status.inReviewConsultant); // ✅ Dalkon bisa return di semua tahap kecuali yang sudah selesai

  const canRequestReturn =
    (isEngineer && doc.status === Status.inReviewEngineering) ||
    (isManager && doc.status === Status.inReviewManager);

  // ✅ Helper function untuk menentukan label tombol
  const getForwardButtonLabel = () => {
    if (isDalkon) {
      if (doc.status === Status.submitted) {
        return "Kirim ke Engineer";
      } else if (doc.status === Status.approved || doc.status === Status.approvedWithNotes) {
        return "Kirim ke Manager";
      } else if (doc.status === Status.inReviewConsultant) {
        return "🎉 Final Approval"; // ✅ Manager sudah approve, Dalkon final
      }
    } else if (isEngineer) {
      return "Approve";
    } else if (isManager) {
      return "Approve";
    }
    return "Forward";
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      console.log("📥 Downloading document:", doc.id);
      
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
        timeout: 120000, // 2 minutes timeout untuk file besar
      });
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.name.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
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
  };

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900">{doc.name}</h3>
              <Badge variant="secondary">{doc.status}</Badge>
              
              {/* 🔍 DEBUG BADGE: Tampilkan info reviewer untuk approved documents */}
              {doc.status === Status.approved && (
                <Badge 
                  variant="outline" 
                  className={
                    isFinalApproved 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }
                >
                  {doc.reviewedBy 
                    ? `✓ By ${doc.reviewedBy.division}` 
                    : "⚠️ No Reviewer Data"}
                </Badge>
              )}
              
              {doc.returnRequestedBy &&
                doc.status === Status.returnForCorrection && (
                  <Badge variant="destructive">
                    Return oleh: {doc.returnRequestedBy}
                  </Badge>
                )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Vendor: <strong>{doc.submittedBy?.name}</strong>
              </p>
              <p>
                Type: <strong>{doc.documentType || "-"}</strong>
              </p>
              {doc.contract?.contractNumber && (
                <p>
                  Contract: <strong>{doc.contract.contractNumber}</strong>
                </p>
              )}
              {doc.contract?.contractDate && (
                <p>
                  Contract Date: <strong>{new Date(doc.contract.contractDate).toLocaleDateString("id-ID")}</strong>
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

          <div className="flex flex-col gap-3 min-w-55">
            {/* ✅ Jika final approved, hanya tampilkan Preview & Download */}
            {isFinalApproved ? (
              <>
                <Button
                  onClick={handleOpenPage}
                  className="bg-[#125d72] hover:bg-[#14a2ba]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
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

                <Button onClick={() => onDetailClick(doc)} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Detail
                </Button>
              </>
            ) : (
              <>
                {/* Tombol lengkap untuk dokumen yang masih dalam proses */}
                <Button
                  onClick={handleOpenPage}
                  className="bg-[#125d72] hover:bg-[#14a2ba]"
                >
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

                <Button onClick={() => onDetailClick(doc)} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Detail
                </Button>

                {canForward && (
                  <Button
                    onClick={() => onReviewClick(doc)}
                    className={
                      isDalkon && doc.status === Status.inReviewConsultant
                        ? "bg-emerald-600 hover:bg-emerald-700" // ✅ Final approval = emerald
                        : "bg-green-600 hover:bg-green-700"    // Regular approve = green
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {getForwardButtonLabel()}
                  </Button>
                )}

                {canReturnToVendor && (
                  <Button
                    onClick={() => onReturnClick(doc)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    {doc.status === Status.submitted
                      ? "Return ke Vendor"
                      : "Batalkan & Return"}
                  </Button>
                )}

                {canRequestReturn && (
                  <Button
                    onClick={() => onReturnClick(doc)}
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Minta Dikembalikan
                  </Button>
                )}

                {onRejectClick && isDalkon && doc.status === Status.submitted && (
                  <Button
                    onClick={() => onRejectClick(doc)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Permanen
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}