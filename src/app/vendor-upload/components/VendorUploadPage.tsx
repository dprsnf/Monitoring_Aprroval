"use client";

import type React from "react";
import { useRef, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectInfoForm from "@/components/ProjectInfoForm";
import FileDropzone from "@/components/file/FileDropZone";
import UploadedFilesList from "@/components/file/UploadFileList";
import FileReviewList from "@/components/FileReviewList";
import AdditionalNotes from "@/components/AdditionalNotes";
import SubmitSection from "@/components/SubmitSection";
import type { UploadedFile, UploadFormData } from "@/app/types/uploadFIle";
import Header from "@/components/common/Header";
import { useAuth } from "@/context/AuthContext";
import { Loader2, X } from "lucide-react";
import { isAxiosError } from "axios";
import { ApiErrorResponse } from "@/app/types";

type FileForUpload = UploadedFile & {
  file: File;
  errorMessage?: string;
};

export default function VendorUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileForUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewStep, setShowReviewStep] = useState(false);
  const submitSectionRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, logout } = useAuth();
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState<UploadFormData>({
    projectTitle: "",
    category: "",
    noContract: "",
    notes: "",
    contractDate: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return;

    const newFiles: FileForUpload[] = files.map((file, index) => {
      const fileId = `file-${Date.now()}-${index}`;
      return {
        id: fileId,
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || getFileTypeFromExtension(file.name),
        uploadTime: new Date().toLocaleString(),
        status: "pending",
        progress: 0,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Automatically go to review if there are files
    setTimeout(() => setShowReviewStep(true), 500);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (uploadedFiles.length === 1) setShowReviewStep(false);
  };

  const handlePreviewFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file) {
      // Implementation preview (img or pdf)
      if (
        file.file.type.startsWith("image/") ||
        file.file.type === "application/pdf"
      ) {
        const fileURL = URL.createObjectURL(file.file);
        window.open(fileURL, "_blank");
      } else {
        alert(
          `Preview file: ${file.name}\n\nTipe file ini (${file.file.type}) mungkin tidak bisa ditampilkan langsung di browser.`
        );
      }
    }
  };

  const goBackToUpload = () => setShowReviewStep(false);

  const proceedToSubmit = () => {
    // chcek file
    if (uploadedFiles.length === 0) {
      alert("Silakan upload file terlebih dahulu.");
      return;
    }
    setShowReviewStep(false);
    submitSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pendingFiles = uploadedFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) {
      alert("Tidak ada file baru untuk di-submit.");
      return;
    }

    setIsUploading(true);

    // WARNING: notes and contractdate are not used in backend
    if (formData.notes || formData.contractDate) {
      console.warn(
        "Catatan: Field 'notes' dan 'contractDate' tidak akan dikirim " +
          "karena endpoint /documents/submit backend tidak menerimanya."
      );
    }

    // Make array for all upload promises
    const uploadPromises = pendingFiles.map(async (fileToUpload) => {
      // Update UI state to 'uploading'
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileToUpload.id
            ? { ...f, status: "uploading", progress: 0 }
            : f
        )
      );

      // Siapkan FormData untuk file ini
      // Preparing FormData for this file
      const fileFormData = new FormData();
      fileFormData.append("file", fileToUpload.file);
      fileFormData.append("name", formData.projectTitle);
      fileFormData.append("documentType", formData.category);
      fileFormData.append("contractNumber", formData.noContract);

      try {
        // Send request to backend using API
        const response = await api.post("/documents/submit", fileFormData, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total) {
              const percentage = Math.floor((loaded * 100) / total);
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === fileToUpload.id ? { ...f, progress: percentage } : f
                )
              );
            }
          },
        });

        // Update UI state to 'completed'
        if (response.status === 201) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileToUpload.id
                ? { ...f, status: "completed", progress: 100 }
                : f
            )
          );
        }
      } catch (error: unknown) {
        // Update UI state to 'error'
        if (isAxiosError<ApiErrorResponse>(error)) {
          const message =
            error.response?.data?.message || "Upload Failed. check console.";
          setApiError(message);
        } else {
          setApiError(
            "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
          );
        }
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);

    setIsUploading(false);
    alert("Semua file baru telah diproses!");

    // Check if any upload failed
    const hasErrors = uploadedFiles.some((f) => f.status === "error");
    if (hasErrors) {
      alert(
        "Beberapa file gagal di-upload. Cek daftar file untuk melihat error."
      );
      // dont reset form if there are error, so user can fix
    } else {
      // Reset form ONLY if all successful
      alert("Semua file berhasil di-submit!");
      setFormData({
        projectTitle: "",
        category: "",
        noContract: "",
        notes: "",
        contractDate: "",
      });
      setUploadedFiles([]);
      setShowReviewStep(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14a2ba]">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      <Header
        title="Upload Drawing"
        currentUser={user}
        backHref="/"
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Upload Drawing Teknis
          </h2>
          <p className="text-gray-700 text-sm sm:text-base">
            Upload dan submit drawing teknis untuk review dan approval PLN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <CardHeader className="px-6 border-b border-gray-300">
              <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">
                Informasi Proyek
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ProjectInfoForm
                formData={formData}
                onChange={handleInputChange}
                onCategoryChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              />
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <CardHeader className="px-6 border-b border-gray-300">
              <CardTitle className="text-black font-semibold text-lg drop-shadow-sm">
                Upload Drawing Files
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              {!showReviewStep ? (
                <>
                  <FileDropzone
                    isDragOver={isDragOver}
                    setIsDragOver={setIsDragOver}
                    onFilesSelected={handleFilesSelected}
                  />

                  <UploadedFilesList
                    files={uploadedFiles}
                    onRemove={removeFile}
                  />

                  {uploadedFiles.length > 0 &&
                    // Review button appears if there are files, regardless of status
                    !isUploading && (
                      <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                              {uploadedFiles.length} file(s) siap untuk
                              di-review!
                            </h4>
                            <p className="text-gray-600 text-xs sm:text-sm">
                              Klik &quot;Review Files&quot; untuk melihat
                              preview dan melanjutkan.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowReviewStep(true)}
                            className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-md"
                          >
                            Review Files
                          </button>
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <FileReviewList
                  files={uploadedFiles}
                  onPreview={handlePreviewFile}
                  onRemove={removeFile}
                  onBackToUpload={goBackToUpload}
                  onProceedToSubmit={proceedToSubmit}
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30">
            <div className="border-b border-gray-300 px-4 sm:px-6 pb-3 sm:pb-4">
              <h3 className="text-black font-semibold text-base sm:text-lg drop-shadow-sm">
                Catatan Tambahan
              </h3>
            </div>
            <CardContent className="">
              <AdditionalNotes
                notes={formData.notes}
                onChange={handleInputChange}
              />
            </CardContent>
          </Card>

          {apiError && (
            <div
              className="relative flex items-center justify-between gap-4 rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700 shadow-md"
              role="alert"
            >
              <div>
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() => setApiError("")} // Tombol untuk menutup alert
                className="p-1 text-red-700 rounded-full hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <Card
            ref={submitSectionRef}
            className="shadow-xl border border-white/30 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm"
            data-submit-section
          >
            <CardContent className="p-4 sm:p-6">
              <SubmitSection
                canSubmit={
                  !showReviewStep &&
                  uploadedFiles.some(
                    (f) => f.status === "pending" || f.status === "error"
                  ) &&
                  !isUploading
                }
              />
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}

// Helpers
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

function getFileTypeFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "dwg":
      return "application/dwg";
    case "dxf":
      return "application/dxf";
    case "png":
    case "jpg":
    case "jpeg":
      return "image";
    default:
      return "application/octet-stream";
  }
}
