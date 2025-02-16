
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Plus, ShoppingCart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { ShoppingList, ShoppingListItem } from "@/types/shopping";

interface ListDetailsDialogProps {
  list: ShoppingList & { assignee?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ListDetailsDialog = ({ list, open, onOpenChange }: ListDetailsDialogProps) => {
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['shopping-list-items', list.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('list_id', list.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ShoppingListItem[];
    }
  });

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          list_id: list.id,
          name: newItem.trim(),
          quantity: parseInt(quantity) || 1,
          completed: false
        });

      if (error) throw error;

      setNewItem("");
      setQuantity("1");
      queryClient.invalidateQueries({ queryKey: ['shopping-list-items', list.id] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });

      toast({
        title: "Item added",
        description: "Item has been added to the list",
      });
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

  const toggleItemComplete = async (item: ShoppingListItem) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ completed: !item.completed })
        .eq('id', item.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['shopping-list-items', list.id] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['shopping-list-items', list.id] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });

      toast({
        title: "Item deleted",
        description: "Item has been removed from the list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteList = async () => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ status: list.status === 'active' ? 'completed' : 'active' })
        .eq('id', list.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      onOpenChange(false);

      toast({
        title: "List updated",
        description: `List marked as ${list.status === 'active' ? 'completed' : 'active'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>{list.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned to {list.assignee || 'Unassigned'}</span>
            </div>
            <Button
              variant={list.status === 'completed' ? "outline" : "default"}
              size="sm"
              onClick={handleCompleteList}
            >
              {list.status === 'completed' ? 'Reactivate List' : 'Complete List'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add new item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20"
              />
              <Button onClick={handleAddItem} disabled={isSubmitting}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingItems ? (
              <p className="text-sm text-muted-foreground">Loading items...</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItemComplete(item)}
                      />
                      <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                        {item.name} ({item.quantity})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
