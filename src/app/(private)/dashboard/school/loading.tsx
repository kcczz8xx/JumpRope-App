import { Skeleton, SkeletonText, SkeletonTable } from "@/components/ui/Skeleton";

export default function SchoolLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3"
          >
            <SkeletonText className="w-1/3 mb-2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
