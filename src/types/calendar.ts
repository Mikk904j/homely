
export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  created_by: string | null;
  attendees: string[];
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateEventData {
  title: string;
  description?: string;
  location?: string;
  event_type?: string;
  start_time: string;
  end_time: string;
  is_all_day?: boolean;
  attendees?: string[];
}
