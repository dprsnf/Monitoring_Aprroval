import { Card, CardContent } from "@/components/ui/card";
import { Document, Status } from "@/app/types";

interface StatisticsCardsProps {
    documents: Document[];
    activeTab: "new" | "results";
}

export default function StatisticsCards({ documents, activeTab }: StatisticsCardsProps) {
    const getStatusCount = (status: Status) => {
        return documents.filter(doc => doc.status === status).length;
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                <CardContent className="p-3 sm:p-6 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{documents.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Documents</div>
                </CardContent>
            </Card>
            {activeTab === "new" ? (
                <>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">{getStatusCount(Status.submitted)}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Submitted</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{getStatusCount(Status.returnForCorrection)}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Return for Correction</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#125d72] mb-1 sm:mb-2">
                                {getStatusCount(Status.inReviewConsultant) + getStatusCount(Status.inReviewEngineering) + getStatusCount(Status.inReviewManager)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">In Review</div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                                {getStatusCount(Status.approved) + getStatusCount(Status.approvedWithNotes)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">Approved</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{getStatusCount(Status.rejected)}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Rejected</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg">
                        <CardContent className="p-3 sm:p-6 text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1 sm:mb-2">{getStatusCount(Status.overdue)}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Overdue</div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}