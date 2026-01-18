import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Mendefinisikan interface yang diperlukan
interface Document {
  id: number;
  name: string;
  submittedBy: { name: string };
  documentType?: string;
  latestVersion: number;
}

interface ReturnModalProps {
  selectedDocument: Document | null;
  managementNotes: string;
  setManagementNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void; // Aksi submit sudah pasti Return for Correction
}

export default function ReturnModal({
  selectedDocument,
  managementNotes,
  setManagementNotes,
  onClose,
  onSubmit,
}: ReturnModalProps) {
  if (!selectedDocument) return null;

  const title = "Return Document for Correction";
  const subTitleColor = "from-orange-600 to-orange-700";
  const processText =
    "↩️ Dokumen akan dikembalikan ke vendor dengan status 'Return for Correction' untuk perbaikan dan resubmission.";
  const buttonText = "Kembalikan untuk Koreksi";

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full">
        <div
          className={cn(
            `bg-linear-to-r ${subTitleColor} text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl`
          )}
        >
          <h2 className="text-base sm:text-lg md:text-xl font-bold">{title}</h2>
          <p className="text-white/80 text-xs sm:text-sm">
            Document ID: {selectedDocument.id}
          </p>
        </div>
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          <div className="p-3 rounded-lg border bg-orange-50 border-orange-200">
            <h4 className="font-semibold mb-1 text-orange-900">
              Aksi: {title}
            </h4>
            <p className="text-orange-700 text-sm">{processText}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedDocument.name}
            </h3>
            <p className="text-gray-600 text-sm">
              Vendor: {selectedDocument.submittedBy?.name}
            </p>
            <p className="text-gray-600 text-sm">
              Document Type: {selectedDocument.documentType || "Not specified"}
            </p>
            <p className="text-gray-600 text-sm">
              Version: {selectedDocument.latestVersion}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alasan Pengembalian dan Petunjuk Perbaikan *
            </label>
            <Textarea
              value={managementNotes}
              onChange={(e) => setManagementNotes(e.target.value)}
              placeholder="Berikan alasan pengembalian yang jelas dan petunjuk perbaikan (contoh: dokumen tidak lengkap, perlu revisi teknis, dll)..."
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Catatan ini akan dikirimkan kepada vendor.
            </p>
          </div>
        </div>
        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!managementNotes.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 hover:cursor-pointer"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
