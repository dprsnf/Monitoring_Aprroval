import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface HistoryStatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  label: string;
  value: number;
}

export default function HistoryStatsCard({
  icon: Icon,
  iconColor,
  bgColor,
  label,
  value,
}: HistoryStatsCardProps) {
  return (
    <Card className="bg-white/95 backdrop-blur border-0 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <div className={`p-2 sm:p-2.5 lg:p-3 ${bgColor} rounded-xl`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}