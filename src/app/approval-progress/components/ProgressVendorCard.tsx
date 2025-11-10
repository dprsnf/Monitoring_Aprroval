import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, User, Eye, Download } from "lucide-react";

interface VendorProgress {
  id: string;
  vendorName: string;
  company: string;
  projectTitle: string;
  submissionDate: string;
  category: string;
  priority: "high" | "medium" | "low";
  overallProgress: number;
  totalDocuments: number;
  completedDocuments: number;
  inProgressDocuments: number;
  onHoldDocuments: number;
  estimatedCompletion: string;
  assignedReviewer: string;
  description: string;
}

interface ProgressVendorCardProps {
  vendor: VendorProgress;
  onViewDetails: (vendor: VendorProgress) => void;
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return <Badge className="bg-red-100 text-red-800 border border-red-200">High</Badge>;
    case "medium": return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Medium</Badge>;
    default: return <Badge className="bg-green-100 text-green-800 border border-green-200">Low</Badge>;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
};

export default function ProgressVendorCard({ vendor, onViewDetails }: ProgressVendorCardProps) {
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
                <div className="flex flex-wrap gap-2">{getPriorityBadge(vendor.priority)}</div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center text-gray-600">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">{vendor.vendorName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">Due: {new Date(vendor.estimatedCompletion).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#14a2ba] flex-shrink-0" />
                  <span className="truncate">{vendor.assignedReviewer}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="font-bold text-gray-900">{vendor.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${getProgressColor(vendor.overallProgress)}`}
                style={{ width: `${vendor.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{vendor.totalDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-green-700">{vendor.completedDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Completed</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-700">{vendor.inProgressDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">In Progress</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-700">{vendor.onHoldDocuments}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">On Hold</p>
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
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> View Progress
            </Button>
            <Button variant="outline" className="flex-1 xs:flex-none border-2 border-[#14a2ba] text-[#14a2ba] hover:bg-[#14a2ba] hover:text-white transition-all duration-200 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}