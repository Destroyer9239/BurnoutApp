import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3c-1.5 4-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-2.5-5-4-9z"
            fill="currentColor"
          />
          <path
            d="M12 14c-1 1.5-2 2.5-2 4a2 2 0 0 0 4 0c0-1.5-1-2.5-2-4z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </span>
      {showWordmark ? (
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
      ) : null}
    </div>
  );
}
