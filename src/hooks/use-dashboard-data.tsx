
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, Ticket } from "lucide-react";

export interface DashboardStats {
  highPriorityTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  totalTickets: number;
  activeShoppingLists: number;
  totalMembers: number;
}

export interface RecentActivity {
  id: string;
  type: 'ticket' | 'shopping';
  title: string;
  status: string;
  time: string;
  icon: any;
  iconClass: string;
}

export const useDashboardData = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [ticketsResponse, shoppingResponse, membersResponse] = await Promise.all([
        supabase
          .from('tickets')
          .select('id, priority, status'),
        supabase
          .from('shopping_lists')
          .select('id, status'),
        supabase
          .from('profiles')
          .select('id')
      ]);

      if (ticketsResponse.error) throw ticketsResponse.error;
      if (shoppingResponse.error) throw shoppingResponse.error;
      if (membersResponse.error) throw membersResponse.error;

      const tickets = ticketsResponse.data;
      const shoppingLists = shoppingResponse.data;
      const members = membersResponse.data;

      return {
        highPriorityTickets: tickets.filter(t => t.priority === 'high' && t.status === 'open').length,
        inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
        completedTickets: tickets.filter(t => t.status === 'completed').length,
        totalTickets: tickets.length,
        activeShoppingLists: shoppingLists.filter(l => l.status === 'active').length,
        totalMembers: members.length
      };
    }
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ticketsError) throw ticketsError;

      return tickets.map(ticket => ({
        id: ticket.id,
        type: 'ticket',
        title: ticket.title,
        status: ticket.priority === 'high' ? 'High Priority' : 
               ticket.status === 'in_progress' ? 'In Progress' : 
               'Open',
        time: new Date(ticket.created_at).toLocaleString(),
        icon: ticket.priority === 'high' ? AlertTriangle :
              ticket.status === 'in_progress' ? Clock :
              Ticket,
        iconClass: ticket.priority === 'high' ? 'text-red-500' :
                  ticket.status === 'in_progress' ? 'text-blue-500' :
                  'text-green-500'
      }));
    }
  });

  return {
    stats,
    recentActivity,
    isLoading: statsLoading || activityLoading
  };
};
