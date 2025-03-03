
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check } from "lucide-react";
import { formatInviteCode } from "@/utils/household";
import { useState } from "react";

interface InviteCodeDisplayProps {
  inviteCode: string;
  expiryDays?: number;
  usesRemaining?: number;
}

export const InviteCodeDisplay = ({ 
  inviteCode, 
  expiryDays = 7,
  usesRemaining = 10
}: InviteCodeDisplayProps) => {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);
  
  if (!inviteCode) {
    return null;
  }

  const formattedCode = formatInviteCode(inviteCode);

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setHasCopied(true);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Try selecting and copying manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-muted p-4 rounded-md w-full">
      <p className="text-sm text-muted-foreground mb-2">Share this code with others to invite them:</p>
      <div className="flex items-center justify-between bg-background border rounded-md p-2">
        <span className="font-mono text-lg tracking-wider px-2">{formattedCode}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyInviteCode} 
          aria-label="Copy invite code"
          disabled={hasCopied}
        >
          {hasCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        This code can be used {usesRemaining === null ? "unlimited times" : `${usesRemaining} times`} and expires in {expiryDays} days
      </p>
    </div>
  );
};
