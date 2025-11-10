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
          const totalDocs = versions.length;

          const completed = versions.filter((v) =>
            v.approvals?.some(
              (a) => a.status === "approved" || a.status === "approvedWithNotes"
            )
          ).length;

          const inProgress = versions.filter(
            (v) =>
              !v.approvals?.length ||
              v.approvals[0]?.status === "inReviewEngineering"
          ).length;

          const onHold = versions.filter(
            (v) => v.approvals?.[0]?.status === "returnForCorrection"
          ).length;

          return {
            id: `VP-${doc.id}`,
            vendorName: doc.submittedBy?.name || "Unknown",
            company: doc.submittedBy?.email?.split("@")[0] || "Unknown",
            projectTitle: doc.name,
            submissionDate: doc.createdAt,
            category: doc.documentType === "protection" ? "Protection" : "Civil",
            priority: "high" as const,
            overallProgress:
              totalDocs > 0
                ? Math.round(((completed + inProgress * 0.5) / totalDocs) * 100)
                : 0,
            totalDocuments: totalDocs,
            completedDocuments: completed,
            inProgressDocuments: inProgress,
            onHoldDocuments: onHold,
            estimatedCompletion: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            assignedReviewer:
              doc.approvals?.[0]?.approvedBy?.name || "Belum Ditugaskan",
            description: `Dokumen ${doc.documentType} untuk kontrak ${
              doc.contract?.contractNumber || "N/A"
            }`,
            drawings: versions.map((v): ProgressDocument => {
              const approval = v.approvals?.[0] ?? null;
              const isOnHold = approval?.status === "returnForCorrection";
              const currentStep = approval
                ? (approval.status === "inReviewEngineering" || isOnHold ? 2 : 1)
                : 1;

              const progressSteps: ProgressStep[] = [
                {
                  step: 1,
                  title: "Document Upload",
                  status: "completed",
                  completedDate: v.createdAt,
                  reviewer: "System",
                },
                {
                  step: 2,
                  title: "Initial Review",
                  status: approval ? "current" : "pending",
                  reviewer: approval?.approvedBy?.name,
                  description: isOnHold ? "Perlu revisi" : undefined,
                },
                {
                  step: 3,
                  title: "Technical Validation",
                  status: "pending",
                },
                {
                  step: 4,
                  title: "Final Approval",
                  status: "pending",
                },
              ];

              const comments: Comment[] = (v.approvals ?? []).map((a) => ({
                id: `c-${a.id}`,
                author: a.approvedBy?.name ?? "Unknown",
                date: a.createdAt,
                message: a.notes ?? "Tidak ada catatan",
                type: (a.status === "returnForCorrection"
                  ? "warning"
                  : "info") as "info" | "warning",
              }));

              return {
                id: `DOC-${v.id}`,
                fileName: `${doc.name}_v${v.version}.pdf`,
                fileType: "PDF",
                fileSize: "0 MB",
                uploadDate: v.createdAt,
                currentStep,
                totalSteps: 4,
                status: isOnHold ? "on_hold" : "in_progress",
                description: `Versi ${v.version}`,
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

  const filteredData = progressData.filter((v) => {
    const matchesSearch =
      v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "in_progress" && v.inProgressDocuments > 0) ||
      (filterStatus === "on_hold" && v.onHoldDocuments > 0);
    return matchesSearch && matchesFilter;
  });

  const total = filteredData.length;
  const inProgress = filteredData.filter((v) => v.inProgressDocuments > 0).length;
  const onHold = filteredData.filter((v) => v.onHoldDocuments > 0).length;

  // Loading dari auth atau API
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
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
      <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
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
    <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
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
            bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
            label="Total Projects"
            value={total}
          />
          <ProgressStatsCard
            icon={PlayCircle}
            iconColor="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
            label="In Progress"
            value={inProgress}
          />
          <ProgressStatsCard
            icon={AlertCircle}
            iconColor="text-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-100 to-yellow-50"
            label="On Hold"
            value={onHold}
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