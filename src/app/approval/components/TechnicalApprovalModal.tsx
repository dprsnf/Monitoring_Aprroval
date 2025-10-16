import { CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TechnicalApprovalModalProps } from "@/app/types/technicalApproval";

export default function TechnicalApprovalModal({
    selectedDocument,
    notes,
    setNotes,
    onClose,
    onSubmit,
    modalType
}: TechnicalApprovalModalProps) {
    if (!selectedDocument) return null;

    const getModalConfig = () => {
        switch (modalType) {
            case "approve":
                return {
                    title: "Konfirmasi Approval",
                    description: "Apakah Anda yakin ingin meng-approve document ini?",
                    icon: CheckCircle,
                    iconColor: "text-green-500",
                    bgColor: "from-green-50 to-green-100",
                    borderColor: "border-green-200",
                    buttonText: "Ya, Approve Document",
                    buttonColor: "bg-green-600 hover:bg-green-700"
                };
            case "approveWithNotes":
                return {
                    title: "Approve Document with Notes",
                    description: `Approve document: ${selectedDocument.name} with additional notes`,
                    icon: MessageSquare,
                    iconColor: "text-blue-500",
                    bgColor: "from-blue-50 to-blue-100",
                    borderColor: "border-blue-200",
                    buttonText: "Approve with Notes",
                    buttonColor: "bg-blue-600 hover:bg-blue-700"
                };
            case "reject":
                return {
                    title: "Reject Document",
                    description: `Reject document: ${selectedDocument.name}`,
                    icon: XCircle,
                    iconColor: "text-red-500",
                    bgColor: "from-red-50 to-red-100",
                    borderColor: "border-red-200",
                    buttonText: "Reject Document",
                    buttonColor: "bg-red-600 hover:bg-red-700"
                };
            default:
                return {
                    title: "",
                    description: "",
                    icon: CheckCircle,
                    iconColor: "",
                    bgColor: "",
                    borderColor: "",
                    buttonText: "",
                    buttonColor: ""
                };
        }
    };

    const config = getModalConfig();
    const IconComponent = config.icon;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-[500px] bg-gradient-to-br from-white ${config.bgColor} border ${config.borderColor} shadow-xl`}>
                <DialogHeader className={`bg-gradient-to-r ${config.bgColor} rounded-t-lg p-4 -m-6 mb-4`}>
                    <DialogTitle className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${config.iconColor.replace('text-', 'bg-')} rounded-full flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        {config.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-700 mt-2">
                        {config.description}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                    {modalType === "approve" ? (
                        <>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Document Details:</h4>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>File:</strong> {selectedDocument.name}
                                </p>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>Type:</strong> {selectedDocument.documentType || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Status:</strong> {selectedDocument.status}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700">
                                    <strong>⚠️ Perhatian:</strong> Setelah di-approve, document ini akan dikembalikan ke vendor dengan status approved dan tidak dapat diubah lagi.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-gray-900 font-semibold">
                                    {modalType === "approveWithNotes" ? "Approval Notes *" : "Rejection Reason *"}
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder={
                                        modalType === "approveWithNotes" 
                                            ? "Berikan catatan tambahan untuk approval ini (misal: kondisi khusus, rekomendasi, dll)..."
                                            : "Jelaskan alasan penolakan document ini..."
                                    }
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            
                            {modalType === "approveWithNotes" && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-700">
                                        <strong>Info:</strong> Document akan di-approve dengan catatan tambahan yang akan dikirim ke vendor sebagai informasi penting.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <DialogFooter>
                    <Button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700" 
                        onClick={onClose}
                    >
                        {modalType === "approve" ? "Batal" : "Cancel"}
                    </Button>
                    <Button 
                        onClick={onSubmit}
                        disabled={modalType !== "approve" && !notes.trim()}
                        className={`${config.buttonColor} text-white disabled:opacity-50`}
                    >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {config.buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}