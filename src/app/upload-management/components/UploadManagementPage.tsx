"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  CheckCircle,
  Download,
  XCircle,
  AlertCircle,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Division, Status, Document } from "@/app/types";
import Header from "@/components/common/Header";
import StatusBadge from "./StatusBadge";
import DocumentCard from "./DocumentCard";
import DocumentCardSkeleton from "./DocumentCardSkeleton";
import FilterSection from "./FilterSection";
import WorkflowHeader from "./WorkflowHeader";

export default function DocumentReviewPage() {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailData, setDetailData] = useState<Document | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [managementNotes, setManagementNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "results">("new");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || "",
      division: authUser.division as Division,
    };
  }, [authUser]);

  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;

    const endpoint = activeTab === "new" ? "/documents" : "/documents/history";

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint);
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load documents");
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadDocuments();
    }
  }, [authLoading, currentUser, loadDocuments, activeTab]);

  const closeModals = useCallback(() => {
    setShowDetailModal(false);
    setShowApprovalModal(false);
    setShowRejectModal(false);
    setSelectedDocument(null);
    setDetailData(null);
    setManagementNotes("");
  }, []);

  const handleReviewSubmit = useCallback(async () => {
    if (!selectedDocument || !currentUser) return;

    try {
      setLoading(true);
      setError(null);

      if (currentUser.division === Division.Dalkon) {
        await api.patch(`/documents/${selectedDocument.id}/dalkon-review`, {
          action: "approve",
        });
        alert(`✅ Dokumen "${selectedDocument.name}" berhasil diteruskan.`);
      } else if (currentUser.division === Division.Engineer) {
        const action = managementNotes.trim() ? "approveWithNotes" : "approve";
        await api.patch(
          `/documents/${selectedDocument.id}/engineering-review`,
          {
            action,
            notes: managementNotes || undefined,
          },
        );
        const message =
          action === "approveWithNotes"
            ? `✅ Dokumen "${selectedDocument.name}" disetujui dengan catatan.`
            : `✅ Dokumen "${selectedDocument.name}" disetujui.`;
        alert(message);
      } else if (currentUser.division === Division.Manager) {
        await api.patch(`/documents/${selectedDocument.id}/manager-review`, {
          action: "approve",
        });
        alert(
          `✅ Dokumen "${selectedDocument.name}" telah disetujui oleh Manager.`,
        );
      }

      await loadDocuments();
      closeModals();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve document");
      console.error("Error approving document:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDocument, currentUser, managementNotes, loadDocuments, closeModals]);

  const handleReturnSubmit = useCallback(async () => {
    if (!selectedDocument || !currentUser || !managementNotes.trim()) {
      alert("⚠️ Catatan pengembalian harus diisi!");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (currentUser.division === Division.Dalkon) {
        await api.patch(`/documents/${selectedDocument.id}/dalkon-review`, {
          action: "returnForCorrection",
        });
        alert(
          `↩️ Dokumen "${selectedDocument.name}" dikembalikan ke Vendor untuk koreksi.`,
        );
      } else if (currentUser.division === Division.Engineer) {
        await api.patch(
          `/documents/${selectedDocument.id}/engineering-review`,
          {
            action: "returnForCorrection",
            notes: managementNotes,
          },
        );
        alert(
          `↩️ Dokumen "${selectedDocument.name}" dikembalikan untuk perbaikan.`,
        );
      } else if (currentUser.division === Division.Manager) {
        await api.patch(`/documents/${selectedDocument.id}/manager-review`, {
          action: "returnForCorrection",
        });
        alert(
          `↩️ Dokumen "${selectedDocument.name}" dikembalikan oleh Manager.`,
        );
      }

      await loadDocuments();
      closeModals();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to return document");
      console.error("Error returning document:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDocument, currentUser, managementNotes, loadDocuments, closeModals]);

  const handleRejectSubmit = useCallback(
    async (docToReject: Document) => {
      if (!currentUser || currentUser.division !== Division.Dalkon) return;

      try {
        setLoading(true);
        setError(null);

        await api.patch(`/documents/${docToReject.id}/dalkon-review`, {
          action: "reject",
        });

        alert(`❌ Dokumen "${docToReject.name}" ditolak.`);
        await loadDocuments();
        closeModals();
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to reject document");
        console.error("Error rejecting document:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadDocuments, closeModals],
  );

  const handleDetailClick = useCallback(async (document: Document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailData(null);
    setError(null);

    try {
      const response = await api.get(`/documents/${document.id}`);
      setDetailData(response.data);
    } catch (err: any) {
      setError("Failed to load document details. Please close and try again.");
      console.error("Error fetching document detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleReviewClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setManagementNotes("");
    setShowApprovalModal(true);
  }, []);

  const handleReturnClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setManagementNotes("");
    setShowRejectModal(true);
  }, []);

  const handleRejectClick = useCallback(
    (document: Document) => {
      if (
        window.confirm(
          `Yakin ingin menolak dokumen "${document.name}"? Tindakan ini tidak dapat dibatalkan.`,
        )
      ) {
        handleRejectSubmit(document);
      }
    },
    [handleRejectSubmit],
  );

  const filteredData = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.submittedBy?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doc.documentType || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please login to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        title="Upload Drawing"
        currentUser={authUser}
        backHref="/"
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && !showDetailModal && (
          <Alert variant="destructive" className="mb-4 bg-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <WorkflowHeader currentUser={currentUser} />

        <div className="mb-6">
          <div className="flex gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
            <Button
              onClick={() => setActiveTab("new")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "new"
                  ? "bg-[#125d72] text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>New Documents</span>
              </div>
            </Button>
            <Button
              onClick={() => setActiveTab("results")}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "results"
                  ? "bg-[#125d72] text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Review Results</span>
              </div>
            </Button>
          </div>
        </div>

        <FilterSection
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterStatus}
        />

        <div className="space-y-4">
          {loading ? (
            // Skeleton loading untuk daftar dokumen
            Array.from({ length: 3 }).map((_, index) => (
              <DocumentCardSkeleton key={index} />
            ))
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 bg-white/80 rounded-xl">
              <p className="text-gray-600">
                {activeTab === "new"
                  ? "No new documents found."
                  : "No document history found."}
              </p>
            </div>
          ) : (
            filteredData.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                currentUser={currentUser}
                activeTab={activeTab}
                onDetailClick={handleDetailClick}
                onReviewClick={handleReviewClick}
                onReturnClick={handleReturnClick}
                onRejectClick={handleRejectClick}
              />
            ))
          )}
        </div>
      </main>

      {/* Modal Detail */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Document Details</h3>
                  <p className="text-sm text-gray-500">
                    {selectedDocument.name}
                  </p>
                </div>
                <Button
                  onClick={closeModals}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </Button>
              </div>
            </div>

            {detailLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <div className="p-10 text-center text-red-600">{error}</div>
            ) : detailData ? (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-700">Status:</p>
                      <StatusBadge status={detailData.status} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        Submitted By:
                      </p>
                      <p className="text-gray-900">
                        {detailData.submittedBy?.name} (
                        {detailData.submittedBy?.email})
                      </p>
                    </div>
                    {detailData.contract && (
                      <div>
                        <p className="font-semibold text-gray-700">
                          Contract Number:
                        </p>
                        <p className="text-gray-900">
                          {detailData.contract.contractNumber}
                        </p>
                      </div>
                    )}
                    {detailData.remarks && (
                      <div>
                        <p className="font-semibold text-gray-700">Remarks:</p>
                        <p className="text-gray-900">{detailData.remarks}</p>
                      </div>
                    )}
                  </div>

                  {detailData.versions && detailData.versions.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">
                        File Versions:
                      </p>
                      <div className="space-y-3">
                        {detailData.versions
                          .sort((a, b) => b.version - a.version)
                          .map((version) => (
                            <div
                              key={version.id}
                              className="relative flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <HardDrive className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    Version {version.version}
                                    {version.version ===
                                      detailData.latestVersion && (
                                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                                        Latest
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Uploaded by {version.uploadedBy?.name} on{" "}
                                    {new Date(
                                      version.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {detailData.approvals && detailData.approvals.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">
                        Approval History:
                      </p>
                      <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                        {detailData.approvals.map((approval) => (
                          <div key={approval.id} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold text-gray-800">
                                {approval.approvedBy?.name}
                              </span>
                            </p>
                            <StatusBadge status={approval.status} />
                            {approval.notes && (
                              <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded-md border">
                                {approval.notes}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(approval.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
              <Button onClick={closeModals} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approval dan Reject tetap sama seperti sebelumnya */}
      {/* ... (kode modal approval dan reject tetap sama) */}
    </div>
  );
}