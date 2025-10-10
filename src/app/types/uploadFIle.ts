export type UploadStatus = "uploading" | "completed" | "error"

export interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
  uploadTime: string
  status: UploadStatus
  progress?: number
}

export interface UploadFormData {
  projectTitle: string
  category: string
  noContract: string
  notes: string
  contractDate: string
}
