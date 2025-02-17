
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { CreateEventDialog } from "./CreateEventDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { CalendarEvent } from "@/types/calendar";

export const CalendarView = () => {
  const { toast } = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading events",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return eventDate >= new Date();
  }).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage household events</p>
        </div>
        <CreateEventDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <Calendar mode="single" className="rounded-md" />
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            {isLoading ? (
              <p className="text-muted-foreground">Loading events...</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
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
                          {new Date(event.start_time).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees?.length || 0} people
                        </div>
                      </div>
                      {event.location && (
                        <p className="text-sm text-muted-foreground mt-1">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-muted-foreground">No upcoming events</p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Total Events</span>
                <span className="font-medium">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="font-medium">
                  {events.filter(event => {
                    const eventDate = new Date(event.start_time);
                    const today = new Date();
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return eventDate >= today && eventDate <= weekFromNow;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Upcoming</span>
                <span className="font-medium">{upcomingEvents.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
