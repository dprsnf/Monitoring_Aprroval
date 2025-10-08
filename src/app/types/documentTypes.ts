export interface HistoryDocument {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadDate: string;
    status: "approved" | "rejected" | "under_review" | "pending";
    reviewNotes?: string;
    reviewDate?: string;
    reviewedBy?: string;
    description: string;
    category: string;
    priority: "high" | "medium" | "low";
}

export interface VendorHistory {
    id: string;
    vendorName: string;
    company: string;
    projectTitle: string;
    submissionDate: string;
    category: string;
    priority: "high" | "medium" | "low";
    finalStatus: "approved" | "rejected" | "under_review" | "pending";
    totalDocuments: number;
    approvedDocuments: number;
    rejectedDocuments: number;
    pendingDocuments: number;
    completionDate?: string;
    reviewer?: string;
    drawings: HistoryDocument[];
    description: string;
}