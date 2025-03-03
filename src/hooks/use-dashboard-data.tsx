
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, Ticket, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  description?: string;
}

export const useDashboardData = () => {
  const { toast } = useToast();

  const fetchDashboardStats = async (): Promise<DashboardStats> => {
    try {
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

      const tickets = ticketsResponse.data || [];
      const shoppingLists = shoppingResponse.data || [];
      const members = membersResponse.data || [];

      return {
        highPriorityTickets: tickets.filter(t => t.priority === 'high' && t.status === 'open').length,
        inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
        completedTickets: tickets.filter(t => t.status === 'completed').length,
        totalTickets: tickets.length,
        activeShoppingLists: shoppingLists.filter(l => l.status === 'active').length,
        totalMembers: members.length
      };
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error Loading Dashboard Data",
        description: error.message || "Failed to load dashboard statistics.",
        variant: "destructive",
      });
      
      // Return empty stats as fallback
      return {
        highPriorityTickets: 0,
        inProgressTickets: 0,
        completedTickets: 0,
        totalTickets: 0,
        activeShoppingLists: 0,
        totalMembers: 0
      };
    }
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    try {
      // Get recent tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ticketsError) throw ticketsError;

      // Get recent shopping lists
      const { data: shoppingLists, error: shoppingError } = await supabase
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (shoppingError) throw shoppingError;

      // Combine and transform ticket data
      const ticketActivities: RecentActivity[] = (tickets || []).map(ticket => ({
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
                  'text-green-500',
        description: ticket.description?.substring(0, 60) + (ticket.description?.length > 60 ? '...' : '')
      }));

      // Combine and transform shopping list data
      const shoppingActivities: RecentActivity[] = (shoppingLists || []).map(list => ({
        id: list.id,
        type: 'shopping',
        title: list.name,
        status: list.status === 'active' ? 'Active' : 'Completed',
        time: new Date(list.created_at).toLocaleString(),
        icon: ShoppingCart,
        iconClass: list.status === 'active' ? 'text-blue-500' : 'text-green-500'
      }));

      // Combine, sort by time and limit
      const allActivities = [...ticketActivities, ...shoppingActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 7);

      return allActivities;
    } catch (error: any) {
      console.error("Error fetching recent activity:", error);
      toast({
        title: "Error Loading Activity",
        description: error.message || "Failed to load recent activity.",
        variant: "destructive",
      });
      
      return [];
    }
  };

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retryOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: recentActivity, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: fetchRecentActivity,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retryOnMount: true,
    refetchOnWindowFocus: true,
  });

  const isError = !!statsError || !!activityError;
  const error = statsError || activityError;

  return {
    stats: stats || {
      highPriorityTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      totalTickets: 0,
      activeShoppingLists: 0,
      totalMembers: 0
    },
    recentActivity: recentActivity || [],
    isLoading: statsLoading || activityLoading,
    isError,
    error
  };
};
