import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        destructive: "bg-destructive/10 text-destructive",
        info: "bg-info/10 text-info",
        outline: "border border-border text-foreground",
        // Session statuses
        planned: "bg-muted text-muted-foreground",
        scheduled: "bg-info/10 text-info",
        active: "bg-info/15 text-info font-semibold",
        finished: "bg-success/10 text-success",
        expired: "bg-destructive/10 text-destructive",
        // Question types
        qcm: "bg-primary/10 text-primary border border-primary/20",
        truefalse: "bg-info/10 text-info border border-info/20",
        open: "bg-success/10 text-success border border-success/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Helper to get variant from status string
export function getStatusVariant(status: string): StatusBadgeProps["variant"] {
  const normalizedStatus = status.toLowerCase().replace(/_/g, "");
  const statusMap: Record<string, StatusBadgeProps["variant"]> = {
    planned: "planned",
    scheduled: "scheduled",
    active: "active",
    finished: "finished",
    expired: "expired",
    qcm: "qcm",
    trueorfalse: "truefalse",
    true_or_false: "truefalse",
    openquestion: "open",
    open_question: "open",
  };
  return statusMap[normalizedStatus] || "default";
}

// Helper to get question type label
export function getQuestionTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    qcm: "Multiple Choice",
    QCM: "Multiple Choice",
    true_or_false: "True/False",
    TRUE_OR_FALSE: "True/False",
    trueorfalse: "True/False",
    open_question: "Open Question",
    OPEN_QUESTION: "Open Question",
    openquestion: "Open Question",
  };
  return typeMap[type] || type;
}
