
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { HouseholdForm } from "./HouseholdForm";
import { SuccessScreen } from "./SuccessScreen";
import { generateInviteCode } from "@/utils/household";

interface CreateHouseholdProps {
  onBack: () => void;
}

export const CreateHousehold = ({ onBack }: CreateHouseholdProps) => {
  const [householdName, setHouseholdName] = useState("");
  const [householdTheme, setHouseholdTheme] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'success'>('info');
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      console.log("Creating household for user:", user.id);

      // Create the household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          created_by: user.id,
          theme: householdTheme, // Store the theme preference
        })
        .select("id, name")
        .single();

      if (householdError) {
        console.error("Household creation error:", householdError);
        throw new Error(`Failed to create household: ${householdError.message}`);
      }

      const householdId = household.id;
      console.log("Household created:", household);

      // Add the user as an admin member
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: user.id,
          household_id: householdId,
          role: "admin",
        });

      if (memberError) {
        console.error("Member creation error:", memberError);
        // If adding the member fails, clean up the household
        if (householdId) {
          await supabase
            .from("households")
            .delete()
            .eq("id", householdId);
        }
        
        throw new Error(`Failed to add you to household: ${memberError.message}`);
      }

      // Generate and create an invite code
      const generatedInviteCode = generateInviteCode();
      const { error: inviteError } = await supabase
        .from("household_invites")
        .insert({
          household_id: householdId,
          code: generatedInviteCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          uses_remaining: 10
        });

      if (inviteError) {
        console.error("Invite creation error:", inviteError);
        // Non-fatal error, just log it
        toast({
          title: "Invite Code Issue",
          description: "Household created but there was an issue generating an invite code.",
          variant: "default",
        });
      } else {
        setInviteCode(generatedInviteCode);
      }

      // Success!
      toast({
        title: "Success!",
        description: "Your household has been created.",
      });

      // Show success screen
      setStep('success');
      
    } catch (error: any) {
      console.error("Household creation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create household. Please try again.",
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
      <SuccessScreen 
        householdName={householdName}
        inviteCode={inviteCode}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            <CardTitle className="text-2xl">Create Your Household</CardTitle>
            <CardDescription>
              Set up your household to start managing tasks and sharing responsibilities with family members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HouseholdForm 
              householdName={householdName}
              setHouseholdName={setHouseholdName}
              householdTheme={householdTheme}
              setHouseholdTheme={setHouseholdTheme}
              isLoading={isLoading}
              onSubmit={handleCreateHousehold}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
