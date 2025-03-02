
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";

interface CreateHouseholdProps {
  onBack: () => void;
}

export const CreateHousehold = ({ onBack }: CreateHouseholdProps) => {
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      console.log("Creating household for user:", user.id);

      // 1. Create the household first
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (householdError) {
        console.error("Household creation error:", householdError);
        throw new Error(`Failed to create household: ${householdError.message}`);
      }

      console.log("Household created:", household);

      // 2. Add the user as a member with admin role
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: user.id,
          household_id: household.id,
          role: "admin",
        });

      if (memberError) {
        console.error("Member creation error:", memberError);
        // If adding the member fails, try to clean up the household
        await supabase
          .from("households")
          .delete()
          .eq("id", household.id);
        
        throw new Error(`Failed to add you to household: ${memberError.message}`);
      }

      toast({
        title: "Success!",
        description: "Your household has been created.",
      });

      // Navigate to the dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Household creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4 animate-fade-in">
      <Card className="p-6">
        <Button
          variant="ghost"
          className="mb-6 -ml-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h2 className="text-2xl font-bold mb-2">Create Your Household</h2>
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
              className="animate-scale-in"
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Household"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};
