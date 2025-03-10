
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { MemberFormData } from "@/types/members";
import type { HouseholdMember, MemberRole } from "@/services/household/types";

interface MemberFormProps {
  member?: HouseholdMember;
  householdId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MemberForm = ({ member, householdId, onSuccess, onCancel }: MemberFormProps) => {
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: member?.profile?.first_name || "",
    last_name: member?.profile?.last_name || "",
    phone: member?.profile?.phone || "",
    role: member?.role || "member",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (member) {
        // Update existing member
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone: formData.phone.trim(),
          })
          .eq('id', member.user_id);

        if (profileError) throw profileError;

        const { error: memberError } = await supabase
          .from('member_households')
          .update({
            role: formData.role,
          })
          .eq('id', member.id);

        if (memberError) throw memberError;

        toast({
          title: "Success",
          description: "Member updated successfully",
        });
      } else {
        // Create new member - first get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('No authenticated user');

        // Update the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            phone: formData.phone.trim(),
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Create member_household entry
        const { error: memberError } = await supabase
          .from('member_households')
          .insert({
            user_id: user.id,
            household_id: householdId,
            role: formData.role as MemberRole,
            created_by: user.id,
          });

        if (memberError) throw memberError;

        toast({
          title: "Success",
          description: "Member added successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error in member form:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            placeholder="Enter first name"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            placeholder="Enter last name"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
          disabled={isSubmitting}
          type="tel"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select
          value={formData.role}
          onValueChange={(value: MemberRole) => setFormData(prev => ({ ...prev, role: value }))}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : member ? "Update Member" : "Add Member"}
        </Button>
      </div>
    </form>
  );
};
