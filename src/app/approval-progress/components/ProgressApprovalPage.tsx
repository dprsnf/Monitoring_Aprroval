"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Header from "@/components/common/Header";
import ProgressStatsCard from "./ProgressStatsCard";
import ProgressSearchFilter from "./ProgressSearchFilter";
import ProgressVendorCard from "./ProgressVendorCard";
import ProgressVendorModal from "./ProgressVendorModal";
import ProgressDocumentModal from "./ProgressDocumentModal";

import { Building, PlayCircle, AlertCircle, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Document } from "@/app/types/documentTypes";
import { Division } from "@/app/types";
import { VendorProgress, ProgressDocument, ProgressStep, Comment } from "@/app/types/progressTypes";
import { useAuth } from "@/context/AuthContext";

export default function ProgressApprovalPage() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorProgress | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ProgressDocument | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [progressData, setProgressData] = useState<VendorProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tunggu auth selesai
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect ke login jika tidak ada user
      window.location.href = "/auth/login";
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Document[]>("/documents");

        // FILTER BERDASARKAN ROLE
        const isVendor = user.division === Division.Vendor;
        const filteredDocs = isVendor
          ? data.filter((doc) => doc.submittedBy.id === user.id)
          : data;

        const mapped: VendorProgress[] = filteredDocs.map((doc) => {
          const versions = doc.versions || [];
          const totalDocs = 1; // Hitung per dokumen, bukan per version

          // Calculate progress based on document status
          const getDocumentProgress = (status: string) => {
            switch (status) {
              case "submitted":
                return 10; // Baru submit
              case "inReviewEngineering":
                return 35; // Sedang di review Engineer
              case "approved":
              case "approvedWithNotes":
                return 60; // Approved by Engineer
              case "inReviewManager":
                return 80; // Sedang di review Manager
              case "inReviewConsultant":
                return 95; // Sedang di review Consultant/Dalkon final
              case "returnForCorrection":
                return 5; // Dikembalikan untuk revisi
              case "rejected":
                return 0; // Ditolak
              default:
                return 0;
            }
          };

          const currentProgress = getDocumentProgress(doc.status || "submitted");
          const isCompleted = doc.status === "approved" || doc.status === "approvedWithNotes";
          const isInProgress = !isCompleted && doc.status !== "returnForCorrection" && doc.status !== "rejected";
          const isOnRevision = doc.returnRequestedBy !== null;

          return {
            id: `VP-${doc.id}`,
            vendorName: doc.submittedBy?.name || "Unknown",
            company: doc.submittedBy?.email?.split("@")[0] || "Unknown",
            projectTitle: doc.name,
            submissionDate: doc.createdAt,
            category: doc.documentType === "protection" ? "Protection" : "Civil",
            priority: "high" as const,
            overallProgress: currentProgress,
            totalDocuments: totalDocs,
            completedDocuments: isCompleted ? 1 : 0,
            inProgressDocuments: isInProgress ? 1 : 0,
            onRevisionDocuments: isOnRevision ? 1 : 0,
            onHoldDocuments: 0,
            estimatedCompletion: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            assignedReviewer:
              doc.approvals?.[0]?.approvedBy?.name || "Belum Ditugaskan",
            description: `Dokumen ${doc.documentType} untuk kontrak ${
              doc.contract?.contractNumber || "N/A"
            }`,
            drawings: versions.map((v): ProgressDocument => {
              const isOnRevision = doc.returnRequestedBy !== null && doc.returnRequestedBy !== undefined;
              
              // Determine current step based on document status
              let currentStep = 1;
              let stepStatus: "completed" | "current" | "pending" = "current";
              
              switch (doc.status) {
                case "submitted":
                  currentStep = 1;
                  stepStatus = "current";
                  break;
                case "inReviewEngineering":
                  currentStep = 2;
                  stepStatus = "current";
                  break;
                case "approved":
                case "approvedWithNotes":
                  currentStep = 3;
                  stepStatus = "current";
                  break;
                case "inReviewManager":
                  currentStep = 3;
                  stepStatus = "current";
                  break;
                case "inReviewConsultant":
                  currentStep = 4;
                  stepStatus = "current";
                  break;
                case "returnForCorrection":
                  currentStep = 1;
                  stepStatus = "pending";
                  break;
                default:
                  currentStep = 1;
                  stepStatus = "current";
              }

              const progressSteps: ProgressStep[] = [
                {
                  step: 1,
                  title: "Document Upload",
                  status: currentStep > 1 ? "completed" : currentStep === 1 ? stepStatus : "pending",
                  completedDate: doc.createdAt,
                  reviewer: doc.submittedBy?.name,
                  description: isOnRevision ? "Perlu revisi" : undefined,
                },
                {
                  step: 2,
                  title: "Engineering Review",
                  status: currentStep > 2 ? "completed" : currentStep === 2 ? stepStatus : "pending",
                  reviewer: doc.status === "inReviewEngineering" || currentStep > 2 ? doc.reviewedBy?.name : undefined,
                  completedDate: currentStep > 2 ? doc.updatedAt : undefined,
                },
                {
                  step: 3,
                  title: "Manager Review",
                  status: currentStep > 3 ? "completed" : currentStep === 3 ? stepStatus : "pending",
                  reviewer: doc.status === "inReviewManager" || currentStep > 3 ? doc.reviewedBy?.name : undefined,
                  completedDate: currentStep > 3 ? doc.updatedAt : undefined,
                },
                {
                  step: 4,
                  title: "Final Approval",
                  status: currentStep >= 4 ? stepStatus : "pending",
                  reviewer: doc.status === "inReviewConsultant" ? doc.reviewedBy?.name : undefined,
                  completedDate: doc.status === "approved" ? doc.updatedAt : undefined,
                },
              ];

              // Get comments from progress array
              const comments: Comment[] = (doc.progress || []).map((p: string, index: number) => ({
                id: `c-${doc.id}-${index}`,
                author: "System",
                date: doc.updatedAt || doc.createdAt,
                message: p,
                type: (p.includes("Returned") || p.includes("return") ? "warning" : "info") as "info" | "warning",
              }));

              return {
                id: `DOC-${v.id}`,
                fileName: `${doc.name}_v${v.version}.pdf`,
                fileType: "PDF",
                fileSize: "0 MB",
                uploadDate: v.createdAt,
                currentStep,
                totalSteps: 4,
                status: isOnRevision ? "on_revision" : "in_progress",
                description: `Status: ${doc.status}`,
                category: doc.documentType === "protection" ? "Protection" : "Civil",
                priority: "high",
                progressSteps,
                comments,
              };
            }),
          };
        });

        setProgressData(mapped);
      } catch (err: any) {
        setError(err.response?.data?.message || "Gagal memuat progress");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]); // Re-fetch saat user berubah

  console.log("Progress Data:", progressData);

  const filteredData = progressData.filter((v) => {
    const matchesSearch =
      v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "in_progress" && v.inProgressDocuments > 0) ||
      (filterStatus === "on_revision" && v.onRevisionDocuments > 0);
    return matchesSearch && matchesFilter;
  });

  const total = filteredData.length;
  const inProgress = filteredData.filter((v) => v.inProgressDocuments > 0).length;
  const onRevision = filteredData.filter((v) => v.onRevisionDocuments > 0).length;

  // Loading dari auth atau API
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
        <Header
          currentUser={user}
          title="Progress"
          backHref="/dashboard"
          backLabel="Dashboard"
          onLogout={logout}
        />
        <main className="p-8">
          <Card>
            <CardContent className="p-12 text-center animate-pulse">
              Loading...
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
        <Header
          currentUser={user}
          title="Progress"
          backHref="/dashboard"
          backLabel="Dashboard"
          onLogout={logout}
        />
        <main className="p-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        currentUser={user}
        title="Progress Approval System"
        backHref="/dashboard"
        backLabel="Dashboard"
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <ProgressStatsCard
            icon={Building}
            iconColor="text-[#14a2ba]"
            bgColor="bg-linear-to-br from-blue-100 to-blue-50"
            label="Total Projects"
            value={total}
          />
          <ProgressStatsCard
            icon={PlayCircle}
            iconColor="text-blue-600"
            bgColor="bg-linear-to-br from-blue-100 to-blue-50"
            label="In Progress"
            value={inProgress}
          />
          <ProgressStatsCard
            icon={AlertCircle}
            iconColor="text-yellow-600"
            bgColor="bg-linear-to-br from-yellow-100 to-yellow-50"
            label="On Revision"
            value={onRevision}
          />
        </div>

        <ProgressSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {filteredData.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 lg:gap-6">
            {filteredData.map((v) => (
              <ProgressVendorCard
                key={v.id}
                vendor={v}
                onViewDetails={() => {
                  setSelectedVendor(v);
                  setShowVendorModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-md">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user?.division === Division.Vendor
                  ? "No Submissions Yet"
                  : "No Active Progress"}
              </h3>
              <p className="text-gray-600">
                {user?.division === Division.Vendor
                  ? "Anda belum mengirim dokumen."
                  : "Tidak ada dokumen yang sedang diproses."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <ProgressVendorModal
        open={showVendorModal}
        onOpenChange={setShowVendorModal}
        vendor={selectedVendor}
        onDocumentClick={(doc) => {
          setSelectedDocument(doc as ProgressDocument);
          setShowDocumentModal(true);
        }}
      />
      <ProgressDocumentModal
        open={showDocumentModal}
        onOpenChange={setShowDocumentModal}
        document={selectedDocument}
      />
    </div>
  );
}