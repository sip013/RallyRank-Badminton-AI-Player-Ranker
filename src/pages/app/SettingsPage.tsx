import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InviteCodeReveal from '@/components/InviteCodeReveal';
import { toast } from 'sonner';
import type { Invite, Membership } from '@/integrations/supabase/types';

type MemberRow = Membership & {
  displayName: string;
  email?: string | null;
};

function profileDisplayName(profile: {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
} | null | undefined): string | null {
  const full = [profile?.first_name, profile?.last_name]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(' ');
  if (full) return full;
  if (profile?.username?.trim()) return profile.username.trim();
  return null;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { club, role, season, refreshClubs } = useClub();
  const queryClient = useQueryClient();
  const [seasonName, setSeasonName] = useState('');
  const [inviteRole, setInviteRole] = useState('coach');
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ code: string; role: string } | null>(
    null
  );

  const { data: members = [] } = useQuery({
    queryKey: ['memberships', club?.id, user?.id],
    enabled: !!club?.id,
    queryFn: async (): Promise<MemberRow[]> => {
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('club_id', club!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const rows = (memberships || []) as Membership[];
      const userIds = [...new Set(rows.map((m) => m.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name')
        .in('id', userIds);
      if (profileError) throw profileError;

      const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      return rows.map((m) => {
        const profile = byId[m.user_id];
        const name = profileDisplayName(profile);
        const isSelf = user?.id === m.user_id;
        return {
          ...m,
          displayName:
            name ||
            (isSelf && user?.email ? user.email : null) ||
            'Unknown member',
          email: isSelf ? user?.email : null,
        };
      });
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('create_invite', {
        p_club_id: club!.id,
        p_role: inviteRole,
      });
      if (error) throw error;
      return data as Invite;
    },
    onSuccess: (invite) => {
      setRevealed({ code: invite.code, role: invite.role });
      setRevealOpen(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startSeason = useMutation({
    mutationFn: async () => {
      if (!confirm('Start a new season? Player ratings will reset to 1000.')) return;
      const { error } = await supabase.rpc('start_season', {
        p_club_id: club!.id,
        p_name: seasonName.trim() || `Season ${new Date().getFullYear()}`,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshClubs();
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('New season started');
      setSeasonName('');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shareUrl =
    typeof window !== 'undefined' && club?.share_token
      ? `${window.location.origin}${import.meta.env.BASE_URL}ladder/${club.share_token}`.replace(
          /([^:]\/)\/+/g,
          '$1'
        )
      : '';

  const copyShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Public ladder link copied');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Settings</h1>
        <p className="text-muted-foreground">Club members, invites, and seasons.</p>
      </div>

      <section className="surface-panel space-y-3 p-5">
        <h2 className="font-display text-lg font-bold">Club</h2>
        <p className="text-sm">
          <span className="text-muted-foreground">Name:</span> {club?.name}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Your role:</span>{' '}
          <span className="capitalize">{role}</span>
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">Active season:</span> {season?.name || '—'}
        </p>
        {shareUrl && (
          <div className="pt-2">
            <Label>Public ladder link</Label>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareUrl} className="h-11 text-xs" />
              <Button type="button" onClick={copyShare}>
                Copy
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="surface-panel space-y-3 p-5">
        <h2 className="font-display text-lg font-bold">Members</h2>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {m.displayName}
                  {user?.id === m.user_id ? (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>
                  ) : null}
                </p>
                {m.email && user?.id === m.user_id ? (
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                ) : null}
              </div>
              <span className="shrink-0 capitalize text-muted-foreground">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {(role === 'owner' || role === 'admin') && (
        <>
          <section className="surface-panel space-y-4 p-5">
            <div>
              <h2 className="font-display text-lg font-bold">Invites</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate a one-time view of the code, copy it, and share it. Codes expire
                after 24 hours and aren’t kept on this page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="h-11 w-[9rem]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => createInvite.mutate()} disabled={createInvite.isPending}>
                {createInvite.isPending ? 'Creating…' : 'Create invite'}
              </Button>
            </div>
          </section>

          <section className="surface-panel space-y-4 p-5">
            <h2 className="font-display text-lg font-bold">New season</h2>
            <p className="text-sm text-muted-foreground">
              Resets ratings to 1000 and starts a fresh ladder. Match history is kept.
            </p>
            <div className="space-y-2">
              <Label htmlFor="season">Season name</Label>
              <Input
                id="season"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="Spring 2026"
                className="h-11"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => startSeason.mutate()}
              disabled={startSeason.isPending}
            >
              Start season
            </Button>
          </section>
        </>
      )}

      <InviteCodeReveal
        code={revealed?.code ?? null}
        role={revealed?.role}
        open={revealOpen}
        onOpenChange={(next) => {
          setRevealOpen(next);
          if (!next) setRevealed(null);
        }}
      />
    </div>
  );
};

export default SettingsPage;
