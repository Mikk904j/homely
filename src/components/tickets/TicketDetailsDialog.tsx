
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TicketHeader } from "./TicketHeader";
import { TicketMetadata } from "./TicketMetadata";
import { CommentsList } from "./CommentsList";
import { CommentForm } from "./CommentForm";
import type { Ticket, CommentData } from "./types";

interface TicketDetailsDialogProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketDetailsDialog = ({ ticket, open, onOpenChange }: TicketDetailsDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['ticket-comments', ticket.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          id,
          comment,
          created_at,
          user_id,
          user:profiles!ticket_comments_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data as any[]).map(comment => ({
        id: comment.id,
        comment: comment.comment,
        time: new Date(comment.created_at).toLocaleString(),
        user: comment.user?.first_name 
          ? `${comment.user.first_name} ${comment.user.last_name}`
          : 'Unknown User'
      }));
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading comments",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus}`,
      });

      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticket.id,
          comment: newComment.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <TicketHeader ticket={ticket} onStatusUpdate={handleStatusUpdate} />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <TicketMetadata ticket={ticket} />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Comments</h4>
            <CommentsList comments={comments} isLoading={isLoadingComments} />
          </div>

          <CommentForm
            comment={newComment}
            onCommentChange={setNewComment}
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
