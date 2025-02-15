
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <DashboardView />
    </AppShell>
  );
};

export default Index;
