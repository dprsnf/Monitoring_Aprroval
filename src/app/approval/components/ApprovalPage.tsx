"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Import types
import { VendorData } from "@/app/types/technicalApproval";
import { Document, Status, Role, ApprovalType, User } from "@/app/types";
import SearchAndFilter from "@/components/SearchAndFilter";
import VendorCard from "./VendorCard";
import DocumentCard from "./DocumentCard";
import TechnicalApprovalModal from "./TechnicalApprovalModal";
import DetailModal from "@/components/modal/DetailModal";
import TechnicalApprovalHeader from "./TrchnicalApprovalHeader";
import VendorInfoHeader from "./VendorInfoHeader";
import Header from "@/components/common/Header";

// Sample data menggunakan type yang sama dengan schema Prisma
const vendorData: VendorData[] = [
  {
    user: {
      id: 1,
      email: "surya.engineering@example.com",
      name: "PT Surya Engineering",
      role: Role.Vendor,
    },
    projectTitle: "Gardu Induk Cibinong 150kV",
    category: "Electrical",
    priority: "high",
    reviewDeadline: "2024-10-15",
    description:
      "Pembangunan gardu induk 150kV dengan kapasitas 2x60 MVA untuk area Cibinong",
    documents: [
      {
        id: 1,
        name: "SLD_GI_Cibinong_Rev01.pdf",
        filePath: "/documents/sld-gi-cibinong.pdf",
        status: Status.submitted,
        overallDeadline: "2024-10-15T00:00:00.000Z",
        documentType: ApprovalType.protection,
        submittedBy: {
          id: 1,
          email: "surya.engineering@example.com",
          name: "PT Surya Engineering",
          role: Role.Vendor,
        },
        submittedById: 1,
        createdAt: "2024-10-01T00:00:00.000Z",
        updatedAt: "2024-10-01T00:00:00.000Z",
        version: 1,
        approvals: [],
        progress: "In Review",
      },
      {
        id: 2,
        name: "Layout_Plan_GI_Cibinong.pdf",
        filePath: "/documents/layout-plan.pdf",
        status: Status.approved,
        overallDeadline: "2024-10-15T00:00:00.000Z",
        documentType: ApprovalType.civil,
        submittedBy: {
          id: 1,
          email: "surya.engineering@example.com",
          name: "PT Surya Engineering",
          role: Role.Vendor,
        },
        submittedById: 1,
        reviewedBy: {
          id: 2,
          email: "technical@pln.co.id",
          name: "Ahmad Technical Team",
          role: Role.Engineer,
        },
        reviewedById: 2,
        createdAt: "2024-10-01T00:00:00.000Z",
        updatedAt: "2024-10-03T00:00:00.000Z",
        version: 1,
        remarks: "Layout sudah sesuai standar PLN",
        approvals: [
          {
            id: 1,
            documentId: 2,
            type: ApprovalType.civil,
            approvedBy: {
              id: 2,
              email: "technical@pln.co.id",
              name: "Ahmad Technical Team",
              role: Role.Engineer,
            },
            approvedById: 2,
            status: Status.approved,
            notes: "Layout sudah sesuai standar PLN",
            deadline: "2024-10-15T00:00:00.000Z",
            createdAt: "2024-10-03T00:00:00.000Z",
            updatedAt: "2024-10-03T00:00:00.000Z",
          },
        ],
        progress: "Approved",
      },
      {
        id: 3,
        name: "Protection_System_Design.pdf",
        filePath: "/documents/protection-design.pdf",
        status: Status.inReviewEngineering,
        overallDeadline: "2024-10-15T00:00:00.000Z",
        documentType: ApprovalType.protection,
        submittedBy: {
          id: 1,
          email: "surya.engineering@example.com",
          name: "PT Surya Engineering",
          role: Role.Vendor,
        },
        submittedById: 1,
        createdAt: "2024-10-02T00:00:00.000Z",
        updatedAt: "2024-10-02T00:00:00.000Z",
        version: 1,
        approvals: [],
        progress: "In Review",
      },
    ],
  },
  {
    user: {
      id: 3,
      email: "buana.teknik@example.com",
      name: "PT Buana Teknik",
      role: Role.Vendor,
    },
    projectTitle: "Substation Bekasi 70kV",
    category: "Electrical",
    priority: "medium",
    reviewDeadline: "2024-10-12",
    description:
      "Upgrade substation 70kV di area Bekasi dengan penambahan bay baru",
    documents: [
      {
        id: 4,
        name: "SLD_Substation_Bekasi.pdf",
        filePath: "/documents/sld-bekasi.pdf",
        status: Status.approved,
        overallDeadline: "2024-10-12T00:00:00.000Z",
        documentType: ApprovalType.protection,
        submittedBy: {
          id: 3,
          email: "buana.teknik@example.com",
          name: "PT Buana Teknik",
          role: Role.Vendor,
        },
        submittedById: 3,
        reviewedBy: {
          id: 2,
          email: "technical@pln.co.id",
          name: "Citra Technical Team",
          role: Role.Engineer,
        },
        reviewedById: 2,
        createdAt: "2024-09-28T00:00:00.000Z",
        updatedAt: "2024-09-30T00:00:00.000Z",
        version: 1,
        remarks: "Diagram sudah sesuai dengan requirement",
        approvals: [
          {
            id: 2,
            documentId: 4,
            type: ApprovalType.protection,
            approvedBy: {
              id: 2,
              email: "technical@pln.co.id",
              name: "Citra Technical Team",
              role: Role.Engineer,
            },
            approvedById: 2,
            status: Status.approved,
            notes: "Diagram sudah sesuai dengan requirement",
            deadline: "2024-10-12T00:00:00.000Z",
            createdAt: "2024-09-30T00:00:00.000Z",
            updatedAt: "2024-09-30T00:00:00.000Z",
          },
        ],
        progress: "Approved",
      },
    ],
  },
];

