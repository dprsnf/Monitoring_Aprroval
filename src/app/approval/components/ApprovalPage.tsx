"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    FileText, 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle, 
    User,
    Calendar,
    Building,
    Eye,
    Download,
    MessageSquare,
    ChevronLeft,
    FolderOpen,
    ArrowLeft,
    ChevronDown,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DrawingDocument, VendorApproval } from "@/app/types";

export default function ApprovalPage() {
    const [selectedVendor, setSelectedVendor] = useState<VendorApproval | null>(null);
    const [selectedDrawing, setSelectedDrawing] = useState<DrawingDocument | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApprovalWithNotesModal, setShowApprovalWithNotesModal] = useState(false);
    const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [approvalWithNotes, setApprovalWithNotes] = useState("");

    // Sample data untuk vendor dan drawings mereka
    const vendorApprovals: VendorApproval[] = [
        {
            id: "V001",
            vendorName: "PT Surya Engineering",
            company: "PT Surya Engineering Solutions",
            projectTitle: "Gardu Induk Cibinong 150kV",
            submissionDate: "2024-10-01",
            category: "Electrical",
            priority: "high",
            reviewDeadline: "2024-10-15",
            totalDocuments: 5,
            pendingDocuments: 3,
            approvedDocuments: 1,
            rejectedDocuments: 1,
            description: "Pembangunan gardu induk 150kV dengan kapasitas 2x60 MVA untuk area Cibinong",
            drawings: [
                {
                    id: "DRW-001",
                    fileName: "SLD_GI_Cibinong_Rev01.pdf",
                    fileType: "PDF",
                    fileSize: "2.3 MB",
                    uploadDate: "2024-10-01",
                    status: "pending",
                    description: "Single Line Diagram gardu induk 150kV Cibinong dengan protection scheme lengkap",
                    category: "Electrical",
                    priority: "high"
                },
                {
                    id: "DRW-002",
                    fileName: "Layout_Plan_GI_Cibinong.pdf",
                    fileType: "PDF",
                    fileSize: "4.1 MB",
                    uploadDate: "2024-10-01",
                    status: "approved",
                    description: "Layout plan gardu induk dengan positioning equipment dan access road",
                    category: "Civil",
                    priority: "medium",
                    reviewNotes: "Layout sudah sesuai standar PLN",
                    reviewDate: "2024-10-03",
                    reviewedBy: "Ahmad Techical Team"
                },
                {
                    id: "DRW-003",
                    fileName: "Protection_System_Design.pdf",
                    fileType: "PDF",
                    fileSize: "3.8 MB",
                    uploadDate: "2024-10-02",
                    status: "pending",
                    description: "Desain sistem proteksi dengan relay coordination dan CT/PT calculation",
                    category: "Electrical",
                    priority: "high"
                },
                {
                    id: "DRW-004",
                    fileName: "Foundation_Design.pdf",
                    fileType: "PDF",
                    fileSize: "5.2 MB",
                    uploadDate: "2024-10-02",
                    status: "rejected",
                    description: "Desain pondasi untuk equipment gardu induk",
                    category: "Civil",
                    priority: "medium",
                    reviewNotes: "Perhitungan beban perlu diperbaiki sesuai standar terbaru",
                    reviewDate: "2024-10-03",
                    reviewedBy: "Budi Technical Team"
                },
                {
                    id: "DRW-005",
                    fileName: "Control_House_Layout.pdf",
                    fileType: "PDF",
                    fileSize: "2.8 MB",
                    uploadDate: "2024-10-02",
                    status: "pending",
                    description: "Layout control house dengan arrangement panel dan equipment",
                    category: "Electrical",
                    priority: "medium"
                }
            ]
        },
        {
            id: "V002",
            vendorName: "PT Buana Teknik",
            company: "PT Buana Teknik Mandiri",
            projectTitle: "Substation Bekasi 70kV",
            submissionDate: "2024-09-28",
            category: "Electrical",
            priority: "medium",
            reviewDeadline: "2024-10-12",
            totalDocuments: 3,
            pendingDocuments: 2,
            approvedDocuments: 1,
            rejectedDocuments: 0,
            description: "Upgrade substation 70kV di area Bekasi dengan penambahan bay baru",
            drawings: [
                {
                    id: "DRW-006",
                    fileName: "SLD_Substation_Bekasi.pdf",
                    fileType: "PDF",
                    fileSize: "1.9 MB",
                    uploadDate: "2024-09-28",
                    status: "approved",
                    description: "Single line diagram untuk upgrade substation Bekasi",
                    category: "Electrical",
                    priority: "medium",
                    reviewNotes: "Diagram sudah sesuai dengan requirement",
                    reviewDate: "2024-09-30",
                    reviewedBy: "Citra Technical Team"
                },
                {
                    id: "DRW-007",
                    fileName: "Bay_Addition_Layout.pdf",
                    fileType: "PDF",
                    fileSize: "3.2 MB",
                    uploadDate: "2024-09-29",
                    status: "pending",
                    description: "Layout penambahan bay baru dengan clearance calculation",
                    category: "Electrical",
                    priority: "medium"
                },
                {
                    id: "DRW-008",
                    fileName: "Cable_Routing_Plan.pdf",
                    fileType: "PDF",
                    fileSize: "2.1 MB",
                    uploadDate: "2024-09-29",
                    status: "pending",
                    description: "Routing plan untuk kabel control dan power bay baru",
                    category: "Electrical",
                    priority: "low"
                }
            ]
        },
        {
            id: "V003",
            vendorName: "PT Mitra Power",
            company: "PT Mitra Power Solutions",
            projectTitle: "Gardu Distribusi Tangerang",
            submissionDate: "2024-09-30",
            category: "Electrical",
            priority: "low",
            reviewDeadline: "2024-10-20",
            totalDocuments: 4,
            pendingDocuments: 4,
            approvedDocuments: 0,
            rejectedDocuments: 0,
            description: "Pembangunan gardu distribusi 20kV untuk area perumahan Tangerang",
            drawings: [
                {
                    id: "DRW-009",
                    fileName: "Distribution_SLD.pdf",
                    fileType: "PDF",
                    fileSize: "1.5 MB",
                    uploadDate: "2024-09-30",
                    status: "pending",
                    description: "Single line diagram gardu distribusi 20kV",
                    category: "Electrical",
                    priority: "low"
                },
                {
                    id: "DRW-010",
                    fileName: "Site_Plan_Distribution.pdf",
                    fileType: "PDF",
                    fileSize: "2.7 MB",
                    uploadDate: "2024-09-30",
                    status: "pending",
                    description: "Site plan untuk gardu distribusi dengan access road",
                    category: "Civil",
                    priority: "low"
                },
                {
                    id: "DRW-011",
                    fileName: "Equipment_Layout.pdf",
                    fileType: "PDF",
                    fileSize: "3.1 MB",
                    uploadDate: "2024-09-30",
                    status: "pending",
                    description: "Layout equipment transformer dan switchgear",
                    category: "Electrical",
                    priority: "low"
                },
                {
                    id: "DRW-012",
                    fileName: "Grounding_System.pdf",
                    fileType: "PDF",
                    fileSize: "1.8 MB",
                    uploadDate: "2024-09-30",
                    status: "pending",
                    description: "Desain sistem grounding untuk gardu distribusi",
                    category: "Electrical",
                    priority: "low"
                }
            ]
        }
    ];

    const filteredVendors = vendorApprovals.filter(vendor => {
        const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === "all") return matchesSearch;
        
        const hasMatchingDrawings = vendor.drawings.some(drawing => drawing.status === filterStatus);
        return matchesSearch && hasMatchingDrawings;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'revision_needed': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Electrical': return 'bg-purple-100 text-purple-800';
            case 'Civil': return 'bg-orange-100 text-orange-800';
            case 'Mechanical': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const handleVendorClick = (vendor: VendorApproval) => {
        setSelectedVendor(vendor);
    };

    const handleBackToVendors = () => {
        setSelectedVendor(null);
        setSelectedDrawing(null);
    };

    const handleApproveDrawing = (drawing: DrawingDocument) => {
        setSelectedDrawing(drawing);
        setShowConfirmApprovalModal(true);
    };

    const handleConfirmApproval = () => {
        if (selectedDrawing && selectedVendor) {
            // Direct approval after confirmation
            const updatedDrawings = selectedVendor.drawings.map(d => 
                d.id === selectedDrawing.id 
                    ? { 
                        ...d, 
                        status: "approved" as const,
                        reviewNotes: "Approved by Technical Team PLN",
                        reviewDate: new Date().toISOString().split('T')[0],
                        reviewedBy: "Technical Team PLN"
                    }
                    : d
            );
            
            setSelectedVendor({
                ...selectedVendor,
                drawings: updatedDrawings,
                approvedDocuments: selectedVendor.approvedDocuments + 1,
                pendingDocuments: selectedVendor.pendingDocuments - 1
            });
            
            setShowConfirmApprovalModal(false);
            setSelectedDrawing(null);
        }
    };

    const handleApproveWithNotesDrawing = (drawing: DrawingDocument) => {
        setSelectedDrawing(drawing);
        setApprovalWithNotes("");
        setShowApprovalWithNotesModal(true);
    };

    const handleRejectDrawing = (drawing: DrawingDocument) => {
        setSelectedDrawing(drawing);
        setShowRejectModal(true);
    };

    const handleRejectSubmit = () => {
        if (selectedDrawing && selectedVendor) {
            // Update drawing status
            const updatedDrawings = selectedVendor.drawings.map(drawing => 
                drawing.id === selectedDrawing.id 
                    ? { 
                        ...drawing, 
                        status: "rejected" as const,
                        reviewNotes: rejectReason,
                        reviewDate: new Date().toISOString().split('T')[0],
                        reviewedBy: "Current User"
                    }
                    : drawing
            );
            
            setSelectedVendor({
                ...selectedVendor,
                drawings: updatedDrawings,
                rejectedDocuments: selectedVendor.rejectedDocuments + 1,
                pendingDocuments: selectedVendor.pendingDocuments - 1
            });
            
            setRejectReason("");
            setShowRejectModal(false);
            setSelectedDrawing(null);
        }
    };

    const handleApprovalWithNotesSubmit = () => {
        if (selectedDrawing && selectedVendor && approvalWithNotes.trim()) {
            // Update drawing status with notes
            const updatedDrawings = selectedVendor.drawings.map(drawing => 
                drawing.id === selectedDrawing.id 
                    ? { 
                        ...drawing, 
                        status: "approved" as const,
                        reviewNotes: approvalWithNotes,
                        reviewDate: new Date().toISOString().split('T')[0],
                        reviewedBy: "Technical Team PLN"
                    }
                    : drawing
            );
            
            setSelectedVendor({
                ...selectedVendor,
                drawings: updatedDrawings,
                approvedDocuments: selectedVendor.approvedDocuments + 1,
                pendingDocuments: selectedVendor.pendingDocuments - 1
            });
            
            setApprovalWithNotes("");
            setShowApprovalWithNotesModal(false);
            setSelectedDrawing(null);
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
                            
                            {selectedVendor && (
                                <Button 
                                    onClick={handleBackToVendors}
                                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
                                >
                                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Back</span>
                                </Button>
                            )}
                            
                            <div className="h-6 sm:h-8 w-px bg-white/30 mx-1 sm:mx-2"></div>
                            
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-white truncate">
                                    {selectedVendor ? (
                                        <>
                                            <span className="block sm:hidden">{selectedVendor.vendorName}</span>
                                            <span className="hidden sm:block lg:hidden">{selectedVendor.vendorName} - Docs</span>
                                            <span className="hidden lg:block">{selectedVendor.vendorName} - Documents</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="block sm:hidden">Approval</span>
                                            <span className="hidden sm:block lg:hidden">Technical Approval</span>
                                            <span className="hidden lg:block">Technical Approval System</span>
                                        </>
                                    )}
                                </h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                                        <span className="text-xs sm:text-sm font-medium mr-1">User</span>
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                                    <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                                        <div className="py-1">
                                            <p className="text-sm font-semibold text-gray-900">Technical Team</p>
                                            <p className="text-xs text-[#14a2ba]">technical@pln.co.id</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                    <DropdownMenuItem className="hover:bg-red-50 cursor-pointer transition-all duration-200 focus:bg-red-100 mx-1 my-1 rounded-md">
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
                {!selectedVendor ? (
                    // Vendor List View
                    <>
                        {/* Page Header */}
                        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Technical Approval Dashboard</h2>
                            <p className="text-gray-700 text-sm sm:text-base">Review dan approve drawings dari vendor berdasarkan project</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="mb-4 sm:mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari vendor, company, atau project..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white text-gray-900"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm sm:text-base min-w-32"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Cards */}
                        <div className="space-y-4 sm:space-y-6">
                            {filteredVendors.map((vendor) => (
                                <Card 
                                    key={vendor.id} 
                                    className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/30 cursor-pointer hover:scale-[1.02]"
                                    onClick={() => handleVendorClick(vendor)}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{vendor.vendorName}</h3>
                                                    <Badge className={`${getPriorityColor(vendor.priority)} whitespace-nowrap`}>
                                                        {vendor.priority.toUpperCase()} Priority
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Building className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{vendor.company}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FolderOpen className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{vendor.projectTitle}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>Submitted: {vendor.submissionDate} | Deadline: {vendor.reviewDeadline}</span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-700 text-sm leading-relaxed">{vendor.description}</p>
                                            </div>
                                            
                                            <div className="w-full lg:w-auto lg:min-w-[300px]">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-4">
                                                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-blue-600">{vendor.totalDocuments}</div>
                                                        <div className="text-xs text-blue-700">Total</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-yellow-600">{vendor.pendingDocuments}</div>
                                                        <div className="text-xs text-yellow-700">Pending</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-green-600">{vendor.approvedDocuments}</div>
                                                        <div className="text-xs text-green-700">Approved</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-red-600">{vendor.rejectedDocuments}</div>
                                                        <div className="text-xs text-red-700">Rejected</div>
                                                    </div>
                                                </div>
                                                
                                                <Button className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Review Documents
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredVendors.length === 0 && (
                            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                                <CardContent className="p-8 sm:p-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        Tidak ada vendor yang sesuai dengan kriteria pencarian atau filter.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    // Drawing Documents View
                    <>
                        {/* Vendor Info Header */}
                        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedVendor.vendorName}</h2>
                                    <p className="text-gray-600 mb-2">{selectedVendor.company}</p>
                                    <p className="text-gray-700 font-medium">{selectedVendor.projectTitle}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className={getPriorityColor(selectedVendor.priority)}>
                                        {selectedVendor.priority.toUpperCase()} Priority
                                    </Badge>
                                    <Badge className={getCategoryColor(selectedVendor.category)}>
                                        {selectedVendor.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className="space-y-4 sm:space-y-6">
                            {selectedVendor.drawings.map((drawing) => (
                                <Card key={drawing.id} className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                                                    <h4 className="text-lg font-bold text-gray-900">{drawing.fileName}</h4>
                                                    <Badge className={`${getStatusColor(drawing.status)} whitespace-nowrap`}>
                                                        {drawing.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{drawing.fileSize} • {drawing.fileType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>Uploaded: {drawing.uploadDate}</span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-700 text-sm leading-relaxed mb-3">{drawing.description}</p>
                                                
                                                {drawing.reviewNotes && (
                                                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#14a2ba]">
                                                        <p className="text-sm text-gray-700 mb-1"><strong>Review Notes:</strong></p>
                                                        <p className="text-sm text-gray-600">{drawing.reviewNotes}</p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Reviewed by {drawing.reviewedBy} on {drawing.reviewDate}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="w-full lg:w-auto lg:min-w-[200px]">
                                                <div className="flex flex-col gap-2">
                                                    <Button className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Preview PDF
                                                    </Button>
                                                    <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                    
                                                    {drawing.status === "pending" && (
                                                        <>
                                                            <Button 
                                                                onClick={() => handleApproveDrawing(drawing)}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Approve
                                                            </Button>
                                                            
                                                            <Button 
                                                                onClick={() => handleApproveWithNotesDrawing(drawing)}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm mt-2"
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                                Approve with Notes
                                                            </Button>
                                                            
                                                            <Button 
                                                                onClick={() => handleRejectDrawing(drawing)}
                                                                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm mt-2"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Confirm Approval Modal */}
            <Dialog open={showConfirmApprovalModal} onOpenChange={setShowConfirmApprovalModal}>
                <DialogContent className="sm:max-w-[450px] bg-gradient-to-br from-white to-green-50 border border-green-200 shadow-xl">
                    <DialogHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg p-4 -m-6 mb-4">
                        <DialogTitle className="flex items-center gap-2 text-green-800">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            Konfirmasi Approval
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 mt-2">
                            Apakah Anda yakin ingin meng-approve drawing ini?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedDrawing && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Drawing Details:</h4>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>File:</strong> {selectedDrawing.fileName}
                                </p>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>Category:</strong> {selectedDrawing.category}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Description:</strong> {selectedDrawing.description}
                                </p>
                            </div>
                        )}
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">
                                <strong>⚠️ Perhatian:</strong> Setelah di-approve, drawing ini akan dikembalikan ke vendor dengan status approved dan tidak dapat diubah lagi.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700" 
                            onClick={() => setShowConfirmApprovalModal(false)}
                        >
                            Batal
                        </Button>
                        <Button 
                            onClick={handleConfirmApproval}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ya, Approve Drawing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50 border border-red-200 shadow-xl">
                    <DialogHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg p-4 -m-6 mb-4">
                        <DialogTitle className="flex items-center gap-2 text-red-800">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <XCircle className="w-4 h-4 text-white" />
                            </div>
                            Reject Drawing
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 mt-2">
                            {selectedDrawing && (
                                <>Reject drawing: <strong className="text-gray-900">{selectedDrawing.fileName}</strong></>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason" className="text-gray-900 font-semibold">Rejection Reason *</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Jelaskan alasan penolakan drawing ini..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[100px] border-red-200 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowRejectModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleRejectSubmit}
                            disabled={!rejectReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Drawing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve with Notes Modal */}
            <Dialog open={showApprovalWithNotesModal} onOpenChange={setShowApprovalWithNotesModal}>
                <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-xl">
                    <DialogHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg p-4 -m-6 mb-4">
                        <DialogTitle className="flex items-center gap-2 text-blue-800">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            Approve Drawing with Notes
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 mt-2">
                            {selectedDrawing && (
                                <>Approve drawing: <strong className="text-gray-900">{selectedDrawing.fileName}</strong> with additional notes</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approval-notes" className="text-gray-900 font-semibold">Approval Notes *</Label>
                            <Textarea
                                id="approval-notes"
                                placeholder="Berikan catatan tambahan untuk approval ini (misal: kondisi khusus, rekomendasi, dll)..."
                                value={approvalWithNotes}
                                onChange={(e) => setApprovalWithNotes(e.target.value)}
                                className="min-h-[100px] border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                            />
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">
                                <strong>Info:</strong> Drawing akan di-approve dengan catatan tambahan yang akan dikirim ke vendor sebagai informasi penting.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowApprovalWithNotesModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleApprovalWithNotesSubmit}
                            disabled={!approvalWithNotes.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Approve with Notes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}