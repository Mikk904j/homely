
import { Card } from "@/components/ui/card";
import type { Ticket } from "./types";

interface TicketStatsProps {
  tickets: Ticket[];
}

export const TicketStats = ({ tickets }: TicketStatsProps) => {
  const stats = {
    high: tickets?.filter(t => t.priority === 'high' && t.status === 'open').length || 0,
    inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    completed: tickets?.filter(t => t.status === 'completed').length || 0,
    total: tickets?.length || 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/50">
        <h3 className="font-medium text-red-600 dark:text-red-400">High Priority</h3>
        <div className="text-2xl font-bold mt-2">{stats.high}</div>
        <p className="text-sm text-muted-foreground">Open tickets</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950/50">
        <h3 className="font-medium text-yellow-600 dark:text-yellow-400">In Progress</h3>
        <div className="text-2xl font-bold mt-2">{stats.inProgress}</div>
        <p className="text-sm text-muted-foreground">Active tickets</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/50">
        <h3 className="font-medium text-green-600 dark:text-green-400">Completed</h3>
        <div className="text-2xl font-bold mt-2">{stats.completed}</div>
        <p className="text-sm text-muted-foreground">This month</p>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/50">
        <h3 className="font-medium text-blue-600 dark:text-blue-400">Total</h3>
        <div className="text-2xl font-bold mt-2">{stats.total}</div>
        <p className="text-sm text-muted-foreground">All tickets</p>
      </Card>
    </div>
  );
};
