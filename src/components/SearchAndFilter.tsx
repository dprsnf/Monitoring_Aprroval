import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Status } from "@/app/types";

interface SearchAndFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    activeTab: "new" | "results";
}

export default function SearchAndFilter({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    activeTab
}: SearchAndFilterProps) {
    return (
        <Card className="shadow-xl bg-white/95 backdrop-blur-sm border border-white/30 mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Cari berdasarkan nama dokumen, vendor, atau tipe..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-10 text-sm sm:text-base"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm sm:text-base min-w-32"
                        >
                            <option value="all">Semua Status</option>
                            {activeTab === "new" ? (
                                <>
                                    <option value={Status.submitted}>Submitted</option>
                                    <option value={Status.returnForCorrection}>Return for Correction</option>
                                    <option value={Status.inReviewManager}>In Review Manager</option>
                                </>
                            ) : (
                                <>
                                    <option value={Status.approved}>Approved</option>
                                    <option value={Status.approvedWithNotes}>Approved with Notes</option>
                                    <option value={Status.rejected}>Rejected</option>
                                    <option value={Status.overdue}>Overdue</option>
                                </>
                            )}
                        </select>
                        <Button className="bg-[#125d72] hover:bg-[#14a2ba] text-white px-3 sm:px-4">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}