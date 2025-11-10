export enum Division {
  Dalkon = "Dalkon",
  Engineering = "Engineering",
  Manager = "Manager",
  Vendor = "Vendor",
}

export interface User {
  id: number;
  name: string;
  email: string;
  division: Division;
}

export interface Approval {
  id: number;
  status: "inReviewEngineering" | "returnForCorrection" | "approved" | "approvedWithNotes" | "rejected";
  notes?: string;
  createdAt: string;
  approvedBy?: User;
}

export interface Version {
  id: number;
  version: number;
  createdAt: string;
  approvals?: Approval[];
}

export interface Document {
  id: number;
  name: string;
  documentType: "protection" | "civil";
  createdAt: string;
  submittedBy: User;
  contract?: {
    contractNumber: string;
  };
  versions: Version[];
  approvals?: Approval[];
}

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