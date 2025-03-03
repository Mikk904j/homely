
import { Activity, Package, Clock, CheckCircle2, TrendingUp, Users, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Loading } from "./ui/loading";
import { ErrorBoundary } from "./ui/error-boundary";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { MetricCard } from "./dashboard/MetricCard";
import { RecentActivity } from "./dashboard/RecentActivity";
import { HouseholdOverview } from "./dashboard/HouseholdOverview";
import { QuickActions } from "./dashboard/QuickActions";

export const DashboardView = () => {
  const { stats, recentActivity, isLoading } = useDashboardData();

  if (isLoading) {
    return <Loading />;
  }

  const metrics = stats ? [
    {
      icon: Activity,
      label: "High Priority",
      value: stats.highPriorityTickets.toString(),
      trend: "Open tickets",
      className: "border-red-500/20 hover:border-red-500/40 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/50",
    },
    {
      icon: Package,
      label: "Shopping Lists",
      value: stats.activeShoppingLists.toString(),
      trend: "Active lists",
      className: "border-green-500/20 hover:border-green-500/40 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/50",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: stats.inProgressTickets.toString(),
      trend: "Current tickets",
      className: "border-blue-500/20 hover:border-blue-500/40 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/50",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: stats.completedTickets.toString(),
      trend: "This month",
      className: "border-purple-500/20 hover:border-purple-500/40 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/50",
    },
  ] : [];

  const householdStats = stats ? [
    { label: "Total Members", value: stats.totalMembers.toString(), icon: Users, trend: "Active users" },
    { label: "Total Tickets", value: stats.totalTickets.toString(), icon: Ticket, trend: "All time" },
    { label: "Completion Rate", value: stats.totalTickets ? `${Math.round((stats.completedTickets / stats.totalTickets) * 100)}%` : "0%", icon: TrendingUp, trend: "Task completion" },
    { label: "Active Items", value: stats.activeShoppingLists.toString(), icon: Package, trend: "Shopping lists" },
  ] : [];

  return (
    <ErrorBoundary>
      <div className="space-y-8 animate-fade-in">
        <motion.div 
          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-purple-600 p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/80">Here's what's happening in your household today.</p>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
            <HomeIcon className="w-full h-full" />
          </div>
        </motion.div>
        
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
              className={metric.className}
            />
          ))}
        </motion.div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <RecentActivity activities={recentActivity || []} />
          <HouseholdOverview stats={householdStats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <QuickActions />
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

interface HomeIconProps {
  className?: string;
}

const HomeIcon = ({ className }: HomeIconProps) => (
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
