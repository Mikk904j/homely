
import { SettingsView } from "@/components/settings/SettingsView";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <SettingsView />
    </AppShell>
  );
};

export default Settings;
