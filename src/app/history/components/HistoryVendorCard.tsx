import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { VendorHistory } from "@/app/types/documentTypes";
import { getStatusBadge, getPriorityBadge } from "./HistoryUtils";
import { Building, Calendar, User } from "lucide-react";

interface HistoryVendorCardProps {
  vendor: VendorHistory;
  onViewDetails: (vendor: VendorHistory) => void;
}

export default function HistoryVendorCard({ vendor, onViewDetails }: HistoryVendorCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate group-hover:text-[#14a2ba] transition-colors duration-200">
                  {vendor.projectTitle}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(vendor.finalStatus)}
                  {getPriorityBadge(vendor.priority)}
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center text-gray-600">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">{vendor.vendorName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">{new Date(vendor.submissionDate).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              {vendor.completionDate && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">Completed: {new Date(vendor.completionDate).toLocaleDateString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{vendor.totalDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total Docs</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700">{vendor.approvedDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Approved</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-red-700">{vendor.rejectedDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Rejected</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-700">{vendor.pendingDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Pending</p>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{vendor.description}</p>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 pt-2">
            <Button
              onClick={() => onViewDetails(vendor)}
              className="flex-1 bg-gradient-to-r from-[#14a2ba] to-[#125d72] hover:from-[#125d72] hover:to-[#14a2ba] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              className="flex-1 xs:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}