
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./use-auth";

export function useHousehold() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: household, isLoading } = useQuery({
    queryKey: ['household'],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    meta: {
      onError: (error: any) => {
        toast({
          title: "Error loading household data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const updateHousehold = useMutation({
    mutationFn: async (updatedData: any) => {
      if (!household?.id) throw new Error("No household found");
      
      const { data, error } = await supabase
        .from('households')
        .update(updatedData)
        .eq('id', household.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['household'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating household",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createInviteCode = useMutation({
    mutationFn: async () => {
      if (!household?.id || !user) throw new Error("Missing required data");
      
      // Generate a random code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { data, error } = await supabase
        .from('household_invites')
        .insert({
          household_id: household.id,
          code,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          uses_remaining: 10
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Invite Code Created",
        description: `New invite code: ${data.code}`,
      });
      queryClient.invalidateQueries({ queryKey: ['household-invites'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating invite code",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    household,
    isLoading,
    updateHousehold,
    createInviteCode,
  };
}
