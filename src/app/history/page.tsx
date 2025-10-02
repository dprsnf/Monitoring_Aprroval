"use client";

import { useState } from "react";
import { ChevronLeft, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, User, Calendar, FileText, ChevronDown, LogOut } from "lucide-react";
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

interface HistoryItem {
    id: string;
    projectTitle: string;
    submittedBy: string;
    submissionDate: string;
    category: string;
    status: "approved" | "rejected" | "pending" | "under_review";
    reviewDate?: string;
    reviewer?: string;
    files: number;
    description: string;
}

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Sample history data
    const [historyData] = useState<HistoryItem[]>([
        {
            id: "HIST-001",
            projectTitle: "Single Line Diagram - Gardu Induk Cibinong",
            submittedBy: "PT. Listrik Jaya",
            submissionDate: "2024-10-01 14:30",
            category: "Electrical",
            status: "approved",
            reviewDate: "2024-10-02 09:15",
            reviewer: "Ir. Ahmad Subandi",
            files: 3,
            description: "Drawing teknis untuk sistem kelistrikan gardu induk dengan kapasitas 150kV"
        },
        {
            id: "HIST-002",
            projectTitle: "Civil Structure - Foundation Design",
            submittedBy: "CV. Konstruksi Prima",
            submissionDate: "2024-09-30 16:45",
            category: "Civil",
            status: "rejected",
            reviewDate: "2024-10-01 11:20",
            reviewer: "Ir. Siti Nurhaliza",
            files: 5,
            description: "Desain pondasi untuk bangunan tower transmisi 500kV"
        },
        {
            id: "HIST-003",
            projectTitle: "Electrical Panel Layout - Substation A",
            submittedBy: "PT. Teknik Elektro",
            submissionDate: "2024-09-29 10:15",
            category: "Electrical",
            status: "under_review",
            files: 4,
            description: "Layout panel listrik untuk gardu distribusi 20kV"
        },
        {
            id: "HIST-004",
            projectTitle: "Site Plan - Transmission Line",
            submittedBy: "PT. Survey Indonesia",
            submissionDate: "2024-09-28 13:20",
            category: "Civil",
            status: "pending",
            files: 2,
            description: "Site plan untuk jalur transmisi 150kV sepanjang 25km"
        },
        {
            id: "HIST-005",
            projectTitle: "Protection System Diagram",
            submittedBy: "PT. Listrik Jaya",
            submissionDate: "2024-09-27 15:10",
            category: "Electrical",
            status: "approved",
            reviewDate: "2024-09-28 08:45",
            reviewer: "Ir. Budi Santoso",
            files: 6,
            description: "Diagram sistem proteksi untuk gardu induk 500kV"
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
            case "under_review":
                return (
                    <Badge className="bg-[#125d72] text-white hover:bg-[#125d72] border border-[#125d72]">
                        <Eye className="w-3 h-3 mr-1" />
                        Under Review
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-[#efe62f] text-gray-900 hover:bg-[#efe62f] border border-[#efe62f]">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            case "under_review":
                return "text-[#125d72]";
            case "pending":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    const filteredData = historyData.filter(item => {
        const matchesSearch = item.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusCount = (status: string) => {
        return historyData.filter(item => item.status === status).length;
    };

    const handleDetailClick = (item: HistoryItem) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedItem(null);
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
                                Histori Submission
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Histori Submission Drawing</h2>
                    <p className="text-gray-700 text-sm sm:text-base">Lihat riwayat submission drawing yang telah diajukan dan status reviewnya</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{historyData.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Total Submission</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">{getStatusCount("approved")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Approved</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#125d72] mb-1 sm:mb-2">{getStatusCount("under_review")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Under Review</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{getStatusCount("rejected")}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Rejected</div>
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
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white px-3 sm:px-4">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* History List */}
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

                                        {item.reviewDate && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                    <span><strong>Review:</strong> {item.reviewDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                    <span><strong>Reviewer:</strong> {item.reviewer}</span>
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

            {/* Detail Modal */}
            {showDetailModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] text-white p-3 sm:p-4 md:p-6 rounded-t-lg sm:rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1">Detail Submission</h2>
                                    <p className="text-blue-100 text-xs sm:text-sm">ID: {selectedItem.id}</p>
                                </div>
                                <Button 
                                    onClick={closeDetailModal}
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
                                        Informasi Proyek
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Judul Proyek</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.projectTitle}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Kategori</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Vendor/Perusahaan</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.submittedBy}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Jumlah File</label>
                                            <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.files} file(s)</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 sm:mt-4">
                                        <label className="text-xs sm:text-sm font-medium text-gray-600">Deskripsi</label>
                                        <p className="text-gray-900 mt-1 p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">{selectedItem.description}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Timeline */}
                            <Card className="shadow-lg border border-gray-200">
                                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                    <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                        Status & Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Status Saat Ini</p>
                                                <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs sm:text-sm font-medium text-gray-600">Tanggal Submit</p>
                                                <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.submissionDate}</p>
                                            </div>
                                        </div>

                                        {selectedItem.reviewDate && (
                                            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">Tanggal Review</p>
                                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.reviewDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">Reviewer</p>
                                                        <p className="text-gray-900 font-semibold mt-1 text-sm sm:text-base">{selectedItem.reviewer}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sample Files List */}
                            <Card className="shadow-lg border border-gray-200">
                                <CardHeader className="bg-gray-50 border-b p-3 sm:p-4">
                                    <CardTitle className="text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
                                        File Dokumen ({selectedItem.files})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4 md:p-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        {Array.from({ length: selectedItem.files }, (_, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72] flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Drawing_{selectedItem.category}_{index + 1}.pdf</p>
                                                        <p className="text-xs sm:text-sm text-gray-600">2.5 MB • PDF Document</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" className="text-[#125d72] border-[#125d72] hover:bg-[#125d72] hover:text-white text-xs px-2 py-1">
                                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">View</span>
                                                    </Button>
                                                    <Button size="sm" className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white text-xs px-2 py-1">
                                                        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Download</span>
                                                    </Button>
                                                </div>
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
                                    onClick={closeDetailModal}
                                    variant="outline" 
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 text-sm sm:text-base py-2"
                                >
                                    Tutup
                                </Button>
                                <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white text-sm sm:text-base py-2">
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Download Semua File</span>
                                    <span className="sm:hidden">Download All</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}