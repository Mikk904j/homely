
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MemberForm } from "./MemberForm";

interface AddMemberDialogProps {
  householdId: string;
  onMemberAdded: () => void;
}

export const AddMemberDialog = ({ householdId, onMemberAdded }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onMemberAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-hover">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <MemberForm
          householdId={householdId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
