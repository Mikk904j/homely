
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityItem } from "./ActivityItem";
import { useNavigate } from "react-router-dom";

interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    time: string;
    icon: any;
    iconClass: string;
  }>;
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <ActivityItem
            key={activity.id}
            icon={activity.icon}
            iconClass={activity.iconClass}
            title={activity.title}
            time={activity.time}
            status={activity.status}
            onClick={() => navigate(`/${activity.type}s`)}
          />
        ))}
        {activities?.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No recent activity to display
          </p>
        )}
      </div>
    </Card>
  );
};
