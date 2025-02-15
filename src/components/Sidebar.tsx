
import { Home, ShoppingCart, Calendar, Users, Settings, X, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: ShoppingCart, label: "Shopping", href: "/shopping" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: Ticket, label: "Tickets", href: "/tickets" },
    { icon: Users, label: "Members", href: "/members" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-card/80 backdrop-blur-xl border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <h2 className="text-lg font-semibold">HomeHarmony</h2>
        <button
          onClick={() => onOpenChange(false)}
          className="lg:hidden p-2 rounded-full hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="space-y-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent animate-hover"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
