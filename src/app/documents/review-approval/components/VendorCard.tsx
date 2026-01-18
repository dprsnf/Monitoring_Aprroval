"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, FolderOpen, Calendar, Eye } from "lucide-react";
import { VendorData, Document } from "@/app/types"; // ✅ FIX: Path import

interface VendorCardProps {
  vendor: VendorData;
  onVendorClick: (vendor: VendorData) => void;
  getPriorityColor: (priority: string) => string;
  getDocumentCounts: (documents: Document[]) => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function VendorCard({
  vendor,
  onVendorClick,
  getPriorityColor,
  getDocumentCounts,
}: VendorCardProps) {
  const counts = getDocumentCounts(vendor.documents);

  return (
    <Card
      key={vendor.user.id}
      className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/30 cursor-pointer hover:scale-[1.02]"
      onClick={() => onVendorClick(vendor)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {vendor.user.name}
              </h3>
              <Badge
                className={`${getPriorityColor(vendor.priority)} whitespace-nowrap`}
              >
                {vendor.priority.toUpperCase()} Priority
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-[#14a2ba]" />
                <span>{vendor.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FolderOpen className="w-4 h-4 text-[#14a2ba]" />
                <span>{vendor.projectTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-[#14a2ba]" />
                {/* ✅ FIX: Format tanggal jika valid */}
                <span>
                  Deadline:{" "}
                  {vendor.reviewDeadline && vendor.reviewDeadline !== "N/A"
                    ? new Date(vendor.reviewDeadline).toLocaleDateString("id-ID")
                    : "N/A"}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">
              {vendor.description}
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-75">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {counts.total}
                </div>
                <div className="text-xs text-blue-700">Total</div>
              </div>
              <div className="text-center p-3 bg-linear-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-yellow-600">
                  {counts.pending}
                </div>
                <div className="text-xs text-yellow-700">Pending</div>
              </div>
              <div className="text-center p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  {counts.approved}
                </div>
                <div className="text-xs text-green-700">Approved</div>
              </div>
              <div className="text-center p-3 bg-linear-to-br from-red-50 to-red-100 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-red-600">
                  {counts.rejected}
                </div>
                <div className="text-xs text-red-700">Rejected</div>
              </div>
            </div>

            <Button className="w-full bg-[#125d72] hover:bg-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200">
              <Eye className="w-4 h-4 mr-2" />
              Review Documents
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}