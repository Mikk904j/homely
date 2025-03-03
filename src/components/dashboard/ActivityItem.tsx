
import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  time: string;
  status: string;
  onClick: () => void;
}

export const ActivityItem = ({ 
  icon: Icon, 
  iconClass, 
  title, 
  time, 
  status, 
  onClick 
}: ActivityItemProps) => {
  return (
    <div
      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors animate-hover cursor-pointer"
      onClick={onClick}
    >
      <div className={`p-2 rounded-full bg-background ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium">{title}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <span className="text-sm text-muted-foreground">{status}</span>
      </div>
    </div>
  );
};
