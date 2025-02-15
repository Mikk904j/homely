
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TicketView } from "@/components/tickets/TicketView";

const Tickets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <TicketView />
    </AppShell>
  );
};

export default Tickets;
