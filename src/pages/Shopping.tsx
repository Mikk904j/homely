
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ShoppingView } from "@/components/shopping/ShoppingView";

const Shopping = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
      <ShoppingView />
    </AppShell>
  );
};

export default Shopping;
