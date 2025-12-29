import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Send,
  Undo2,
  XCircle,
  Download,
  FileText,
} from "lucide-react";
import { Document, Division, Status } from "@/app/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

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

  const handleOpenPage = () => {
    const data = {
      documentId: doc.id,
      documentName: doc.name,
      userDivision: currentUser?.division,
      initialAction: null,
    };
    sessionStorage.setItem("documentReviewData", JSON.stringify(data));
    router.push(`/documents/review/${doc.id}`);
  };

  const isDalkon = currentUser?.division === Division.Dalkon;
  const isEngineer = currentUser?.division === Division.Engineer;
  const isManager = currentUser?.division === Division.Manager;

  const canForward =
    (isDalkon &&
      (doc.status === Status.submitted ||
        doc.status === Status.approved ||
        doc.status === Status.approvedWithNotes)) ||
    (isEngineer && doc.status === Status.inReviewEngineering) ||
    (isManager && doc.status === Status.inReviewManager);

  const canReturnToVendor =
    isDalkon &&
    (doc.status === Status.submitted ||
     doc.status === Status.approved ||
     doc.status === Status.approvedWithNotes);

  const canRequestReturn =
    (isEngineer && doc.status === Status.inReviewEngineering) ||
    (isManager && doc.status === Status.inReviewManager);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/documents/${doc.id}/file`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.name.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal download file.");
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

          <div className="flex flex-col gap-3 min-w-[220px]">
            <Button
              onClick={handleOpenPage}
              className="bg-[#125d72] hover:bg-[#14a2ba]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview & Coret
            </Button>

            <Button onClick={handleDownload} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button onClick={() => onDetailClick(doc)} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Detail
            </Button>

            {canForward && (
              <Button
                onClick={() => onReviewClick(doc)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isDalkon
                  ? doc.status === Status.submitted
                    ? "Kirim ke Engineer"
                    : "Kirim ke Manager"
                  : isEngineer
                  ? "Approve"
                  : "Final Approve"}
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
                  : "Batalkan Approval"}
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
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Permanen
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}