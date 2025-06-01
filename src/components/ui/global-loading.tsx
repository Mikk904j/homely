
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GlobalLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function GlobalLoading({ 
  message = "Loading...", 
  fullScreen = true 
}: GlobalLoadingProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <motion.div
            className="absolute inset-0 border-2 border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <motion.div
            className="h-1 w-32 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
