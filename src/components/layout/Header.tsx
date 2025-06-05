
import { useState } from "react";
import { Menu, Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { motion } from "framer-motion";

interface HeaderProps {
  onMenuClick: () => void;
  onSearchFocus?: () => void;
}

export const Header = ({ onMenuClick, onSearchFocus }: HeaderProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, signOut } = useAuth();
  const { hasHousehold } = useHousehold();

  const userInitials = user?.email 
    ? user.email.split('@')[0].slice(0, 2).toUpperCase() 
    : 'U';

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-accent/80 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:flex items-center gap-2">
            <motion.div 
              className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              HomeHarmony
            </motion.div>
            {hasHousehold && (
              <Badge variant="secondary" className="ml-2">
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks, lists, or members..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50"
              onFocus={() => {
                setSearchFocused(true);
                onSearchFocus?.();
              }}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/80 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {hasHousehold ? 'Household Member' : 'No Household'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
