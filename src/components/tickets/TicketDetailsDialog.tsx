
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TicketDetailsDialogProps {
  ticket: {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    assignee: string;
    created: string;
    comments: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketDetailsDialog = ({ ticket, open, onOpenChange }: TicketDetailsDialogProps) => {
  const comments = [
    {
      id: 1,
      user: "John",
      comment: "I'll take a look at this today.",
      time: "1 hour ago",
    },
    {
      id: 2,
      user: "Sarah",
      comment: "Let me know if you need any help.",
      time: "30 minutes ago",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                ticket.priority === "high" 
                  ? "bg-red-50 text-red-500" 
                  : ticket.priority === "medium"
                  ? "bg-yellow-50 text-yellow-500"
                  : "bg-green-50 text-green-500"
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Priority: {ticket.priority}</p>
                <p className="text-sm text-muted-foreground">Status: {ticket.status}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update Status
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {ticket.assignee}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {ticket.created}
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              {ticket.comments} comments
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Comments</h4>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar>
                    <AvatarFallback>{comment.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{comment.user}</p>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Add Comment</h4>
            <Textarea placeholder="Write a comment..." />
            <div className="flex justify-end">
              <Button size="sm">Post Comment</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
