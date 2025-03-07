
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const HouseholdSetup = () => {
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          created_by: user.id,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Add user as admin member
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: user.id,
          household_id: household.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Your household has been created!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto pt-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create Your Household</h1>
        <p className="text-muted-foreground mb-6">
          Set up your household to start managing tasks and sharing responsibilities with family members.
        </p>
        <form onSubmit={handleCreateHousehold} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Household Name</label>
            <Input
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="Enter household name"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Household"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
