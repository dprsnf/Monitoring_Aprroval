import { Send, CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModalProps, ApprovalType} from "@/app/types";

interface ExtendedModalProps extends ModalProps {
    actionType?: "approve" | "approveWithNotes" | "returnForCorrection" | "reject" | "forward" | "finalApproval";
    status?: string;
}

export default function ApprovalModal({
    selectedDocument,
    managementNotes,
    setManagementNotes,
    onClose,
    onSubmit,
    actionType = "forward",
    status
}: ExtendedModalProps) {
    if (!selectedDocument) return null;

    const getNextReviewTeam = (documentType?: ApprovalType) => {
        if (documentType === ApprovalType.protection) {
            return "Tim Engineering (Protection)";
        } else if (documentType === ApprovalType.civil) {
            return "Tim Engineering (Civil)";
        }
        return "Tim Teknis";
    };

    // Konfigurasi untuk setiap action type
    const getModalConfig = () => {
        switch (actionType) {
            case "approve":
                // ✅ Cek apakah ini final approval berdasarkan status
                // Final approval = dokumen sudah di-approve Manager, kembali ke Dalkon untuk final
                const isFinalApproval = status === "inReviewConsultant";
                
                if (isFinalApproval) {
                    return {
                        title: "🎉 Final Approval",
                        bgColor: "from-emerald-600 to-emerald-700",
                        textColor: "text-emerald-100",
                        icon: <CheckCircle className="w-5 h-5" />,
                        iconColor: "text-emerald-500",
                        description: "✨ Ini adalah approval terakhir. Setelah approved, dokumen akan selesai diproses dan tidak bisa diubah lagi.",
                        notePlaceholder: "Catatan final approval (opsional)...\n\nContoh:\n- Semua persyaratan telah terpenuhi\n- Dokumen telah melalui semua tahap review\n- Dokumen disetujui untuk implementasi",
                        buttonText: "Final Approval - Selesaikan Proses",
                        buttonBg: "bg-emerald-600 hover:bg-emerald-700",
                        infoText: "✅ Dokumen akan berstatus APPROVED dan proses selesai.",
                        isRequired: false,
                    };
                }
                
                return {
                    title: "✅ Approve Dokumen",
                    bgColor: "from-green-600 to-green-700",
                    textColor: "text-green-100",
                    icon: <CheckCircle className="w-5 h-5" />,
                    iconColor: "text-green-500",
                    description: "📋 Dokumen akan disetujui dan dilanjutkan ke tahap berikutnya dalam proses review.",
                    notePlaceholder: "Tambahkan catatan approval (opsional)...",
                    buttonText: status === "approved" || status === "approvedWithNotes" 
                        ? "Kirim ke Manager" 
                        : "Approve Dokumen",
                    buttonBg: "bg-green-600 hover:bg-green-700",
                    infoText: "Status dokumen akan diupdate setelah approval.",
                    isRequired: false,
                };

            case "approveWithNotes":
                return {
                    title: "📝 Approve dengan Catatan",
                    bgColor: "from-blue-600 to-blue-700",
                    textColor: "text-blue-100",
                    icon: <MessageSquare className="w-5 h-5" />,
                    iconColor: "text-blue-500",
                    description: "✍️ Dokumen disetujui dengan catatan tambahan yang perlu diperhatikan untuk tahap selanjutnya.",
                    notePlaceholder: "Tulis catatan penting yang perlu diperhatikan (wajib diisi)...",
                    buttonText: "Approve dengan Catatan",
                    buttonBg: "bg-blue-600 hover:bg-blue-700",
                    infoText: "Catatan akan diteruskan ke reviewer berikutnya.",
                    isRequired: true,
                };

            case "returnForCorrection":
                return {
                    title: "🔄 Return for Correction",
                    bgColor: "from-orange-600 to-orange-700",
                    textColor: "text-orange-100",
                    icon: <Send className="w-5 h-5" />,
                    iconColor: "text-orange-500",
                    description: "⚠️ Dokumen akan dikembalikan ke Vendor untuk dilakukan perbaikan sesuai dengan catatan yang diberikan.",
                    notePlaceholder: "Jelaskan detail revisi yang diperlukan (wajib diisi)...\n\nContoh:\n- Perbaiki halaman 3 bagian perhitungan struktur\n- Lengkapi data teknis pada lampiran B\n- Revisi gambar detail sesuai spesifikasi terbaru",
                    buttonText: "Kembalikan untuk Revisi",
                    buttonBg: "bg-orange-600 hover:bg-orange-700",
                    infoText: "⚠️ Vendor harus melakukan resubmit setelah perbaikan.",
                    isRequired: true,
                };

            case "reject":
                return {
                    title: "❌ Reject Dokumen",
                    bgColor: "from-red-600 to-red-700",
                    textColor: "text-red-100",
                    icon: <XCircle className="w-5 h-5" />,
                    iconColor: "text-red-500",
                    description: "🚫 Dokumen akan ditolak secara permanen. Tindakan ini tidak dapat dibatalkan dan dokumen tidak akan diproses lebih lanjut.",
                    notePlaceholder: "Jelaskan alasan penolakan dokumen (wajib diisi)...\n\nContoh:\n- Dokumen tidak sesuai spesifikasi kontrak\n- Format dokumen tidak sesuai standar\n- Dokumen tidak lengkap dan tidak memenuhi persyaratan minimum",
                    buttonText: "Reject Dokumen",
                    buttonBg: "bg-red-600 hover:bg-red-700",
                    infoText: "⚠️ PERHATIAN: Dokumen yang di-reject tidak dapat diresubmit.",
                    isRequired: true,
                };

            case "finalApproval":
                return {
                    title: "🎉 Final Approval",
                    bgColor: "from-emerald-600 to-emerald-700",
                    textColor: "text-emerald-100",
                    icon: <CheckCircle className="w-5 h-5" />,
                    iconColor: "text-emerald-500",
                    description: "✨ Ini adalah approval terakhir. Setelah approved, dokumen akan selesai diproses dan tidak bisa diubah lagi.",
                    notePlaceholder: "Catatan final approval (opsional)...\n\nContoh:\n- Semua persyaratan telah terpenuhi\n- Dokumen telah melalui semua tahap review\n- Dokumen disetujui untuk implementasi",
                    buttonText: "Final Approval - Selesaikan Proses",
                    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
                    infoText: "✅ Dokumen akan berstatus APPROVED dan proses selesai.",
                    isRequired: false,
                };

            case "forward":
            default:
                return {
                    title: "📤 Forward to Technical Review",
                    bgColor: "from-green-600 to-green-700",
                    textColor: "text-green-100",
                    icon: <Send className="w-5 h-5" />,
                    iconColor: "text-green-500",
                    description: `📄 Dokumen akan diteruskan ke ${getNextReviewTeam(selectedDocument.documentType)} untuk review teknis mendalam.`,
                    notePlaceholder: "Berikan catatan untuk tim teknis (wajib)...\n\nContoh:\n- Dokumen sudah dicek kelengkapan\n- Perhatian khusus pada bagian struktur\n- Review detail perhitungan teknis",
                    buttonText: `Teruskan ke ${getNextReviewTeam(selectedDocument.documentType)}`,
                    buttonBg: "bg-green-600 hover:bg-green-700",
                    infoText: "Status dokumen akan berubah menjadi 'In Review' sesuai dengan tipe dokumen.",
                    isRequired: true,
                };
        }
    };

    const config = getModalConfig();

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className={`bg-linear-to-r ${config.bgColor} text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-lg">
                            {config.icon}
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg md:text-xl font-bold">{config.title}</h2>
                            <p className={`${config.textColor} text-xs sm:text-sm`}>Document: {selectedDocument.name}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-6 space-y-4">
                    <div className={`p-4 rounded-lg border ${
                        actionType === 'reject' ? 'bg-red-50 border-red-200' :
                        actionType === 'returnForCorrection' ? 'bg-orange-50 border-orange-200' :
                        actionType === 'finalApproval' ? 'bg-emerald-50 border-emerald-200' :
                        actionType === 'approveWithNotes' ? 'bg-blue-50 border-blue-200' :
                        'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={config.iconColor}>
                                {config.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Informasi Proses</h4>
                                <p className="text-gray-700 text-sm">
                                    {config.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Detail Dokumen</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600 font-medium">📄 Nama Dokumen:</p>
                                <p className="text-gray-900">{selectedDocument.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">👤 Vendor:</p>
                                <p className="text-gray-900">{selectedDocument.submittedBy.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">📋 Tipe Dokumen:</p>
                                <p className="text-gray-900">{selectedDocument.documentType || "Not specified"}</p>
                            </div>
                            {status && (
                                <div>
                                    <p className="text-gray-600 font-medium">🔄 Status Saat Ini:</p>
                                    <p className="text-gray-900">{status}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {actionType === 'returnForCorrection' ? '📝 Detail Revisi yang Diperlukan' : 
                             actionType === 'reject' ? '❌ Alasan Penolakan' :
                             actionType === 'approveWithNotes' ? '📝 Catatan Approval' :
                             actionType === 'finalApproval' ? '✅ Catatan Final' :
                             '💬 Catatan'}
                            {config.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <Textarea
                            value={managementNotes}
                            onChange={(e) => setManagementNotes(e.target.value)}
                            placeholder={config.notePlaceholder}
                            rows={actionType === 'returnForCorrection' || actionType === 'reject' ? 6 : 4}
                            className="w-full font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {config.infoText}
                        </p>
                        {config.isRequired && !managementNotes.trim() && (
                            <p className="text-xs text-red-600 mt-1 font-semibold">
                                ⚠️ Catatan wajib diisi untuk melanjutkan proses ini
                            </p>
                        )}
                    </div>
                </div>

                <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                        <Button 
                            onClick={onClose}
                            variant="outline"
                            className="border-gray-300 text-gray-700 "
                        >
                            ❌ Cancel
                        </Button>
                        <Button 
                            onClick={onSubmit}
                            disabled={config.isRequired && !managementNotes.trim()}
                            className={`${config.buttonBg} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {config.icon}
                            <span className="ml-2">{config.buttonText}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}