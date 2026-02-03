import {
  SkeletonHeading,
  SkeletonButton,
  SkeletonStatsCard,
  SkeletonTable,
} from "@/components/ui/Skeleton";

export default function SchoolLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonHeading />
        <SkeletonButton className="w-32" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}
