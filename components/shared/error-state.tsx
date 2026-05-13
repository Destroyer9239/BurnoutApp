import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please refresh the page or try again in a moment.",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
      <div>
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
