
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  className,
  size = "md",
  text = "Loading...",
  fullScreen = false,
}: LoadingProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center py-8";

  return (
    <div className={cn(containerClass, className)}>
      <div className="text-center">
        <Loader2 className={cn("animate-spin mx-auto mb-4", sizeClass[size])} />
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}
