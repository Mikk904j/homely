
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  variant?: "error" | "warning" | "info";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onGoHome,
  onGoBack,
  showRetry = true,
  showGoHome = false,
  showGoBack = false,
  variant = "error"
}: ErrorStateProps) {
  const iconVariants = {
    error: { icon: AlertTriangle, bgColor: "bg-red-100", iconColor: "text-red-600" },
    warning: { icon: AlertTriangle, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
    info: { icon: AlertTriangle, bgColor: "bg-blue-100", iconColor: "text-blue-600" }
  };

  const { icon: Icon, bgColor, iconColor } = iconVariants[variant];

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`mx-auto w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mb-6`}
          >
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </motion.div>
          
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {showGoBack && onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            
            {showGoHome && onGoHome && (
              <Button variant="outline" onClick={onGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
