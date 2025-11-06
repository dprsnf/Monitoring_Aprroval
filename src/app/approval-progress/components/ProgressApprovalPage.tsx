"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  ChevronDown,
  LogOut,
  Download,
  MessageSquare,
  Building,
  FolderOpen,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProgressDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  currentStep: number;
  totalSteps: number;
  status: "in_progress" | "completed" | "on_hold" | "rejected";
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  progressSteps: ProgressStep[];
  comments: Comment[];
}

interface ProgressStep {
  step: number;
  title: string;
  status: "completed" | "current" | "pending";
  completedDate?: string;
  reviewer?: string;
  description?: string;
}

interface Comment {
  id: string;
  author: string;
  date: string;
  message: string;
  type: "info" | "warning" | "approval" | "rejection";
}

interface VendorProgress {
  id: string;
  vendorName: string;
  company: string;
  projectTitle: string;
  submissionDate: string;
  category: string;
  priority: "high" | "medium" | "low";
  overallProgress: number;
  totalDocuments: number;
  completedDocuments: number;
  inProgressDocuments: number;
  onHoldDocuments: number;
  estimatedCompletion: string;
  assignedReviewer: string;
  drawings: ProgressDocument[];
  description: string;
}

export default function ProgressApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorProgress | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] =
    useState<ProgressDocument | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Sample progress data grouped by vendor
  const [progressData] = useState<VendorProgress[]>([
    {
      id: "VP-001",
      vendorName: "PT. Listrik Jaya",
      company: "PT. Listrik Jaya Abadi",
      projectTitle: "Gardu Induk Cibinong - Sistem Kelistrikan",
      submissionDate: "2024-10-01 14:30",
      category: "Electrical",
      priority: "high",
      overallProgress: 65,
      totalDocuments: 3,
      completedDocuments: 1,
      inProgressDocuments: 2,
      onHoldDocuments: 0,
      estimatedCompletion: "2024-10-05",
      assignedReviewer: "Ir. Ahmad Subandi",
      description:
        "Proyek pembangunan gardu induk dengan kapasitas 150kV untuk wilayah Cibinong",
      drawings: [
        {
          id: "DOC-001",
          fileName: "Single_Line_Diagram_GI_Cibinong.pdf",
          fileType: "PDF",
          fileSize: "2.5 MB",
          uploadDate: "2024-10-01 14:30",
          currentStep: 4,
          totalSteps: 4,
          status: "completed",
          description: "Diagram satu garis sistem kelistrikan gardu induk",
          category: "Electrical",
          priority: "high",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "System",
              description: "File berhasil diunggah dan divalidasi",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-10-02",
              reviewer: "Ir. Ahmad Subandi",
              description: "Review awal dokumen selesai",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "completed",
              completedDate: "2024-10-03",
              reviewer: "Tim Teknis",
              description: "Validasi teknis selesai",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "completed",
              completedDate: "2024-10-04",
              reviewer: "Ir. Ahmad Subandi",
              description: "Dokumen disetujui",
            },
          ],
          comments: [
            {
              id: "1",
              author: "Ir. Ahmad Subandi",
              date: "2024-10-04 15:30",
              message:
                "Dokumen telah sesuai dengan standar PLN dan disetujui untuk implementasi.",
              type: "approval",
            },
            {
              id: "2",
              author: "Tim Teknis",
              date: "2024-10-03 10:15",
              message: "Validasi teknis selesai, diagram sudah sesuai standar.",
              type: "info",
            },
          ],
        },
        {
          id: "DOC-002",
          fileName: "Protection_Scheme_150kV.pdf",
          fileType: "PDF",
          fileSize: "1.8 MB",
          uploadDate: "2024-10-01 14:35",
          currentStep: 2,
          totalSteps: 4,
          status: "in_progress",
          description: "Skema proteksi untuk sistem 150kV",
          category: "Electrical",
          priority: "high",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "System",
              description: "File berhasil diunggah",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "current",
              reviewer: "Ir. Ahmad Subandi",
              description: "Sedang dalam review awal",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "pending",
              description: "Menunggu validasi teknis",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "pending",
              description: "Menunggu persetujuan final",
            },
          ],
          comments: [
            {
              id: "3",
              author: "Ir. Ahmad Subandi",
              date: "2024-10-02 09:30",
              message:
                "Dokumen sedang dalam review. Ada beberapa poin yang perlu klarifikasi.",
              type: "info",
            },
            {
              id: "4",
              author: "System",
              date: "2024-10-01 14:36",
              message: "File berhasil diunggah dan divalidasi.",
              type: "approval",
            },
          ],
        },
        {
          id: "DOC-003",
          fileName: "Equipment_Layout_GI.pdf",
          fileType: "PDF",
          fileSize: "3.2 MB",
          uploadDate: "2024-10-01 14:40",
          currentStep: 3,
          totalSteps: 4,
          status: "in_progress",
          description: "Layout peralatan di gardu induk",
          category: "Electrical",
          priority: "medium",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "System",
              description: "File berhasil diunggah",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-10-02",
              reviewer: "Ir. Ahmad Subandi",
              description: "Review awal selesai",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "current",
              reviewer: "Tim Teknis",
              description: "Sedang dalam validasi teknis",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "pending",
              description: "Menunggu persetujuan final",
            },
          ],
          comments: [
            {
              id: "5",
              author: "Tim Teknis",
              date: "2024-10-03 14:20",
              message:
                "Validasi teknis sedang berlangsung. Layout clearance sedang diperiksa.",
              type: "info",
            },
            {
              id: "6",
              author: "Ir. Ahmad Subandi",
              date: "2024-10-02 16:45",
              message:
                "Review awal selesai, diteruskan ke tim teknis untuk validasi.",
              type: "approval",
            },
          ],
        },
      ],
    },
    {
      id: "VP-002",
      vendorName: "CV. Konstruksi Prima",
      company: "CV. Konstruksi Prima Indonesia",
      projectTitle: "Foundation Design - Tower Transmisi 500kV",
      submissionDate: "2024-09-30 16:45",
      category: "Civil",
      priority: "high",
      overallProgress: 25,
      totalDocuments: 2,
      completedDocuments: 0,
      inProgressDocuments: 1,
      onHoldDocuments: 1,
      estimatedCompletion: "2024-10-08",
      assignedReviewer: "Ir. Siti Nurhaliza",
      description:
        "Desain pondasi untuk tower transmisi 500kV jalur Surabaya-Jakarta",
      drawings: [
        {
          id: "DOC-004",
          fileName: "Foundation_Design_500kV.pdf",
          fileType: "PDF",
          fileSize: "4.1 MB",
          uploadDate: "2024-09-30 16:45",
          currentStep: 2,
          totalSteps: 4,
          status: "on_hold",
          description: "Desain pondasi tower transmisi 500kV",
          category: "Civil",
          priority: "high",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-09-30",
              reviewer: "System",
              description: "File berhasil diunggah",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "current",
              reviewer: "Ir. Siti Nurhaliza",
              description: "Review ditahan - perlu revisi",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "pending",
              description: "Menunggu perbaikan dokumen",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "pending",
              description: "Menunggu perbaikan dokumen",
            },
          ],
          comments: [
            {
              id: "7",
              author: "Ir. Siti Nurhaliza",
              date: "2024-10-01 11:20",
              message:
                "Perhitungan beban angin tidak sesuai standar SNI. Mohon diperbaiki sebelum melanjutkan review.",
              type: "warning",
            },
            {
              id: "8",
              author: "System",
              date: "2024-09-30 16:46",
              message: "File berhasil diunggah dan divalidasi.",
              type: "approval",
            },
          ],
        },
        {
          id: "DOC-005",
          fileName: "Soil_Investigation_Report.pdf",
          fileType: "PDF",
          fileSize: "2.8 MB",
          uploadDate: "2024-09-30 16:50",
          currentStep: 1,
          totalSteps: 4,
          status: "in_progress",
          description: "Laporan investigasi tanah lokasi tower",
          category: "Civil",
          priority: "high",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "current",
              reviewer: "System",
              description: "Sedang dalam proses validasi format",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "pending",
              description: "Menunggu validasi format selesai",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "pending",
              description: "Menunggu review awal",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "pending",
              description: "Menunggu validasi teknis",
            },
          ],
          comments: [
            {
              id: "9",
              author: "System",
              date: "2024-09-30 16:51",
              message:
                "File sedang dalam proses validasi format dan integritas.",
              type: "info",
            },
          ],
        },
      ],
    },
    {
      id: "VP-003",
      vendorName: "PT. Teknik Elektro",
      company: "PT. Teknik Elektro Nusantara",
      projectTitle: "Electrical Panel Layout - Substation A",
      submissionDate: "2024-09-29 10:15",
      category: "Electrical",
      priority: "medium",
      overallProgress: 87,
      totalDocuments: 4,
      completedDocuments: 3,
      inProgressDocuments: 1,
      onHoldDocuments: 0,
      estimatedCompletion: "2024-10-02",
      assignedReviewer: "Ir. Bambang Sutrisno",
      description:
        "Layout panel listrik untuk gardu distribusi 20kV wilayah Jakarta Selatan",
      drawings: [
        {
          id: "DOC-006",
          fileName: "Panel_Layout_20kV.pdf",
          fileType: "PDF",
          fileSize: "2.1 MB",
          uploadDate: "2024-09-29 10:15",
          currentStep: 4,
          totalSteps: 4,
          status: "completed",
          description: "Layout panel distribusi 20kV",
          category: "Electrical",
          priority: "medium",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-09-29",
              reviewer: "System",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-09-30",
              reviewer: "Ir. Bambang Sutrisno",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Tim Teknis",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Ir. Bambang Sutrisno",
            },
          ],
          comments: [
            {
              id: "10",
              author: "Ir. Bambang Sutrisno",
              date: "2024-10-01 16:30",
              message:
                "Layout panel sudah sesuai standar PLN SPLN dan disetujui.",
              type: "approval",
            },
          ],
        },
        {
          id: "DOC-007",
          fileName: "Wiring_Diagram_Control.pdf",
          fileType: "PDF",
          fileSize: "1.6 MB",
          uploadDate: "2024-09-29 10:20",
          currentStep: 4,
          totalSteps: 4,
          status: "completed",
          description: "Diagram pengawatan sistem kontrol",
          category: "Electrical",
          priority: "medium",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-09-29",
              reviewer: "System",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-09-30",
              reviewer: "Ir. Bambang Sutrisno",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Tim Teknis",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Ir. Bambang Sutrisno",
            },
          ],
          comments: [
            {
              id: "11",
              author: "Ir. Bambang Sutrisno",
              date: "2024-10-01 16:35",
              message: "Diagram pengawatan sudah benar dan lengkap, disetujui.",
              type: "approval",
            },
          ],
        },
        {
          id: "DOC-008",
          fileName: "Protection_Settings.pdf",
          fileType: "PDF",
          fileSize: "1.2 MB",
          uploadDate: "2024-09-29 10:25",
          currentStep: 4,
          totalSteps: 4,
          status: "completed",
          description: "Setting proteksi relay",
          category: "Electrical",
          priority: "medium",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-09-29",
              reviewer: "System",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-09-30",
              reviewer: "Ir. Bambang Sutrisno",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Tim Teknis",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "completed",
              completedDate: "2024-10-01",
              reviewer: "Ir. Bambang Sutrisno",
            },
          ],
          comments: [
            {
              id: "12",
              author: "Ir. Bambang Sutrisno",
              date: "2024-10-01 17:00",
              message:
                "Setting proteksi sudah sesuai koordinasi dan disetujui.",
              type: "approval",
            },
          ],
        },
        {
          id: "DOC-009",
          fileName: "Equipment_Specifications.pdf",
          fileType: "PDF",
          fileSize: "2.9 MB",
          uploadDate: "2024-09-29 10:30",
          currentStep: 3,
          totalSteps: 4,
          status: "in_progress",
          description: "Spesifikasi peralatan panel",
          category: "Electrical",
          priority: "low",
          progressSteps: [
            {
              step: 1,
              title: "Document Upload",
              status: "completed",
              completedDate: "2024-09-29",
              reviewer: "System",
            },
            {
              step: 2,
              title: "Initial Review",
              status: "completed",
              completedDate: "2024-09-30",
              reviewer: "Ir. Bambang Sutrisno",
            },
            {
              step: 3,
              title: "Technical Validation",
              status: "current",
              reviewer: "Tim Teknis",
              description: "Sedang memverifikasi spesifikasi equipment",
            },
            {
              step: 4,
              title: "Final Approval",
              status: "pending",
              description: "Menunggu hasil validasi teknis",
            },
          ],
          comments: [
            {
              id: "13",
              author: "Tim Teknis",
              date: "2024-10-02 09:15",
              message:
                "Sedang memverifikasi compliance spesifikasi dengan standar PLN.",
              type: "info",
            },
          ],
        },
      ],
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
            <PlayCircle className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case "on_hold":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            On Hold
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200">
            Low
          </Badge>
        );
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredData = progressData.filter((vendor) => {
    const matchesSearch =
      vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.company.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (filterStatus !== "all") {
      if (filterStatus === "completed") {
        matchesFilter = vendor.overallProgress === 100;
      } else if (filterStatus === "in_progress") {
        matchesFilter =
          vendor.overallProgress > 0 && vendor.overallProgress < 100;
      } else if (filterStatus === "on_hold") {
        matchesFilter = vendor.onHoldDocuments > 0;
      }
    }

    return matchesSearch && matchesFilter;
  });

  const openVendorDetail = (vendor: VendorProgress) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const openDocumentDetail = (document: ProgressDocument) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  // Statistics calculation
  const totalVendors = progressData.length;
  const completedVendors = progressData.filter(
    (v) => v.overallProgress === 100
  ).length;
  const inProgressVendors = progressData.filter(
    (v) => v.overallProgress > 0 && v.overallProgress < 100
  ).length;
  const onHoldVendors = progressData.filter(
    (v) => v.onHoldDocuments > 0
  ).length;

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
                  <span className="block sm:hidden">Progress</span>
                  <span className="hidden sm:block lg:hidden">
                    Progress Approval
                  </span>
                  <span className="hidden lg:block">
                    Progress Approval System
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium mr-1">
                      User
                    </span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56 bg-white border border-gray-100 shadow-xl rounded-lg"
                >
                  <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                    <div className="py-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Progress Team
                      </p>
                      <p className="text-xs text-[#14a2ba]">
                        progress@pln.co.id
                      </p>
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
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Total Projects
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {totalVendors}
                  </p>
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
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Completed
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {completedVendors}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    In Progress
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {inProgressVendors}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    On Hold
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {onHoldVendors}
                  </p>
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
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Progress List */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6">
          {filteredData.map((vendor) => (
            <Card
              key={vendor.id}
              className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
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
                          <span className="truncate">
                            Due:{" "}
                            {new Date(
                              vendor.estimatedCompletion
                            ).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                          <span className="truncate">
                            {vendor.assignedReviewer}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Overall Progress
                      </span>
                      <span className="font-bold text-gray-900">
                        {vendor.overallProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div
                        className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getProgressColor(
                          vendor.overallProgress
                        )}`}
                        style={{ width: `${vendor.overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Statistics Section */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                        {vendor.totalDocuments}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        Total Docs
                      </p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700">
                        {vendor.completedDocuments}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        Completed
                      </p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-700">
                        {vendor.inProgressDocuments}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        In Progress
                      </p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-700">
                        {vendor.onHoldDocuments}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        On Hold
                      </p>
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
                      View Progress
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
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                No Progress Found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                No vendor progress matches your current search criteria. Try
                adjusting your filters or search terms.
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

      {/* Vendor Detail Modal will be added in next part... */}

      {/* Vendor Progress Detail Modal */}
      <Dialog open={showVendorModal} onOpenChange={setShowVendorModal}>
        <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Vendor Progress Details
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Complete progress tracking for vendor submission
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
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Project:
                      </span>
                      <span className="text-gray-900 break-words">
                        {selectedVendor.projectTitle}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Vendor:
                      </span>
                      <span className="text-gray-900 break-words">
                        {selectedVendor.vendorName}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Company:
                      </span>
                      <span className="text-gray-900 break-words">
                        {selectedVendor.company}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Category:
                      </span>
                      <span className="text-gray-900">
                        {selectedVendor.category}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Priority:
                      </span>
                      {getPriorityBadge(selectedVendor.priority)}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#14a2ba]" />
                    Progress Summary
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[100px]">
                        Submitted:
                      </span>
                      <span className="text-gray-900">
                        {new Date(selectedVendor.submissionDate).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[100px]">
                        Progress:
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(
                              selectedVendor.overallProgress
                            )}`}
                            style={{
                              width: `${selectedVendor.overallProgress}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {selectedVendor.overallProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[100px]">
                        Est. Complete:
                      </span>
                      <span className="text-gray-900">
                        {new Date(
                          selectedVendor.estimatedCompletion
                        ).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[100px]">
                        Reviewer:
                      </span>
                      <span className="text-gray-900">
                        {selectedVendor.assignedReviewer}
                      </span>
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

              {/* Documents Progress */}
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2 text-[#14a2ba]" />
                  Documents Progress ({selectedVendor.drawings.length})
                </h4>
                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
                  {selectedVendor.drawings.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                {doc.fileName}
                              </h5>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {doc.description}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar for Document */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">
                                Step {doc.currentStep} of {doc.totalSteps}
                              </span>
                              <span className="font-medium">
                                {Math.round(
                                  (doc.currentStep / doc.totalSteps) * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${getProgressColor(
                                  (doc.currentStep / doc.totalSteps) * 100
                                )}`}
                                style={{
                                  width: `${
                                    (doc.currentStep / doc.totalSteps) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {doc.fileSize}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {new Date(doc.uploadDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                            {getPriorityBadge(doc.priority)}
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Progress Detail Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-xs sm:max-w-lg lg:max-w-3xl max-h-[95vh] overflow-y-auto m-2 sm:m-4">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
              Document Progress Details
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
                      <span className="font-medium text-gray-700 min-w-[60px]">
                        Name:
                      </span>
                      <span className="text-gray-900 break-all">
                        {selectedDocument.fileName}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[60px]">
                        Type:
                      </span>
                      <span className="text-gray-900">
                        {selectedDocument.fileType}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[60px]">
                        Size:
                      </span>
                      <span className="text-gray-900">
                        {selectedDocument.fileSize}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[60px]">
                        Category:
                      </span>
                      <span className="text-gray-900">
                        {selectedDocument.category}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[60px]">
                        Priority:
                      </span>
                      {getPriorityBadge(selectedDocument.priority)}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                    <PlayCircle className="w-4 h-4 mr-2 text-[#14a2ba]" />
                    Progress Status
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Uploaded:
                      </span>
                      <span className="text-gray-900">
                        {new Date(selectedDocument.uploadDate).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Status:
                      </span>
                      {getStatusBadge(selectedDocument.status)}
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                      <span className="font-medium text-gray-700 min-w-[80px]">
                        Progress:
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(
                              (selectedDocument.currentStep /
                                selectedDocument.totalSteps) *
                                100
                            )}`}
                            style={{
                              width: `${
                                (selectedDocument.currentStep /
                                  selectedDocument.totalSteps) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {selectedDocument.currentStep}/
                          {selectedDocument.totalSteps}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100 leading-relaxed">
                  {selectedDocument.description}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                  Progress Steps
                </h4>
                <div className="space-y-3">
                  {selectedDocument.progressSteps.map((step, index) => (
                    <div
                      key={step.step}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                            step.status === "completed"
                              ? "bg-green-500 text-white"
                              : step.status === "current"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : step.status === "current" ? (
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            step.step
                          )}
                        </div>
                        {index < selectedDocument.progressSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-8 sm:h-12 ml-3 sm:ml-4 mt-1 ${
                              step.status === "completed"
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-900">
                          {step.title}
                        </h5>
                        {step.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {step.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                          {step.completedDate && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              Completed:{" "}
                              {new Date(step.completedDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          )}
                          {step.reviewer && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {step.reviewer}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {selectedDocument.comments &&
                selectedDocument.comments.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                      Comments & Updates
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedDocument.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            comment.type === "approval"
                              ? "bg-green-50 border-green-500"
                              : comment.type === "warning"
                              ? "bg-yellow-50 border-yellow-500"
                              : comment.type === "rejection"
                              ? "bg-red-50 border-red-500"
                              : "bg-blue-50 border-blue-500"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {comment.author}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.date).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">
                            {comment.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button className="flex-1 bg-gradient-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Download Document
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
