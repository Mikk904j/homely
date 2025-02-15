
import { Card } from "@/components/ui/card";
import { Activity, Package, Clock, AlertTriangle, TrendingUp, Users, FileText, CheckCircle2, BarChart3, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardView = () => {
  const metrics = [
    {
      icon: Activity,
      label: "Active Tasks",
      value: "12",
      trend: "+2 from yesterday",
      className: "border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/50",
    },
    {
      icon: Package,
      label: "Shopping Items",
      value: "8",
      trend: "3 urgent",
      className: "border-green-500/20 hover:border-green-500/40 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/50",
    },
    {
      icon: Clock,
      label: "Upcoming Events",
      value: "4",
      trend: "Next: Team dinner",
      className: "border-purple-500/20 hover:border-purple-500/40 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/50",
    },
    {
      icon: Ticket,
      label: "Open Tickets",
      value: "6",
      trend: "2 high priority",
      className: "border-red-500/20 hover:border-red-500/40 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/50",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "ticket",
      title: "Bathroom sink needs repair",
      status: "High Priority",
      time: "2 hours ago",
      icon: AlertTriangle,
      iconClass: "text-red-500",
    },
    {
      id: 2,
      type: "shopping",
      title: "Weekly groceries completed",
      status: "Completed",
      time: "4 hours ago",
      icon: CheckCircle2,
      iconClass: "text-green-500",
    },
    {
      id: 3,
      type: "task",
      title: "Clean garage",
      status: "In Progress",
      time: "1 day ago",
      icon: Clock,
      iconClass: "text-blue-500",
    },
  ];

  const householdStats = [
    { label: "Total Members", value: "5", icon: Users, trend: "+1 this month" },
    { label: "Tasks Completed", value: "28", icon: CheckCircle2, trend: "+12% vs last week" },
    { label: "Budget Status", value: "$1,240", icon: TrendingUp, trend: "Under budget" },
    { label: "Documents", value: "15", icon: FileText, trend: "3 need review" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, John</h1>
          <p className="text-white/80">Here's what's happening in your household today.</p>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <Home className="w-full h-full" />
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className={`p-6 hover:shadow-lg transition-all duration-200 animate-hover ${metric.className}`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-background/50">
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

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors animate-hover"
              >
                <div className={`p-2 rounded-full bg-background ${activity.iconClass}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Household Overview</h3>
            <Button variant="outline" size="sm">Details</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {householdStats.map((stat, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/50">
                <div className="flex items-center space-x-2 mb-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{stat.label}</span>
                </div>
                <div className="mt-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="p-4 h-auto flex flex-col items-center space-y-2 bg-gradient-to-br from-primary to-purple-600 text-white animate-hover">
            <Ticket className="h-6 w-6" />
            <span>New Ticket</span>
          </Button>
          <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2 animate-hover">
            <Package className="h-6 w-6" />
            <span>Add to Shopping</span>
          </Button>
          <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2 animate-hover">
            <Calendar className="h-6 w-6" />
            <span>Schedule Event</span>
          </Button>
          <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2 animate-hover">
            <BarChart3 className="h-6 w-6" />
            <span>View Reports</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

interface HomeIcon {
  className?: string;
}

const Home: React.FC<HomeIcon> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
