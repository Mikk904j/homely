
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseholdForm } from "./HouseholdForm";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface CreateHouseholdCardProps {
  householdName: string;
  setHouseholdName: (name: string) => void;
  householdTheme: string;
  setHouseholdTheme: (theme: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const CreateHouseholdCard = ({
  householdName,
  setHouseholdName,
  householdTheme,
  setHouseholdTheme,
  isLoading,
  onSubmit,
  onBack
}: CreateHouseholdCardProps) => {
  return (
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
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