const currentUser: User = {
  id: 2,
  email: "technical@pln.co.id",
  name: "Technical Team PLN",
  role: Role.Engineer,
};

export default function ApprovalPage() {
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalWithNotesModal, setShowApprovalWithNotesModal] =
    useState(false);
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] =
    useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalWithNotes, setApprovalWithNotes] = useState("");

  // Filter functions
  const filteredVendors = vendorData.filter((vendor) => {
    const matchesSearch =
      vendor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;

    const hasMatchingDocuments = vendor.documents.some(
      (doc) => doc.status === filterStatus
    );
    return matchesSearch && hasMatchingDocuments;
  });

  // Helper functions
  const getDocumentCounts = (documents: Document[]) => {
    return {
      total: documents.length,
      pending: documents.filter(
        (doc) =>
          doc.status === Status.submitted ||
          doc.status === Status.inReviewConsultant ||
          doc.status === Status.inReviewEngineering ||
          doc.status === Status.inReviewManager
      ).length,
      approved: documents.filter(
        (doc) =>
          doc.status === Status.approved ||
          doc.status === Status.approvedWithNotes
      ).length,
      rejected: documents.filter((doc) => doc.status === Status.rejected)
        .length,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.submitted:
      case Status.inReviewConsultant:
      case Status.inReviewEngineering:
      case Status.inReviewManager:
        return "bg-yellow-100 text-yellow-800";
      case Status.approved:
      case Status.approvedWithNotes:
        return "bg-green-100 text-green-800";
      case Status.rejected:
        return "bg-red-100 text-red-800";
      case Status.returnForCorrection:
        return "bg-orange-100 text-orange-800";
      case Status.overdue:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case Status.submitted:
        return "Submitted";
      case Status.inReviewConsultant:
        return "In Review Consultant";
      case Status.inReviewEngineering:
        return "In Review Engineering";
      case Status.inReviewManager:
        return "In Review Manager";
      case Status.approved:
        return "Approved";
      case Status.approvedWithNotes:
        return "Approved with Notes";
      case Status.returnForCorrection:
        return "Return for Correction";
      case Status.rejected:
        return "Rejected";
      case Status.overdue:
        return "Overdue";
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Electrical":
        return "bg-purple-100 text-purple-800";
      case "Civil":
        return "bg-orange-100 text-orange-800";
      case "Mechanical":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Event handlers
  const handleVendorClick = (vendor: VendorData) => {
    setSelectedVendor(vendor);
  };

  const handleBackToVendors = () => {
    setSelectedVendor(null);
    setSelectedDocument(null);
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
  };

  const handleApproveDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowConfirmApprovalModal(true);
  };

  const handleApproveWithNotesDocument = (document: Document) => {
    setSelectedDocument(document);
    setApprovalWithNotes("");
    setShowApprovalWithNotesModal(true);
  };

  const handleRejectDocument = (document: Document) => {
    setSelectedDocument(document);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeModals = () => {
    setShowConfirmApprovalModal(false);
    setShowApprovalWithNotesModal(false);
    setShowRejectModal(false);
    setShowDetailModal(false);
    setSelectedDocument(null);
    setRejectReason("");
    setApprovalWithNotes("");
  };

  const handleConfirmApproval = () => {
    if (selectedDocument && selectedVendor) {
      const updatedDocuments = selectedVendor.documents.map((doc) =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              status: Status.approved,
              remarks: "Approved by Technical Team PLN",
              updatedAt: new Date().toISOString(),
              reviewedBy: currentUser,
              reviewedById: currentUser.id,
            }
          : doc
      );

      setSelectedVendor({
        ...selectedVendor,
        documents: updatedDocuments,
      });

      closeModals();
    }
  };

  const handleApprovalWithNotesSubmit = () => {
    if (selectedDocument && selectedVendor && approvalWithNotes.trim()) {
      const updatedDocuments = selectedVendor.documents.map((doc) =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              status: Status.approvedWithNotes,
              remarks: approvalWithNotes,
              updatedAt: new Date().toISOString(),
              reviewedBy: currentUser,
              reviewedById: currentUser.id,
            }
          : doc
      );

      setSelectedVendor({
        ...selectedVendor,
        documents: updatedDocuments,
      });

      closeModals();
    }
  };

  const handleRejectSubmit = () => {
    if (selectedDocument && selectedVendor && rejectReason.trim()) {
      const updatedDocuments = selectedVendor.documents.map((doc) =>
        doc.id === selectedDocument.id
          ? {
              ...doc,
              status: Status.rejected,
              remarks: rejectReason,
              updatedAt: new Date().toISOString(),
              reviewedBy: currentUser,
              reviewedById: currentUser.id,
            }
          : doc
      );

      setSelectedVendor({
        ...selectedVendor,
        documents: updatedDocuments,
      });

      closeModals();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        currentUser={currentUser}
        title={
          selectedVendor
            ? `Dokumen: ${selectedVendor.projectTitle}`
            : "Technical Approval Dashboard"
        }
        backHref={selectedVendor ? "" : undefined}
        backLabel={selectedVendor ? "Kembali" : "Dashboard"}
        showLogo={false}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!selectedVendor ? (
          // Vendor List View
          <>
            {/* Page Header */}
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Technical Approval Dashboard
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Review dan approve documents dari vendor berdasarkan project
              </p>
            </div>

            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              activeTab={"results"}
            />

            {/* Vendor Cards */}
            <div className="space-y-4 sm:space-y-6">
              {filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.user.id}
                  vendor={vendor}
                  onVendorClick={handleVendorClick}
                  getPriorityColor={getPriorityColor}
                  getDocumentCounts={getDocumentCounts}
                />
              ))}
            </div>

            {filteredVendors.length === 0 && (
              <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    {/* <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" /> */}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No vendors found
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Tidak ada vendor yang sesuai dengan kriteria pencarian atau
                    filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          // Documents View
          <>
            <VendorInfoHeader
              selectedVendor={selectedVendor}
              getPriorityColor={getPriorityColor}
              getCategoryColor={getCategoryColor}
            />

            {/* Documents List */}
            <div className="space-y-4 sm:space-y-6">
              {selectedVendor.documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onApprove={handleApproveDocument}
                  onApproveWithNotes={handleApproveWithNotesDocument}
                  onReject={handleRejectDocument}
                  onPreview={handlePreviewDocument}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showConfirmApprovalModal && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes=""
          setNotes={() => {}}
          onClose={closeModals}
          onSubmit={handleConfirmApproval}
          modalType="approve"
        />
      )}

      {showApprovalWithNotesModal && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes={approvalWithNotes}
          setNotes={setApprovalWithNotes}
          onClose={closeModals}
          onSubmit={handleApprovalWithNotesSubmit}
          modalType="approveWithNotes"
        />
      )}

      {showRejectModal && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes={rejectReason}
          setNotes={setRejectReason}
          onClose={closeModals}
          onSubmit={handleRejectSubmit}
          modalType="reject"
        />
      )}

      {showDetailModal && selectedDocument && (
        <DetailModal
          selectedDocument={selectedDocument}
          onClose={closeModals}
        />
      )}
    </div>
  );
}
