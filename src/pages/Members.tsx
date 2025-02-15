
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MembersView } from "@/components/members/MembersView";

const Members = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <MembersView />
    </AppShell>
  );
};

export default Members;
