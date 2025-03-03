
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, Package, Ticket, BarChart3 } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Ticket",
      icon: Ticket,
      path: "/tickets",
      variant: "default" as const,
      className: "bg-gradient-to-br from-primary to-purple-600 text-white"
    },
    {
      label: "Add to Shopping",
      icon: Package,
      path: "/shopping",
      variant: "outline" as const,
      className: ""
    },
    {
      label: "Schedule Event",
      icon: Calendar,
      path: "/calendar",
      variant: "outline" as const,
      className: ""
    },
    {
      label: "View Reports",
      icon: BarChart3,
      path: "/members",
      variant: "outline" as const,
      className: ""
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button 
            key={action.label}
            variant={action.variant} 
            className={`p-4 h-auto flex flex-col items-center space-y-2 animate-hover ${action.className}`}
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-6 w-6" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
