import { XCircle, FileText, MessageSquare, CheckCircle, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document, Status, ApprovalType } from "@/app/types";

interface DetailModalProps {
    selectedDocument: Document | null;
    onClose: () => void;
}

export default function DetailModal({ selectedDocument, onClose }: DetailModalProps) {
    if (!selectedDocument) return null;

    const getStatusText = (status: Status) => {
        const statusMap = {
            [Status.submitted]: "Submitted",
            [Status.inReviewConsultant]: "In Review Consultant",
            [Status.inReviewEngineering]: "In Review Engineering",
            [Status.inReviewManager]: "In Review Manager",
            [Status.approved]: "Approved",
            [Status.approvedWithNotes]: "Approved with Notes",
            [Status.returnForCorrection]: "Return for Correction",
            [Status.rejected]: "Rejected",
            [Status.overdue]: "Overdue"
        };
        return statusMap[status] || status;
    };

    const getTypeText = (type?: ApprovalType) => {
        if (!type) return "Not Specified";
        return type === ApprovalType.protection ? "Protection" : "Civil";
    };

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">Document Review Detail</h2>
                            <p className="text-blue-100 text-xs sm:text-sm">ID: {selectedDocument.id}</p>
                        </div>
                        {/* <Button 
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/30 text-white border-none p-1.5 sm:p-2"
                        >
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button> */}
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    {/* Document Info */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                            <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                Document Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Document Name</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedDocument.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Document Type</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{getTypeText(selectedDocument.documentType)}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{getStatusText(selectedDocument.status)}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Version</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedDocument.version}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Submitted By</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedDocument.submittedBy.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-600">Submission Date</label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                                        {new Date(selectedDocument.createdAt).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            
                            {selectedDocument.overallDeadline && (
                                <div className="mt-3 sm:mt-4">
                                    <label className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Overall Deadline
                                    </label>
                                    <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                                        {new Date(selectedDocument.overallDeadline).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            )}

                            <div className="mt-3 sm:mt-4">
                                <label className="text-xs sm:text-sm font-medium text-gray-600">Remarks</label>
                                <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
                                    {selectedDocument.remarks || "Tidak ada keterangan tambahan"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contract Information */}
                    {selectedDocument.contract && (
                        <Card className="shadow-lg border border-gray-200">
                            <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                    Contract Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Contract Number</label>
                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedDocument.contract.contractNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Contract Date</label>
                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                                            {new Date(selectedDocument.contract.contractDate).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Review History */}
                    {selectedDocument.reviewedBy && (
                        <Card className="shadow-lg border border-gray-200">
                            <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                    Review History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Reviewed By</label>
                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedDocument.reviewedBy.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Review Date</label>
                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">
                                            {new Date(selectedDocument.updatedAt).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Approval History */}
                    {selectedDocument.approvals.length > 0 && (
                        <Card className="shadow-lg border border-gray-200">
                            <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                    Approval History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 md:p-6">
                                {selectedDocument.approvals.map((approval) => (
                                    <div key={approval.id} className="border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-2">
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Approved By</label>
                                                <p className="text-gray-900 font-semibold text-sm sm:text-base">{approval.approvedBy.name}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                                                <p className="text-gray-900 font-semibold text-sm sm:text-base">{getStatusText(approval.status)}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Deadline</label>
                                                <p className="text-gray-900 font-semibold text-sm sm:text-base">
                                                    {new Date(approval.deadline).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Date</label>
                                                <p className="text-gray-900 font-semibold text-sm sm:text-base">
                                                    {new Date(approval.createdAt).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        {approval.notes && (
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Notes</label>
                                                <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded text-xs sm:text-sm">{approval.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                        <Button 
                            onClick={onClose}
                            variant="outline" 
                            className="border-gray-300 text-gray-700 hover:cursor-pointer text-sm sm:text-base py-2"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}