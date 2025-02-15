
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Clock, AlertTriangle, CheckCircle2, User, MessageSquare } from "lucide-react";

export const TicketView = () => {
  const tickets = [
    {
      id: 1,
      title: "Bathroom sink needs repair",
      description: "The sink in the main bathroom is leaking",
      priority: "high",
      status: "open",
      assignee: "John",
      created: "2 hours ago",
      comments: 3,
    },
    {
      id: 2,
      title: "Replace living room light bulb",
      description: "The main ceiling light needs replacement",
      priority: "medium",
      status: "in_progress",
      assignee: "Sarah",
      created: "1 day ago",
      comments: 2,
    },
    {
      id: 3,
      title: "Fix garage door",
      description: "Garage door making noise when opening",
      priority: "low",
      status: "completed",
      assignee: "Mike",
      created: "3 days ago",
      comments: 5,
    },
  ];

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Track and manage household maintenance requests</p>
        </div>
        <Button className="animate-hover">
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/50">
          <h3 className="font-medium text-red-600 dark:text-red-400">High Priority</h3>
          <div className="text-2xl font-bold mt-2">3</div>
          <p className="text-sm text-muted-foreground">Open tickets</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-950/50">
          <h3 className="font-medium text-yellow-600 dark:text-yellow-400">In Progress</h3>
          <div className="text-2xl font-bold mt-2">5</div>
          <p className="text-sm text-muted-foreground">Active tickets</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/50">
          <h3 className="font-medium text-green-600 dark:text-green-400">Completed</h3>
          <div className="text-2xl font-bold mt-2">12</div>
          <p className="text-sm text-muted-foreground">This month</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/50">
          <h3 className="font-medium text-blue-600 dark:text-blue-400">Total</h3>
          <div className="text-2xl font-bold mt-2">20</div>
          <p className="text-sm text-muted-foreground">All tickets</p>
        </Card>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-6 hover:shadow-lg transition-all duration-200 animate-hover"
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
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
