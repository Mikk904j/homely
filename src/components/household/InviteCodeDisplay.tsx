
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Copy } from "lucide-react";
import { formatInviteCode } from "@/utils/household";

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
  
  if (!inviteCode) {
    return null;
  }

  const formattedCode = formatInviteCode(inviteCode);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  return (
    <div className="bg-muted p-4 rounded-md w-full">
      <p className="text-sm text-muted-foreground mb-2">Share this code with others to invite them:</p>
      <div className="flex items-center justify-between bg-background border rounded-md p-2">
        <span className="font-mono text-lg tracking-wider px-2">{formattedCode}</span>
        <Button variant="ghost" size="sm" onClick={copyInviteCode} aria-label="Copy invite code">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        This code can be used {usesRemaining === null ? "unlimited times" : `${usesRemaining} times`} and expires in {expiryDays} days
      </p>
    </div>
  );
};
