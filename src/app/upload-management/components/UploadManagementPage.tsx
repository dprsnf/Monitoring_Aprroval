"use client";

import { useState } from "react";
import { ChevronLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock, User, Calendar, FileText, ChevronDown, LogOut, Download, MessageSquare, ArrowRight, Send, Ban, AlertTriangle, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UploadManagementItem {
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

export default function UploadManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedItem, setSelectedItem] = useState<UploadManagementItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [managementNotes, setManagementNotes] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "results">("new");

    // Sample upload management data - PLN Company Workflow
    const [managementData, setManagementData] = useState<UploadManagementItem[]>([
        {
            id: "PLN-UPM-001",
            projectTitle: "Single Line Diagram - Gardu Induk Cibinong 150kV",
            submittedBy: "PT. Listrik Jaya Mandiri",
            submissionDate: "2024-10-01 14:30",
            category: "Electrical",
            status: "pending_review",
            files: 3,
            description: "Drawing teknis sistem kelistrikan gardu induk dengan kapasitas 150kV sesuai standar PLN SPLN"
        },
        {
            id: "PLN-UPM-002",
            projectTitle: "Civil Structure - Foundation Design Tower 500kV",
            submittedBy: "CV. Konstruksi Prima Engineering",
            submissionDate: "2024-09-30 16:45",
            category: "Civil",
            status: "in_approval",
            files: 5,
            description: "Desain pondasi untuk bangunan tower transmisi 500kV termasuk analisis geoteknik dan struktural",
            managementReviewer: "Budi Santoso - PLN Upload Manager",
            managementDate: "2024-10-01 09:15",
            managementNotes: "Dokumen sudah sesuai dengan standar PLN. Diteruskan ke tim teknis untuk review mendalam. Semua file engineering drawing lengkap."
        },
        {
            id: "PLN-UPM-003",
            projectTitle: "Electrical Panel Layout - Substation Distribution 20kV",
            submittedBy: "PT. Teknik Elektro Nusantara",
            submissionDate: "2024-09-29 10:15",
            category: "Electrical",
            status: "final_approved",
            files: 4,
            description: "Layout panel listrik untuk gardu distribusi 20kV dengan sistem proteksi digital sesuai standar IEC",
            managementReviewer: "Budi Santoso - PLN Upload Manager",
            managementDate: "2024-09-29 15:20",
            managementNotes: "Dokumen memenuhi standar PLN. Diteruskan ke tim approval untuk verifikasi teknis.",
            approvalStatus: "approved",
            approvalDate: "2024-09-30 14:30",
            approvalReviewer: "Ir. Ahmad Subandi - Senior Engineer PLN",
            approvalNotes: "Technical review selesai. Semua spesifikasi memenuhi standar PLN SPLN 50-1:2019. Konstruksi dapat dilanjutkan."
        },
        {
            id: "PLN-UPM-004",
            projectTitle: "Site Plan - Transmission Line Corridor 150kV",
            submittedBy: "PT. Survey & Consulting Indonesia",
            submissionDate: "2024-09-28 13:20",
            category: "Civil",
            status: "rejected",
            files: 2,
            description: "Site plan untuk jalur transmisi 150kV sepanjang 25km dengan analisis right of way",
            managementReviewer: "Budi Santoso - PLN Upload Manager",
            managementDate: "2024-09-28 16:45",
            managementNotes: "Dokumen tidak lengkap. Diperlukan: 1) Analisis dampak lingkungan (AMDAL), 2) Data survey topografi detail, 3) Koordinat GPS setiap tower, 4) Persetujuan masyarakat. Silakan submit ulang setelah melengkapi."
        },
        {
            id: "PLN-UPM-005",
            projectTitle: "Protection System Diagram - GI 500kV Cilegon",
            submittedBy: "PT. Listrik Jaya Mandiri",
            submissionDate: "2024-09-27 15:10",
            category: "Electrical",
            status: "final_rejected",
            files: 6,
            description: "Diagram sistem proteksi untuk gardu induk 500kV dengan sistem SCADA terintegrasi",
            managementReviewer: "Budi Santoso - PLN Upload Manager",
            managementDate: "2024-09-27 17:30",
            managementNotes: "Dokumen forwarded ke tim teknis untuk evaluasi sistem proteksi.",
            approvalStatus: "rejected",
            approvalDate: "2024-09-28 11:20",
            approvalReviewer: "Ir. Siti Nurhaliza - Protection Engineer PLN",
            approvalNotes: "Skema proteksi tidak sesuai standar PLN SPLN 52-2:2020. Diperlukan studi koordinasi proteksi ulang. Setting relay perlu disesuaikan dengan existing system. Mohon revisi dan submit ulang."
        },
        {
            id: "PLN-UPM-006",
            projectTitle: "Substation Layout - GIS 150kV Modernization",
            submittedBy: "PT. Modern Power Engineering",
            submissionDate: "2024-10-02 08:45",
            category: "Electrical",
            status: "pending_review",
            files: 7,
            description: "Layout Gas Insulated Substation untuk modernisasi GI 150kV dengan teknologi digital dan remote control"
        }
    ]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending_review":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                    </Badge>
                );
            case "approved_for_approval":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
                        <Send className="w-3 h-3 mr-1" />
                        Sent to Approval
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case "in_approval":
                return (
                    <Badge className="bg-[#125d72] text-white hover:bg-[#125d72] border border-[#125d72]">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        In Approval
                    </Badge>
                );
            case "final_approved":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Final Approved
                    </Badge>
                );
            case "final_rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                        <Ban className="w-3 h-3 mr-1" />
                        Final Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    const filteredData = managementData.filter(item => {
        const matchesSearch = item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Separate data into new submissions and approval results
    const newSubmissions = filteredData.filter(item => 
        item.status === "pending_review" || item.status === "approved_for_approval" || item.status === "in_approval"
    );
    
    const approvalResults = filteredData.filter(item => 
        item.status === "final_approved" || item.status === "final_rejected" || item.status === "rejected"
    );

    const currentData = activeTab === "new" ? newSubmissions : approvalResults;

    const getStatusCount = (status: string) => {
        return managementData.filter(item => item.status === status).length;
    };

    const getNewSubmissionsCount = () => {
        return managementData.filter(item => 
            item.status === "pending_review" || item.status === "approved_for_approval" || item.status === "in_approval"
        ).length;
    };

    const getApprovalResultsCount = () => {
        return managementData.filter(item => 
            item.status === "final_approved" || item.status === "final_rejected" || item.status === "rejected"
        ).length;
    };

    const handleDetailClick = (item: UploadManagementItem) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const handleApproveClick = (item: UploadManagementItem) => {
        setSelectedItem(item);
        setManagementNotes("");
        setShowApprovalModal(true);
    };

    const handleRejectClick = (item: UploadManagementItem) => {
        setSelectedItem(item);
        setManagementNotes("");
        setShowRejectModal(true);
    };

    const closeModals = () => {
        setShowDetailModal(false);
        setShowApprovalModal(false);
        setShowRejectModal(false);
        setSelectedItem(null);
        setManagementNotes("");
    };

    const handleApproveSubmit = () => {
        if (selectedItem && managementNotes.trim()) {
            const updatedData = managementData.map(item => {
                if (item.id === selectedItem.id) {
                    return {
                        ...item,
                        status: "approved_for_approval" as const,
                        managementReviewer: "Budi Santoso - PLN Upload Manager",
                        managementDate: new Date().toLocaleString(),
                        managementNotes: managementNotes
                    };
                }
                return item;
            });
            setManagementData(updatedData);
            closeModals();
            
            // Show success message
            alert(`✅ Dokumen ${selectedItem.id} berhasil diteruskan ke Tim Teknis PLN untuk approval.\n\nWorkflow: Upload Management → Technical Approval Team`);
            
            // Simulate sending to approval system and eventual return
            setTimeout(() => {
                const approvalData = managementData.map(item => {
                    if (item.id === selectedItem.id) {
                        return {
                            ...item,
                            status: "in_approval" as const
                        };
                    }
                    return item;
                });
                setManagementData(approvalData);
            }, 1000);
        }
    };

    const handleRejectSubmit = () => {
        if (selectedItem && managementNotes.trim()) {
            const updatedData = managementData.map(item => {
                if (item.id === selectedItem.id) {
                    return {
                        ...item,
                        status: "rejected" as const,
                        managementReviewer: "Budi Santoso - PLN Upload Manager",
                        managementDate: new Date().toLocaleString(),
                        managementNotes: managementNotes
                    };
                }
                return item;
            });
            setManagementData(updatedData);
            closeModals();
            
            // Show rejection message
            alert(`❌ Dokumen ${selectedItem.id} ditolak.\n\nVendor akan menerima notifikasi untuk melakukan perbaikan dan submit ulang.`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0 flex-1">
                            <Link href="/">
                                <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Button>
                            </Link>
                            
                            <div className="h-6 sm:h-8 w-px bg-white/30 mx-1 sm:mx-2"></div>
                            
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-white truncate">
                                    <span className="block sm:hidden">Upload Mgmt</span>
                                    <span className="hidden sm:block lg:hidden">Upload Management</span>
                                    <span className="hidden lg:block">Upload Management System</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                                        <span className="text-xs sm:text-sm font-medium mr-1">Admin</span>
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                                    <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                                        <div className="py-1">
                                            <p className="text-sm font-semibold text-gray-900">Budi Santoso</p>
                                            <p className="text-xs text-[#14a2ba]">Upload Manager - PLN</p>
                                            <p className="text-xs text-gray-600">budi.santoso@pln.co.id</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem
                                        className="hover:bg-red-50 cursor-pointer transition-all duration-200 focus:bg-red-100 mx-1 my-1 rounded-md"
                                        onClick={() => console.log("Logout clicked")}
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-red-600" />
                                        <span className="font-medium text-red-600">Keluar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#125d72] to-[#14a2ba] rounded-xl flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Management System</h2>
                            <p className="text-sm text-[#125d72] font-medium">PT PLN (Persero) - Document Review Center</p>
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">Kelola dan review submission dari vendor sebelum dikirim ke approval team teknis PLN</p>
                    
                    {/* Workflow Indicator */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 text-[#125d72] font-medium">
                                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Vendor</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-blue-600 font-semibold">
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Upload Mgmt</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1 text-[#125d72] font-medium">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Approval Team</span>
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
                                <span className="hidden sm:inline">New Submissions</span>
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
                                <span className="hidden sm:inline">Approval Results</span>
                                <span className="sm:hidden">Results</span>
                                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                                    {getApprovalResultsCount()}
                                </Badge>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{managementData.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Upload</div>
                        </CardContent>
                    </Card>
                    {activeTab === "new" ? (
                        <>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">{getStatusCount("pending_review")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Pending Review</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{getStatusCount("approved_for_approval")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Sent to Approval</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#125d72] mb-1 sm:mb-2">{getStatusCount("in_approval")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">In Approval</div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{getStatusCount("final_approved")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Final Approved</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{getStatusCount("final_rejected")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Final Rejected</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                                <CardContent className="p-3 sm:p-6 text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1 sm:mb-2">{getStatusCount("rejected")}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">Mgmt Rejected</div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Search and Filter */}
                <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 mb-4 sm:mb-6">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari berdasarkan judul proyek, vendor, atau kategori..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-10 text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm sm:text-base min-w-32"
                                >
                                    <option value="all">Semua Status</option>
                                    {activeTab === "new" ? (
                                        <>
                                            <option value="pending_review">Pending Review</option>
                                            <option value="approved_for_approval">Sent to Approval</option>
                                            <option value="in_approval">In Approval</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="final_approved">Final Approved</option>
                                            <option value="final_rejected">Final Rejected</option>
                                            <option value="rejected">Management Rejected</option>
                                        </>
                                    )}
                                </select>
                                <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white px-3 sm:px-4">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section Title */}
                <div className="mb-4 p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {activeTab === "new" ? "📥 New Submissions from Vendors" : "📋 Approval Results from Technical Team"}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                        {activeTab === "new" 
                            ? "Review dokumen vendor dan teruskan ke tim teknis PLN untuk approval"
                            : "Hasil final dari tim teknis PLN - siap untuk komunikasi ke vendor"
                        }
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                        {activeTab === "new" 
                            ? "🔄 Workflow: Vendor → Upload Management → Technical Approval"
                            : "✅ Workflow: Technical Approval → Upload Management → Vendor Notification"
                        }
                    </div>
                </div>

                {/* Management List */}
                <div className="space-y-3 sm:space-y-4">
                    {currentData.map((item) => (
                        <Card key={item.id} className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-200">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.projectTitle}</h3>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                                                <span><strong>Vendor:</strong> {item.submittedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                                                <span><strong>Submit:</strong> {item.submissionDate}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                                                <span><strong>Files:</strong> {item.files} file(s)</span>
                                            </div>
                                        </div>

                                        {item.managementDate && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                                    <span><strong>Reviewed:</strong> {item.managementDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                                    <span><strong>Reviewer:</strong> {item.managementReviewer}</span>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-2 justify-end">
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleDetailClick(item)}
                                            className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md text-xs sm:text-sm px-3 py-2"
                                        >
                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Detail</span>
                                        </Button>
                                        
                                        {activeTab === "new" && item.status === "pending_review" && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApproveClick(item)}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-md text-xs sm:text-sm px-3 py-2"
                                                >
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Approve</span>
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleRejectClick(item)}
                                                    className="bg-red-600 hover:bg-red-700 text-white shadow-md text-xs sm:text-sm px-3 py-2"
                                                >
                                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                                    <span className="hidden sm:inline">Reject</span>
                                                </Button>
                                            </>
                                        )}
                                        
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="border-[#efe62f] text-gray-900 hover:bg-[#efe62f] shadow-md text-xs sm:text-sm px-3 py-2"
                                        >
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Download</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* No Results */}
                {currentData.length === 0 && (
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                {activeTab === "new" ? (
                                    <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                                ) : (
                                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                                )}
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                {activeTab === "new" ? "No new submissions" : "No approval results"}
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {activeTab === "new" 
                                    ? "Belum ada submission baru dari vendor. Submission akan muncul di sini setelah vendor mengupload."
                                    : "Belum ada hasil dari approval team. Hasil akan muncul di sini setelah proses approval selesai."
                                }
                            </p>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Detail Modal */}
            {showDetailModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">Upload Management Detail</h2>
                                    <p className="text-blue-100 text-xs sm:text-sm">ID: {selectedItem.id}</p>
                                </div>
                                <Button 
                                    onClick={closeModals}
                                    className="bg-white/20 hover:bg-white/30 text-white border-none p-1.5 sm:p-2"
                                >
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                            {/* Project Info */}
                            <Card className="shadow-lg border border-gray-200">
                                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                    <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                        Project Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Project Title</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.projectTitle}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Category</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Submitted By</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.submittedBy}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Submission Date</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.submissionDate}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-4">
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">{selectedItem.description}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Management Review */}
                            {selectedItem.managementDate && (
                                <Card className="shadow-lg border border-gray-200">
                                    <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                        <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                            Management Review
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-4 md:p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Reviewed By</label>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.managementReviewer}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Review Date</label>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.managementDate}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-4">
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Management Notes</label>
                                            <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">{selectedItem.managementNotes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Approval Status */}
                            {selectedItem.approvalDate && (
                                <Card className="shadow-lg border border-gray-200">
                                    <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                        <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                            Approval Result
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-4 md:p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Approval Status</label>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base capitalize">{selectedItem.approvalStatus}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Approval Date</label>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.approvalDate}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Approval Reviewer</label>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.approvalReviewer}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 sm:mt-4">
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Approval Notes</label>
                                            <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">{selectedItem.approvalNotes}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                <Button 
                                    onClick={closeModals}
                                    variant="outline" 
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 text-sm sm:text-base py-2"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                            <h2 className="text-base sm:text-lg md:text-xl font-bold">Forward to Technical Approval Team</h2>
                            <p className="text-green-100 text-xs sm:text-sm">PLN Document ID: {selectedItem.id}</p>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6 space-y-4">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-1">Workflow Process</h4>
                                <p className="text-blue-700 text-sm">
                                    📄 Dokumen akan diteruskan ke Tim Teknis PLN → Review mendalam → Hasil kembali ke Upload Management
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{selectedItem.projectTitle}</h3>
                                <p className="text-gray-600 text-sm">Vendor: {selectedItem.submittedBy}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Management Notes untuk Tim Teknis *
                                </label>
                                <Textarea
                                    value={managementNotes}
                                    onChange={(e) => setManagementNotes(e.target.value)}
                                    placeholder="Berikan catatan untuk tim teknis PLN (contoh: dokumen lengkap, perhatian khusus, dll)..."
                                    rows={4}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                <Button 
                                    onClick={closeModals}
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleApproveSubmit}
                                    disabled={!managementNotes.trim()}
                                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Teruskan ke Tim Teknis PLN
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full">
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                            <h2 className="text-base sm:text-lg md:text-xl font-bold">Reject Upload - Return to Vendor</h2>
                            <p className="text-red-100 text-xs sm:text-sm">PLN Document ID: {selectedItem.id}</p>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6 space-y-4">
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <h4 className="font-semibold text-red-900 mb-1">Notification Process</h4>
                                <p className="text-red-700 text-sm">
                                    ❌ Dokumen akan dikembalikan ke vendor dengan alasan penolakan untuk perbaikan dan resubmission
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{selectedItem.projectTitle}</h3>
                                <p className="text-gray-600 text-sm">Vendor: {selectedItem.submittedBy}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan Penolakan untuk Vendor *
                                </label>
                                <Textarea
                                    value={managementNotes}
                                    onChange={(e) => setManagementNotes(e.target.value)}
                                    placeholder="Berikan alasan penolakan yang jelas dan petunjuk perbaikan untuk vendor..."
                                    rows={4}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                <Button 
                                    onClick={closeModals}
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleRejectSubmit}
                                    disabled={!managementNotes.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak & Kembalikan ke Vendor
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}