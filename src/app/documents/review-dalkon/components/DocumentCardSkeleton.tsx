import { Skeleton } from "@/components/ui/skeleton"

export default function DocumentCardSkeleton() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-6">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <div className="flex-1 mb-4 sm:mb-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  )
}