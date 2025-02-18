
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketDetailsDialog } from "./TicketDetailsDialog";
import { TicketStats } from "./TicketStats";
import { TicketList } from "./TicketList";
import type { Ticket } from "./types";

export const TicketView = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
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

      return ticketsData.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description || '',
        priority: ticket.priority as Ticket['priority'],
        status: ticket.status as Ticket['status'],
        assignee: ticket.assignee_id ? profileMap.get(ticket.assignee_id) || 'Unassigned' : 'Unassigned',
        created: new Date(ticket.created_at || '').toLocaleString(),
        comments: ticket.ticket_comments[0].count,
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
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Track and manage household maintenance requests</p>
        </div>
        <CreateTicketDialog />
      </div>

      <TicketStats tickets={tickets || []} />
      <TicketList tickets={tickets || []} onTicketClick={handleTicketClick} />

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
