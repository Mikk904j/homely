
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface SuccessScreenProps {
  householdName: string;
  inviteCode: string;
  onContinue: () => void;
}

export const SuccessScreen = ({ householdName, inviteCode, onContinue }: SuccessScreenProps) => {
  const { toast } = useToast();

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

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

            <Button onClick={onContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
