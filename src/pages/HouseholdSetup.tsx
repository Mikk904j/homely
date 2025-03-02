
import { useState } from "react";
import { CreateHousehold } from "@/components/household/CreateHousehold";
import { JoinHousehold } from "@/components/household/JoinHousehold";
import { Card } from "@/components/ui/card";
import { Home, Users } from "lucide-react";

const HouseholdSetup = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

  if (mode === 'create') {
    return <CreateHousehold onBack={() => setMode('select')} />;
  }

  if (mode === 'join') {
    return <JoinHousehold onBack={() => setMode('select')} />;
  }

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Welcome to HomeHarmony</h1>
        <p className="text-muted-foreground">Let's get you set up with your household</p>
      </div>

      <div className="grid gap-6 animate-fade-in">
        <Card 
          className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 hover:-translate-y-1" 
          onClick={() => setMode('create')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              <Home className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Create a New Household</h3>
              <p className="text-sm text-muted-foreground">Start fresh and invite your family members</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 hover:-translate-y-1" 
          onClick={() => setMode('join')}
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Join an Existing Household</h3>
              <p className="text-sm text-muted-foreground">Connect with your family's household</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdSetup;
