
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export const AppShell = ({ children, sidebarOpen, onSidebarOpenChange }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => onSidebarOpenChange(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onOpenChange={onSidebarOpenChange} />
        <main className="flex-1 p-4 animate-in">{children}</main>
      </div>
    </div>
  );
};
