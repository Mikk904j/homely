
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatInviteCode } from "@/utils/household";
import { Copy, Check, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface InviteCodeDisplayProps {
  inviteCode: string;
  expiryDays: number;
  usesRemaining: number;
}

export const InviteCodeDisplay = ({
  inviteCode,
  expiryDays,
  usesRemaining,
}: InviteCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The invite code has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCode = formatInviteCode(inviteCode);

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-muted-foreground">Share this invite code</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>Expires in {expiryDays} days</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div 
            className="text-2xl tracking-wider font-mono bg-background py-2 px-4 rounded-md border border-input"
            aria-label="Invite code"
          >
            {formattedCode}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {usesRemaining} uses remaining
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="ml-2"
            aria-label={copied ? "Copied" : "Copy invite code"}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
