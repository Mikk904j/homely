
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Tag, CheckCircle, User } from "lucide-react";
import { CreateListDialog } from "./CreateListDialog";
import { ListDetailsDialog } from "./ListDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ShoppingList } from "@/types/shopping";

export const ShoppingView = () => {
  const [selectedList, setSelectedList] = useState<(ShoppingList & { assignee?: string }) | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: lists, isLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const { data: listsData, error: listsError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (count)
        `)
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      // Fetch profiles for assignees
      const assigneeIds = listsData
        .map(list => list.assignee_id)
        .filter((id): id is string => id !== null);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assigneeIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles.map(p => [
        p.id,
        `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unassigned'
      ]));

      return listsData.map(list => ({
        ...list,
        assignee: list.assignee_id ? profileMap.get(list.assignee_id) : 'Unassigned',
        items: list.shopping_list_items[0].count
      }));
    }
  });

  const handleListClick = (list: ShoppingList & { assignee?: string }) => {
    setSelectedList(list);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const stats = {
    active: lists?.filter(l => l.status === 'active').length || 0,
    completed: lists?.filter(l => l.status === 'completed').length || 0,
    total: lists?.length || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground">Manage your household shopping lists</p>
        </div>
        <CreateListDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Lists</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Lists</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists?.map((list) => (
          <Card
            key={list.id}
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleListClick(list)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{list.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  list.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {list.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="h-4 w-4 mr-2" />
                <span>{list.items} items</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>Assigned to {list.assignee}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedList && (
        <ListDetailsDialog
          list={selectedList}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
};
