"use client";

import { useState } from "react";
import { ChevronLeft, Search, Filter, Eye, CheckCircle, XCircle, Clock, User, Calendar, FileText, ChevronDown, LogOut, Download, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProgressItem {
    id: string;
    projectTitle: string;
    submittedBy: string;
    submissionDate: string;
    category: string;
    currentStep: number;
    totalSteps: number;
    status: "in_progress" | "approved" | "rejected" | "pending_review";
    assignedReviewer: string;
    estimatedCompletion: string;
    files: number;
    description: string;
    progressSteps: ProgressStep[];
    comments: Comment[];
}

interface ProgressStep {
    step: number;
    title: string;
    status: "completed" | "current" | "pending";
    completedDate?: string;
    reviewer?: string;
}

interface Comment {
    id: string;
    author: string;
    date: string;
    message: string;
    type: "info" | "warning" | "approval" | "rejection";
}

export default function ProgressApprovalPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedItem, setSelectedItem] = useState<ProgressItem | null>(null);
    const [showProgressModal, setShowProgressModal] = useState(false);

    // Sample progress data
    const [progressData] = useState<ProgressItem[]>([
        {
            id: "PROG-001",
            projectTitle: "Single Line Diagram - Gardu Induk Cibinong",
            submittedBy: "PT. Listrik Jaya",
            submissionDate: "2024-10-01 14:30",
            category: "Electrical",
            currentStep: 2,
            totalSteps: 4,
            status: "in_progress",
            assignedReviewer: "Ir. Ahmad Subandi",
            estimatedCompletion: "2024-10-05",
            files: 3,
            description: "Drawing teknis untuk sistem kelistrikan gardu induk dengan kapasitas 150kV",
            progressSteps: [
                { step: 1, title: "Document Submission", status: "completed", completedDate: "2024-10-01", reviewer: "System" },
                { step: 2, title: "Initial Review", status: "current", reviewer: "Ir. Ahmad Subandi" },
                { step: 3, title: "Technical Validation", status: "pending" },
                { step: 4, title: "Final Approval", status: "pending" }
            ],
            comments: [
                { id: "1", author: "Ir. Ahmad Subandi", date: "2024-10-02 09:30", message: "Document received and initial check completed. Proceeding to technical review.", type: "info" },
                { id: "2", author: "System", date: "2024-10-01 14:31", message: "Files successfully uploaded and validated.", type: "approval" }
            ]
        },
        {
            id: "PROG-002",
            projectTitle: "Civil Structure - Foundation Design",
            submittedBy: "CV. Konstruksi Prima",
            submissionDate: "2024-09-30 16:45",
            category: "Civil",
            currentStep: 4,
            totalSteps: 4,
            status: "approved",
            assignedReviewer: "Ir. Siti Nurhaliza",
            estimatedCompletion: "2024-10-01",
            files: 5,
            description: "Desain pondasi untuk bangunan tower transmisi 500kV",
            progressSteps: [
                { step: 1, title: "Document Submission", status: "completed", completedDate: "2024-09-30", reviewer: "System" },
                { step: 2, title: "Initial Review", status: "completed", completedDate: "2024-10-01", reviewer: "Ir. Siti Nurhaliza" },
                { step: 3, title: "Technical Validation", status: "completed", completedDate: "2024-10-01", reviewer: "Ir. Budi Santoso" },
                { step: 4, title: "Final Approval", status: "completed", completedDate: "2024-10-01", reviewer: "Ir. Siti Nurhaliza" }
            ],
            comments: [
                { id: "1", author: "Ir. Siti Nurhaliza", date: "2024-10-01 16:20", message: "All technical requirements met. Project approved for implementation.", type: "approval" },
                { id: "2", author: "Ir. Budi Santoso", date: "2024-10-01 14:15", message: "Technical validation completed. Foundation design meets standards.", type: "approval" }
            ]
        },
        {
            id: "PROG-003",
            projectTitle: "Electrical Panel Layout - Substation A",
            submittedBy: "PT. Teknik Elektro",
            submissionDate: "2024-09-29 10:15",
            category: "Electrical",
            currentStep: 3,
            totalSteps: 4,
            status: "pending_review",
            assignedReviewer: "Ir. Ahmad Subandi",
            estimatedCompletion: "2024-10-04",
            files: 4,
            description: "Layout panel listrik untuk gardu distribusi 20kV",
            progressSteps: [
                { step: 1, title: "Document Submission", status: "completed", completedDate: "2024-09-29", reviewer: "System" },
                { step: 2, title: "Initial Review", status: "completed", completedDate: "2024-09-30", reviewer: "Ir. Ahmad Subandi" },
                { step: 3, title: "Technical Validation", status: "current", reviewer: "Ir. Budi Santoso" },
                { step: 4, title: "Final Approval", status: "pending" }
            ],
            comments: [
                { id: "1", author: "Ir. Ahmad Subandi", date: "2024-09-30 11:45", message: "Initial review completed. Minor adjustments needed in cable routing. Please review technical validation feedback.", type: "warning" },
                { id: "2", author: "System", date: "2024-09-29 10:16", message: "Files successfully uploaded and validated.", type: "info" }
            ]
        },
        {
            id: "PROG-004",
            projectTitle: "Site Plan - Transmission Line",
            submittedBy: "PT. Survey Indonesia",
            submissionDate: "2024-09-28 13:20",
            category: "Civil",
            currentStep: 1,
            totalSteps: 4,
            status: "rejected",
            assignedReviewer: "Ir. Siti Nurhaliza",
            estimatedCompletion: "N/A",
            files: 2,
            description: "Site plan untuk jalur transmisi 150kV sepanjang 25km",
            progressSteps: [
                { step: 1, title: "Document Submission", status: "completed", completedDate: "2024-09-28", reviewer: "System" },
                { step: 2, title: "Initial Review", status: "pending" },
                { step: 3, title: "Technical Validation", status: "pending" },
                { step: 4, title: "Final Approval", status: "pending" }
            ],
            comments: [
                { id: "1", author: "Ir. Siti Nurhaliza", date: "2024-09-29 08:30", message: "Site plan does not meet environmental impact requirements. Please revise and resubmit with proper environmental assessment.", type: "rejection" },
                { id: "2", author: "System", date: "2024-09-28 13:21", message: "Files uploaded but missing required environmental documentation.", type: "warning" }
            ]
        }
    ]);

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
            case "in_progress":
                return (
                    <Badge className="bg-[#125d72] text-white hover:bg-[#125d72] border border-[#125d72]">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case "pending_review":
                return (
                    <Badge className="bg-[#efe62f] text-gray-900 hover:bg-[#efe62f] border border-[#efe62f]">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getProgressPercentage = (currentStep: number, totalSteps: number) => {
        return Math.round((currentStep / totalSteps) * 100);
    };

    const filteredData = progressData.filter(item => {
        const matchesSearch = item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusCount = (status: string) => {
        return progressData.filter(item => item.status === status).length;
    };

    const handleProgressClick = (item: ProgressItem) => {
        setSelectedItem(item);
        setShowProgressModal(true);
    };

    const closeProgressModal = () => {
        setShowProgressModal(false);
        setSelectedItem(null);
    };

    const getStepStatus = (step: ProgressStep) => {
        switch (step.status) {
            case "completed":
                return "bg-green-500 text-white";
            case "current":
                return "bg-[#125d72] text-white";
            case "pending":
                return "bg-gray-300 text-gray-600";
            default:
                return "bg-gray-300 text-gray-600";
        }
    };

    const getCommentStyle = (type: string) => {
        switch (type) {
            case "approval":
                return "border-green-200 bg-green-50";
            case "rejection":
                return "border-red-200 bg-red-50";
            case "warning":
                return "border-yellow-200 bg-yellow-50";
            case "info":
            default:
                return "border-blue-200 bg-blue-50";
        }
    };

    return (
        <div className="min-h-screen bg-[#14a2ba]">
            {/* Header */}
            <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href="/">
                                <Button className="group bg-[#efe62f] hover:bg-[#14a2ba] border border-white/20 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
                                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-900 group-hover:text-white" />
                                    <div className="text-xs sm:text-sm font-medium group-hover:text-white">
                                        <span className="hidden sm:inline">Kembali ke Dashboard</span>
                                        <span className="sm:hidden">Dashboard</span>
                                    </div>
                                </Button>
                            </Link>
                            <div className="h-8 w-px bg-blue-300"></div>
                            <h1 className="text-sm sm:text-xl font-semibold text-white">
                                Progress Approval
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="group flex items-center gap-1 sm:gap-3 bg-[#efe62f] hover:bg-[#125d72] border border-white/20 rounded-lg px-2 sm:px-3 py-2 transition-all duration-200 h-auto text-white shadow-sm hover:shadow-md">
                                        <div className="text-xs sm:text-sm text-gray-900 font-medium group-hover:text-white">
                                            <span className="hidden sm:inline">Nama Pengguna</span>
                                            <span className="sm:hidden">User</span>
                                        </div>
                                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-900 group-hover:text-white" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                                    <DropdownMenuLabel>
                                        <div className="py-1">
                                            <p className="text-sm font-semibold text-gray-900">Nama Pengguna</p>
                                            <p className="text-xs text-blue-600">user@pln.co.id</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-blue-100" />
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Progress Approval Drawing</h2>
                    <p className="text-gray-700 text-sm sm:text-base">Pantau progress review dan approval drawing yang sedang dalam proses</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{progressData.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Progress</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#125d72] mb-1 sm:mb-2">{getStatusCount("in_progress")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">{getStatusCount("pending_review")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Pending Review</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{getStatusCount("approved")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                        </CardContent>
                    </Card>
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
                                    <option value="in_progress">In Progress</option>
                                    <option value="pending_review">Pending Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white px-3 sm:px-4">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress List */}
                <div className="space-y-3 sm:space-y-4">
                    {filteredData.map((item) => (
                        <Card key={item.id} className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 hover:shadow-2xl transition-all duration-200">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{item.projectTitle}</h3>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs sm:text-sm font-medium text-gray-600">
                                                    Progress: Step {item.currentStep} of {item.totalSteps}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-[#125d72]">
                                                    {getProgressPercentage(item.currentStep, item.totalSteps)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                                                <div 
                                                    className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] h-2 sm:h-3 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage(item.currentStep, item.totalSteps)}%` }}
                                                />
                                            </div>
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
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#125d72]" />
                                                <span><strong>Reviewer:</strong> {item.assignedReviewer}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-2 justify-end">
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleProgressClick(item)}
                                            className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md text-xs sm:text-sm px-3 py-2"
                                        >
                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">View Progress</span>
                                            <span className="sm:hidden">Progress</span>
                                        </Button>
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
                {filteredData.length === 0 && (
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Tidak ada data ditemukan</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Coba ubah kata kunci pencarian atau filter status untuk melihat hasil lainnya.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Progress Detail Modal */}
            {showProgressModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">Progress Detail</h2>
                                    <p className="text-blue-100 text-xs sm:text-sm">ID: {selectedItem.id}</p>
                                </div>
                                <Button 
                                    onClick={closeProgressModal}
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
                                        Project Overview
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
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Assigned Reviewer</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.assignedReviewer}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Estimated Completion</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.estimatedCompletion}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Timeline */}
                            <Card className="shadow-lg border border-gray-200">
                                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                    <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                        Progress Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="space-y-4 sm:space-y-6">
                                        {selectedItem.progressSteps.map((step, index) => (
                                            <div key={step.step} className="flex items-center gap-3 sm:gap-4">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${getStepStatus(step)}`}>
                                                    {step.status === "completed" ? (
                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    ) : (
                                                        step.step
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h4>
                                                        <div className="flex flex-col sm:items-end text-xs sm:text-sm text-gray-600">
                                                            {step.completedDate && (
                                                                <span>Completed: {step.completedDate}</span>
                                                            )}
                                                            {step.reviewer && (
                                                                <span>Reviewer: {step.reviewer}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {index < selectedItem.progressSteps.length - 1 && (
                                                        <div className="ml-4 sm:ml-5 mt-2 h-6 w-px bg-gray-300"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comments Section */}
                            <Card className="shadow-lg border border-gray-200">
                                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                    <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                        Comments & Updates ({selectedItem.comments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        {selectedItem.comments.map((comment) => (
                                            <div key={comment.id} className={`p-3 sm:p-4 rounded-lg border ${getCommentStyle(comment.type)}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{comment.author}</span>
                                                    <span className="text-xs sm:text-sm text-gray-600">{comment.date}</span>
                                                </div>
                                                <p className="text-gray-800 text-xs sm:text-sm">{comment.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t bg-gray-50 p-3 sm:p-4 md:p-6 rounded-b-lg sm:rounded-b-xl">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                <Button 
                                    onClick={closeProgressModal}
                                    variant="outline" 
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 text-sm sm:text-base py-2"
                                >
                                    Close
                                </Button>
                                <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm sm:text-base py-2">
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Download Files</span>
                                    <span className="sm:hidden">Download</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}