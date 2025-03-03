
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";

interface HouseholdFormProps {
  householdName: string;
  setHouseholdName: (name: string) => void;
  householdTheme: string;
  setHouseholdTheme: (theme: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const HouseholdForm = ({
  householdName,
  setHouseholdName,
  householdTheme,
  setHouseholdTheme,
  isLoading,
  onSubmit,
}: HouseholdFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="householdName">Household Name</Label>
        <Input
          id="householdName"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          placeholder="Enter household name"
          className="animate-scale-in"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Household Theme</Label>
        <Tabs defaultValue={householdTheme} onValueChange={setHouseholdTheme} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="warm">Warm</TabsTrigger>
            <TabsTrigger value="cool">Cool</TabsTrigger>
          </TabsList>
          <TabsContent value="default" className="mt-0">
            <div className="h-20 rounded-md bg-gradient-to-r from-primary/80 to-primary flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
          </TabsContent>
          <TabsContent value="warm" className="mt-0">
            <div className="h-20 rounded-md bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
          </TabsContent>
          <TabsContent value="cool" className="mt-0">
            <div className="h-20 rounded-md bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <Home className="h-8 w-8 text-white" />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Household"}
      </Button>
    </form>
  );
};
