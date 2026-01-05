"use client";

import { useState, useEffect, useCallback, useMemo, useRef, SetStateAction, Dispatch } from "react";
import {
  Clock,
  CheckCircle,
  Download,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ApiErrorResponse, Division, Document, Status } from "@/app/types";
import Header from "@/components/common/Header";
import StatusBadge from "./StatusBadge";
import DocumentCardSkeleton from "./DocumentCardSkeleton";
import FilterSection from "./FilterSection";
import WorkflowHeader from "./WorkflowHeader";
import { isAxiosError } from "axios";
import ApprovalModal from "@/components/modal/ApprovalModal";
import RejectModal from "@/components/modal/RejectModal";
import ReturnModal from "@/components/modal/ReturnModal"; 
import DalkonDocumentCard from "./DocumentCard";

export default function DocumentReviewPage() {
  const { user: authUser, isLoading: authLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [detailData, setDetailData] = useState<Document | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false); 
  const [showReturnModal, setShowReturnModal] = useState(false); 
  const [managementNotes, setManagementNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "results">("new");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || "Gagal memuat dokumen.");
      } else {
        setError("Terjadi kesalahan yang tidak terduga.");
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

  const closeModals = useCallback(() => {
    setShowDetailModal(false);
    setShowApprovalModal(false);
    setShowRejectModal(false);
    setShowReturnModal(false); // ✅ Tutup modal Return
    setSelectedDocument(null);
    setDetailData(null);
    setManagementNotes("");
    setError(null);
  }, []);

  // === APPROVE: Forward ke Tim Teknis ===
  const handleReviewSubmit = useCallback(
    async (notes: string) => {
      if (!selectedDocument || !currentUser) return;

      try {
        setLoading(true);
        setError(null);

        let endpoint = "";
        let payload: any = { action: "approve", notes };

        if (currentUser.division === Division.Dalkon) {
            // Dalkon punya 3 fase Approve:
            // 1. submitted → Engineer
            // 2. approved/approvedWithNotes → Manager
            // 3. inReviewConsultant → Final Approval
            if (selectedDocument.status === Status.submitted) {
                // Forward ke Engineer
                endpoint = `/documents/${selectedDocument.id}/dalkon-review`;
            } else if (selectedDocument.status === Status.approved || selectedDocument.status === Status.approvedWithNotes) {
                // Forward ke Manager
                endpoint = `/documents/${selectedDocument.id}/dalkon-review`;
            } else if (selectedDocument.status === Status.inReviewConsultant) {
                // ✅ Final Approval (Manager sudah approve, kembali ke Dalkon)
                endpoint = `/documents/${selectedDocument.id}/dalkon-review`;
            } else {
                setError("Dalkon: Dokumen tidak dalam status yang tepat untuk diteruskan.");
                return;
            }
        } else if (currentUser.division === Division.Engineer) {
            // Engineer Approve
          endpoint = `/documents/${selectedDocument.id}/engineering-review`;
          payload = { action: notes.trim() ? "approveWithNotes" : "approve", notes };
        } else if (currentUser.division === Division.Manager) {
            // Manager Approve
          endpoint = `/documents/${selectedDocument.id}/manager-review`;
          payload = { action: "approve", notes };
        }

        if (!endpoint) {
          setError("Aksi tidak diizinkan.");
          return;
        }

        await api.patch(endpoint, payload, {
          timeout: 300000, // 5 minutes for annotation processing
        });

        // ✅ Success message berdasarkan status dokumen
        let successMessage = "Dokumen berhasil diproses.";
        if (currentUser.division === Division.Dalkon) {
          if (selectedDocument.status === Status.submitted) {
            successMessage = "✅ Dokumen berhasil dikirim ke Engineer untuk review teknis.";
          } else if (selectedDocument.status === Status.approved || selectedDocument.status === Status.approvedWithNotes) {
            successMessage = "✅ Dokumen berhasil dikirim ke Manager untuk approval.";
          } else if (selectedDocument.status === Status.inReviewConsultant) {
            successMessage = "🎉 Final Approval berhasil! Dokumen sudah selesai diproses.";
          }
        }
        
        alert(successMessage);
        await loadDocuments();
        closeModals();
      } catch (err: unknown) {
        const msg = isAxiosError<ApiErrorResponse>(err)
          ? err.response?.data?.message ?? "Gagal meneruskan dokumen."
          : "Terjadi kesalahan.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [selectedDocument, currentUser, loadDocuments, closeModals]
  );

  // === RETURN FOR CORRECTION (Semua divisi yang berhak) ===
  const handleReturnSubmit = useCallback(
    async (notes: string) => {
      if (!selectedDocument || !currentUser) return;

      try {
        setLoading(true);
        setError(null);

        let endpoint = "";
        let payload: any = { action: "returnForCorrection", notes };

        if (currentUser.division === Division.Dalkon) {
            // ✅ FIX: Dalkon bisa return dari berbagai status
            // - submitted (dokumen baru dari vendor)
            // - approved/approvedWithNotes (dari Engineer)
            // - inReviewConsultant (dari Manager)
            if (selectedDocument.status === Status.submitted ||
                selectedDocument.status === Status.approved || 
                selectedDocument.status === Status.approvedWithNotes ||
                selectedDocument.status === Status.inReviewConsultant) {
                endpoint = `/documents/${selectedDocument.id}/dalkon-review`;
            } else {
                setError("Dalkon: Dokumen tidak dalam status yang tepat untuk dikembalikan.");
                return;
            }
        } else if (currentUser.division === Division.Engineer) {
          endpoint = `/documents/${selectedDocument.id}/engineering-review`;
        } else if (currentUser.division === Division.Manager) {
          endpoint = `/documents/${selectedDocument.id}/manager-review`;
        } else {
          setError("Aksi pengembalian tidak diizinkan untuk divisi ini.");
          return;
        }

        if (!endpoint) {
          setError("Aksi pengembalian tidak diizinkan.");
          return;
        }

        await api.patch(endpoint, payload, {
          timeout: 300000, // 5 minutes for annotation processing
        });
        await loadDocuments();
        closeModals();
      } catch (err: unknown) {
        const msg = isAxiosError<ApiErrorResponse>(err)
          ? err.response?.data?.message ?? "Gagal mengembalikan dokumen."
          : "Terjadi kesalahan.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [selectedDocument, currentUser, loadDocuments, closeModals]
  );


  // === REJECT (Hanya Dalkon/Submitted) ===
  const handleRejectSubmit = useCallback(
    async (notes: string) => {
      if (
        !selectedDocument ||
        !currentUser ||
        currentUser.division !== Division.Dalkon
      )
        return;

      try {
        setLoading(true);
        setError(null);

        await api.patch(`/documents/${selectedDocument.id}/dalkon-review`, {
          action: "reject",
          notes,
        }, {
          timeout: 300000, // 5 minutes for annotation processing
        });

        alert(`Dokumen "${selectedDocument.name}" berhasil ditolak.`);
        await loadDocuments();
        closeModals();
      } catch (err: unknown) {
        const msg = isAxiosError<ApiErrorResponse>(err)
          ? err.response?.data?.message ?? "Gagal menolak dokumen."
          : "Terjadi kesalahan.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [selectedDocument, currentUser, loadDocuments, closeModals]
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
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || "Gagal memuat detail dokumen.");
      } else {
        setError("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleReviewClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setManagementNotes("");
    setShowApprovalModal(true);
  }, []);

  // ✅ Mengarahkan ke modal Return
  const handleReturnClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setManagementNotes("");
    setShowReturnModal(true);
  }, []);

  // ✅ Mengarahkan ke modal Reject
  const handleRejectClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setManagementNotes("");
    setShowRejectModal(true);
  }, []);

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
        title="Upload Drawing"
        currentUser={authUser}
        backHref="/dashboard"
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
              <DalkonDocumentCard
                key={doc.id}
                document={doc}
                currentUser={currentUser}
                // activeTab={activeTab}
                onDetailClick={handleDetailClick}
                onReviewClick={handleReviewClick}
                onReturnClick={handleReturnClick}
                onRejectClick={handleRejectClick}
              />
            ))
          )}
        </div>
      </main>

      {/* === DETAIL MODAL === */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white p-6 border-b z-10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Document Details</h3>
                <p className="text-sm text-gray-500">{selectedDocument.name}</p>
              </div>
              <Button onClick={closeModals} variant="ghost" size="icon">
                <XCircle className="w-6 h-6 text-gray-400" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {detailLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : detailData ? (
                <div
                  ref={contentRef}
                  className="space-y-6 bg-white p-6 rounded-lg border"
                >
                  <h4 className="text-lg font-bold">Informasi Dokumen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Status:</p>
                      <StatusBadge status={detailData.status} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Submitted By:</p>
                      <p>{detailData.submittedBy?.name}</p>
                    </div>
                    {detailData.contract && (
                      <div>
                        <p className="font-medium text-gray-700">Contract:</p>
                        <p>{detailData.contract.contractNumber}</p>
                      </div>
                    )}
                    {detailData.remarks && (
                      <div>
                        <p className="font-medium text-gray-700">Remarks:</p>
                        <p>{detailData.remarks}</p>
                      </div>
                    )}
                  </div>

                  {detailData.versions && detailData.versions.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700 mb-2">
                        File Versions:
                      </p>
                      <div className="space-y-2">
                        {detailData.versions
                          .sort((a, b) => b.version - a.version)
                          .map((version) => (
                            <div
                              key={version.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                            >
                              <div>
                                <span className="font-medium">
                                  V{version.version}
                                </span>
                                {version.version ===
                                  detailData.latestVersion && (
                                  <Badge className="ml-2 text-xs">Latest</Badge>
                                )}
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    version.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(version.fileUrl, "_blank")
                                }
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-500">Gagal memuat detail dokumen.</p>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
              <Button onClick={closeModals} variant="outline">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === APPROVAL MODAL === */}
      {showApprovalModal && selectedDocument && (
        <ApprovalModal
          selectedDocument={selectedDocument}
          managementNotes={managementNotes}
          setManagementNotes={setManagementNotes as Dispatch<SetStateAction<string>>}
          onClose={closeModals}
          onSubmit={() => handleReviewSubmit(managementNotes)}
          actionType={
            selectedDocument.status === Status.submitted ? "forward" : "approve"
          }
          documentStatus={selectedDocument.status}
        />
      )}

      {/* === REJECT MODAL (Final Rejection) === */}
      {showRejectModal && selectedDocument && (
        <RejectModal
          selectedDocument={selectedDocument}
          managementNotes={managementNotes}
          setManagementNotes={setManagementNotes as Dispatch<SetStateAction<string>>}
          onClose={closeModals}
          onSubmit={() => handleRejectSubmit(managementNotes)} // Langsung panggil reject submit
        />
      )}

      {/* === RETURN MODAL (Return for Correction) === */}
      {showReturnModal && selectedDocument && (
        <ReturnModal
          selectedDocument={selectedDocument}
          managementNotes={managementNotes}
          setManagementNotes={setManagementNotes as Dispatch<SetStateAction<string>>}
          onClose={closeModals}
          onSubmit={() => handleReturnSubmit(managementNotes)} // Langsung panggil return submit
        />
      )}
    </div>
  );
}