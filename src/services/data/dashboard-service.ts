
import { supabase } from "@/integrations/supabase/client";
import { BaseDataService, realtimeManager } from "./base-service";
import { DashboardStats, RecentActivity } from "@/hooks/use-dashboard-data";
import { AlertTriangle, Clock, Ticket, ShoppingCart, Calendar as CalendarIcon } from "lucide-react";

class DashboardService extends BaseDataService {
  constructor() {
    super('dashboard');
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.executeQuery(async () => {
      const [ticketsResponse, shoppingResponse, membersResponse, eventsResponse] = await Promise.all([
        supabase.from('tickets').select('id, priority, status'),
        supabase.from('shopping_lists').select('id, status'),
        supabase.from('profiles').select('id'),
        supabase.from('calendar_events').select('id, start_date').gte('start_date', new Date().toISOString())
      ]);

      // Handle potential errors gracefully
      const tickets = ticketsResponse.data || [];
      const shoppingLists = shoppingResponse.data || [];
      const members = membersResponse.data || [];
      const events = eventsResponse.data || [];

      return {
        data: {
          highPriorityTickets: tickets.filter(t => t.priority === 'high' && t.status === 'open').length,
          inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          totalTickets: tickets.length,
          activeShoppingLists: shoppingLists.filter(l => l.status === 'active').length,
          totalMembers: members.length,
          upcomingEvents: events.length
        },
        error: null
      };
    });
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.executeQuery(async () => {
      const [ticketsResponse, shoppingResponse, eventsResponse] = await Promise.all([
        supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('shopping_lists')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('calendar_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities: RecentActivity[] = [];

      // Process tickets
      if (ticketsResponse.data) {
        activities.push(...ticketsResponse.data.map(ticket => ({
          id: ticket.id,
          type: 'ticket' as const,
          title: ticket.title,
          status: ticket.priority === 'high' ? 'High Priority' : 
                 ticket.status === 'in_progress' ? 'In Progress' : 'Open',
          time: new Date(ticket.created_at).toLocaleString(),
          icon: ticket.priority === 'high' ? AlertTriangle :
                ticket.status === 'in_progress' ? Clock : Ticket,
          iconClass: ticket.priority === 'high' ? 'text-red-500' :
                    ticket.status === 'in_progress' ? 'text-blue-500' : 'text-green-500',
          description: ticket.description?.substring(0, 60) + (ticket.description?.length > 60 ? '...' : '')
        })));
      }

      // Process shopping lists
      if (shoppingResponse.data) {
        activities.push(...shoppingResponse.data.map(list => ({
          id: list.id,
          type: 'shopping' as const,
          title: list.name,
          status: list.status === 'active' ? 'Active' : 'Completed',
          time: new Date(list.created_at).toLocaleString(),
          icon: ShoppingCart,
          iconClass: list.status === 'active' ? 'text-blue-500' : 'text-green-500'
        })));
      }

      // Process calendar events
      if (eventsResponse.data) {
        activities.push(...eventsResponse.data.map(event => ({
          id: event.id,
          type: 'calendar' as const,
          title: event.title,
          status: 'Upcoming',
          time: new Date(event.start_date).toLocaleString(),
          icon: CalendarIcon,
          iconClass: 'text-purple-500',
          description: event.description?.substring(0, 60) + (event.description?.length > 60 ? '...' : '')
        })));
      }

      // Sort by time and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

      return {
        data: sortedActivities,
        error: null
      };
    });
  }

  subscribeToUpdates(callback: () => void): () => void {
    const unsubscribeTickets = realtimeManager.subscribe(
      'dashboard-tickets',
      'tickets',
      callback
    );

    const unsubscribeShopping = realtimeManager.subscribe(
      'dashboard-shopping',
      'shopping_lists',
      callback
    );

    const unsubscribeEvents = realtimeManager.subscribe(
      'dashboard-events',
      'calendar_events',
      callback
    );

    // Return cleanup function
    return () => {
      unsubscribeTickets();
      unsubscribeShopping();
      unsubscribeEvents();
    };
  }
}

export const dashboardService = new DashboardService();
