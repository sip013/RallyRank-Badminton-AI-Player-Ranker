import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { clearPendingAuth, isEmailConfirmed, pingAuthVerified } from '@/lib/authHelpers';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Finishing sign-in…');

  useEffect(() => {
    let cancelled = false;
    let routed = false;

    const routeUser = async (user: {
      email_confirmed_at?: string | null;
      identities?: { provider: string }[];
    }) => {
      if (cancelled || routed) return;
      routed = true;

      if (!isEmailConfirmed(user)) {
        navigate('/auth/verify-email', { replace: true });
        return;
      }

      pingAuthVerified();
      clearPendingAuth();

      const { data: memberships } = await supabase
        .from('memberships')
        .select('id')
        .limit(1);

      if (cancelled) return;

      if (memberships && memberships.length > 0) {
        navigate('/app', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    };

    const finish = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      const session = data.session;
      if (!session?.user) {
        // Give the client a moment to parse URL hash/query tokens
        await new Promise((r) => setTimeout(r, 400));
        const retry = await supabase.auth.getSession();
        if (!retry.data.session?.user) {
          setMessage('Could not complete sign-in. Try again.');
          return;
        }
        await routeUser(retry.data.session.user);
        return;
      }

      await routeUser(session.user);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void routeUser(session.user);
      }
    });

    void finish();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-white"
      style={{
        background: 'linear-gradient(160deg, #0c241a 0%, #1f6b4a 100%)',
      }}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <p className="mt-4 text-sm text-white/85">{message}</p>
    </div>
  );
};

export default AuthCallbackPage;
