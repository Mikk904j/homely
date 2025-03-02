import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, Copy, Home, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

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

  const generateInviteCode = () => {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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

      // Use a direct SQL RPC call to bypass RLS issues
      // This simpler approach may avoid the deadlock and recursion issues
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          created_by: user.id,
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

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  const handleContinue = () => {
    navigate("/");
  };

  if (step === 'success') {
    return (
      <div className="container max-w-lg mx-auto pt-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 border-green-200 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Household Created!</h2>
              <p className="text-muted-foreground mb-6">
                You've successfully created "{householdName}" and you're now the admin.
              </p>

              {inviteCode && (
                <div className="bg-muted p-4 rounded-md mb-6 w-full">
                  <p className="text-sm text-muted-foreground mb-2">Share this code with others to invite them:</p>
                  <div className="flex items-center justify-between bg-background border rounded-md p-2">
                    <span className="font-mono text-lg tracking-wider px-2">{inviteCode}</span>
                    <Button variant="ghost" size="sm" onClick={copyInviteCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This code can be used 10 times and expires in 7 days</p>
                </div>
              )}

              <Button onClick={handleContinue} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
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
            <form onSubmit={handleCreateHousehold} className="space-y-6">
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
                <Tabs defaultValue="default" onValueChange={setHouseholdTheme} className="w-full">
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Household"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
