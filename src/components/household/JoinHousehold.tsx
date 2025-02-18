
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface JoinHouseholdProps {
  onBack: () => void;
}

export const JoinHousehold = ({ onBack }: JoinHouseholdProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Here you would implement the logic to join a household using an invite code
      // For now, we'll show a message that this feature is coming soon
      toast({
        title: "Coming Soon",
        description: "The ability to join households will be available soon!",
      });

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

        <h2 className="text-2xl font-bold mb-2">Join a Household</h2>
        <p className="text-muted-foreground mb-6">
          Enter the invite code shared by your household administrator to join.
        </p>

        <form onSubmit={handleJoinHousehold} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invite Code</label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="animate-scale-in"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join Household"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
