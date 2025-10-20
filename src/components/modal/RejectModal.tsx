import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModalProps } from "@/app/types";

export default function RejectModal({
    selectedDocument,
    managementNotes,
    setManagementNotes,
    onClose,
    onSubmit
}: ModalProps) {
    if (!selectedDocument) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold">Return Document for Correction</h2>
                    <p className="text-red-100 text-xs sm:text-sm">Document ID: {selectedDocument.id}</p>
                </div>
                <div className="p-3 sm:p-4 md:p-6 space-y-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-1">Return Process</h4>
                        <p className="text-red-700 text-sm">
                            ❌ Dokumen akan dikembalikan ke vendor dengan status &quot;Return for Correction&quot; untuk perbaikan dan resubmission
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{selectedDocument.name}</h3>
                        <p className="text-gray-600 text-sm">Vendor: {selectedDocument.submittedBy.name}</p>
                        <p className="text-gray-600 text-sm">Document Type: {selectedDocument.documentType || "Not specified"}</p>
                        <p className="text-gray-600 text-sm">Version: {selectedDocument.version}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alasan Pengembalian dan Petunjuk Perbaikan *
                        </label>
                        <Textarea
                            value={managementNotes}
                            onChange={(e) => setManagementNotes(e.target.value)}
                            placeholder="Berikan alasan pengembalian yang jelas dan petunjuk perbaikan untuk vendor (contoh: dokumen tidak lengkap, perlu revisi teknis, dll)..."
                            rows={4}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Catatan: Dokumen akan berstatus &quot;Return for Correction&quot; dan vendor dapat mengajukan revisi
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
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 hover:cursor-pointer"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Kembalikan untuk Koreksi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}