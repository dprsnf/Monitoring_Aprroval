"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { type ApiErrorResponse, Division, type Document, Status } from "@/app/types"
import Header from "@/components/common/Header"
import { isAxiosError } from "axios"
import ManagerDocumentCard from "./components/ManagerDocumentCard"
import DocumentCardSkeleton from "../review-dalkon/components/DocumentCardSkeleton"

export default function ManagerPage() {
  const { user: authUser, isLoading: authLoading, logout } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUser = useMemo(() => {
    if (!authUser) return null
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name || "",
      division: authUser.division as Division,
    }
  }, [authUser])

  const loadDocuments = useCallback(async () => {
    if (!currentUser || currentUser.division !== Division.Manager) return

    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/documents")
      // Filter untuk Manager: hanya yang status inReviewManager
      setDocuments(response.data.filter((doc: Document) => doc.status === Status.inReviewManager))
    } catch (err: unknown) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || "Gagal memuat dokumen.")
      } else {
        setError("Terjadi kesalahan yang tidak terduga.")
      }
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!authLoading && currentUser) {
      loadDocuments()
    }
  }, [authLoading, currentUser, loadDocuments])

  const filteredData = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.submittedBy?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.documentType || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!currentUser || currentUser.division !== Division.Manager) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Akses ditolak. Halaman ini hanya untuk Manager.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#14a2ba] via-[#125d72] to-[#efe62f]">
      <Header title="Manager Review" currentUser={authUser} backHref="/dashboard" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header dengan workflow info */}
        <div className="mb-6 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900">Final Review Documents</h2>
          <p className="text-gray-600 mt-2">
            Review final approval documents yang telah melalui tahap Engineering. Upload anotasi dan berikan keputusan
            akhir.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cari dokumen atau vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#14a2ba]"
          />
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <DocumentCardSkeleton key={index} />)
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 bg-white/80 rounded-xl">
              <p className="text-gray-600 text-lg">Tidak ada dokumen yang perlu direview.</p>
            </div>
          ) : (
            filteredData.map((doc) => <ManagerDocumentCard key={doc.id} document={doc} onRefresh={loadDocuments} />)
          )}
        </div>
      </main>
    </div>
  )
}
