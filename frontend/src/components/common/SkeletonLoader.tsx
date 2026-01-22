import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "card" | "table-row" | "avatar" | "button";
}

export function SkeletonLoader({ className, variant = "text" }: SkeletonLoaderProps) {
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    "table-row": "h-12 w-full rounded",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  return (
    <div
      className={cn(
        "skeleton-shimmer",
        variants[variant],
        className
      )}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} className="flex-1 h-8" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <SkeletonLoader key={j} className="flex-1 h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <SkeletonLoader className="h-6 w-1/3" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-2/3" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <SkeletonLoader className="h-4 w-1/2 mb-2" />
      <SkeletonLoader className="h-8 w-1/3" />
    </div>
  );
}
