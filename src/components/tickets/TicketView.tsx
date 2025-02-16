
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Clock, AlertTriangle, CheckCircle2, User, MessageSquare } from "lucide-react";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketDetailsDialog } from "./TicketDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface TicketType {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed';
  assignee_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface TicketWithComments extends TicketType {
  comments: number;
  assignee_name?: string;
  ticket_comments?: Array<{ count: number }>;
}

export const TicketView = () => {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithComments | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch profiles for assignees
      const assigneeIds = ticketsData
        .map(ticket => ticket.assignee_id)
        .filter((id): id is string => id !== null);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assigneeIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles.map(p => [
        p.id,
        `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unassigned'
      ]));

      return ticketsData.map((ticket): TicketWithComments => ({
        ...ticket as unknown as TicketType, // Cast to ensure correct types
        comments: ticket.ticket_comments[0].count,
        assignee_name: ticket.assignee_id ? profileMap.get(ticket.assignee_id) : 'Unassigned'
      }));
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading tickets",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Change received!', payload);
          // Invalidate the tickets query to refresh the data
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 dark:bg-red-950/50";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50";
      case "low":
        return "text-green-500 bg-green-50 dark:bg-green-950/50";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return AlertTriangle;
      case "in_progress":
        return Clock;
      case "completed":
        return CheckCircle2;
      default:
        return Ticket;
    }
  };

  const handleTicketClick = (ticket: TicketWithComments) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const stats = {
    high: tickets?.filter(t => t.priority === 'high' && t.status === 'open').length || 0,
    inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    completed: tickets?.filter(t => t.status === 'completed').length || 0,
    total: tickets?.length || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Track and manage household maintenance requests</p>
        </div>
        <CreateTicketDialog />
      </div>

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

      <div className="space-y-4">
        {tickets?.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-6 hover:shadow-lg transition-all duration-200 animate-hover cursor-pointer"
            onClick={() => handleTicketClick(ticket)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {React.createElement(getStatusIcon(ticket.status), { className: "h-5 w-5" })}
                </div>
                <div>
                  <h3 className="font-semibold">{ticket.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      {ticket.assignee_name}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(ticket.created_at).toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {ticket.comments} comments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTicket && (
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
};
