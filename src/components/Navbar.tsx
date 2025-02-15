
import { Menu, Bell } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-full hover:bg-accent mr-2"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-auto flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-accent animate-hover">
            <Bell className="h-5 w-5" />
          </button>
          <button className="size-8 rounded-full bg-primary text-primary-foreground">
            JD
          </button>
        </div>
      </div>
    </header>
  );
};
