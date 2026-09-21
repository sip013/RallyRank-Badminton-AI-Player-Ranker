import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';

const JoinClubPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { joinClub } = useClub();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?mode=signup&redirect=/join/${code}`);
    }
  }, [authLoading, user, navigate, code]);

  const handleJoin = async () => {
    if (!code) return;
    setBusy(true);
    try {
      await joinClub(code);
      toast.success('Welcome to the club');
      navigate('/app');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not join');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="court-lines flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md surface-panel p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Join club</h1>
        <p className="mt-2 text-muted-foreground">
          Invite code <span className="font-mono font-semibold text-ink">{code}</span>
        </p>
        <Button className="mt-6 h-11 w-full" onClick={handleJoin} disabled={busy || !user}>
          {busy ? 'Joining…' : 'Accept invite'}
        </Button>
      </div>
    </div>
  );
};

export default JoinClubPage;
