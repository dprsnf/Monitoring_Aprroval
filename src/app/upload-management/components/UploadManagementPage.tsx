"use client";

import { useState } from "react";
import { Clock, CheckCircle, ArrowRight, Upload, Download, User, FileText, Send, XCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import components
import Header from "@/components/Header";
import StatisticsCards from "@/components/StatisticsCards";
import SearchAndFilter from "@/components/SearchAndFilter";
import ManagementList from "@/components/ManagementList";
import DetailModal from "@/components/DetailModal";
import ApprovalModal from "@/components/ApprovalModal";
import RejectModal from "@/components/RejectModal";

// Import types
import { Document, Status, Role, ApprovalType, User as UserType } from "@/app/types";

// Sample data sesuai dengan schema
const initialDocuments: Document[] = [
  {
    id: 1,
    name: "Single Line Diagram - Gardu Induk Cibinong 150kV",
    filePath: "/documents/sld-cibinong.pdf",
    status: Status.submitted,
    overallDeadline: "2024-10-15T00:00:00",
    documentType: ApprovalType.protection,
    contract: {
      id: 1,
      contractNumber: "CONT-001",
      contractDate: "2024-01-15T00:00:00"
    },
    submittedBy: {
      id: 2,
      email: "vendor@listrikjayamandiri.com",
      name: "PT. Listrik Jaya Mandiri",
      role: Role.Vendor
    },
    submittedById: 2,
    createdAt: "2024-10-01T14:30:00",
    updatedAt: "2024-10-01T14:30:00",
    version: 1,
    remarks: "Drawing teknis sistem kelistrikan gardu induk dengan kapasitas 150kV sesuai standar PLN SPLN",
    approvals: []
  },
  {
    id: 2,
    name: "Civil Structure - Foundation Design Tower 500kV",
    filePath: "/documents/foundation-design.pdf",
    status: Status.inReviewEngineering,
    overallDeadline: "2024-10-20T00:00:00",
    documentType: ApprovalType.civil,
    contract: {
      id: 2,
      contractNumber: "CONT-002",
      contractDate: "2024-02-20T00:00:00"
    },
    submittedBy: {
      id: 3,
      email: "info@konstruksiprima.com",
      name: "CV. Konstruksi Prima Engineering",
      role: Role.Vendor
    },
    submittedById: 3,
    reviewedBy: {
      id: 1,
      email: "budi.santoso@pln.co.id",
      name: "Budi Santoso",
      role: Role.Manager
    },
    reviewedById: 1,
    createdAt: "2024-09-30T16:45:00",
    updatedAt: "2024-10-01T09:15:00",
    version: 1,
    remarks: "Desain pondasi untuk bangunan tower transmisi 500kV termasuk analisis geoteknik dan struktural",
    approvals: [
      {
        id: 1,
        documentId: 2,
        type: ApprovalType.civil,
        approvedBy: {
          id: 1,
          email: "budi.santoso@pln.co.id",
          name: "Budi Santoso",
          role: Role.Manager
        },
        approvedById: 1,
        status: Status.inReviewEngineering,
        notes: "Dokumen sudah sesuai dengan standar PLN. Diteruskan ke tim engineering untuk review mendalam.",
        deadline: "2024-10-25T00:00:00",
        createdAt: "2024-10-01T09:15:00",
        updatedAt: "2024-10-01T09:15:00"
      }
    ]
  },
  {
    id: 3,
    name: "Electrical Panel Layout - Substation Distribution 20kV",
    filePath: "/documents/panel-layout.pdf",
    status: Status.approved,
    overallDeadline: "2024-09-30T00:00:00",
    documentType: ApprovalType.protection,
    contract: {
      id: 3,
      contractNumber: "CONT-003",
      contractDate: "2024-03-10T00:00:00"
    },
    submittedBy: {
      id: 4,
      email: "teknik@elektronusantara.com",
      name: "PT. Teknik Elektro Nusantara",
      role: Role.Vendor
    },
    submittedById: 4,
    reviewedBy: {
      id: 1,
      email: "budi.santoso@pln.co.id",
      name: "Budi Santoso",
      role: Role.Manager
    },
    reviewedById: 1,
    createdAt: "2024-09-29T10:15:00",
    updatedAt: "2024-09-30T14:30:00",
    version: 1,
    remarks: "Layout panel listrik untuk gardu distribusi 20kV dengan sistem proteksi digital sesuai standar IEC",
    approvals: [
      {
        id: 2,
        documentId: 3,
        type: ApprovalType.protection,
        approvedBy: {
          id: 5,
          email: "ahmad.subandi@pln.co.id",
          name: "Ir. Ahmad Subandi",
          role: Role.Engineer
        },
        approvedById: 5,
        status: Status.approved,
        notes: "Technical review selesai. Semua spesifikasi memenuhi standar PLN SPLN 50-1:2019. Konstruksi dapat dilanjutkan.",
        deadline: "2024-10-10T00:00:00",
        createdAt: "2024-09-30T14:30:00",
        updatedAt: "2024-09-30T14:30:00"
      }
    ]
  },
  {
    id: 4,
    name: "Site Plan - Transmission Line Corridor 150kV",
    filePath: "/documents/site-plan.pdf",
    status: Status.returnForCorrection,
    overallDeadline: "2024-10-10T00:00:00",
    documentType: ApprovalType.civil,
    contract: {
      id: 4,
      contractNumber: "CONT-004",
      contractDate: "2024-04-05T00:00:00"
    },
    submittedBy: {
      id: 6,
      email: "survey@consultingindonesia.com",
      name: "PT. Survey & Consulting Indonesia",
      role: Role.Vendor
    },
    submittedById: 6,
    reviewedBy: {
      id: 1,
      email: "budi.santoso@pln.co.id",
      name: "Budi Santoso",
      role: Role.Manager
    },
    reviewedById: 1,
    createdAt: "2024-09-28T13:20:00",
    updatedAt: "2024-09-28T16:45:00",
    version: 1,
    remarks: "Site plan untuk jalur transmisi 150kV sepanjang 25km dengan analisis right of way",
    approvals: [
      {
        id: 3,
        documentId: 4,
        type: ApprovalType.civil,
        approvedBy: {
          id: 1,
          email: "budi.santoso@pln.co.id",
          name: "Budi Santoso",
          role: Role.Manager
        },
        approvedById: 1,
        status: Status.returnForCorrection,
        notes: "Dokumen tidak lengkap. Diperlukan: 1) Analisis dampak lingkungan (AMDAL), 2) Data survey topografi detail, 3) Koordinat GPS setiap tower, 4) Persetujuan masyarakat. Silakan submit ulang setelah melengkapi.",
        deadline: "2024-10-15T00:00:00",
        createdAt: "2024-09-28T16:45:00",
        updatedAt: "2024-09-28T16:45:00"
      }
    ]
  },
  {
    id: 5,
    name: "Protection System Diagram - GI 500kV Cilegon",
    filePath: "/documents/protection-system.pdf",
    status: Status.rejected,
    overallDeadline: "2024-09-25T00:00:00",
    documentType: ApprovalType.protection,
    contract: {
      id: 5,
      contractNumber: "CONT-005",
      contractDate: "2024-05-12T00:00:00"
    },
    submittedBy: {
      id: 2,
      email: "vendor@listrikjayamandiri.com",
      name: "PT. Listrik Jaya Mandiri",
      role: Role.Vendor
    },
    submittedById: 2,
    reviewedBy: {
      id: 1,
      email: "budi.santoso@pln.co.id",
      name: "Budi Santoso",
      role: Role.Manager
    },
    reviewedById: 1,
    createdAt: "2024-09-27T15:10:00",
    updatedAt: "2024-09-28T11:20:00",
    version: 1,
    remarks: "Diagram sistem proteksi untuk gardu induk 500kV dengan sistem SCADA terintegrasi",
    approvals: [
      {
        id: 4,
        documentId: 5,
        type: ApprovalType.protection,
        approvedBy: {
          id: 7,
          email: "siti.nurhaliza@pln.co.id",
          name: "Ir. Siti Nurhaliza",
          role: Role.Engineer
        },
        approvedById: 7,
        status: Status.rejected,
        notes: "Skema proteksi tidak sesuai standar PLN SPLN 52-2:2020. Diperlukan studi koordinasi proteksi ulang. Setting relay perlu disesuaikan dengan existing system. Mohon revisi dan submit ulang.",
        deadline: "2024-10-05T00:00:00",
        createdAt: "2024-09-28T11:20:00",
        updatedAt: "2024-09-28T11:20:00"
      }
    ]
  },
  {
    id: 6,
    name: "Substation Layout - GIS 150kV Modernization",
    filePath: "/documents/substation-layout.pdf",
    status: Status.submitted,
    overallDeadline: "2024-11-15T00:00:00",
    documentType: ApprovalType.protection,
    contract: {
      id: 6,
      contractNumber: "CONT-006",
      contractDate: "2024-06-20T00:00:00"
    },
    submittedBy: {
      id: 8,
      email: "info@modernpower.com",
      name: "PT. Modern Power Engineering",
      role: Role.Vendor
    },
    submittedById: 8,
    createdAt: "2024-10-02T08:45:00",
    updatedAt: "2024-10-02T08:45:00",
    version: 1,
    remarks: "Layout Gas Insulated Substation untuk modernisasi GI 150kV dengan teknologi digital dan remote control",
    approvals: []
  }
];

const currentUser: UserType = {
  id: 1,
  email: "budi.santoso@pln.co.id",
  name: "Budi Santoso",
  role: Role.Manager
};

export default function DocumentReviewPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [managementNotes, setManagementNotes] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "results">("new");
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);

    const getStatusBadge = (status: Status) => {
        switch (status) {
            case Status.submitted:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Submitted
                    </Badge>
                );
            case Status.inReviewConsultant:
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
                        <User className="w-3 h-3 mr-1" />
                        In Review Consultant
                    </Badge>
                );
            case Status.inReviewEngineering:
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
                        <User className="w-3 h-3 mr-1" />
                        In Review Engineering
                    </Badge>
                );
            case Status.inReviewManager:
                return (
                    <Badge className="bg-[#125d72] text-white hover:bg-[#125d72] border border-[#125d72]">
                        <User className="w-3 h-3 mr-1" />
                        In Review Manager
                    </Badge>
                );
            case Status.approved:
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                );
            case Status.approvedWithNotes:
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved with Notes
                    </Badge>
                );
            case Status.returnForCorrection:
                return (
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border border-orange-200">
                        <Send className="w-3 h-3 mr-1" />
                        Return for Correction
                    </Badge>
                );
            case Status.rejected:
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case Status.overdue:
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                        <Ban className="w-3 h-3 mr-1" />
                        Overdue
                    </Badge>
                );
            default:
                return null;
        }
    };

    const filteredData = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (doc.documentType && doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === "all" || doc.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Separate data into new submissions and review results
    const newSubmissions = filteredData.filter(doc => 
        doc.status === Status.submitted || doc.status === Status.returnForCorrection || doc.status === Status.inReviewManager
    );
    
    const reviewResults = filteredData.filter(doc => 
        doc.status === Status.approved || 
        doc.status === Status.approvedWithNotes || 
        doc.status === Status.rejected ||
        doc.status === Status.overdue ||
        doc.status === Status.inReviewConsultant ||
        doc.status === Status.inReviewEngineering
    );

    const currentData = activeTab === "new" ? newSubmissions : reviewResults;

    const getNewSubmissionsCount = () => {
        return documents.filter(doc => 
            doc.status === Status.submitted || doc.status === Status.returnForCorrection || doc.status === Status.inReviewManager
        ).length;
    };

    const getReviewResultsCount = () => {
        return documents.filter(doc => 
            doc.status === Status.approved || 
            doc.status === Status.approvedWithNotes || 
            doc.status === Status.rejected ||
            doc.status === Status.overdue ||
            doc.status === Status.inReviewConsultant ||
            doc.status === Status.inReviewEngineering
        ).length;
    };

    const handleDetailClick = (document: Document) => {
        setSelectedDocument(document);
        setShowDetailModal(true);
    };

    const handleReviewClick = (document: Document) => {
        setSelectedDocument(document);
        setManagementNotes("");
        setShowApprovalModal(true);
    };

    const handleReturnClick = (document: Document) => {
        setSelectedDocument(document);
        setManagementNotes("");
        setShowRejectModal(true);
    };

    const closeModals = () => {
        setShowDetailModal(false);
        setShowApprovalModal(false);
        setShowRejectModal(false);
        setSelectedDocument(null);
        setManagementNotes("");
    };

    const handleReviewSubmit = () => {
        if (selectedDocument && managementNotes.trim()) {
            const nextStatus = selectedDocument.documentType === ApprovalType.protection 
                ? Status.inReviewEngineering 
                : Status.inReviewConsultant;

            const updatedData = documents.map(doc => {
                if (doc.id === selectedDocument.id) {
                    return {
                        ...doc,
                        status: nextStatus,
                        reviewedBy: currentUser,
                        reviewedById: currentUser.id,
                        updatedAt: new Date().toISOString(),
                        remarks: managementNotes,
                        approvals: [
                            ...doc.approvals,
                            {
                                id: Math.max(...doc.approvals.map(a => a.id), 0) + 1,
                                documentId: doc.id,
                                type: doc.documentType || ApprovalType.protection,
                                approvedBy: currentUser,
                                approvedById: currentUser.id,
                                status: nextStatus,
                                notes: managementNotes,
                                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        ]
                    };
                }
                return doc;
            });
            setDocuments(updatedData);
            closeModals();
            
            alert(`✅ Dokumen ${selectedDocument.name} berhasil diteruskan untuk review teknis.`);
        }
    };

    const handleReturnSubmit = () => {
        if (selectedDocument && managementNotes.trim()) {
            const updatedData = documents.map(doc => {
                if (doc.id === selectedDocument.id) {
                    return {
                        ...doc,
                        status: Status.returnForCorrection,
                        reviewedBy: currentUser,
                        reviewedById: currentUser.id,
                        updatedAt: new Date().toISOString(),
                        remarks: managementNotes,
                        approvals: [
                            ...doc.approvals,
                            {
                                id: Math.max(...doc.approvals.map(a => a.id), 0) + 1,
                                documentId: doc.id,
                                type: doc.documentType || ApprovalType.protection,
                                approvedBy: currentUser,
                                approvedById: currentUser.id,
                                status: Status.returnForCorrection,
                                notes: managementNotes,
                                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        ]
                    };
                }
                return doc;
            });
            setDocuments(updatedData);
            closeModals();
            
            alert(`↩️ Dokumen ${selectedDocument.name} dikembalikan untuk koreksi.`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
            <Header currentUser={currentUser} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#125d72] to-[#14a2ba] rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Document Review System</h2>
                            <p className="text-sm text-[#125d72] font-medium">PT PLN (Persero) - Document Review Center</p>
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">Kelola dan review dokumen dari vendor sebelum dikirim ke tim teknis PLN</p>
                    
                    {/* Workflow Indicator */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 text-[#125d72] font-medium">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Vendor</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-blue-600 font-semibold">
                                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Document Review</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-[#125d72] font-medium">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Technical Team</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Final Result</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                        <Button
                            onClick={() => setActiveTab("new")}
                            className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                                activeTab === "new"
                                    ? "bg-[#125d72] text-white shadow-md"
                                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="hidden sm:inline">New Documents</span>
                                <span className="sm:hidden">New</span>
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1">
                                    {getNewSubmissionsCount()}
                                </Badge>
                            </div>
                        </Button>
                        <Button
                            onClick={() => setActiveTab("results")}
                            className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                                activeTab === "results"
                                    ? "bg-[#125d72] text-white shadow-md"
                                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Review Results</span>
                                <span className="sm:hidden">Results</span>
                                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                    {getReviewResultsCount()}
                                </Badge>
                            </div>
                        </Button>
                    </div>
                </div>

                <StatisticsCards documents={documents} activeTab={activeTab} />
                
                <SearchAndFilter 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    activeTab={activeTab}
                />

                {/* Section Title */}
                <div className="mb-4 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {activeTab === "new" ? "📥 New Documents from Vendors" : "📋 Review Results from Technical Team"}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                        {activeTab === "new" 
                            ? "Review dokumen vendor dan teruskan ke tim teknis PLN"
                            : "Hasil review dari tim teknis PLN - siap untuk komunikasi ke vendor"
                        }
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                        {activeTab === "new" 
                            ? "🔄 Workflow: Vendor → Document Review → Technical Review"
                            : "✅ Workflow: Technical Review → Document Review → Vendor Notification"
                        }
                    </div>
                </div>

                <ManagementList 
                    data={currentData}
                    activeTab={activeTab}
                    onDetailClick={handleDetailClick}
                    onApproveClick={handleReviewClick}
                    onRejectClick={handleReturnClick}
                    getStatusBadge={getStatusBadge}
                    currentUserRole={currentUser.role}
                />
            </main>

            {/* Modals */}
            {showDetailModal && selectedDocument && (
                <DetailModal 
                    selectedDocument={selectedDocument}
                    onClose={closeModals}
                />
            )}

            {showApprovalModal && selectedDocument && (
                <ApprovalModal 
                    selectedDocument={selectedDocument}
                    managementNotes={managementNotes}
                    setManagementNotes={setManagementNotes}
                    onClose={closeModals}
                    onSubmit={handleReviewSubmit}
                />
            )}

            {showRejectModal && selectedDocument && (
                <RejectModal 
                    selectedDocument={selectedDocument}
                    managementNotes={managementNotes}
                    setManagementNotes={setManagementNotes}
                    onClose={closeModals}
                    onSubmit={handleReturnSubmit}
                />
            )}
        </div>
    );
}