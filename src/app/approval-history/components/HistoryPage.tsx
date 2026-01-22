"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { VendorHistory, HistoryDocument } from "@/app/types/documentTypes";

import HistoryStatsCard from "./HistoryStatsCard";
import HistorySearchFilter from "./HistorySearchFilter";
import HistoryVendorCard from "./HistoryVendorCard";
import HistoryVendorModal from "./HistoryVendorModal";
import HistoryDocumentModal from "./HistoryDocumentModal";

import {
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import Header from "@/components/common/Header";
import { ApiErrorResponse, Division } from "@/app/types";
import { isAxiosError } from "axios";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorHistory | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] =
    useState<HistoryDocument | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [historyData, setHistoryData] = useState<VendorHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user from localStorage/context
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch {
        setCurrentUser({
          id: 0,
          name: "History Team",
          email: "history@pln.co.id",
          division: Division.Dalkon,
        });
      }
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔒 Backend akan filter otomatis berdasarkan user role
        // Vendor hanya lihat dokumen mereka, role lain lihat semua
        const { data } = await api.get("/documents/history");

        const mapped: VendorHistory[] = (data ?? []).map((doc: any) => {
          const finalApproval = (doc.approvals ?? [])[0] ?? {};

          /* finalStatus */
          const finalStatus: "approved" | "rejected" =
            doc.status === "rejected" ? "rejected" : "approved";

          /* hitung docs */
          const versions = doc.versions ?? [];
          const totalDocs = versions.length;
          const approvedDocs = versions.filter((v: any) =>
            (v.approvals ?? []).some(
              (a: any) =>
                a.status === "approved" || a.status === "approvedWithNotes",
            ),
          ).length;
          const rejectedDocs = versions.filter((v: any) =>
            (v.approvals ?? []).some((a: any) => a.status === "rejected"),
          ).length;
          const pendingDocs = totalDocs - approvedDocs - rejectedDocs;

          return {
            id: `VH-${doc.id}`,
            vendorName: doc.submittedBy?.name ?? "Unknown",
            company: doc.submittedBy?.email?.split("@")[0] ?? "Unknown Company",
            projectTitle: doc.name,
            submissionDate: doc.createdAt,
            category:
              doc.documentType === "protection" ? "Protection" : "Civil",
            // priority: "high",
            finalStatus,
            totalDocuments: totalDocs,
            approvedDocuments: approvedDocs,
            rejectedDocuments: rejectedDocs,
            pendingDocuments: pendingDocs,
            completionDate: finalApproval.createdAt ?? doc.updatedAt,
            reviewer: finalApproval.approvedBy?.name ?? "Unknown",
            description: `Dokumen ${doc.documentType ?? "N/A"} – kontrak ${
              doc.contract?.contractNumber ?? "N/A"
            }`,
            drawings: versions.map((v: any) => {
              const va = (v.approvals ?? [])[0] ?? {};
              return {
                id: `DOC-${v.id}`,
                fileName: `${doc.name}_v${v.version}.pdf`,
                fileType: "PDF",
                fileSize: "0 MB",
                uploadDate: v.createdAt,
                status:
                  va.status === "rejected"
                    ? "rejected"
                    : va.status === "approvedWithNotes"
                      ? "approved"
                      : "approved",
                reviewDate: va.createdAt,
                reviewedBy: va.approvedBy?.name,
                description: `Versi ${v.version} – ${doc.name}`,
                category:
                  doc.documentType === "protection" ? "Protection" : "Civil",
                // priority: "high",
                reviewNotes: va.notes,
              };
            }),
          };
        });

        setHistoryData(mapped);
      } catch (err: unknown) {
        if (isAxiosError<ApiErrorResponse>(err)) {
          alert(err.response?.data?.message || "Gagal Memuat Riwayat Dokumen.");
        } else {
          alert("Terjadi kesalahan yang tidak terduga.");
        }
        // setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /* ---------- FILTER ---------- */
  const filteredData = historyData.filter((v) => {
    const matchSearch =
      v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStatus === "all" || v.finalStatus === filterStatus;
    return matchSearch && matchFilter;
  });

  /* ---------- STATS ---------- */
  const totalVendors = filteredData.length;
  const approvedVendors = filteredData.filter(
    (v) => v.finalStatus === "approved",
  ).length;
  const rejectedVendors = filteredData.filter(
    (v) => v.finalStatus === "rejected",
  ).length;
  const inReviewVendors = 0; // history = selesai

  /* ---------- HANDLER MODAL ---------- */
  const openVendorDetail = (vendor: VendorHistory) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };
  const openDocumentDetail = (doc: HistoryDocument) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
        <Header
          currentUser={currentUser}
          title="History & Reports System"
          backHref="/dashboard"
          backLabel="Dashboard"
          onLogout={() => {}}
        />
        <main className="max-w-7xl mx-auto p-6">
          <Card className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
        <Header
          currentUser={currentUser}
          title="History & Reports System"
          backHref="/dashboard"
          backLabel="Dashboard"
          onLogout={() => {}}
        />
        <main className="max-w-7xl mx-auto p-6">
          <Card className="p-8 text-center bg-red-50 border-red-200">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Muat Ulang
            </button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        currentUser={currentUser || {
          id: 0,
          name: "User",
          email: "user@pln.co.id",
          division: Division.Dalkon,
        }}
        title="History & Reports System"
        backHref="/dashboard"
        backLabel="Dashboard"
        onLogout={() => console.log("Logout")}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* ==== STATS ==== */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <HistoryStatsCard
            icon={Building}
            iconColor="text-[#14a2ba]"
            bgColor="bg-linear-to-br from-blue-100 to-blue-50"
            label="Total Vendors"
            value={totalVendors}
          />
          <HistoryStatsCard
            icon={CheckCircle}
            iconColor="text-green-600"
            bgColor="bg-linear-to-br from-green-100 to-green-50"
            label="Approved"
            value={approvedVendors}
          />
          <HistoryStatsCard
            icon={XCircle}
            iconColor="text-red-600"
            bgColor="bg-linear-to-br from-red-100 to-red-50"
            label="Rejected"
            value={rejectedVendors}
          />
          {/* <HistoryStatsCard
            icon={Clock}
            iconColor="text-gray-600"
            bgColor="bg-linear-to-br from-gray-100 to-gray-50"
            label="In Review"
            value={inReviewVendors}
          /> */}
        </div>

        {/* ==== SEARCH & FILTER ==== */}
        <HistorySearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* ==== LIST ==== */}
        {filteredData.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 lg:gap-6">
            {filteredData.map((v) => (
              <HistoryVendorCard
                key={v.id}
                vendor={v}
                onViewDetails={openVendorDetail}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-md">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Riwayat
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">
                Tidak ditemukan dokumen selesai yang cocok dengan filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 bg-[#14a2ba] text-white rounded hover:bg-[#125d72]"
              >
                Reset Filter
              </button>
            </div>
          </Card>
        )}
      </main>

      {/* ==== MODALS ==== */}
      <HistoryVendorModal
        open={showVendorModal}
        onOpenChange={setShowVendorModal}
        vendor={selectedVendor}
        onDocumentClick={openDocumentDetail}
      />
      <HistoryDocumentModal
        open={showDocumentModal}
        onOpenChange={setShowDocumentModal}
        document={selectedDocument}
      />
    </div>
  );
}
