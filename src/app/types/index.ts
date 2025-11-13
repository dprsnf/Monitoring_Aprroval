export enum Division {
  Manager = "Manager",
  Dalkon = "Dalkon",
  Engineer = "Engineer",
  Vendor = "Vendor",
}

export enum Status {
  submitted = "submitted",
  inReviewConsultant = "inReviewConsultant",
  inReviewEngineering = "inReviewEngineering",
  inReviewManager = "inReviewManager",
  approved = "approved",
  approvedWithNotes = "approvedWithNotes",
  returnForCorrection = "returnForCorrection",
  rejected = "rejected",
  overdue = "overdue",
}

export enum ApprovalType {
  protection = "protection",
  civil = "civil",
}

export interface User {
  id?: number;
  email: string;
  name: string;
  division: Division;
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractDate: string;
}

export interface DocumentVersion {
  fileUrl: string;
  id: string;
  filePath: string;
  version: number;
  createdAt: string;
  uploadedBy: {
    id: number;
    name: string;
  };
}

export interface Document {
  id: number;
  name: string;
  filePath: string;
  status: Status;
  overallDeadline?: string;
  documentType?: ApprovalType;
  contract?: Contract;
  contractId?: string;
  submittedBy: User;
  submittedById: number;
  reviewedBy?: User;
  reviewedById?: number;
  createdAt: string;
  updatedAt: string;
  remarks?: string;
  approvals: Approval[];

  progress: string[]; 
  latestVersion: number; 
  versions: DocumentVersion[]; 
}

export interface Approval {
  id: number;
  documentId: number;
  type: ApprovalType;
  approvedBy: User;
  approvedById: number;
  status: Status;
  notes?: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorData {
  user: User;
  projectTitle: string; // Akan diisi dengan nomor kontrak atau info lain
  category: string;
  priority: string;
  reviewDeadline: string;
  description: string;
  documents: Document[];
}

export interface ApiErrorResponse {
  message: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

export interface TechnicalApprovalModalProps {
  selectedDocument: Document | null;
  notes: string;
  setNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  modalType: "approve" | "approveWithNotes" | "reject"; // reject akan jadi 'return'
}

export interface ModalProps {
  selectedDocument: Document;
  managementNotes: string;
  setManagementNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void; 
}

export interface DetailModalProps {
  selectedDocument: Document | null;
  isLoading: boolean;
  onClose: () => void;
}