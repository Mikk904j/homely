
import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loading({ 
  text, 
  fullScreen = false, 
  className = "", 
  size = "md" 
}: LoadingProps) {
  // Size mappings
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClass = fullScreen
    ? "flex flex-col items-center justify-center min-h-[80vh] w-full"
    : "flex flex-col items-center justify-center p-4";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
        {text && (
          <p className="text-muted-foreground text-sm">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
