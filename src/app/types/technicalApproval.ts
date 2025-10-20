import { Document, User} from "./index";

export interface VendorData {
  user: User;
  documents: Document[];
  projectTitle: string;
  category: string;
  priority: "high" | "medium" | "low";
  reviewDeadline: string;
  description: string;
}

export interface TechnicalApprovalModalProps {
  selectedDocument: Document | null;
  notes: string;
  setNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  modalType: "approve" | "approveWithNotes" | "reject";
}