
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface HouseholdFormProps {
  householdName: string;
  setHouseholdName: (name: string) => void;
  householdDescription: string;
  setHouseholdDescription: (description: string) => void;
  householdTheme: string;
  setHouseholdTheme: (theme: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const HouseholdForm = ({
  householdName,
  setHouseholdName,
  householdDescription,
  setHouseholdDescription,
  householdTheme,
  setHouseholdTheme,
  isLoading,
  onSubmit,
}: HouseholdFormProps) => {
  const [nameStrength, setNameStrength] = useState(0);
  const [formValid, setFormValid] = useState(false);

  // Calculate form validity and name strength
  useEffect(() => {
    const trimmedName = householdName.trim();
    const nameLength = trimmedName.length;
    
    // Simple strength calculation based on length
    const strength = Math.min(100, (nameLength / 15) * 100);
    setNameStrength(nameLength === 0 ? 0 : Math.max(10, strength));
    
    // Form is valid if we have a non-empty name
    setFormValid(trimmedName.length > 0 && trimmedName.length <= 50);
  }, [householdName]);

  const getProgressColor = () => {
    if (nameStrength < 30) return "bg-red-500";
    if (nameStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="householdName">Household Name</Label>
          <span className="text-xs text-muted-foreground">
            {householdName.length}/50
          </span>
        </div>
        <Input
          id="householdName"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          placeholder="Enter household name"
          className="animate-scale-in"
          required
          disabled={isLoading}
          maxLength={50}
          aria-describedby="nameHelp"
        />
        <Progress value={nameStrength} className={getProgressColor()} aria-hidden="true" />
        <p id="nameHelp" className="text-xs text-muted-foreground">
          Choose a descriptive name for your household
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="householdDescription">Description (Optional)</Label>
          <span className="text-xs text-muted-foreground">
            {householdDescription.length}/200
          </span>
        </div>
        <Textarea
          id="householdDescription"
          value={householdDescription}
          onChange={(e) => setHouseholdDescription(e.target.value)}
          placeholder="Briefly describe your household"
          className="resize-none"
          disabled={isLoading}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Household Theme</Label>
        <Tabs defaultValue={householdTheme} onValueChange={setHouseholdTheme} className="w-full">
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
        disabled={isLoading || !formValid}
      >
        {isLoading ? "Creating..." : "Create Household"}
      </Button>
    </form>
  );
};
