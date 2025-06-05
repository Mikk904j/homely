
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Navigation } from "./Navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => onOpenChange(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : "-100%",
          width: isCollapsed ? "4rem" : "16rem"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card/95 backdrop-blur-xl border-r shadow-lg lg:static lg:translate-x-0",
          "lg:transition-all lg:duration-300"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          isCollapsed && "justify-center px-2"
        )}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              >
                HomeHarmony
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden lg:flex h-8 w-8 hover:bg-accent/80"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="lg:hidden h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <Navigation isCollapsed={isCollapsed} />
        </div>

        {/* Sidebar Footer */}
        <div className={cn(
          "p-4 border-t",
          isCollapsed && "px-2"
        )}>
          <div className={cn(
            "text-xs text-muted-foreground text-center",
            isCollapsed && "hidden"
          )}>
            <p>© 2024 HomeHarmony</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
