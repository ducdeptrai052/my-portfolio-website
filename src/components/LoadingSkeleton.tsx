import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type: "card" | "blog" | "repo" | "text";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  type,
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <div className={cn("grid gap-6", className)}>
        {skeletons.map((i) => (
          <div key={i} className="rounded-lg border bg-card p-0 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "blog") {
    return (
      <div className={cn("grid gap-6", className)}>
        {skeletons.map((i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "repo") {
    return (
      <div className={cn("grid gap-4", className)}>
        {skeletons.map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {skeletons.map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
