import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Skeleton className="h-80" />
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
        </div>
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
