"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { ChevronLeft, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, User, Calendar, FileText, ChevronDown, LogOut, Building, FolderOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HistoryDocument, VendorHistory } from "@/app/types/documentTypes";

import { Role, User as UserType } from "@/app/types";

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedVendor, setSelectedVendor] = useState<VendorHistory | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<HistoryDocument | null>(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    // Sample history data grouped by vendor
    const [historyData] = useState<VendorHistory[]>([
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
    ]);

    const currentUser: UserType = {
        id: 1,
        email: "budi.santoso@pln.co.id",
        name: "Budi Santoso",
        role: Role.Manager
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case "under_review":
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "high":
                return <Badge className="bg-red-100 text-red-800 border border-red-200">High</Badge>;
            case "medium":
                return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Medium</Badge>;
            default:
                return <Badge className="bg-green-100 text-green-800 border border-green-200">Low</Badge>;
        }
    };

    const filteredData = historyData.filter(vendor => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || vendor.finalStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const openVendorDetail = (vendor: VendorHistory) => {
        setSelectedVendor(vendor);
        setShowVendorModal(true);
    };

    const openDocumentDetail = (document: HistoryDocument) => {
        setSelectedDocument(document);
        setShowDocumentModal(true);
    };

    // Statistics calculation
    const totalVendors = historyData.length;
    const approvedVendors = historyData.filter(v => v.finalStatus === "approved").length;
    const rejectedVendors = historyData.filter(v => v.finalStatus === "rejected").length;
    const pendingVendors = historyData.filter(v => v.finalStatus === "under_review" || v.finalStatus === "pending").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
            {/* Header */}
            <Header currentUser={currentUser} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                                    <Building className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#14a2ba]" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Vendors</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{totalVendors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Approved</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{approvedVendors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl">
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Rejected</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{rejectedVendors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Review</p>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{pendingVendors}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200 mb-4 sm:mb-6 lg:mb-8">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search vendors, projects, companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 border-gray-200 focus:border-[#14a2ba] focus:ring-[#14a2ba] focus:ring-2 focus:ring-opacity-20 rounded-lg text-sm"
                                />
                            </div>
                            <div className="relative sm:w-auto w-full">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full sm:w-auto pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:border-[#14a2ba] focus:ring-[#14a2ba] focus:ring-2 focus:ring-opacity-20 bg-white text-sm min-w-[160px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor History List */}
                <div className="grid gap-3 sm:gap-4 lg:gap-6">
                    {filteredData.map((vendor) => (
                        <Card key={vendor.id} className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                            <CardContent className="p-4 sm:p-5 lg:p-6">
                                <div className="flex flex-col space-y-4">
                                    {/* Header Section */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                                                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate group-hover:text-[#14a2ba] transition-colors duration-200">
                                                    {vendor.projectTitle}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {getStatusBadge(vendor.finalStatus)}
                                                    {getPriorityBadge(vendor.priority)}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs sm:text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                                                    <span className="truncate">{vendor.vendorName}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                                                    <span className="truncate">{new Date(vendor.submissionDate).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                            
                                            {vendor.completionDate && (
                                                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                                                    <span className="truncate">Completed: {new Date(vendor.completionDate).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Statistics Section */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                        <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                                            <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{vendor.totalDocuments}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">Total Docs</p>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                            <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700">{vendor.approvedDocuments}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">Approved</p>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                                            <p className="text-sm sm:text-base lg:text-lg font-bold text-red-700">{vendor.rejectedDocuments}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">Rejected</p>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                                            <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-700">{vendor.pendingDocuments}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                                            {vendor.description}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col xs:flex-row gap-2 pt-2">
                                        <Button
                                            onClick={() => openVendorDetail(vendor)}
                                            className="flex-1 bg-gradient-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                                        >
                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 xs:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm"
                                        >
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredData.length === 0 && (
                    <Card className="bg-white/95 backdrop-blur border-0 shadow-md">
                        <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                            <div className="text-gray-400 mb-4 sm:mb-6">
                                <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto" />
                            </div>
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
                            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                                No vendor history matches your current search criteria. Try adjusting your filters or search terms.
                            </p>
                            <Button 
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                }}
                                className="mt-4 bg-[#14a2ba] hover:bg-[#125d72] text-white"
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Vendor Detail Modal */}
            <Dialog open={showVendorModal} onOpenChange={setShowVendorModal}>
                <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            Vendor History Details
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-gray-600">
                            Complete review history for vendor submission
                        </DialogDescription>
                    </DialogHeader>

                    {selectedVendor && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Vendor Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="space-y-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                        <Building className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                        Project Information
                                    </h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Project:</span>
                                            <span className="text-gray-900 break-words">{selectedVendor.projectTitle}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Vendor:</span>
                                            <span className="text-gray-900 break-words">{selectedVendor.vendorName}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Company:</span>
                                            <span className="text-gray-900 break-words">{selectedVendor.company}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Category:</span>
                                            <span className="text-gray-900">{selectedVendor.category}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Priority:</span>
                                            {getPriorityBadge(selectedVendor.priority)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                        Review Summary
                                    </h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[100px]">Submitted:</span>
                                            <span className="text-gray-900">{new Date(selectedVendor.submissionDate).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[100px]">Status:</span>
                                            {getStatusBadge(selectedVendor.finalStatus)}
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[100px]">Completed:</span>
                                            <span className="text-gray-900">{selectedVendor.completionDate ? new Date(selectedVendor.completionDate).toLocaleString('id-ID') : 'Not completed'}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[100px]">Reviewer:</span>
                                            <span className="text-gray-900">{selectedVendor.reviewer || 'Not assigned'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                    Project Description
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
                                    {selectedVendor.description}
                                </p>
                            </div>

                            {/* Documents */}
                            <div className="space-y-4">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                    <FolderOpen className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                    Documents ({selectedVendor.drawings.length})
                                </h4>
                                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
                                    {selectedVendor.drawings.map((doc) => (
                                        <div key={doc.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0 flex-1">
                                                            <h5 className="text-xs sm:text-sm font-medium text-gray-900 break-words">{doc.fileName}</h5>
                                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-1 rounded">{doc.fileSize}</span>
                                                        <span className="bg-gray-100 px-2 py-1 rounded">{new Date(doc.uploadDate).toLocaleDateString('id-ID')}</span>
                                                        {doc.reviewDate && (
                                                            <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                                                                Reviewed: {new Date(doc.reviewDate).toLocaleDateString('id-ID')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0">
                                                    {getStatusBadge(doc.status)}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDocumentDetail(doc)}
                                                        className="border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white text-xs"
                                                    >
                                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {doc.reviewNotes && (
                                                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Review Notes:</p>
                                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{doc.reviewNotes}</p>
                                                    {doc.reviewedBy && (
                                                        <p className="text-xs text-gray-500 mt-2 italic">— {doc.reviewedBy}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Document Detail Modal */}
            <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
                <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                            Document Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDocument && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="space-y-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                        File Information
                                    </h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[60px]">Name:</span>
                                            <span className="text-gray-900 break-all">{selectedDocument.fileName}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[60px]">Type:</span>
                                            <span className="text-gray-900">{selectedDocument.fileType}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[60px]">Size:</span>
                                            <span className="text-gray-900">{selectedDocument.fileSize}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[60px]">Category:</span>
                                            <span className="text-gray-900">{selectedDocument.category}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[60px]">Priority:</span>
                                            {getPriorityBadge(selectedDocument.priority)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                                        Review Status
                                    </h4>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Uploaded:</span>
                                            <span className="text-gray-900">{new Date(selectedDocument.uploadDate).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                            <span className="font-medium text-gray-700 min-w-[80px]">Status:</span>
                                            {getStatusBadge(selectedDocument.status)}
                                        </div>
                                        {selectedDocument.reviewDate && (
                                            <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                                <span className="font-medium text-gray-700 min-w-[80px]">Reviewed:</span>
                                                <span className="text-gray-900">{new Date(selectedDocument.reviewDate).toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {selectedDocument.reviewedBy && (
                                            <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                                                <span className="font-medium text-gray-700 min-w-[80px]">By:</span>
                                                <span className="text-gray-900">{selectedDocument.reviewedBy}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm sm:text-base font-semibold text-gray-900">Description</h4>
                                <p className="text-xs sm:text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
                                    {selectedDocument.description}
                                </p>
                            </div>

                            {selectedDocument.reviewNotes && (
                                <div className="space-y-3">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Review Notes</h4>
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{selectedDocument.reviewNotes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                <Button className="flex-1 bg-gradient-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                    Download Document
                                </Button>
                                <Button variant="outline" className="flex-1 sm:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm">
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}