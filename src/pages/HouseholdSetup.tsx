
import { useState, useEffect } from "react";
import { CreateHousehold } from "@/components/household/CreateHousehold";
import { JoinHousehold } from "@/components/household/JoinHousehold";
import { Card } from "@/components/ui/card";
import { Home, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const HouseholdSetup = () => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const { toast } = useToast();

  // Welcome the user on first load
  useEffect(() => {
    toast({
      title: "Welcome to HomeHarmony",
      description: "Let's get you set up with your household",
    });
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      {mode === 'create' ? (
        <motion.div
          key="create"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <CreateHousehold onBack={() => setMode('select')} />
        </motion.div>
      ) : mode === 'join' ? (
        <motion.div
          key="join"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <JoinHousehold onBack={() => setMode('select')} />
        </motion.div>
      ) : (
        <motion.div
          key="select"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="container max-w-lg mx-auto pt-8 px-4"
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Welcome to HomeHarmony</h1>
            <p className="text-muted-foreground mb-6">Let's get you set up with your household</p>
            <div className="w-16 h-1 bg-primary/50 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 group" 
                onClick={() => setMode('create')}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:bg-primary/30 transition-colors">
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 flex items-center">
                      Create a New Household
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground">Start fresh and invite your family members</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/20 hover:border-primary/40 group" 
                onClick={() => setMode('join')}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:bg-primary/30 transition-colors">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 flex items-center">
                      Join an Existing Household
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground">Connect with your family's household</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HouseholdSetup;
