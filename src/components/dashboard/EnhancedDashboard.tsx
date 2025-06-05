
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  ShoppingCart, 
  Calendar, 
  Ticket, 
  Users, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Loading } from "@/components/ui/loading";

export const EnhancedDashboard = () => {
  const { stats, recentActivity, isLoading } = useDashboardData();

  if (isLoading) {
    return <Loading text="Loading your dashboard..." fullScreen />;
  }

  const quickStats = [
    {
      title: "Active Tasks",
      value: stats.inProgressTickets,
      total: stats.totalTickets,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12%"
    },
    {
      title: "Shopping Lists",
      value: stats.activeShoppingLists,
      total: 5,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+5%"
    },
    {
      title: "Family Members",
      value: stats.totalMembers,
      total: stats.totalMembers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "0%"
    },
    {
      title: "Completed Today",
      value: stats.completedTickets,
      total: stats.totalTickets,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+25%"
    }
  ];

  const quickActions = [
    { title: "Add Task", icon: Plus, href: "/tickets", color: "bg-blue-500" },
    { title: "Shopping List", icon: ShoppingCart, href: "/shopping", color: "bg-green-500" },
    { title: "Schedule Event", icon: Calendar, href: "/calendar", color: "bg-purple-500" },
    { title: "Invite Member", icon: Users, href: "/members", color: "bg-orange-500" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Good morning! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your household today.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.total > 0 && (
                      <span className="text-sm text-muted-foreground">
                        / {stat.total}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {stat.total > 0 && (
                <div className="mt-4">
                  <Progress 
                    value={(stat.value / stat.total) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                    >
                      <div className={`p-2 rounded-full ${action.color} text-white`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">{action.title}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-full ${activity.iconClass} bg-muted`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Priority Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Priority Tasks</h3>
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.highPriorityTickets} High Priority
              </Badge>
            </div>
            
            {stats.highPriorityTickets > 0 ? (
              <div className="space-y-2">
                {Array.from({ length: Math.min(3, stats.highPriorityTickets) }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-1 bg-red-100 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">High Priority Task #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Requires immediate attention
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No high priority tasks! 🎉</p>
                <p className="text-sm">Everything is under control.</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
