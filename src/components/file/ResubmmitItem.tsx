"use client";

import { useState } from "react";
import { Upload, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface ResubmitItemProps {
  doc: any;
  onResubmitSuccess: () => void;
}

export default function ResubmitItem({ doc, onResubmitSuccess }: ResubmitItemProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleResubmit = async () => {
    if (!selectedFile) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.patch(`/documents/${doc.id}/resubmit`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);
        },
      });

      onResubmitSuccess();
      setSelectedFile(null);
      setProgress(0);
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal mengunggah revisi");
    } finally {
      setIsUploading(false);
    }
  };

  const statusText =
    doc.status === "returnForCorrection"
      ? "Dikembalikan untuk diperbaiki"
      : "Disetujui dengan catatan";

  const statusColor =
    doc.status === "returnForCorrection" ? "text-orange-600" : "text-blue-600";

  return (
    <div className="bg-white rounded-lg border border-yellow-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">{doc.name}</h4>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Kontrak:</strong> {doc.contract?.contractNumber || "-"}
            </p>
            <p>
              <strong>Tipe:</strong>{" "}
              {doc.documentType === "protection" ? "Proteksi" : "Sipil"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={statusColor}>{statusText}</span>
            </p>
            <p>
              <strong>Versi saat ini:</strong> v{doc.latestVersion}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isUploading}
            />
          </div>

          {selectedFile && (
            <div className="text-xs text-gray-600">
              Terpilih: <strong>{selectedFile.name}</strong> (
              {formatFileSize(selectedFile.size)})
            </div>
          )}

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button
            onClick={handleResubmit}
            disabled={!selectedFile || isUploading}
            className="bg-[#125d72] hover:bg-[#14a2ba] text-white"
          >
            {isUploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Mengunggah... {progress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Resubmit v{doc.latestVersion + 1}
              </>
            )}
          </Button>
        </div>
      </div>

      {doc.approvals?.[0]?.notes && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <p className="font-medium text-yellow-800 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Catatan Reviewer:
          </p>
          <p className="text-yellow-700 mt-1">{doc.approvals[0].notes}</p>
        </div>
      )}
    </div>
  );
}

// Helper
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}