
import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle2, User, MessageSquare, Ticket } from "lucide-react";
import type { Ticket } from "./types";

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export const TicketList = ({ tickets, onTicketClick }: TicketListProps) => {
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

  return (
    <div className="space-y-4">
      {tickets?.map((ticket) => (
        <Card
          key={ticket.id}
          className="p-6 hover:shadow-lg transition-all duration-200 animate-hover cursor-pointer"
          onClick={() => onTicketClick(ticket)}
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
                    {ticket.assignee}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {ticket.created}
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
  );
};
