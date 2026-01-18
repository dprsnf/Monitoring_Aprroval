"use client"

import type React from "react"

import { useRef } from "react"
import { Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  isDragOver: boolean
  setIsDragOver: (val: boolean) => void
  onFilesSelected: (files: File[]) => void
}

export default function FileDropzone({ isDragOver, setIsDragOver, onFilesSelected }: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    onFilesSelected(files)
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    onFilesSelected(files)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragOver
          ? "border-blue-500 bg-blue-50"
          : "border-blue-300 bg-linear-to-br from-blue-50 to-blue-100 hover:border-blue-400 hover:bg-blue-50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">Upload File Drawing</h3>
      <p className="text-gray-600 mb-4">Ambil & tempel file disini, atau click untuk mencari</p>
      <p className="text-sm text-gray-500 mb-6">Supported formats: PDF (Max: 50MB per file)</p>
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
      >
        <Plus className="w-4 h-4 mr-2" />
        Cari File
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
