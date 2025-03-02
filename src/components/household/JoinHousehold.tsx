
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, Loader2, Users } from "lucide-react";
import { Label } from "@/components/ui/label";

interface JoinHouseholdProps {
  onBack: () => void;
}

export const JoinHousehold = ({ onBack }: JoinHouseholdProps) => {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [householdName, setHouseholdName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // 1. Verify the invite code exists and is valid
      const { data: invite, error: inviteError } = await supabase
        .from("household_invites")
        .select("household_id, uses_remaining, expires_at")
        .eq("code", inviteCode.toUpperCase().trim())
        .single();

      if (inviteError || !invite) {
        throw new Error("Invalid or expired invite code");
      }

      // Check if the invite is expired
      if (new Date(invite.expires_at) < new Date()) {
        throw new Error("This invite code has expired");
      }

      // Check if there are uses remaining
      if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
        throw new Error("This invite code has reached its usage limit");
      }

      // 2. Check if user is already a member of this household
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from("member_households")
        .select("id")
        .eq("household_id", invite.household_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMembership) {
        throw new Error("You are already a member of this household");
      }

      // 3. Get the household name for the success message
      const { data: household, error: householdError } = await supabase
        .from("households")
        .select("name")
        .eq("id", invite.household_id)
        .single();

      if (householdError) {
        throw new Error("Could not find the household");
      }

      // 4. Add the user as a member
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: user.id,
          household_id: invite.household_id,
          role: "member",
        });

      if (memberError) {
        console.error("Error joining household:", memberError);
        throw new Error(`Failed to join household: ${memberError.message}`);
      }

      // 5. Decrement the uses_remaining if it's not null
      if (invite.uses_remaining !== null) {
        await supabase
          .from("household_invites")
          .update({ uses_remaining: invite.uses_remaining - 1 })
          .eq("code", inviteCode.toUpperCase().trim());
      }

      // Success!
      setHouseholdName(household.name);
      toast({
        title: "Success!",
        description: `You've joined "${household.name}"`,
      });

      // Show success screen
      setStep('success');
      
    } catch (error: any) {
      console.error("Error joining household:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join household. Please check your invite code and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  if (step === 'success') {
    return (
      <div className="container max-w-lg mx-auto pt-8 px-4 animate-fade-in">
        <Card className="p-6 border-green-200 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Successfully Joined!</h2>
            <p className="text-muted-foreground mb-8">
              You are now a member of "{householdName}"
            </p>
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4 animate-fade-in">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <Button
            variant="ghost"
            className="-ml-2 mb-2"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-2xl">Join a Household</CardTitle>
          <CardDescription>
            Enter the invite code shared by your household administrator to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinHousehold} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code (e.g. ABC123D4)"
                className="animate-scale-in uppercase"
                required
                disabled={isLoading}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Enter the code exactly as it was shared with you
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Household"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
