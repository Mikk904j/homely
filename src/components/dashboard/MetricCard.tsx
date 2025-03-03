
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  className?: string;
}

export const MetricCard = ({ icon: Icon, label, value, trend, className = "" }: MetricCardProps) => {
  return (
    <Card
      className={`p-6 hover:shadow-lg transition-all duration-200 animate-hover ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-full bg-background/50">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">{label}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">{trend}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
