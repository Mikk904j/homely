
import { Home, ShoppingCart, Calendar, Users, Settings, Ticket, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavigationProps {
  isCollapsed?: boolean;
}

export const Navigation = ({ isCollapsed = false }: NavigationProps) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      href: "/", 
      badge: null,
      description: "Overview and quick actions"
    },
    { 
      icon: ShoppingCart, 
      label: "Shopping", 
      href: "/shopping", 
      badge: "2",
      description: "Manage shopping lists"
    },
    { 
      icon: Calendar, 
      label: "Calendar", 
      href: "/calendar", 
      badge: null,
      description: "Events and scheduling"
    },
    { 
      icon: Ticket, 
      label: "Tickets", 
      href: "/tickets", 
      badge: "5",
      description: "Tasks and requests"
    },
    { 
      icon: Users, 
      label: "Members", 
      href: "/members", 
      badge: null,
      description: "Household members"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/settings", 
      badge: null,
      description: "App preferences"
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Add Task", action: () => {} },
    { icon: ShoppingCart, label: "Quick List", action: () => {} },
  ];

  return (
    <nav className="space-y-6 p-4">
      {/* Main Navigation */}
      <div className="space-y-1">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h3>
        )}
        
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <motion.div
              key={item.href}
              onHoverStart={() => setHoveredItem(item.href)}
              onHoverEnd={() => setHoveredItem(null)}
              className="relative"
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/80",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {item.badge && !isCollapsed && (
                  <Badge 
                    variant={isActive ? "secondary" : "default"} 
                    className="h-5 min-w-[20px] flex items-center justify-center text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Hover tooltip for collapsed state */}
                <AnimatePresence>
                  {isCollapsed && hoveredItem === item.href && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.8 }}
                      className="absolute left-full ml-2 z-50 px-3 py-2 bg-popover border rounded-lg shadow-lg min-w-[150px]"
                    >
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="space-y-1 pt-4 border-t">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent/80"
              onClick={action.action}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
};
