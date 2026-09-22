import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BrandMark from '@/components/BrandMark';
import {
  authCallbackUrl,
  clearPendingAuth,
  consumePostAuthRedirect,
  isEmailConfirmed,
  isEmailNotConfirmedError,
  readPendingAuth,
  readPostAuthRedirect,
  sanitizeAppPath,
  savePendingAuth,
  savePostAuthRedirect,
  subscribeAuthVerified,
} from '@/lib/authHelpers';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pending = useMemo(() => readPendingAuth(), []);
  const [email, setEmail] = useState(params.get('email') || pending?.email || '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Waiting for the confirmation link…');
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const finishing = useRef(false);
  const checkingRef = useRef(false);

  const redirectHint = useMemo(
    () => sanitizeAppPath(params.get('redirect') || readPostAuthRedirect(), ''),
    [params]
  );

  useEffect(() => {
    if (redirectHint) savePostAuthRedirect(redirectHint);
  }, [redirectHint]);

  const goNext = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    clearPendingAuth();

    const saved = readPostAuthRedirect();
    if (saved) {
      navigate(consumePostAuthRedirect(saved), { replace: true });
      return;
    }

    const { data } = await supabase.from('memberships').select('id').limit(1);
    navigate(data && data.length > 0 ? '/app' : '/onboarding', { replace: true });
  }, [navigate]);

  const tryEnterIfVerified = useCallback(async () => {
    if (finishing.current) return false;

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user && isEmailConfirmed(sessionData.session.user)) {
      setStatus('Verified — redirecting…');
      await goNext();
      return true;
    }

    if (sessionData.session?.user) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && isEmailConfirmed(userData.user)) {
        setStatus('Verified — redirecting…');
        await goNext();
        return true;
      }
    }

    return false;
  }, [goNext]);

  const trySignInOnce = useCallback(async () => {
    if (finishing.current || checkingRef.current) return;

    const tryEmail = readPendingAuth()?.email || email;
    if (!tryEmail || !password) {
      setStatus('Enter your password to continue after confirming.');
      return;
    }

    checkingRef.current = true;
    setChecking(true);
    setStatus('Checking verification…');
    const { error } = await supabase.auth.signInWithPassword({
      email: tryEmail,
      password,
    });
    checkingRef.current = false;
    setChecking(false);

    if (finishing.current) return;

    if (!error) {
      setStatus('Verified — redirecting…');
      await goNext();
      return;
    }

    if (isEmailNotConfirmedError(error.message)) {
      setStatus('Still waiting — open the link in your email.');
      return;
    }

    setStatus(error.message);
  }, [email, goNext, password]);

  useEffect(() => {
    let alive = true;

    const onVerifiedPing = async () => {
      if (!alive || finishing.current) return;
      setStatus('Confirmation received — signing you in…');
      const entered = await tryEnterIfVerified();
      if (!entered && alive) {
        await trySignInOnce();
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!alive || finishing.current) return;
      if (
        session?.user &&
        isEmailConfirmed(session.user) &&
        (event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED' ||
          event === 'INITIAL_SESSION')
      ) {
        setStatus('Verified — redirecting…');
        await goNext();
      }
    });

    const unsubscribePing = subscribeAuthVerified(() => {
      void onVerifiedPing();
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void tryEnterIfVerified();
      }
    };
    const onFocus = () => {
      void tryEnterIfVerified();
    };

    void tryEnterIfVerified();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
      unsubscribePing();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [goNext, tryEnterIfVerified, trySignInOnce]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    savePendingAuth(email);
    await trySignInOnce();
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authCallbackUrl() },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success('Verification email sent');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside
        className="flex flex-col justify-between px-8 py-10 text-white lg:w-[40%] lg:px-12"
        style={{
          background: 'linear-gradient(160deg, #0c241a 0%, #1f6b4a 100%)',
        }}
      >
        <Link to="/" className="group flex items-center gap-2">
          <BrandMark mood="verify" inverted className="h-8 w-8" />
          <span className="font-display text-xl font-bold">RallyRank</span>
        </Link>
        <div className="mt-10 lg:mt-0">
          <h1 className="font-display text-3xl font-bold">Check your inbox</h1>
          <p className="mt-3 text-white/85">
            Open the confirmation link. This page updates when verification
            completes — no password is stored in the browser while you wait.
          </p>
        </div>
        <span />
      </aside>

      <main className="flex flex-1 items-center justify-center bg-[#f4f6f3] px-4 py-10">
        <div className="w-full max-w-md surface-panel p-6 md:p-8">
          <p className="text-sm text-muted-foreground">Verification status</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{status}</p>
          {email && (
            <p className="mt-2 text-sm">
              Sent to <span className="font-semibold">{email}</span>
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5a524]" />
            Listening for confirmation
          </div>

          <form onSubmit={handleContinue} className="mt-6 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="verify-email">Email</Label>
              <Input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verify-password">Password</Label>
              <Input
                id="verify-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                autoComplete="current-password"
                required
              />
              <p className="text-xs text-muted-foreground">
                Re-enter your password only when continuing manually — it is not saved here.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={checking}>
              {checking ? 'Checking…' : "I've confirmed — continue"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={resending || !email}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </Button>
            <Button asChild variant="ghost">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmailPage;
