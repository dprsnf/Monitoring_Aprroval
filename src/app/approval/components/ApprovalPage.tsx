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
import { Document, User, Role, Status, ApprovalType, Contract, Approval } from "@/app/types";

// Type untuk data yang ditampilkan di komponen ini (menggunakan type dari schema Prisma)
interface VendorData {
  user: User;
  documents: Document[];
  projectTitle: string;
  category: string;
  priority: "high" | "medium" | "low";
  reviewDeadline: string;
  description: string;
}

export default function ApprovalPage() {
    const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApprovalWithNotesModal, setShowApprovalWithNotesModal] = useState(false);
    const [showConfirmApprovalModal, setShowConfirmApprovalModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [approvalWithNotes, setApprovalWithNotes] = useState("");

    // Sample data menggunakan type yang sama dengan schema Prisma
    const vendorData: VendorData[] = [
        {
            user: {
                id: 1,
                email: "surya.engineering@example.com",
                name: "PT Surya Engineering",
                role: Role.Vendor
            },
            projectTitle: "Gardu Induk Cibinong 150kV",
            category: "Electrical",
            priority: "high",
            reviewDeadline: "2024-10-15",
            description: "Pembangunan gardu induk 150kV dengan kapasitas 2x60 MVA untuk area Cibinong",
            documents: [
                {
                    id: 1,
                    name: "SLD_GI_Cibinong_Rev01.pdf",
                    filePath: "/documents/sld-gi-cibinong.pdf",
                    status: Status.submitted,
                    overallDeadline: "2024-10-15",
                    documentType: ApprovalType.protection,
                    submittedBy: {
                        id: 1,
                        email: "surya.engineering@example.com",
                        name: "PT Surya Engineering",
                        role: Role.Vendor
                    },
                    submittedById: 1,
                    createdAt: "2024-10-01",
                    updatedAt: "2024-10-01",
                    version: 1,
                    approvals: [],
                    progress: "In Review"
                },
                {
                    id: 2,
                    name: "Layout_Plan_GI_Cibinong.pdf",
                    filePath: "/documents/layout-plan.pdf",
                    status: Status.approved,
                    overallDeadline: "2024-10-15",
                    documentType: ApprovalType.civil,
                    submittedBy: {
                        id: 1,
                        email: "surya.engineering@example.com",
                        name: "PT Surya Engineering",
                        role: Role.Vendor
                    },
                    submittedById: 1,
                    reviewedBy: {
                        id: 2,
                        email: "technical@pln.co.id",
                        name: "Ahmad Technical Team",
                        role: Role.Engineer
                    },
                    reviewedById: 2,
                    createdAt: "2024-10-01",
                    updatedAt: "2024-10-03",
                    version: 1,
                    remarks: "Layout sudah sesuai standar PLN",
                    approvals: [
                        {
                            id: 1,
                            documentId: 2,
                            type: ApprovalType.civil,
                            approvedBy: {
                                id: 2,
                                email: "technical@pln.co.id",
                                name: "Ahmad Technical Team",
                                role: Role.Engineer
                            },
                            approvedById: 2,
                            status: Status.approved,
                            notes: "Layout sudah sesuai standar PLN",
                            deadline: "2024-10-15",
                            createdAt: "2024-10-03",
                            updatedAt: "2024-10-03"
                        }
                    ],
                    progress: "Approved"
                },
                {
                    id: 3,
                    name: "Protection_System_Design.pdf",
                    filePath: "/documents/protection-design.pdf",
                    status: Status.inReviewEngineering,
                    overallDeadline: "2024-10-15",
                    documentType: ApprovalType.protection,
                    submittedBy: {
                        id: 1,
                        email: "surya.engineering@example.com",
                        name: "PT Surya Engineering",
                        role: Role.Vendor
                    },
                    submittedById: 1,
                    createdAt: "2024-10-02",
                    updatedAt: "2024-10-02",
                    version: 1,
                    approvals: [],
                    progress: "In Review"
                }
            ]
        },
        {
            user: {
                id: 3,
                email: "buana.teknik@example.com",
                name: "PT Buana Teknik",
                role: Role.Vendor
            },
            projectTitle: "Substation Bekasi 70kV",
            category: "Electrical",
            priority: "medium",
            reviewDeadline: "2024-10-12",
            description: "Upgrade substation 70kV di area Bekasi dengan penambahan bay baru",
            documents: [
                {
                    id: 4,
                    name: "SLD_Substation_Bekasi.pdf",
                    filePath: "/documents/sld-bekasi.pdf",
                    status: Status.approved,
                    overallDeadline: "2024-10-12",
                    documentType: ApprovalType.protection,
                    submittedBy: {
                        id: 3,
                        email: "buana.teknik@example.com",
                        name: "PT Buana Teknik",
                        role: Role.Vendor
                    },
                    submittedById: 3,
                    reviewedBy: {
                        id: 2,
                        email: "technical@pln.co.id",
                        name: "Citra Technical Team",
                        role: Role.Engineer
                    },
                    reviewedById: 2,
                    createdAt: "2024-09-28",
                    updatedAt: "2024-09-30",
                    version: 1,
                    remarks: "Diagram sudah sesuai dengan requirement",
                    approvals: [
                        {
                            id: 2,
                            documentId: 4,
                            type: ApprovalType.protection,
                            approvedBy: {
                                id: 2,
                                email: "technical@pln.co.id",
                                name: "Citra Technical Team",
                                role: Role.Engineer
                            },
                            approvedById: 2,
                            status: Status.approved,
                            notes: "Diagram sudah sesuai dengan requirement",
                            deadline: "2024-10-12",
                            createdAt: "2024-09-30",
                            updatedAt: "2024-09-30"
                        }
                    ],
                    progress: "Approved"
                }
            ]
        }
    ];

    const filteredVendors = vendorData.filter(vendor => {
        const matchesSearch = vendor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === "all") return matchesSearch;
        
        const hasMatchingDocuments = vendor.documents.some(doc => doc.status === filterStatus);
        return matchesSearch && hasMatchingDocuments;
    });

    // Helper functions untuk menghitung dokumen berdasarkan status
    const getDocumentCounts = (documents: Document[]) => {
        return {
            total: documents.length,
            pending: documents.filter(doc => 
                doc.status === Status.submitted || 
                doc.status === Status.inReviewConsultant ||
                doc.status === Status.inReviewEngineering ||
                doc.status === Status.inReviewManager
            ).length,
            approved: documents.filter(doc => 
                doc.status === Status.approved || 
                doc.status === Status.approvedWithNotes
            ).length,
            rejected: documents.filter(doc => doc.status === Status.rejected).length
        };
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case Status.submitted:
            case Status.inReviewConsultant:
            case Status.inReviewEngineering:
            case Status.inReviewManager:
                return 'bg-yellow-100 text-yellow-800';
            case Status.approved:
            case Status.approvedWithNotes:
                return 'bg-green-100 text-green-800';
            case Status.rejected:
                return 'bg-red-100 text-red-800';
            case Status.returnForCorrection:
                return 'bg-orange-100 text-orange-800';
            case Status.overdue:
                return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: Status) => {
        switch (status) {
            case Status.submitted: return 'Submitted';
            case Status.inReviewConsultant: return 'In Review Consultant';
            case Status.inReviewEngineering: return 'In Review Engineering';
            case Status.inReviewManager: return 'In Review Manager';
            case Status.approved: return 'Approved';
            case Status.approvedWithNotes: return 'Approved with Notes';
            case Status.returnForCorrection: return 'Return for Correction';
            case Status.rejected: return 'Rejected';
            case Status.overdue: return 'Overdue';
            default: return status;
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

    const handleVendorClick = (vendor: VendorData) => {
        setSelectedVendor(vendor);
    };

    const handleBackToVendors = () => {
        setSelectedVendor(null);
        setSelectedDocument(null);
    };

    const handleApproveDocument = (document: Document) => {
        setSelectedDocument(document);
        setShowConfirmApprovalModal(true);
    };

    const handleConfirmApproval = () => {
        if (selectedDocument && selectedVendor) {
            // Update document status
            const updatedDocuments = selectedVendor.documents.map(doc => 
                doc.id === selectedDocument.id 
                    ? { 
                        ...doc, 
                        status: Status.approved,
                        remarks: "Approved by Technical Team PLN",
                        updatedAt: new Date().toISOString().split('T')[0],
                        reviewedBy: {
                            id: 2,
                            email: "technical@pln.co.id",
                            name: "Technical Team PLN",
                            role: Role.Engineer
                        },
                        reviewedById: 2
                    }
                    : doc
            );
            
            setSelectedVendor({
                ...selectedVendor,
                documents: updatedDocuments
            });
            
            setShowConfirmApprovalModal(false);
            setSelectedDocument(null);
        }
    };

    const handleApproveWithNotesDocument = (document: Document) => {
        setSelectedDocument(document);
        setApprovalWithNotes("");
        setShowApprovalWithNotesModal(true);
    };

    const handleRejectDocument = (document: Document) => {
        setSelectedDocument(document);
        setShowRejectModal(true);
    };

    const handleRejectSubmit = () => {
        if (selectedDocument && selectedVendor) {
            // Update document status
            const updatedDocuments = selectedVendor.documents.map(doc => 
                doc.id === selectedDocument.id 
                    ? { 
                        ...doc, 
                        status: Status.rejected,
                        remarks: rejectReason,
                        updatedAt: new Date().toISOString().split('T')[0],
                        reviewedBy: {
                            id: 2,
                            email: "technical@pln.co.id",
                            name: "Current User",
                            role: Role.Engineer
                        },
                        reviewedById: 2
                    }
                    : doc
            );
            
            setSelectedVendor({
                ...selectedVendor,
                documents: updatedDocuments
            });
            
            setRejectReason("");
            setShowRejectModal(false);
            setSelectedDocument(null);
        }
    };

    const handleApprovalWithNotesSubmit = () => {
        if (selectedDocument && selectedVendor && approvalWithNotes.trim()) {
            // Update document status with notes
            const updatedDocuments = selectedVendor.documents.map(doc => 
                doc.id === selectedDocument.id 
                    ? { 
                        ...doc, 
                        status: Status.approvedWithNotes,
                        remarks: approvalWithNotes,
                        updatedAt: new Date().toISOString().split('T')[0],
                        reviewedBy: {
                            id: 2,
                            email: "technical@pln.co.id",
                            name: "Technical Team PLN",
                            role: Role.Engineer
                        },
                        reviewedById: 2
                    }
                    : doc
            );
            
            setSelectedVendor({
                ...selectedVendor,
                documents: updatedDocuments
            });
            
            setApprovalWithNotes("");
            setShowApprovalWithNotesModal(false);
            setSelectedDocument(null);
        }
    };

    // Render utama
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
                                            <span className="block sm:hidden">{selectedVendor.user.name}</span>
                                            <span className="hidden sm:block lg:hidden">{selectedVendor.user.name} - Docs</span>
                                            <span className="hidden lg:block">{selectedVendor.user.name} - Documents</span>
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
                            <p className="text-gray-700 text-sm sm:text-base">Review dan approve documents dari vendor berdasarkan project</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="mb-4 sm:mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Cari vendor, project, atau description..."
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
                                        <option value={Status.submitted}>Submitted</option>
                                        <option value={Status.inReviewEngineering}>In Review</option>
                                        <option value={Status.approved}>Approved</option>
                                        <option value={Status.rejected}>Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Cards */}
                        <div className="space-y-4 sm:space-y-6">
                            {filteredVendors.map((vendor) => {
                                const counts = getDocumentCounts(vendor.documents);
                                return (
                                <Card 
                                    key={vendor.user.id} 
                                    className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/30 cursor-pointer hover:scale-[1.02]"
                                    onClick={() => handleVendorClick(vendor)}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{vendor.user.name}</h3>
                                                    <Badge className={`${getPriorityColor(vendor.priority)} whitespace-nowrap`}>
                                                        {vendor.priority.toUpperCase()} Priority
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Building className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{vendor.user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <FolderOpen className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{vendor.projectTitle}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>Deadline: {vendor.reviewDeadline}</span>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-gray-700 text-sm leading-relaxed">{vendor.description}</p>
                                            </div>
                                            
                                            <div className="w-full lg:w-auto lg:min-w-[300px]">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-4">
                                                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-blue-600">{counts.total}</div>
                                                        <div className="text-xs text-blue-700">Total</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-yellow-600">{counts.pending}</div>
                                                        <div className="text-xs text-yellow-700">Pending</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-green-600">{counts.approved}</div>
                                                        <div className="text-xs text-green-700">Approved</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-bold text-red-600">{counts.rejected}</div>
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
                            )})}
                        </div>

                        {filteredVendors.length === 0 && (
                            <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                                <CardContent className="p-8 sm:p-12 text-center">
                                    <div className="text-gray-400 mb-4">
                                        {/* <User className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" /> */}
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
                    // Documents View
                    <>
                        {/* Vendor Info Header */}
                        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedVendor.user.name}</h2>
                                    <p className="text-gray-600 mb-2">{selectedVendor.user.email}</p>
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
                            {selectedVendor.documents.map((document) => (
                                <Card key={document.id} className="overflow-hidden shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                                                    <h4 className="text-lg font-bold text-gray-900">{document.name}</h4>
                                                    <Badge className={`${getStatusColor(document.status)} whitespace-nowrap`}>
                                                        {getStatusText(document.status)}
                                                    </Badge>
                                                    {document.documentType && (
                                                        <Badge variant="outline" className="whitespace-nowrap">
                                                            {document.documentType}
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>{document.filePath.split('.').pop()?.toUpperCase()} • {document.updatedAt}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-[#14a2ba]" />
                                                        <span>Created: {document.createdAt}</span>
                                                    </div>
                                                </div>
                                                
                                                {document.progress && (
                                                    <p className="text-gray-700 text-sm leading-relaxed mb-3">Progress: {document.progress}</p>
                                                )}
                                                
                                                {document.remarks && (
                                                    <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#14a2ba]">
                                                        <p className="text-sm text-gray-700 mb-1"><strong>Remarks:</strong></p>
                                                        <p className="text-sm text-gray-600">{document.remarks}</p>
                                                        {document.reviewedBy && document.updatedAt && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Reviewed by {document.reviewedBy.name} on {document.updatedAt}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="w-full lg:w-auto lg:min-w-[200px]">
                                                <div className="flex flex-col gap-2">
                                                    <Button className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Preview Document
                                                    </Button>
                                                    <Button className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                    
                                                    {(document.status === Status.submitted || 
                                                      document.status === Status.inReviewEngineering) && (
                                                        <>
                                                            <Button 
                                                                onClick={() => handleApproveDocument(document)}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Approve
                                                            </Button>
                                                            
                                                            <Button 
                                                                onClick={() => handleApproveWithNotesDocument(document)}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm mt-2"
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                                Approve with Notes
                                                            </Button>
                                                            
                                                            <Button 
                                                                onClick={() => handleRejectDocument(document)}
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
                            Apakah Anda yakin ingin meng-approve document ini?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedDocument && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Document Details:</h4>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>File:</strong> {selectedDocument.name}
                                </p>
                                <p className="text-sm text-gray-700 mb-1">
                                    <strong>Type:</strong> {selectedDocument.documentType || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <strong>Status:</strong> {getStatusText(selectedDocument.status)}
                                </p>
                            </div>
                        )}
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">
                                <strong>⚠️ Perhatian:</strong> Setelah di-approve, document ini akan dikembalikan ke vendor dengan status approved dan tidak dapat diubah lagi.
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
                            Ya, Approve Document
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
                            Reject Document
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 mt-2">
                            {selectedDocument && (
                                <>Reject document: <strong className="text-gray-900">{selectedDocument.name}</strong></>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason" className="text-gray-900 font-semibold">Rejection Reason *</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Jelaskan alasan penolakan document ini..."
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
                            Reject Document
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
                            Approve Document with Notes
                        </DialogTitle>
                        <DialogDescription className="text-gray-700 mt-2">
                            {selectedDocument && (
                                <>Approve document: <strong className="text-gray-900">{selectedDocument.name}</strong> with additional notes</>
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
                                <strong>Info:</strong> Document akan di-approve dengan catatan tambahan yang akan dikirim ke vendor sebagai informasi penting.
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