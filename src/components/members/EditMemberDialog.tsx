
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MemberForm } from "./MemberForm";
import type { HouseholdMember } from "@/types/members";

interface EditMemberDialogProps {
  member: HouseholdMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberUpdated: () => void;
}

export const EditMemberDialog = ({
  member,
  open,
  onOpenChange,
  onMemberUpdated,
}: EditMemberDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    onMemberUpdated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <MemberForm
          member={member}
          householdId={member.household_id}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
