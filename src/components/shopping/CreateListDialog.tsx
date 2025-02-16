
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/shopping";

export const CreateListDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (error) throw error;

      return (data as Profile[]).map(member => ({
        id: member.id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unnamed User'
      }));
    }
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          name: name.trim(),
          assignee_id: assignee || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shopping list created successfully",
      });

      setName("");
      setAssignee("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    } catch (error: any) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-hover">
          <Plus className="mr-2" />
          New List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Shopping List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">List Name</label>
            <Input
              placeholder="Enter list name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign To</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Create List
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
