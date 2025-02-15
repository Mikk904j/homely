
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CalendarView } from "@/components/calendar/CalendarView";

const Calendar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <CalendarView />
    </AppShell>
  );
};

export default Calendar;
