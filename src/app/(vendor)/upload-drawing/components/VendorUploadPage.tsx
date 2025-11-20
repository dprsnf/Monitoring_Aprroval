"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectInfoForm from "@/components/ProjectInfoForm";
import FileDropzone from "@/components/file/FileDropZone";
import UploadedFilesList from "@/components/file/UploadFileList";
import FileReviewList from "@/components/file/FileReviewList";
import AdditionalNotes from "@/components/AdditionalNotes";
import SubmitSection from "@/components/SubmitSection";
import type { UploadedFile, UploadFormData } from "@/app/types/uploadFIle";
import Header from "@/components/common/Header";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Loader2, X, Pencil, ExternalLink } from "lucide-react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import DocumentViewerModal from "@/app/documents/review-approval/components/DocumentViewerModal";

type FileForUpload = UploadedFile & {
  file: File;
  errorMessage?: string;
};

interface VendorUploadPageProps {
  initialResubmitDocs: any[];
}

export default function VendorUploadPage({
  initialResubmitDocs,
}: VendorUploadPageProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileForUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showReviewStep, setShowReviewStep] = useState(false);
  const submitSectionRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, logout } = useAuth();
  const [apiError, setApiError] = useState("");
  const [resubmitDocs, setResubmitDocs] = useState<any[]>(initialResubmitDocs);
  const [annotatingDoc, setAnnotatingDoc] = useState<any>(null);
  const [resubmitUploadingId, setResubmitUploadingId] = useState<number | null>(
    null
  );

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesSelected = (files: File[]) => {
    if (!files.length) return;
    const newFiles: FileForUpload[] = files.map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || getFileTypeFromExtension(file.name),
      uploadTime: new Date().toLocaleString(),
      status: "pending",
      progress: 0,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setTimeout(() => setShowReviewStep(true), 500);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (uploadedFiles.length === 1) setShowReviewStep(false);
  };

  const handlePreviewFile = (fileId: string) => {
    const fileObj = uploadedFiles.find((f) => f.id === fileId);
    if (!fileObj) return;
    if (fileObj.file.type === "application/pdf") {
      const url = URL.createObjectURL(fileObj.file);
      window.open(url, "_blank");
    } else if (fileObj.file.type.startsWith("image/")) {
      const url = URL.createObjectURL(fileObj.file);
      window.open(url, "_blank");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingFiles = uploadedFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return alert("Tidak ada file baru");

    setIsUploading(true);
    const uploadPromises = pendingFiles.map(async (f) => {
      setUploadedFiles((prev) =>
        prev.map((x) => (x.id === f.id ? { ...x, status: "uploading" } : x))
      );

      const form = new FormData();
      form.append("file", f.file);
      form.append("name", formData.projectTitle);
      form.append("documentType", formData.category);
      form.append("contractNumber", formData.noContract || "");

      try {
        await api.post("/documents/submit", form, {
          onUploadProgress: (p) => {
            if (p.total) {
              const percent = Math.round((p.loaded * 100) / p.total);
              setUploadedFiles((prev) =>
                prev.map((x) =>
                  x.id === f.id ? { ...x, progress: percent } : x
                )
              );
            }
          },
        });
        setUploadedFiles((prev) =>
          prev.map((x) =>
            x.id === f.id ? { ...x, status: "completed", progress: 100 } : x
          )
        );
      } catch (err: any) {
        const msg = isAxiosError(err)
          ? err.response?.data?.message || "Upload gagal"
          : "Error";
        setUploadedFiles((prev) =>
          prev.map((x) =>
            x.id === f.id ? { ...x, status: "error", errorMessage: msg } : x
          )
        );
      }
    });

    await Promise.allSettled(uploadPromises);
    setIsUploading(false);

    const hasError = uploadedFiles.some((f) => f.status === "error");
    if (!hasError) {
      alert("Semua file berhasil diupload!");
      setUploadedFiles([]);
      setFormData({
        projectTitle: "",
        category: "",
        noContract: "",
        notes: "",
        contractDate: "",
      });
      setShowReviewStep(false);
    }
  };

  const refreshResubmitDocs = async () => {
    try {
      const { data } = await api.get("/documents");
      setResubmitDocs(
        data.filter(
          (d: any) =>
            ["returnForCorrection", "approvedWithNotes"].includes(d.status) &&
            d.submittedById === user?.id
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleResubmitAnnotated = async (docId: number, file: File) => {
    setResubmitUploadingId(docId);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.patch(`/documents/${docId}/resubmit-annotated`, form);
      alert("Revisi dengan coretan berhasil disubmit!");
      await refreshResubmitDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal submit revisi");
    } finally {
      setResubmitUploadingId(null);
      setAnnotatingDoc(null);
    }
  };

  useEffect(() => {
    if (user && resubmitDocs.length === 0) refreshResubmitDocs();
  }, [user]);

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
        backHref="/dashboard"
        onLogout={logout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Upload Drawing Teknis
          </h1>
          <p className="text-white/90">
            Submit drawing untuk proses approval PLN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* DOKUMEN YANG PERLU DIREVISI */}
          {resubmitDocs.length > 0 && (
            <Card className="shadow-2xl bg-yellow-50 border-4 border-yellow-500">
              <CardHeader className="bg-yellow-600 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <AlertCircle className="w-8 h-8" />
                  Dokumen Perlu Revisi ({resubmitDocs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {resubmitDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl shadow-xl border p-6 flex flex-col lg:flex-row justify-between items-start gap-6"
                  >
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {doc.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Versi {doc.latestVersion} •{" "}
                        {doc.documentType?.toUpperCase()}
                        {doc.contract?.contractNumber &&
                          ` • ${doc.contract.contractNumber}`}
                      </p>
                      {doc.approvals?.[0]?.notes && (
                        <div className="mt-4 p-5 bg-red-50 border-2 border-red-300 rounded-xl">
                          <p className="font-bold text-red-800">
                            Catatan Reviewer:
                          </p>
                          <p className="text-red-700 mt-2">
                            {doc.approvals[0].notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() =>
                          window.open(`/documents/${doc.id}/file`, "_blank")
                        }
                      >
                        <ExternalLink className="w-5 h-5 mr-2" /> Preview
                      </Button>

                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setAnnotatingDoc(doc)}
                      >
                        <Pencil className="w-5 h-5 mr-2" /> Coret & Submit
                      </Button>

                      <label className="cursor-pointer">
                        <Button
                          size="lg"
                          variant="secondary"
                          disabled={resubmitUploadingId === doc.id}
                        >
                          {resubmitUploadingId === doc.id
                            ? "Uploading..."
                            : "Upload Revisi Biasa"}
                        </Button>
                        <input
                          type="file"
                          accept="application/pdf"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const form = new FormData();
                            form.append("file", file);
                            try {
                              await api.patch(
                                `/documents/${doc.id}/resubmit`,
                                form
                              );
                              alert("Revisi biasa berhasil!");
                              await refreshResubmitDocs();
                            } catch {
                              alert("Gagal upload revisi biasa");
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SEMUA KODE UPLOAD BARU ANDA */}
          <Card className="shadow-xl bg-white/95">
            <CardHeader>
              <CardTitle>Informasi Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectInfoForm
                formData={formData}
                onChange={handleInputChange}
                onCategoryChange={(v) =>
                  setFormData((prev) => ({ ...prev, category: v }))
                }
              />
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95">
            <CardHeader>
              <CardTitle>Upload Drawing Files</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button size="lg" onClick={() => setShowReviewStep(true)}>
                        Review Files
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <FileReviewList
                  files={uploadedFiles}
                  onPreview={handlePreviewFile}
                  onRemove={removeFile}
                  onBackToUpload={() => setShowReviewStep(false)}
                  onProceedToSubmit={() =>
                    submitSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-white/95">
            <CardHeader>
              <CardTitle>Catatan Tambahan</CardTitle>
            </CardHeader>
            <CardContent>
              <AdditionalNotes
                notes={formData.notes}
                onChange={handleInputChange}
              />
            </CardContent>
          </Card>

          {apiError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between">
              <span>{apiError}</span>
              <button onClick={() => setApiError("")}>
                <X />
              </button>
            </div>
          )}

          <div ref={submitSectionRef}>
            <SubmitSection
              canSubmit={
                uploadedFiles.some(
                  (f) => f.status === "pending" || f.status === "error"
                ) && !isUploading
              }
            />
          </div>
        </form>
      </main>

      {/* MODAL CORET-CORET */}
      {annotatingDoc && (
        <DocumentViewerModal
          documentId={annotatingDoc.id}
          documentName={annotatingDoc.name}
          isOpen={true}
          onClose={() => setAnnotatingDoc(null)}
          onSave={(blob) => {
            const file = new File([blob], `revisi-${annotatingDoc.name}.pdf`, {
              type: "application/pdf",
            });
            handleResubmitAnnotated(annotatingDoc.id, file);
          }}
        />
      )}
    </div>
  );
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getFileTypeFromExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "dwg":
      return "application/dwg";
    case "dxf":
      return "application/dxf";
    default:
      return "application/octet-stream";
  }
}
