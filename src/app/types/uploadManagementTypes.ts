export interface UploadManagementItem {
    id: string;
    projectTitle: string;
    submittedBy: string;
    submissionDate: string;
    category: string;
    status: "pending_review" | "approved_for_approval" | "rejected" | "in_approval" | "final_approved" | "final_rejected";
    files: number;
    description: string;
    managementReviewer?: string;
    managementDate?: string;
    managementNotes?: string;
    approvalStatus?: string;
    approvalDate?: string;
    approvalReviewer?: string;
    approvalNotes?: string;
}

export interface ModalProps {
    selectedItem: UploadManagementItem | null;
    managementNotes: string;
    setManagementNotes: (notes: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}