
import { BaseDataService, realtimeManager } from "./base-service";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats, RecentActivity } from "@/hooks/use-dashboard-data";
import { AlertTriangle, Clock, Ticket, ShoppingCart, Calendar, Users } from "lucide-react";

export class DashboardDataService extends BaseDataService {
  constructor() {
    super('dashboard');
  }
  
  async getDashboardStats(): Promise<DashboardStats> {
    return this.executeQuery(async () => {
      const [ticketsResponse, shoppingResponse, membersResponse, eventsResponse] = await Promise.all([
        supabase
          .from('tickets')
          .select('id, priority, status')
          .throwOnError(),
        supabase
          .from('shopping_lists')
          .select('id, status')
          .throwOnError(),
        supabase
          .from('profiles')
          .select('id')
          .throwOnError(),
        supabase
          .from('calendar_events')
          .select('id')
          .gte('start_time', new Date().toISOString())
          .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          .throwOnError()
      ]);

      const tickets = ticketsResponse.data || [];
      const shoppingLists = shoppingResponse.data || [];
      const members = membersResponse.data || [];
      const upcomingEvents = eventsResponse.data || [];

      return {
        data: {
          highPriorityTickets: tickets.filter(t => t.priority === 'high' && t.status === 'open').length,
          inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
          completedTickets: tickets.filter(t => t.status === 'completed').length,
          totalTickets: tickets.length,
          activeShoppingLists: shoppingLists.filter(l => l.status === 'active').length,
          totalMembers: members.length,
          upcomingEvents: upcomingEvents.length,
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
          .limit(5)
          .throwOnError(),
        supabase
          .from('shopping_lists')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
          .throwOnError(),
        supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3)
          .throwOnError()
      ]);

      const tickets = ticketsResponse.data || [];
      const shoppingLists = shoppingResponse.data || [];
      const events = eventsResponse.data || [];

      // Transform ticket data
      const ticketActivities: RecentActivity[] = tickets.map(ticket => ({
        id: ticket.id,
        type: 'ticket' as const,
        title: ticket.title,
        status: this.getTicketStatusLabel(ticket),
        time: new Date(ticket.created_at).toLocaleString(),
        icon: this.getTicketIcon(ticket),
        iconClass: this.getTicketIconClass(ticket),
        description: this.truncateText(ticket.description, 60)
      }));

      // Transform shopping list data
      const shoppingActivities: RecentActivity[] = shoppingLists.map(list => ({
        id: list.id,
        type: 'shopping' as const,
        title: list.name,
        status: list.status === 'active' ? 'Active' : 'Completed',
        time: new Date(list.created_at).toLocaleString(),
        icon: ShoppingCart,
        iconClass: list.status === 'active' ? 'text-blue-500' : 'text-green-500'
      }));

      // Transform calendar events data
      const eventActivities: RecentActivity[] = events.map(event => ({
        id: event.id,
        type: 'calendar' as const,
        title: event.title,
        status: 'Upcoming',
        time: new Date(event.start_time).toLocaleString(),
        icon: Calendar,
        iconClass: 'text-purple-500',
        description: this.truncateText(event.description, 60)
      }));

      // Combine, sort by time and limit
      const allActivities = [...ticketActivities, ...shoppingActivities, ...eventActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

      return { data: allActivities, error: null };
    });
  }
  
  // Subscribe to real-time updates for dashboard data
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
    
    return () => {
      unsubscribeTickets();
      unsubscribeShopping();
      unsubscribeEvents();
    };
  }
  
  private getTicketStatusLabel(ticket: any): string {
    if (ticket.priority === 'high') return 'High Priority';
    if (ticket.status === 'in_progress') return 'In Progress';
    if (ticket.status === 'completed') return 'Completed';
    return 'Open';
  }
  
  private getTicketIcon(ticket: any) {
    if (ticket.priority === 'high') return AlertTriangle;
    if (ticket.status === 'in_progress') return Clock;
    return Ticket;
  }
  
  private getTicketIconClass(ticket: any): string {
    if (ticket.priority === 'high') return 'text-red-500';
    if (ticket.status === 'in_progress') return 'text-blue-500';
    if (ticket.status === 'completed') return 'text-green-500';
    return 'text-gray-500';
  }
  
  private truncateText(text: string | null, maxLength: number): string | undefined {
    if (!text) return undefined;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }
}

export const dashboardService = new DashboardDataService();
