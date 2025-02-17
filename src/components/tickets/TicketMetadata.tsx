
import { User, Clock, MessageSquare } from "lucide-react";
import type { Ticket } from "./types";

interface TicketMetadataProps {
  ticket: Ticket;
}

export const TicketMetadata = ({ ticket }: TicketMetadataProps) => {
  return (
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
  );
};
