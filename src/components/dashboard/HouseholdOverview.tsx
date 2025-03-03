
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface HouseholdStat {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
}

interface HouseholdOverviewProps {
  stats: HouseholdStat[];
}

export const HouseholdOverview = ({ stats }: HouseholdOverviewProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Household Overview</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/members')}
        >
          Details
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-lg bg-accent/50">
            <div className="flex items-center space-x-2 mb-2">
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="font-medium">{stat.label}</span>
            </div>
            <div className="mt-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
