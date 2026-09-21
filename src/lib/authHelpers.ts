const PENDING_AUTH_KEY = 'rallyrank.pendingAuth';
const AUTH_VERIFIED_CHANNEL = 'rallyrank.auth-verified';

export type PendingAuth = {
  email: string;
  password: string;
};

export type AuthVerifiedPing = {
  type: 'email-verified';
  at: number;
};

export function getAuthRedirectBase(): string {
  const origin = window.location.origin;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${origin}${base}`;
}

export function authCallbackUrl(): string {
  return `${getAuthRedirectBase()}/auth/callback`;
}

export function savePendingAuth(email: string, password: string) {
  sessionStorage.setItem(
    PENDING_AUTH_KEY,
    JSON.stringify({ email: email.trim(), password } satisfies PendingAuth)
  );
}

export function readPendingAuth(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAuth;
    if (!parsed.email || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingAuth() {
  sessionStorage.removeItem(PENDING_AUTH_KEY);
}

export function isEmailConfirmed(user: { email_confirmed_at?: string | null; identities?: { provider: string }[] } | null): boolean {
  if (!user) return false;
  if (user.email_confirmed_at) return true;
  // OAuth providers are treated as verified
  const providers = user.identities?.map((i) => i.provider) || [];
  return providers.some((p) => p !== 'email');
}

export function isEmailNotConfirmedError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('email not confirmed') || m.includes('not confirmed');
}

/** Notify other same-origin tabs (e.g. verify-email page) that auth completed. */
export function pingAuthVerified() {
  const payload: AuthVerifiedPing = { type: 'email-verified', at: Date.now() };
  try {
    const channel = new BroadcastChannel(AUTH_VERIFIED_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // BroadcastChannel unsupported — storage fallback below still helps
  }
  try {
    localStorage.setItem('rallyrank.auth-verified-at', String(payload.at));
  } catch {
    // ignore quota / private mode
  }
}

export function subscribeAuthVerified(onPing: () => void): () => void {
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(AUTH_VERIFIED_CHANNEL);
    channel.onmessage = (event: MessageEvent<AuthVerifiedPing>) => {
      if (event.data?.type === 'email-verified') onPing();
    };
  } catch {
    channel = null;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === 'rallyrank.auth-verified-at' && event.newValue) {
      onPing();
    }
    // Supabase persists the session in localStorage; other tabs pick it up here
    if (event.key?.startsWith('sb-') && event.key.includes('auth-token') && event.newValue) {
      onPing();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    channel?.close();
    window.removeEventListener('storage', onStorage);
  };
}
