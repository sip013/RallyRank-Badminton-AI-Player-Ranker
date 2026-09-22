const PENDING_AUTH_KEY = 'rallyrank.pendingAuth';
const POST_AUTH_REDIRECT_KEY = 'rallyrank.postAuthRedirect';
const AUTH_VERIFIED_CHANNEL = 'rallyrank.auth-verified';

export type PendingAuth = {
  email: string;
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

/** Safe in-app path only (blocks open redirects). */
export function sanitizeAppPath(path: string | null | undefined, fallback = '/onboarding'): string {
  if (!path) return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  if (trimmed.startsWith('/auth')) return fallback;
  return trimmed;
}

export function savePostAuthRedirect(path: string) {
  const safe = sanitizeAppPath(path, '');
  if (!safe) return;
  try {
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, safe);
  } catch {
    /* ignore */
  }
}

export function readPostAuthRedirect(): string | null {
  try {
    const raw = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    return raw ? sanitizeAppPath(raw, '') || null : null;
  } catch {
    return null;
  }
}

export function consumePostAuthRedirect(fallback = '/onboarding'): string {
  const path = readPostAuthRedirect() || fallback;
  try {
    sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  } catch {
    /* ignore */
  }
  return sanitizeAppPath(path, fallback);
}

/** Store email only — never persist password in sessionStorage. */
export function savePendingAuth(email: string, _password?: string) {
  sessionStorage.setItem(
    PENDING_AUTH_KEY,
    JSON.stringify({ email: email.trim() } satisfies PendingAuth)
  );
}

export function readPendingAuth(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAuth & { password?: string };
    if (!parsed.email) return null;
    return { email: parsed.email };
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
