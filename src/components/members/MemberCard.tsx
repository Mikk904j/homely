
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Shield } from "lucide-react";
import type { HouseholdMember } from "@/types/members";

interface MemberCardProps {
  member: HouseholdMember;
  onEdit: (member: HouseholdMember) => void;
  currentUserIsAdmin: boolean;
}

export const MemberCard = ({ member, onEdit, currentUserIsAdmin }: MemberCardProps) => {
  const fullName = `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim() || 'Unnamed Member';

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold">
            {fullName.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h3 className="font-semibold flex items-center">
              {fullName}
              {member.role === "admin" && (
                <Shield className="h-4 w-4 text-primary ml-2" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
          </div>
        </div>
        {currentUserIsAdmin && (
          <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
            Edit
          </Button>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{member.profile?.email || 'No email'}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{member.profile?.phone || 'No phone'}</span>
        </div>
      </div>
    </Card>
  );
};
