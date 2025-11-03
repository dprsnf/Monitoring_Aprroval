import { JSX } from "react";

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

// ✅ BARU: Interface untuk riwayat versi file (patch)
export interface DocumentVersion {
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

  // ✅ DIPERBARUI: Disesuaikan dengan schema.prisma
  progress: string[]; // Diubah dari string?
  latestVersion: number; // Diubah dari 'version'
  versions: DocumentVersion[]; // Ditambahkan
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

export interface ApiErrorResponse {
  message: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

// Props untuk komponen yang menggunakan Document
export interface DocumentListProps {
  documents: Document[];
  onDetailClick: (document: Document) => void;
  onApproveClick: (document: Document) => void;
  onRejectClick: (document: Document) => void;
  getStatusBadge: (status: Status) => JSX.Element | null;
}

export interface ModalProps {
  selectedDocument: Document | null;
  managementNotes: string;
  setManagementNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}