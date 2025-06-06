
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { householdService } from "@/services/household";

export const HouseholdSetup = () => {
  const [householdName, setHouseholdName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshHouseholdStatus } = useHousehold();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a household",
        variant: "destructive",
      });
      return;
    }

    if (!householdName.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a household name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating household with user ID:", user.id);
      
      const result = await householdService.createHousehold({
        name: householdName.trim(),
        userId: user.id
      });
      
      console.log("Household created successfully:", result);

      // Refresh household status immediately
      await refreshHouseholdStatus();
      console.log("Household status refreshed after creation");

      toast({
        title: "Success",
        description: "Your household has been created!",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Household creation failed:", error);
      
      let errorMessage = error.message || "Failed to create household. Please try again.";
      
      // Enhanced error handling
      if (errorMessage.includes("violates row level security")) {
        errorMessage = "Permission error. Please try logging out and back in.";
      } else if (errorMessage.includes("duplicate key")) {
        errorMessage = "A household with this name already exists. Please try a different name.";
      } else if (errorMessage.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
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
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !householdName.trim()}>
            {isLoading ? "Creating..." : "Create Household"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
