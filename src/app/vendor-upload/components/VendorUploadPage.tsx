"use client";

import { useState, useRef } from "react";
import { ChevronLeft, Upload, Wallet, User, ChevronDown, LogOut, Check, AlertCircle, Plus, Trash2, Eye, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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



interface UploadedFile {
    id: string;
    name: string;
    size: string;
    type: string;
    uploadTime: string;
    status: "uploading" | "completed" | "error";
    progress?: number;
}

export default function VendorUploadPage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showReviewStep, setShowReviewStep] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        projectTitle: "",
        category: "",
        noContract: "",
        notes: "",
        contractDate: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFileUpload(files);
    };

    const handleFileUpload = (files: File[]) => {
        setIsUploading(true);

        files.forEach((file, index) => {
            const fileId = `file-${Date.now()}-${index}`;
            const newFile: UploadedFile = {
                id: fileId,
                name: file.name,
                size: formatFileSize(file.size),
                type: file.type || getFileTypeFromExtension(file.name),
                uploadTime: new Date().toLocaleString(),
                status: "uploading",
                progress: 0
            };

            setUploadedFiles(prev => [...prev, newFile]);

            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    clearInterval(interval);
                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === fileId
                                ? { ...f, status: "completed", progress: 100 }
                                : f
                        )
                    );
                    setIsUploading(false);
                    // Auto navigate to review step when all files are uploaded
                    setTimeout(() => {
                        setShowReviewStep(true);
                    }, 1000);
                } else {
                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === fileId
                                ? { ...f, progress: Math.min(progress, 99) }
                                : f
                        )
                    );
                }
            }, 500);
        });
    };

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        // If no files left, go back to upload step
        if (uploadedFiles.length === 1) {
            setShowReviewStep(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileTypeFromExtension = (filename: string): string => {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf': return 'application/pdf';
            case 'dwg': return 'application/dwg';
            case 'dxf': return 'application/dxf';
            case 'png': case 'jpg': case 'jpeg': return 'image';
            default: return 'application/octet-stream';
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('dwg') || type.includes('dxf')) return '📐';
        if (type.includes('image')) return '🖼️';
        return '📁';
    };

    const handlePreviewFile = (fileId: string) => {
        const file = uploadedFiles.find(f => f.id === fileId);
        if (file) {
            // In a real application, this would open the actual file
            alert(`Preview file: ${file.name}\n\nNote: Ini adalah simulasi preview. Dalam implementasi nyata, file akan dibuka di viewer atau tab baru.`);
        }
    };

    const goBackToUpload = () => {
        setShowReviewStep(false);
    };

    const proceedToSubmit = () => {
        // Validate all files are completed
        const allCompleted = uploadedFiles.every(file => file.status === "completed");
        if (!allCompleted) {
            alert("Pastikan semua file sudah berhasil diupload sebelum melanjutkan.");
            return;
        }

        // For now, we'll just show an alert
        const fileList = uploadedFiles.map(f => `- ${f.name} (${f.size})`).join('\n');
        if (window.confirm(`Anda akan submit ${uploadedFiles.length} file(s):\n\n${fileList}\n\nLanjutkan ke submit form?`)) {
            setShowReviewStep(false);
            // Scroll to submit section
            document.querySelector('[data-submit-section]')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        console.log('Uploaded Files:', uploadedFiles);

        // Show success message
        alert('Drawing berhasil disubmit untuk review!');

        // Reset form
        setFormData({
            projectTitle: "",
            category: "",
            noContract: "",
            notes: "",
            contractDate: ""
        });
        setUploadedFiles([]);
        setShowReviewStep(false);
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
                                Upload Drawing
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
                <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Drawing Teknis</h2>
                    <p className="text-gray-700 text-sm sm:text-base">Upload dan submit drawing teknis untuk review dan approval PLN</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                    {/* Project Information */}
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                        <CardHeader className="px-6 py-4 border-b border-gray-300">
                            <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">Informasi Proyek</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="projectTitle" className="text-gray-900 font-medium">
                                        Judul Proyek *
                                    </Label>
                                    <input
                                        id="projectTitle"
                                        name="projectTitle"
                                        required
                                        value={formData.projectTitle}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Single Line Diagram - Gardu Induk Cibinong"
                                        className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-900 font-medium">
                                        Kategori *
                                    </Label>
                                    <input
                                        id="category"
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Single Line Diagram - Gardu Induk Cibinong"
                                        className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contractDate" className="text-gray-900 font-medium">
                                        Tanggal Kontrak *
                                    </Label>
                                    <input
                                        id="contractDate"
                                        name="contractDate"
                                        type="date"
                                        required
                                        value={formData.contractDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="noContract" className="text-gray-900 font-medium">
                                        No. Kontrak *
                                    </Label>
                                    <input
                                        id="noContract"
                                        name="noContract"
                                        required
                                        value={formData.noContract}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: K/PLN/2024/001"
                                        className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    {/* File Upload */}
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                        <CardHeader className="px-6 py-4 border-b border-gray-300">
                            <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">Upload Drawing Files</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {!showReviewStep ? (
                                <>
                                    {/* Drag and Drop Area */}
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-black mb-2">
                                            Upload Drawing Files
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Drag & drop files here, atau click untuk browse
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Supported formats: PDF, DWG, DXF, PNG, JPG (Max: 50MB per file)
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Browse Files
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Uploaded Files List */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 sm:mt-6">
                                            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Uploading Files ({uploadedFiles.length})</h4>
                                            <div className="space-y-2 sm:space-y-3">
                                                {uploadedFiles.map((file) => (
                                                    <div key={file.id} className="bg-white border border-blue-200 rounded-lg p-3 sm:p-4 shadow-sm">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                                                <div className="text-xl sm:text-2xl">{getFileIcon(file.type)}</div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{file.name}</p>
                                                                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                                        <span>{file.size}</span>
                                                                        <span className="hidden sm:inline">{file.uploadTime}</span>
                                                                        {file.status === "uploading" && file.progress !== undefined && (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                                                        style={{ width: `${file.progress}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className="text-xs">{Math.round(file.progress)}%</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                {file.status === "uploading" && (
                                                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                                )}
                                                                {file.status === "completed" && (
                                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                                )}
                                                                {file.status === "error" && (
                                                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => removeFile(file.id)}
                                                                    className="border-red-200 hover:bg-red-50 text-red-600 px-2 py-1"
                                                                >
                                                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Review Files Button - shown when all files are completed */}
                                    {uploadedFiles.length > 0 && uploadedFiles.every(file => file.status === "completed") && (
                                        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                                        {uploadedFiles.length} file(s) berhasil diupload!
                                                    </h4>
                                                    <p className="text-gray-600 text-xs sm:text-sm">
                                                        Klik "Review Files" untuk melihat preview dan melanjutkan ke submit
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => setShowReviewStep(true)}
                                                    className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                                                >
                                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                                    <span className="hidden sm:inline">Review Files</span>
                                                    <span className="sm:hidden">Review</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* File Review Step */
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Review Files Sebelum Submit</h3>
                                            <p className="text-gray-600 text-sm">
                                                Review dan preview file yang sudah diupload. Pastikan semua file sudah benar sebelum melanjutkan.
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={goBackToUpload}
                                            className="bg-[#efe62f] border-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base px-3 sm:px-4 py-2"
                                        >
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            <span className="hidden sm:inline">Upload More Files</span>
                                            <span className="sm:hidden">Upload</span>
                                        </Button>
                                    </div>

                                    {/* File Review List */}
                                    <div className="space-y-3 sm:space-y-4">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={file.id} className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-md">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl sm:text-3xl">
                                                            {getFileIcon(file.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-lg">{file.name}</h4>
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium w-fit">
                                                                    File #{index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                                <div>
                                                                    <span className="font-medium">Size:</span> {file.size}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Type:</span> {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                                </div>
                                                                <div className="hidden sm:block">
                                                                    <span className="font-medium">Uploaded:</span> {file.uploadTime.split(' ')[1]}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Status:</span>
                                                                    <span className="ml-1 text-blue-600 font-semibold">Ready</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 justify-end">
                                                        <Button
                                                            type="button"
                                                            onClick={() => handlePreviewFile(file.id)}
                                                            className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md hover:shadow-lg font-medium transition-all duration-200 text-sm px-3 py-2"
                                                        >
                                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                                            <span className="hidden sm:inline">Preview</span>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => removeFile(file.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-md hover:shadow-lg font-medium transition-all duration-200 text-sm px-3 py-2"
                                                        >
                                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Review Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1 drop-shadow-sm text-sm sm:text-base">
                                                {uploadedFiles.length} file(s) ready untuk submit
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                Semua file sudah berhasil diupload dan siap untuk direview
                                            </p>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            <Button
                                                type="button"
                                                onClick={proceedToSubmit}
                                                className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                                            >
                                                <span className="hidden sm:inline">Lanjut ke Submit</span>
                                                <span className="sm:hidden">Submit</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional Notes */}
                    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
                        <CardHeader className="border-b border-gray-300 px-4 sm:px-6 py-3 sm:py-4">
                            <CardTitle className="text-black font-semibold text-base sm:text-lg drop-shadow-sm">Catatan Tambahan</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-gray-900 font-medium text-sm sm:text-base">
                                    Catatan untuk Reviewer (Opsional)
                                </Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Berikan catatan khusus, perhatian, atau informasi tambahan untuk reviewer..."
                                    className="w-full text-black px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors resize-none text-sm sm:text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Section */}
                    <Card className="shadow-xl border border-white/30 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm" data-submit-section>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 drop-shadow-sm">Ready to Submit?</h3>
                                    <p className="text-gray-700 text-sm">
                                        Pastikan semua informasi sudah benar dan file sudah terupload dengan sempurna
                                    </p>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    <Button
                                        type="submit"
                                        disabled={!showReviewStep || uploadedFiles.length === 0 || isUploading}
                                        className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-8 py-2 sm:py-3 font-semibold transition-all duration-200 text-sm sm:text-base"
                                    >
                                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">
                                            {showReviewStep ? 'Submit untuk Review' : `Review Files First (${uploadedFiles.length} uploaded)`}
                                        </span>
                                        <span className="sm:hidden">
                                            {showReviewStep ? 'Submit' : `Review (${uploadedFiles.length})`}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    );
}
