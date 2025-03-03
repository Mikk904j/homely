
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { InviteCodeDisplay } from "./InviteCodeDisplay";

interface SuccessScreenProps {
  householdName: string;
  inviteCode: string;
  onContinue: () => void;
}

export const SuccessScreen = ({ householdName, inviteCode, onContinue }: SuccessScreenProps) => {
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
              <div className="mb-6 w-full">
                <InviteCodeDisplay 
                  inviteCode={inviteCode} 
                  expiryDays={7} 
                  usesRemaining={10} 
                />
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
