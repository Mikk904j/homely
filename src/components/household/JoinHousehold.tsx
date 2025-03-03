
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useJoinHousehold } from "@/hooks/use-join-household";
import { formatInviteCode } from "@/utils/household";

interface JoinHouseholdProps {
  onBack: () => void;
}

export const JoinHousehold = ({ onBack }: JoinHouseholdProps) => {
  const {
    inviteCode,
    setInviteCode,
    isLoading,
    step,
    householdName,
    error,
    handleJoinHousehold,
    handleContinue
  } = useJoinHousehold();

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
              <h2 className="text-2xl font-bold mb-2">Successfully Joined!</h2>
              <p className="text-muted-foreground mb-8">
                You are now a member of "{householdName}"
              </p>
              <Button onClick={handleContinue} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow user to type with or without formatting
    setInviteCode(e.target.value);
  };

  const displayValue = inviteCode ? formatInviteCode(inviteCode) : '';

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
                  value={displayValue}
                  onChange={handleInputChange}
                  placeholder="Enter invite code (e.g. ABCD-1234)"
                  className="animate-scale-in uppercase tracking-wider text-center font-mono"
                  required
                  disabled={isLoading}
                  maxLength={9} // 8 chars + potential hyphen
                  aria-invalid={!!error}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the code exactly as it was shared with you
                </p>
                {error && (
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                )}
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
      </motion.div>
    </div>
  );
};
