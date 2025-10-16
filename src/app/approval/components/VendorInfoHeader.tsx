import { Badge } from "@/components/ui/badge";
import { VendorData } from "@/app/types/technicalApproval";

interface VendorInfoHeaderProps {
    selectedVendor: VendorData;
    getPriorityColor: (priority: string) => string;
    getCategoryColor: (category: string) => string;
}

export default function VendorInfoHeader({ selectedVendor, getPriorityColor, getCategoryColor }: VendorInfoHeaderProps) {
    return (
        <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedVendor.user.name}</h2>
                    <p className="text-gray-600 mb-2">{selectedVendor.user.email}</p>
                    <p className="text-gray-700 font-medium">{selectedVendor.projectTitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge className={getPriorityColor(selectedVendor.priority)}>
                        {selectedVendor.priority.toUpperCase()} Priority
                    </Badge>
                    <Badge className={getCategoryColor(selectedVendor.category)}>
                        {selectedVendor.category}
                    </Badge>
                </div>
            </div>
        </div>
    );
}