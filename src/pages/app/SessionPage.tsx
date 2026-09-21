import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from '@/components/ui/EmptyState';
import type { Player } from '@/integrations/supabase/types';
import { balanceTeams, teamRating, winChance } from '@/lib/teamBalance';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'rallyrank.sessionAttendees';

const SessionPage: React.FC = () => {
  const { club } = useClub();
  const [selected, setSelected] = useState<string[]>([]);
  const [courtCount, setCourtCount] = useState(1);
  const [balanced, setBalanced] = useState<{ teamA: Player[]; teamB: Player[] } | null>(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', club!.id)
        .order('name');
      if (error) throw error;
      return data as Player[];
    },
  });

  useEffect(() => {
    if (!club?.id) return;
    const raw = localStorage.getItem(`${SESSION_KEY}.${club.id}`);
    if (raw) {
      try {
        setSelected(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, [club?.id]);

  useEffect(() => {
    if (!club?.id) return;
    localStorage.setItem(`${SESSION_KEY}.${club.id}`, JSON.stringify(selected));
  }, [selected, club?.id]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setBalanced(null);
  };

  const attendees = useMemo(
    () => players.filter((p) => selected.includes(p.id)),
    [players, selected]
  );

  const runBalance = () => {
    if (attendees.length < 2) return;
    setBalanced(balanceTeams(attendees));
  };

  if (!isLoading && players.length === 0) {
    return (
      <EmptyState
        title="No players yet"
        description="Add players to the roster before balancing a session."
        actionLabel="Add players"
        actionTo="/app/roster"
      />
    );
  }

  const ratingA = balanced ? teamRating(balanced.teamA) : 0;
  const ratingB = balanced ? teamRating(balanced.teamB) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Session</h1>
        <p className="text-muted-foreground">Select who’s here, then generate fair teams.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="court-count" className="text-sm font-medium">
            Courts
          </label>
          <Select
            value={String(courtCount)}
            onValueChange={(v) => setCourtCount(Number(v))}
          >
            <SelectTrigger id="court-count" className="h-11 w-[5.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={runBalance} disabled={attendees.length < 2} className="h-11">
          Balance teams ({attendees.length})
        </Button>
        <Button asChild variant="outline" className="h-11" disabled={!balanced}>
          <Link to="/app/matches/new">Log a match</Link>
        </Button>
      </div>

      <section className="surface-panel p-4">
        <h2 className="mb-3 font-display text-lg font-bold">Attendance</h2>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  'touch-target rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  on
                    ? 'border-court bg-court text-white'
                    : 'border-border bg-background text-foreground hover:border-court/50'
                )}
              >
                {p.name}
                <span className="ml-2 opacity-70">{p.rating}</span>
              </button>
            );
          })}
        </div>
      </section>

      {balanced && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: 'Team A', players: balanced.teamA, rating: ratingA, chance: winChance(ratingA, ratingB) },
            { label: 'Team B', players: balanced.teamB, rating: ratingB, chance: winChance(ratingB, ratingA) },
          ].map((team, idx) => (
            <div
              key={team.label}
              className="surface-panel animate-stagger-in p-5"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-xl font-bold">{team.label}</h3>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular-nums">{team.rating}</p>
                  <p className="text-xs text-muted-foreground">{team.chance}% win chance</p>
                </div>
              </div>
              <ul className="space-y-2">
                {team.players.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="tabular-nums text-muted-foreground">{p.rating}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {courtCount > 1 && balanced && (
        <p className="text-sm text-muted-foreground">
          Tip: rotate by rebalancing after each court finishes. {courtCount} courts selected.
        </p>
      )}
    </div>
  );
};

export default SessionPage;
