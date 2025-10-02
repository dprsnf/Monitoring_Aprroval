"use client";

import { useState } from "react";
import { ChevronLeft, Wallet, ChevronDown, LogOut,  FileText, Check, X, MessageSquare, Download, Eye, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function ApprovalPage() {
  const [selectedApproval, setSelectedApproval] = useState<string>("");
  const [approvalText, setApprovalText] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isApproveTextConfirmOpen, setIsApproveTextConfirmOpen] = useState(false);
  const [isApproveTextModalOpen, setIsApproveTextModalOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<any>(null);

  // Sample data untuk drawing yang perlu diapprove
  const drawingsToApprove = [
    {
      id: "DRW-2024-001",
      title: "Single Line Diagram - Gardu Induk Cibinong",
      submittedDate: "2024-10-01",
      category: "Electrical",
      priority: "High",
      description: "Single line diagram untuk gardu induk 150kV Cibinong dengan kapasitas 2x60 MVA. Dokumen ini mencakup layout keseluruhan sistem kelistrikan termasuk protection scheme dan control system.",
      fileSize: "2.3 MB",
      pages: 3,
      status: "pending",
      deadline: "2024-10-15"
    },
    {
      id: "DRW-2024-002", 
      title: "Layout Plan - Substation Bekasi",
      submittedDate: "2024-09-28",
      category: "Civil",
      priority: "Medium",
      description: "Layout plan untuk pembangunan gardu induk baru di Bekasi dengan area 2.5 hektar. Termasuk positioning equipment, access road, dan drainage system.",
      fileSize: "4.1 MB", 
      pages: 5,
      status: "pending",
      deadline: "2024-10-12"
    },
    {
      id: "DRW-2024-003",
      title: "Protection System Design - GI Tangerang",
      submittedDate: "2024-09-30",
      category: "Electrical",
      priority: "High",
      description: "Desain sistem proteksi untuk gardu induk Tangerang 150kV. Mencakup relay coordination, CT/PT calculation, dan SCADA integration.",
      fileSize: "3.8 MB",
      pages: 8,
      status: "pending",
      deadline: "2024-10-10"
    }
  ];

  // Handlers for opening confirmation modals
  const openApproveConfirm = (drawing: any) => {
    setCurrentDrawing(drawing);
    setIsApproveConfirmOpen(true);
  };

  const openApproveTextFlow = (drawing: any) => {
    setCurrentDrawing(drawing);
    setIsApproveTextConfirmOpen(true);
  };

  const openRejectFlow = (drawing: any) => {
    setCurrentDrawing(drawing);
    setIsRejectConfirmOpen(true);
  };

  // Final action handlers
  const handleSimpleApprove = () => {
    if (currentDrawing) {
      setSelectedApproval(`${currentDrawing.id}-approved`);
      console.log(`Drawing ${currentDrawing.id} approved without comment`);
      setIsApproveConfirmOpen(false);
      setCurrentDrawing(null);
    }
  };

  const handleApproveWithTextConfirm = () => {
    setIsApproveTextConfirmOpen(false);
    setIsApproveTextModalOpen(true);
  };

  const handleApproveWithText = () => {
    if (currentDrawing && approvalText.trim()) {
      setSelectedApproval(`${currentDrawing.id}-approved-text`);
      console.log(`Drawing ${currentDrawing.id} approved with comment: ${approvalText}`);
      setApprovalText("");
      setIsApproveTextModalOpen(false);
      setCurrentDrawing(null);
    }
  };

  const handleRejectConfirm = () => {
    setIsRejectConfirmOpen(false);
    setIsRejectModalOpen(true);
  };

  const handleReject = () => {
    if (currentDrawing && rejectReason.trim()) {
      setSelectedApproval(`${currentDrawing.id}-rejected`);
      console.log(`Drawing ${currentDrawing.id} rejected with reason: ${rejectReason}`);
      setRejectReason("");
      setIsRejectModalOpen(false);
      setCurrentDrawing(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button className="group bg-[#efe62f] hover:bg-[#125d72] border border-white/20 text-gray-900 hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                  <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">Kembali ke Dashboard</span>
                </Button>
              </Link>
              <div className="h-8 w-px bg-blue-300"></div>
              <h1 className="text-sm sm:text-xl font-semibold text-white">
                Approval System
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1 sm:gap-3 bg-[#efe62f] hover:bg-[#125d72] border border-white/20 rounded-lg px-2 sm:px-3 py-2 transition-all duration-200 h-auto text-gray-900 hover:text-white shadow-sm hover:shadow-md">
                    <div className="text-xs sm:text-sm font-medium">
                      <span className="hidden sm:inline">Nama Pengguna</span>
                      <span className="sm:hidden">User</span>
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                  <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                    <div className="py-1">
                      <p className="text-sm font-semibold text-gray-900">Nama Pengguna</p>
                      <p className="text-xs text-[#14a2ba]">user@pln.co.id</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-100" />

                  <DropdownMenuSeparator className="bg-blue-100 mx-2" />

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
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Drawing Review Queue</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review dan approve drawing teknis PLN yang sedang menunggu persetujuan</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {drawingsToApprove.map((drawing) => (
            <Card key={drawing.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/30">
              <CardHeader className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 backdrop-blur-sm border-b border-white/20 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                      <CardTitle className="text-lg sm:text-xl text-gray-900 leading-tight">{drawing.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(drawing.priority)} whitespace-nowrap`}>
                        {drawing.priority} Priority
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#14a2ba]" />
                        <span><strong>Submitted:</strong> {drawing.submittedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#14a2ba]" />
                        <span><strong>Deadline:</strong> {drawing.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(drawing.category)} text-center flex-1 sm:flex-none`}>
                      {drawing.category}
                    </span>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 text-center flex-1 sm:flex-none">
                      ID: {drawing.id}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                  {/* Drawing Info & Preview */}
                  <div className="xl:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Deskripsi Drawing</h4>
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{drawing.description}</p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                      <span className="flex items-center gap-2">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-[#14a2ba]" />
                        <strong>{drawing.pages} halaman</strong>
                      </span>
                      <span className="font-medium">{drawing.fileSize}</span>
                    </div>

                    {/* PDF Preview */}
                    <div className="bg-gradient-to-br from-[#14a2ba]/10 to-[#125d72]/10 border-2 border-dashed border-[#14a2ba]/30 rounded-xl p-4 sm:p-8 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#14a2ba]/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#125d72]" />
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">PDF Document Preview</h5>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">Klik tombol di bawah untuk melihat atau mengunduh dokumen</p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                        <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Preview PDF
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="xl:col-span-1">
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Review Actions</h4>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {/* Simple Approve */}
                      <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openApproveConfirm(drawing)}
                      >
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {selectedApproval === `${drawing.id}-approved` ? 'Approved!' : 'Approve Drawing'}
                      </Button>

                      {/* Approve with Text */}
                      <Button 
                        className="w-full bg-gradient-to-r from-[#efe62f] to-[#f4d03f] hover:from-[#125d72] hover:to-[#14a2ba] text-gray-900 hover:text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openApproveTextFlow(drawing)}
                      >
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {selectedApproval === `${drawing.id}-approved-text` ? 'Approved with Notes!' : 'Approve with Notes'}
                      </Button>

                      {/* Reject */}
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openRejectFlow(drawing)}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {selectedApproval === `${drawing.id}-rejected` ? 'Rejected!' : 'Reject Drawing'}
                      </Button>
                    </div>

                    {/* Status Display */}
                    {selectedApproval.includes(drawing.id) && (
                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-white/80 to-[#14a2ba]/10 backdrop-blur-sm border border-white/30">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedApproval.includes('approved') ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                          ) : (
                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          )}
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">Status Updated</p>
                        </div>
                        <p className={`text-xs sm:text-sm font-medium ${
                          selectedApproval.includes('approved') ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {selectedApproval.includes('approved') ? '✓ Drawing has been approved' : '✗ Drawing has been rejected'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Confirmation Modals */}
      
      {/* Simple Approve Confirmation */}
      <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-white to-green-50 border border-green-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg p-4 -m-6 mb-4">
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              Konfirmasi Approval
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2">
              {currentDrawing && (
                <>Apakah Anda yakin ingin <strong className="text-green-600">menyetujui</strong> drawing: <strong className="text-gray-900">{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" onClick={() => setIsApproveConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSimpleApprove} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg">
              <Check className="w-4 h-4 mr-2" />
              Ya, Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve with Text Confirmation */}
      <Dialog open={isApproveTextConfirmOpen} onOpenChange={setIsApproveTextConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-white to-yellow-50 border border-yellow-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg p-4 -m-6 mb-4">
            <DialogTitle className="flex items-center gap-2 text-yellow-800">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              Approval dengan Catatan
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2">
              {currentDrawing && (
                <>Apakah Anda ingin <strong className="text-yellow-600">menyetujui dengan catatan</strong> drawing: <strong className="text-gray-900">{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" onClick={() => setIsApproveTextConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleApproveWithTextConfirm} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-md hover:shadow-lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve with Text Modal */}
      <Dialog open={isApproveTextModalOpen} onOpenChange={setIsApproveTextModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-yellow-50 border border-yellow-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg p-4 -m-6 mb-4">
            <DialogTitle className="flex items-center gap-2 text-yellow-800">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              Approve dengan Catatan
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2">
              {currentDrawing && (
                <>Berikan catatan approval untuk drawing: <strong className="text-gray-900">{currentDrawing.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 bg-gradient-to-br from-yellow-25 to-white rounded-lg p-4 border border-yellow-100">
            <div className="space-y-2">
              <Label htmlFor="approval-text" className="text-gray-900 font-semibold">Catatan Approval</Label>
              <Textarea
                id="approval-text"
                placeholder="Berikan catatan, saran, atau komentar untuk approval ini..."
                value={approvalText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApprovalText(e.target.value)}
                className="min-h-[120px] border-yellow-200 text-black focus:ring-yellow-500 focus:border-yellow-500 bg-white shadow-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" onClick={() => setIsApproveTextModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleApproveWithText}
              className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!approvalText.trim()}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Approve dengan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation */}
      <Dialog open={isRejectConfirmOpen} onOpenChange={setIsRejectConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-white to-red-50 border border-red-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg p-4 -m-6 mb-4">
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              Konfirmasi Penolakan
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2">
              {currentDrawing && (
                <>Apakah Anda yakin ingin <strong className="text-red-600">menolak</strong> drawing: <strong className="text-gray-900">{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" onClick={() => setIsRejectConfirmOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleRejectConfirm} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg">
              <X className="w-4 h-4 mr-2" />
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-red-50 border border-red-200 shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg p-4 -m-6 mb-4">
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              Penolakan Drawing
            </DialogTitle>
            <DialogDescription className="text-gray-700 mt-2">
              {currentDrawing && (
                <>Berikan alasan penolakan untuk drawing: <strong className="text-gray-900">{currentDrawing.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 bg-gradient-to-br from-red-25 to-white rounded-lg p-4 border border-red-100">
            <div className="space-y-2">
              <Label htmlFor="reject-reason" className="text-gray-900 font-semibold">Alasan Penolakan *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Jelaskan secara detail alasan mengapa drawing ini ditolak..."
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                className="min-h-[120px] border-red-200 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm" onClick={() => setIsRejectModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!rejectReason.trim()}
            >
              <X className="w-4 h-4 mr-2" />
              Tolak Drawing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}