"use client"

import type React from "react"

import { Label } from "@/components/ui/label"

interface AdditionalNotesProps {
  notes: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export default function AdditionalNotes({ notes, onChange }: AdditionalNotesProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes" className="text-gray-900 font-medium text-sm sm:text-base">
        Catatan untuk Reviewer (Opsional)
      </Label>
      <textarea
        id="notes"
        name="notes"
        rows={3}
        value={notes}
        onChange={onChange}
        placeholder="Berikan catatan khusus, perhatian, atau informasi tambahan untuk reviewer..."
        className="w-full text-black px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors resize-none text-sm sm:text-base"
      />
    </div>
  )
}
