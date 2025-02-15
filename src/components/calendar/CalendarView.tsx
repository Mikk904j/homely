
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export const CalendarView = () => {
  const events = [
    {
      id: 1,
      title: "Family Dinner",
      date: "Today, 7:00 PM",
      attendees: 4,
      type: "social",
    },
    {
      id: 2,
      title: "House Cleaning",
      date: "Tomorrow, 10:00 AM",
      attendees: 2,
      type: "chore",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage household events</p>
        </div>
        <Button className="animate-hover">
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <Calendar mode="single" className="rounded-md" />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees} people
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Events</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <span className="font-medium">2</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
