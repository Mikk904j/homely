
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ticket } from "./types";

interface TicketHeaderProps {
  ticket: Ticket;
  onStatusUpdate: (status: string) => void;
}

export const TicketHeader = ({ ticket, onStatusUpdate }: TicketHeaderProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-yellow-500 bg-yellow-50";
      case "low":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${getPriorityColor(ticket.priority)}`}>
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">Priority: {ticket.priority}</p>
          <p className="text-sm text-muted-foreground">Current status: {ticket.status}</p>
        </div>
      </div>
      <Select
        defaultValue={ticket.status}
        onValueChange={onStatusUpdate}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
