import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const REVEAL_MS = 60_000;

type InviteCodeRevealProps = {
  code: string | null;
  role?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const InviteCodeReveal: React.FC<InviteCodeRevealProps> = ({
  code,
  role,
  open,
  onOpenChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [remainingMs, setRemainingMs] = useState(REVEAL_MS);

  useEffect(() => {
    if (!open || !code) {
      setRemainingMs(REVEAL_MS);
      setCopied(false);
      return;
    }

    const started = Date.now();
    setRemainingMs(REVEAL_MS);
    setCopied(false);

    const id = window.setInterval(() => {
      const left = Math.max(0, REVEAL_MS - (Date.now() - started));
      setRemainingMs(left);
      if (left <= 0) {
        window.clearInterval(id);
        onOpenChange(false);
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [open, code, onOpenChange]);

  const progress = (remainingMs / REVEAL_MS) * 100;
  const secondsLeft = Math.ceil(remainingMs / 1000);

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Invite code copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select the code manually');
    }
  };

  return (
    <Dialog open={open && !!code} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-5 sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Invite ready</DialogTitle>
          <DialogDescription>
            Copy this code now — it won’t be shown again here. The invite itself
            stays valid for 24 hours.
            {role ? (
              <>
                {' '}
                Role: <span className="capitalize text-foreground">{role}</span>.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <button
            type="button"
            onClick={copyCode}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg border border-border',
              'bg-muted/40 px-4 py-4 font-mono text-2xl font-bold tracking-[0.35em] text-ink',
              'transition-[background-color,border-color] duration-300 hover:border-court/40 hover:bg-muted/70'
            )}
            aria-label="Copy invite code"
          >
            {code}
          </button>

          <Button type="button" className="h-11 w-full" onClick={copyCode}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy code
              </>
            )}
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>This window closes automatically</span>
            <span className="tabular-nums">{secondsLeft}s</span>
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Time until this window closes"
          >
            <div
              className="h-full rounded-full bg-court transition-[width] duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCodeReveal;
