import { Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModalProps, ApprovalType, Status } from "@/app/types";

export default function ApprovalModal({
    selectedDocument,
    managementNotes,
    setManagementNotes,
    onClose,
    onSubmit
}: ModalProps) {
    if (!selectedDocument) return null;

    const getNextReviewTeam = (documentType?: ApprovalType) => {
        if (documentType === ApprovalType.protection) {
            return "Tim Engineering (Protection)";
        } else if (documentType === ApprovalType.civil) {
            return "Tim Consultant (Civil)";
        }
        return "Tim Teknis";
    };

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold">Forward to Technical Review Team</h2>
                    <p className="text-green-100 text-xs sm:text-sm">Document ID: {selectedDocument.id}</p>
                </div>
                <div className="p-3 sm:p-4 md:p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-1">Review Process</h4>
                        <p className="text-blue-700 text-sm">
                            📄 Dokumen akan diteruskan ke {getNextReviewTeam(selectedDocument.documentType)} untuk review teknis mendalam
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{selectedDocument.name}</h3>
                        <p className="text-gray-600 text-sm">Vendor: {selectedDocument.submittedBy.name}</p>
                        <p className="text-gray-600 text-sm">Document Type: {selectedDocument.documentType || "Not specified"}</p>
                        <p className="text-gray-600 text-sm">Next Review: {getNextReviewTeam(selectedDocument.documentType)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan untuk Tim Teknis *
                        </label>
                        <Textarea
                            value={managementNotes}
                            onChange={(e) => setManagementNotes(e.target.value)}
                            placeholder="Berikan catatan untuk tim teknis (contoh: dokumen sudah dicek kelengkapan, perhatian khusus pada bagian tertentu, dll)..."
                            rows={4}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Status dokumen akan berubah menjadi "In Review" sesuai dengan tipe dokumen
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
                            className="bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white disabled:opacity-50"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Teruskan ke Review Teknis
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}