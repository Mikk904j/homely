
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SettingsView } from "@/components/settings/SettingsView";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <SettingsView />
    </AppShell>
  );
};

export default Settings;
