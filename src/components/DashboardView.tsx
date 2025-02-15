
import { Card } from "@/components/ui/card";
import { Activity, Package, Clock, AlertTriangle } from "lucide-react";

export const DashboardView = () => {
  const metrics = [
    {
      icon: Activity,
      label: "Active Tasks",
      value: "12",
      trend: "+2 from yesterday",
      className: "border-blue-500/20 hover:border-blue-500/40",
    },
    {
      icon: Package,
      label: "Shopping Items",
      value: "8",
      trend: "3 urgent",
      className: "border-green-500/20 hover:border-green-500/40",
    },
    {
      icon: Clock,
      label: "Upcoming Events",
      value: "4",
      trend: "Next: Team dinner",
      className: "border-purple-500/20 hover:border-purple-500/40",
    },
    {
      icon: AlertTriangle,
      label: "Issues",
      value: "2",
      trend: "1 high priority",
      className: "border-red-500/20 hover:border-red-500/40",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Here's what's happening in your household.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={`p-6 hover:shadow-lg transition-all duration-200 animate-hover ${metric.className}`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-background">
                <metric.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{metric.label}</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Activity items would go here */}
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Quick action buttons would go here */}
            <button className="p-4 rounded-lg border hover:bg-accent animate-hover">
              Add Task
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent animate-hover">
              New Shopping Item
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent animate-hover">
              Schedule Event
            </button>
            <button className="p-4 rounded-lg border hover:bg-accent animate-hover">
              Report Issue
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
