export interface ProgressStep {
  step: number;
  title: string;
  status: "completed" | "current" | "pending";
  completedDate?: string;
  reviewer?: string;
  description?: string;
}

export interface Comment {
  id: string;
  author: string;
  date: string;
  message: string;
  type: "info" | "warning" | "approval" | "rejection";
}

export interface ProgressDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  currentStep: number;
  totalSteps: number;
  status: "in_progress" | "on_revision";
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  progressSteps: ProgressStep[];
  comments: Comment[];
}

export interface VendorProgress {
  id: string;
  vendorName: string;
  company: string;
  projectTitle: string;
  submissionDate: string;
  category: string;
  priority: "high" | "medium" | "low";
  overallProgress: number;
  totalDocuments: number;
  completedDocuments: number;
  inProgressDocuments: number;
  onRevisionDocuments: number;
  estimatedCompletion: string;
  assignedReviewer: string;
  description: string;
  drawings: ProgressDocument[];
}