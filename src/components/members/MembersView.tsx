
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberCard } from "./MemberCard";
import { AddMemberDialog } from "./AddMemberDialog";
import { EditMemberDialog } from "./EditMemberDialog";
import { Users, Star, Shield } from "lucide-react";
import { householdService, HouseholdMember } from "@/services/household";
import type { Household } from "@/types/members";

export const MembersView = () => {
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: household } = useQuery({
    queryKey: ['household'],
    queryFn: async () => {
      const { data: householdData, error } = await supabase
        .from('households')
        .select('*')
        .single();

      if (error) throw error;
      return householdData as Household;
    }
  });

  const { data: currentUserRole } = useQuery({
    queryKey: ['current-user-role', household?.id],
    enabled: !!household?.id,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('member_households')
        .select('role')
        .eq('household_id', household?.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data.role;
    }
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['household-members', household?.id],
    enabled: !!household?.id,
    queryFn: async () => {
      if (!household?.id) throw new Error("No household ID available");
      return householdService.getHouseholdMembers(household.id);
    }
  });

  const handleEditMember = (member: HouseholdMember) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const stats = {
    total: members.length,
    admins: members.filter(m => m.role === 'admin').length,
    active: members.filter(m => m.profile?.status === 'active').length,
  };

  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Household Members</h1>
          <p className="text-muted-foreground">Manage your household members and their permissions</p>
        </div>
        {isAdmin && household && (
          <AddMemberDialog
            householdId={household.id}
            onMemberAdded={() => {
              // React Query will automatically refresh the members list
            }}
          />
        )}
      </div>

      <div className="grid gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={handleEditMember}
            currentUserIsAdmin={isAdmin}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Member Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Total Members</span>
              </div>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span>Active Members</span>
              </div>
              <span className="font-medium">{stats.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Administrators</span>
              </div>
              <span className="font-medium">{stats.admins}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Household Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Household Name</span>
              <span className="font-medium">{household?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Created</span>
              <span className="font-medium">
                {household?.created_at
                  ? new Date(household.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Your Role</span>
              <span className="font-medium capitalize">{currentUserRole || 'Loading...'}</span>
            </div>
          </div>
        </Card>
      </div>

      {selectedMember && (
        <EditMemberDialog
          member={selectedMember}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onMemberUpdated={() => {
            setSelectedMember(null);
            // React Query will automatically refresh the members list
          }}
        />
      )}
    </div>
  );
};
