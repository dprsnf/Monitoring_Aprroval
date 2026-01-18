"use client"

import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmitSectionProps {
  canSubmit: boolean
}

export default function SubmitSection({ canSubmit }: SubmitSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 drop-shadow-sm">Ready to Submit?</h3>
        <p className="text-gray-700 text-sm">
          Pastikan semua informasi sudah benar dan file sudah terupload dengan sempurna
        </p>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-8 py-2 sm:py-3 font-semibold transition-all duration-200 text-sm sm:text-base"
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Submit untuk Review</span>
          <span className="sm:hidden">Submit</span>
        </Button>
      </div>
    </div>
  )
}

