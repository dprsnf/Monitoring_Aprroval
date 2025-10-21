"use client";

import type React from "react";

import { Label } from "@/components/ui/label";
import type { UploadFormData } from "@/app/types/uploadFIle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

interface ProjectInfoFormProps {
  formData: UploadFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange?: (value: string) => void;
}

export default function ProjectInfoForm({
  formData,
  onChange,
  onCategoryChange,
}: ProjectInfoFormProps) {
  return (
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
          onChange={onChange}
          placeholder="Contoh: Single Line Diagram - Gardu Induk Cibinong"
          className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-gray-900 font-medium">
          Kategori *
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-blue-200 text-black bg-white "
            >
              {formData.category || "Pilih kategori"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => onCategoryChange?.("protection")}>
              Protection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryChange?.("civil")}>
              Civil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          onChange={onChange}
          className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="noContract" className="text-gray-900 font-medium">
          No. Kontrak *
        </Label>
        <input
          id="noContract"
          name="noContract"
          required
          value={formData.noContract}
          onChange={onChange}
          placeholder="Contoh: K/PLN/2024/001"
          className="w-full px-3 py-2 text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
        />
      </div>
    </div>
  );
}
