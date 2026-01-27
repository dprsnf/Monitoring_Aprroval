"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  VendorData,
  Document,
  Status,
  Division,
  ApiErrorResponse,
} from "@/app/types";
import SearchAndFilter from "@/components/SearchAndFilter";
import VendorCard from "./VendorCard";
import TechnicalApprovalModal from "./TechnicalApprovalModal";
import DetailModal from "@/components/modal/DetailModal";
import Header from "@/components/common/Header";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isAxiosError } from "axios";
import EngineerDocumentCard from "./DocumentCard";

export default function ApprovalPage() {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [vendorList, setVendorList] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const [detailData, setDetailData] = useState<Document | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"new" | "results">("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalWithNotesModal, setShowApprovalWithNotesModal] =
    useState(false);
  const [showConfirmApprovalModal, setShowConfirmApprovalModal] =
    useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalWithNotes, setApprovalWithNotes] = useState("");
  const [, setApiError] = useState("");

  const currentUser = useMemo(() => {
    if (!authUser || !authUser.id) return null;

    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || "User",
      division: authUser.division as Division,
    };
  }, [authUser]);

  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;

    const endpoint = activeTab === "new" ? "/documents" : "/documents/history";
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoint);
      const documents: Document[] = response.data;

      const vendorsMap = new Map<number, VendorData>();

      for (const doc of documents) {
        if (!doc.submittedBy || typeof doc.submittedBy.id === "undefined")
          continue;
        const vendorId = doc.submittedBy.id;

        if (!vendorsMap.has(vendorId)) {
          vendorsMap.set(vendorId, {
            user: doc.submittedBy,
            projectTitle: doc.contract?.contractNumber || "Proyek Umum",
            category: doc.documentType || "Umum",
            priority: "medium", // Default
            reviewDeadline: doc.overallDeadline || "N/A",
            description: `Dokumen yang dikirim oleh ${doc.submittedBy.name}`,
            documents: [],
          });
        }
        vendorsMap.get(vendorId)!.documents.push(doc);
      }

      const groupedVendors = Array.from(vendorsMap.values());
      setVendorList(groupedVendors);
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        const message = err.response?.data?.message || "Gagal memuat dokumen.";
        setApiError(message);
      } else {
        setApiError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadDocuments();
    }
  }, [authLoading, currentUser, loadDocuments, activeTab]);

  // Filter functions
  const filteredVendors = vendorList.filter((vendor) => {
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
      rejected: documents.filter(
        (doc) =>
          doc.status === Status.rejected ||
          doc.status === Status.returnForCorrection
      ).length,
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
    return status
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Event handlers
  const handleVendorClick = (vendor: VendorData) => {
    setSelectedVendor(vendor);
  };

  const handlePreviewDocument = async (document: Document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailData(null);
    setError(null);

    try {
      const response = await api.get(`/documents/${document.id}`);
      setDetailData(response.data);
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        const message =
          err.response?.data?.message ||
          "Gagal memuat detail dokumen. Silahkan tutup dan coba lagi.";
        setApiError(message);
      } else {
        setApiError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      }
    } finally {
      setDetailLoading(false);
    }
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
    setDetailData(null);
    setRejectReason("");
    setApprovalWithNotes("");
    setError(null);
  };

  // ✅ BARU: Handler terpadu untuk mengirim aksi ke backend
  const handleActionSubmit = async (action: string, notes?: string) => {
    if (!selectedDocument || !currentUser) return;

    let endpoint = "";
    if (currentUser.division === Division.Dalkon) {
      endpoint = `/documents/${selectedDocument.id}/dalkon-review`;
    } else if (currentUser.division === Division.Engineer) {
      endpoint = `/documents/${selectedDocument.id}/engineering-review`;
    } else if (currentUser.division === Division.Manager) {
      endpoint = `/documents/${selectedDocument.id}/manager-review`;
    } else {
      setError(
        "Hanya Dalkon, Engineer, atau Manager yang dapat melakukan aksi ini."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.patch(endpoint, { action, notes }, {
        timeout: 300000, // 5 minutes for annotation processing
      });

      alert(`Status dokumen "${selectedDocument.name}" telah diperbarui.`);

      // Muat ulang data DAN kembali ke daftar vendor
      await loadDocuments();
      setSelectedVendor(null); // Kembali ke daftar vendor
      closeModals();
    } catch (err: unknown) {
      const modalIsOpen =
        showConfirmApprovalModal ||
        showApprovalWithNotesModal ||
        showRejectModal;

      if (isAxiosError<ApiErrorResponse>(err)) {
        const message =
          err.response?.data?.message || "Gagal memperbarui dokumen.";
        setApiError(message);

        if (modalIsOpen) {
          setError(message);
        } else {
          alert(message);
        }
      } else {
        const message =
          "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
        setApiError(message);

        if (modalIsOpen) {
          setError(message);
        } else {
          alert(message);
        }
      }

      console.error("Error updating document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApproval = () => {
    handleActionSubmit("approve");
  };

  const handleApprovalWithNotesSubmit = () => {
    if (!approvalWithNotes.trim()) {
      alert("Notes wajib diisi untuk aksi ini.");
      return;
    }
    handleActionSubmit("approveWithNotes", approvalWithNotes);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert("Alasan wajib diisi untuk aksi ini.");
      return;
    }
    // "Reject" di UI kita petakan ke "returnForCorrection" di backend
    handleActionSubmit("returnForCorrection", rejectReason);
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading || (loading && vendorList.length === 0)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please login to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        currentUser={currentUser}
        title={
          selectedDocument
            ? `Review: ${selectedDocument.name}`
            : "Technical Approval Dashboard"
        }
        onBack={
          selectedDocument
            ? () => setSelectedDocument(null)
            : selectedVendor
            ? () => setSelectedVendor(null)
            : undefined
        }
        backHref={!selectedVendor && !selectedDocument ? "/dashboard" : undefined}
        backLabel="Kembali"
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error &&
          !showDetailModal &&
          !showConfirmApprovalModal &&
          !showApprovalWithNotesModal &&
          !showRejectModal && (
            <Alert variant="destructive" className="mb-4 bg-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

        {!selectedVendor ? (
          // Vendor List View
          <>
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Technical Approval Dashboard
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">
                Review dan approve documents dari vendor berdasarkan project
              </p>
            </div>

            {/* ✅ FIX: Mengaktifkan SearchAndFilter */}
            <SearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              activeTab={activeTab}
              setActiveTab={setActiveTab} // Prop ini tidak ada di SearchAndFilter, tapi saya tambahkan di panggilannya
            />

            {/* Vendor Cards */}
            <div className="space-y-4 sm:space-y-6">
              {loading ? (
                <div className="text-center py-8 text-white">Loading...</div>
              ) : filteredVendors.length === 0 ? (
                <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      No vendors found
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Tidak ada vendor yang sesuai dengan kriteria pencarian
                      atau filter.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.user.id}
                    vendor={vendor}
                    onVendorClick={handleVendorClick}
                    getPriorityColor={getPriorityColor}
                    getDocumentCounts={getDocumentCounts}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          // Documents View
          <>
            {/* Documents List */}
            <div className="space-y-4 sm:space-y-6">
              {selectedVendor.documents.map((document) => (
                <EngineerDocumentCard
                  key={document.id}
                  document={document}
                  onApprove={handleApproveDocument}
                  onApproveWithNotes={handleApproveWithNotesDocument}
                  onReject={handleRejectDocument}
                  onPreview={handlePreviewDocument}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  currentUser={currentUser}
                  activeTab={activeTab}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {showConfirmApprovalModal && selectedDocument && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes=""
          setNotes={() => {}}
          onClose={closeModals}
          onSubmit={handleConfirmApproval}
          modalType="approve"
        />
      )}

      {showApprovalWithNotesModal && selectedDocument && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes={approvalWithNotes}
          setNotes={setApprovalWithNotes}
          onClose={closeModals}
          onSubmit={handleApprovalWithNotesSubmit}
          modalType="approveWithNotes"
        />
      )}

      {showRejectModal && selectedDocument && (
        <TechnicalApprovalModal
          selectedDocument={selectedDocument}
          notes={rejectReason}
          setNotes={setRejectReason}
          onClose={closeModals}
          onSubmit={handleRejectSubmit}
          modalType="reject"
        />
      )}

      {showDetailModal && (
        <DetailModal
          selectedDocument={detailData || selectedDocument}
          isLoading={detailLoading}
          onClose={closeModals}
        />
      )}
    </div>
  );
}
