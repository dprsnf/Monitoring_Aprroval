"use client";

import { useState } from "react";
import { VendorHistory, HistoryDocument } from "@/app/types/documentTypes";
import HistoryStatsCard from "./HistoryStatsCard";
import HistorySearchFilter from "./HistorySearchFilter";
import HistoryVendorCard from "./HistoryVendorCard";
import HistoryVendorModal from "./HistoryVendorModal";
import HistoryDocumentModal from "./HistoryDocumentModal";
import { Building, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/common/Header";
import { Role } from "@/app/types";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorHistory | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<HistoryDocument | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const currentUser = {
    id: 0,
    name: "History Team",
    email: "history@pln.co.id",
    role: Role.Dalkon,
  };

  const historyData: VendorHistory[] = [
    {
      id: "VH-001",
      vendorName: "PT. Listrik Jaya",
      company: "PT. Listrik Jaya Abadi",
      projectTitle: "Gardu Induk Cibinong - Sistem Kelistrikan",
      submissionDate: "2024-10-01 14:30",
      category: "Electrical",
      priority: "high",
      finalStatus: "approved",
      totalDocuments: 3,
      approvedDocuments: 3,
      rejectedDocuments: 0,
      pendingDocuments: 0,
      completionDate: "2024-10-02 16:30",
      reviewer: "Ir. Ahmad Subandi",
      description: "Proyek pembangunan gardu induk dengan kapasitas 150kV untuk wilayah Cibinong",
      drawings: [
        {
          id: "DOC-001",
          fileName: "Single_Line_Diagram_GI_Cibinong.pdf",
          fileType: "PDF",
          fileSize: "2.5 MB",
          uploadDate: "2024-10-01 14:30",
          status: "approved",
          reviewDate: "2024-10-02 09:15",
          reviewedBy: "Ir. Ahmad Subandi",
          description: "Diagram satu garis sistem kelistrikan gardu induk",
          category: "Electrical",
          priority: "high",
          reviewNotes: "Dokumen telah sesuai dengan standar PLN dan dapat disetujui untuk implementasi."
        },
        {
          id: "DOC-002",
          fileName: "Protection_Scheme_150kV.pdf",
          fileType: "PDF",
          fileSize: "1.8 MB",
          uploadDate: "2024-10-01 14:35",
          status: "approved",
          reviewDate: "2024-10-02 10:20",
          reviewedBy: "Ir. Ahmad Subandi",
          description: "Skema proteksi untuk sistem 150kV",
          category: "Electrical",
          priority: "high",
          reviewNotes: "Skema proteksi sudah sesuai dengan standar IEEE dan PLN."
        },
        {
          id: "DOC-003",
          fileName: "Equipment_Layout_GI.pdf",
          fileType: "PDF",
          fileSize: "3.2 MB",
          uploadDate: "2024-10-01 14:40",
          status: "approved",
          reviewDate: "2024-10-02 11:45",
          reviewedBy: "Ir. Ahmad Subandi",
          description: "Layout peralatan di gardu induk",
          category: "Electrical",
          priority: "medium",
          reviewNotes: "Layout peralatan telah memenuhi clearance dan standar keamanan."
        }
      ]
    },
    {
      id: "VH-002",
      vendorName: "CV. Konstruksi Prima",
      company: "CV. Konstruksi Prima Indonesia",
      projectTitle: "Foundation Design - Tower Transmisi 500kV",
      submissionDate: "2024-09-30 16:45",
      category: "Civil",
      priority: "high",
      finalStatus: "rejected",
      totalDocuments: 2,
      approvedDocuments: 0,
      rejectedDocuments: 2,
      pendingDocuments: 0,
      completionDate: "2024-10-01 15:30",
      reviewer: "Ir. Siti Nurhaliza",
      description: "Desain pondasi untuk tower transmisi 500kV jalur Surabaya-Jakarta",
      drawings: [
        {
          id: "DOC-004",
          fileName: "Foundation_Design_500kV.pdf",
          fileType: "PDF",
          fileSize: "4.1 MB",
          uploadDate: "2024-09-30 16:45",
          status: "rejected",
          reviewDate: "2024-10-01 11:20",
          reviewedBy: "Ir. Siti Nurhaliza",
          description: "Desain pondasi tower transmisi 500kV",
          category: "Civil",
          priority: "high",
          reviewNotes: "Perhitungan beban angin tidak sesuai dengan standar SNI. Perlu revisi untuk kondisi angin ekstrem."
        },
        {
          id: "DOC-005",
          fileName: "Soil_Investigation_Report.pdf",
          fileType: "PDF",
          fileSize: "2.8 MB",
          uploadDate: "2024-09-30 16:50",
          status: "rejected",
          reviewDate: "2024-10-01 12:45",
          reviewedBy: "Ir. Siti Nurhaliza",
          description: "Laporan investigasi tanah lokasi tower",
          category: "Civil",
          priority: "high",
          reviewNotes: "Data SPT tidak mencukupi untuk analisis daya dukung. Perlu penambahan titik boring."
        }
      ]
    },
    {
      id: "VH-003",
      vendorName: "PT. Teknik Elektro",
      company: "PT. Teknik Elektro Nusantara",
      projectTitle: "Electrical Panel Layout - Substation A",
      submissionDate: "2024-09-29 10:15",
      category: "Electrical",
      priority: "medium",
      finalStatus: "under_review",
      totalDocuments: 4,
      approvedDocuments: 2,
      rejectedDocuments: 0,
      pendingDocuments: 2,
      reviewer: "Ir. Bambang Sutrisno",
      description: "Layout panel listrik untuk gardu distribusi 20kV wilayah Jakarta Selatan",
      drawings: [
        {
          id: "DOC-006",
          fileName: "Panel_Layout_20kV.pdf",
          fileType: "PDF",
          fileSize: "2.1 MB",
          uploadDate: "2024-09-29 10:15",
          status: "approved",
          reviewDate: "2024-09-30 14:20",
          reviewedBy: "Ir. Bambang Sutrisno",
          description: "Layout panel distribusi 20kV",
          category: "Electrical",
          priority: "medium",
          reviewNotes: "Layout panel sudah sesuai standar PLN SPLN."
        },
        {
          id: "DOC-007",
          fileName: "Wiring_Diagram_Control.pdf",
          fileType: "PDF",
          fileSize: "1.6 MB",
          uploadDate: "2024-09-29 10:20",
          status: "approved",
          reviewDate: "2024-09-30 15:10",
          reviewedBy: "Ir. Bambang Sutrisno",
          description: "Diagram pengawatan sistem kontrol",
          category: "Electrical",
          priority: "medium",
          reviewNotes: "Diagram pengawatan sudah benar dan lengkap."
        },
        {
          id: "DOC-008",
          fileName: "Protection_Settings.pdf",
          fileType: "PDF",
          fileSize: "1.2 MB",
          uploadDate: "2024-09-29 10:25",
          status: "under_review",
          description: "Setting proteksi relay",
          category: "Electrical",
          priority: "medium"
        },
        {
          id: "DOC-009",
          fileName: "Equipment_Specifications.pdf",
          fileType: "PDF",
          fileSize: "2.9 MB",
          uploadDate: "2024-09-29 10:30",
          status: "under_review",
          description: "Spesifikasi peralatan panel",
          category: "Electrical",
          priority: "low"
        }
      ]
    }
  ];

  const filteredData = historyData.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || vendor.finalStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalVendors = historyData.length;
  const approvedVendors = historyData.filter(v => v.finalStatus === "approved").length;
  const rejectedVendors = historyData.filter(v => v.finalStatus === "rejected").length;
  const pendingVendors = historyData.filter(v => v.finalStatus === "under_review" || v.finalStatus === "pending").length;

  const openVendorDetail = (vendor: VendorHistory) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const openDocumentDetail = (document: HistoryDocument) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header
        currentUser={currentUser}
        title="History & Reports System"
        backHref="/dashboard"
        backLabel="Dashboard"
        onLogout={() => console.log("Logout clicked")}
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <HistoryStatsCard
            icon={Building}
            iconColor="text-[#14a2ba]"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
            label="Total Vendors"
            value={totalVendors}
          />
          <HistoryStatsCard
            icon={CheckCircle}
            iconColor="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-50"
            label="Approved"
            value={approvedVendors}
          />
          <HistoryStatsCard
            icon={XCircle}
            iconColor="text-red-600"
            bgColor="bg-gradient-to-br from-red-100 to-red-50"
            label="Rejected"
            value={rejectedVendors}
          />
          <HistoryStatsCard
            icon={Clock}
            iconColor="text-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-100 to-yellow-50"
            label="In Review"
            value={pendingVendors}
          />
        </div>

        <HistorySearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {filteredData.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 lg:gap-6">
            {filteredData.map((vendor) => (
              <HistoryVendorCard
                key={vendor.id}
                vendor={vendor}
                onViewDetails={openVendorDetail}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-md">
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="text-gray-400 mb-4 sm:mb-6">
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                No vendor history matches your current search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="mt-4 px-4 py-2 bg-[#14a2ba] text-white rounded-lg hover:bg-[#125d72]"
              >
                Clear Filters
              </button>
            </div>
          </Card>
        )}
      </main>

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