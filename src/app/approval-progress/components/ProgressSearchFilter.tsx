import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
}

export default function ProgressSearchFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: ProgressSearchFilterProps) {
  return (
    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200 mb-4 sm:mb-6 lg:mb-8">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search vendors, projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border-gray-200 focus:border-[#14a2ba] focus:ring-[#14a2ba] focus:ring-2 focus:ring-opacity-20 rounded-lg text-sm"
            />
          </div>
          <div className="relative sm:w-auto w-full">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:border-[#14a2ba] focus:ring-[#14a2ba] focus:ring-2 focus:ring-opacity-20 bg-white text-sm min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}