"use client";

import { useState } from "react";
import { ChevronLeft, FileText, Check, X, MessageSquare, Download, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      submittedBy: "Ir. Ahmad Santoso",
      submittedDate: "2024-10-01",
      category: "Electrical",
      description: "Single line diagram untuk gardu induk 150kV Cibinong dengan kapasitas 2x60 MVA",
      fileSize: "2.3 MB",
      pages: 3,
      status: "pending"
    },
    {
      id: "DRW-2024-002", 
      title: "Layout Plan - Substation Bekasi",
      submittedBy: "Ir. Siti Nurhaliza",
      submittedDate: "2024-09-28",
      category: "Civil",
      description: "Layout plan untuk pembangunan gardu induk baru di Bekasi",
      fileSize: "4.1 MB", 
      pages: 5,
      status: "pending"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Approval Drawing
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">PLN</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {drawingsToApprove.map((drawing) => (
            <Card key={drawing.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{drawing.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <span>ID: {drawing.id}</span>
                      <span>Submitted by: {drawing.submittedBy}</span>
                      <span>Date: {drawing.submittedDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {drawing.category}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Drawing Info & Preview */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Deskripsi Drawing</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{drawing.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {drawing.pages} pages
                      </span>
                      <span>{drawing.fileSize}</span>
                    </div>

                    {/* PDF Preview Placeholder */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">PDF Preview</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  <div className="lg:col-span-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Review Actions</h4>
                    
                    <div className="space-y-3">
                      {/* Simple Approve */}
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openApproveConfirm(drawing)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {selectedApproval === `${drawing.id}-approved` ? 'Approved!' : 'Approve'}
                      </Button>

                      {/* Approve with Text */}
                      <Button 
                        variant="outline" 
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openApproveTextFlow(drawing)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {selectedApproval === `${drawing.id}-approved-text` ? 'Approved with Comment!' : 'Approve with Text'}
                      </Button>

                      {/* Reject */}
                      <Button 
                        variant="outline"
                        className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={selectedApproval.includes(drawing.id)}
                        onClick={() => openRejectFlow(drawing)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {selectedApproval === `${drawing.id}-rejected` ? 'Rejected!' : 'Reject'}
                      </Button>

                    </div>

                    {/* Status Display */}
                    {selectedApproval.includes(drawing.id) && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Status:</p>
                        <p className={`text-sm ${
                          selectedApproval.includes('approved') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedApproval.includes('approved') ? '✓ Approved' : '✗ Rejected'}
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Konfirmasi Approve
            </DialogTitle>
            <DialogDescription>
              {currentDrawing && (
                <>Apakah Anda yakin ingin <strong className="text-green-600">menyetujui</strong> drawing: <strong>{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveConfirmOpen(false)}>
              Tidak
            </Button>
            <Button onClick={handleSimpleApprove} className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4 mr-2" />
              Ya, Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve with Text Confirmation */}
      <Dialog open={isApproveTextConfirmOpen} onOpenChange={setIsApproveTextConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Konfirmasi Approve dengan Komentar
            </DialogTitle>
            <DialogDescription>
              {currentDrawing && (
                <>Apakah Anda yakin ingin <strong className="text-green-600">menyetujui dengan komentar</strong> drawing: <strong>{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveTextConfirmOpen(false)}>
              Tidak
            </Button>
            <Button onClick={handleApproveWithTextConfirm} className="bg-green-600 hover:bg-green-700 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve with Text Modal */}
      <Dialog open={isApproveTextModalOpen} onOpenChange={setIsApproveTextModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Approve dengan Komentar
            </DialogTitle>
            <DialogDescription>
              {currentDrawing && (
                <>Berikan komentar approval untuk drawing: <strong>{currentDrawing.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-text">Komentar Approval</Label>
              <Textarea
                id="approval-text"
                placeholder="Berikan catatan atau komentar untuk approval ini..."
                value={approvalText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApprovalText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveTextModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleApproveWithText}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!approvalText.trim()}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation */}
      <Dialog open={isRejectConfirmOpen} onOpenChange={setIsRejectConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Konfirmasi Reject
            </DialogTitle>
            <DialogDescription>
              {currentDrawing && (
                <>Apakah Anda yakin ingin <strong className="text-red-600">menolak</strong> drawing: <strong>{currentDrawing.title}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectConfirmOpen(false)}>
              Tidak
            </Button>
            <Button onClick={handleRejectConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              <X className="w-4 h-4 mr-2" />
              Ya, Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Reject Drawing
            </DialogTitle>
            <DialogDescription>
              {currentDrawing && (
                <>Berikan alasan penolakan untuk drawing: <strong>{currentDrawing.title}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Alasan Penolakan *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Jelaskan alasan mengapa drawing ini ditolak..."
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectReason.trim()}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}