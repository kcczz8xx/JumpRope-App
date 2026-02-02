import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={5} />
    </div>
  );
}
