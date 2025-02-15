
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Tag, CheckCircle } from "lucide-react";

export const ShoppingView = () => {
  const shoppingLists = [
    {
      id: 1,
      name: "Groceries",
      items: 12,
      status: "Active",
      assignedTo: "John",
    },
    {
      id: 2,
      name: "Household Items",
      items: 5,
      status: "Completed",
      assignedTo: "Sarah",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shopping Lists</h1>
          <p className="text-muted-foreground">Manage your household shopping lists</p>
        </div>
        <Button className="animate-hover">
          <Plus className="mr-2" />
          New List
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shoppingLists.map((list) => (
          <Card key={list.id} className="p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{list.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                list.status === "Active" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {list.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Tag className="h-4 w-4 mr-2" />
                <span>{list.items} items</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Assigned to {list.assignedTo}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">Loading purchases...</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shopping Analytics</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
