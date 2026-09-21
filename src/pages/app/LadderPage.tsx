import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import type { Player } from '@/integrations/supabase/types';
import EmptyState from '@/components/ui/EmptyState';

type PairStats = { a: string; b: string; aName: string; bName: string; matches: number; score: number };

const LadderPage: React.FC = () => {
  const { club, season } = useClub();

  const { data: players = [] } = useQuery({
    queryKey: ['players', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', club!.id)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data as Player[];
    },
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches-all', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('club_id', club!.id);
      if (error) throw error;
      return data || [];
    },
  });

  const nameById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p.name])),
    [players]
  );

  const rivalries = useMemo(() => {
    const map = new Map<string, { matches: number; diffSum: number; a: string; b: string }>();
    for (const m of matches) {
      if (m.team1_player2_id || m.team2_player2_id) continue;
      const a = m.team1_player1_id;
      const b = m.team2_player1_id;
      const key = [a, b].sort().join(':');
      const prev = map.get(key) || { matches: 0, diffSum: 0, a, b };
      prev.matches += 1;
      prev.diffSum += Math.abs(m.team1_score - m.team2_score);
      map.set(key, prev);
    }
    return [...map.values()]
      .filter((x) => x.matches >= 2)
      .map(
        (x): PairStats => ({
          a: x.a,
          b: x.b,
          aName: nameById[x.a] || '?',
          bName: nameById[x.b] || '?',
          matches: x.matches,
          score: x.diffSum / x.matches,
        })
      )
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [matches, nameById]);

  const synergies = useMemo(() => {
    const map = new Map<string, { matches: number; wins: number; a: string; b: string }>();
    for (const m of matches) {
      const pairs: { a: string; b: string; won: boolean }[] = [];
      if (m.team1_player2_id) {
        pairs.push({
          a: m.team1_player1_id,
          b: m.team1_player2_id,
          won: m.winner === 'team1',
        });
      }
      if (m.team2_player2_id) {
        pairs.push({
          a: m.team2_player1_id,
          b: m.team2_player2_id,
          won: m.winner === 'team2',
        });
      }
      for (const pair of pairs) {
        const key = [pair.a, pair.b].sort().join(':');
        const prev = map.get(key) || { matches: 0, wins: 0, a: pair.a, b: pair.b };
        prev.matches += 1;
        if (pair.won) prev.wins += 1;
        map.set(key, prev);
      }
    }
    return [...map.values()]
      .filter((x) => x.matches >= 3)
      .map(
        (x): PairStats => ({
          a: x.a,
          b: x.b,
          aName: nameById[x.a] || '?',
          bName: nameById[x.b] || '?',
          matches: x.matches,
          score: x.wins / x.matches,
        })
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [matches, nameById]);

  if (players.length === 0) {
    return (
      <EmptyState
        title="Ladder is empty"
        description="Add players and log matches to build your Elo ladder."
        actionLabel="Go to roster"
        actionTo="/app/roster"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-court">
          {season?.name || 'Season'} · Elo
        </p>
        <h1 className="font-display text-3xl font-bold text-ink">Ladder</h1>
        <p className="text-muted-foreground">Trusted club rankings from server-side Elo.</p>
      </div>

      <div className="surface-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Rating</th>
              <th className="hidden px-4 py-3 sm:table-cell">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map((p, i) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link to={`/app/roster/${p.id}`} className="font-medium hover:text-court">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-display text-lg font-bold tabular-nums">
                  {p.rating}
                </td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                  {p.wins}–{Math.max(0, p.matches_played - p.wins)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="surface-panel p-5">
          <h2 className="font-display text-lg font-bold">Fierce rivalries</h2>
          <p className="mb-3 text-xs text-muted-foreground">Closest singles H2H (min 2 matches)</p>
          {rivalries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough singles data yet.</p>
          ) : (
            <ul className="space-y-2">
              {rivalries.map((r) => (
                <li key={`${r.a}-${r.b}`} className="flex justify-between text-sm">
                  <span>
                    {r.aName} vs {r.bName}
                  </span>
                  <span className="text-muted-foreground">
                    avg diff {r.score.toFixed(1)} · {r.matches}g
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="surface-panel p-5">
          <h2 className="font-display text-lg font-bold">Team synergy</h2>
          <p className="mb-3 text-xs text-muted-foreground">Best doubles partnerships (min 3)</p>
          {synergies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not enough doubles data yet.</p>
          ) : (
            <ul className="space-y-2">
              {synergies.map((r) => (
                <li key={`${r.a}-${r.b}`} className="flex justify-between text-sm">
                  <span>
                    {r.aName} & {r.bName}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(r.score * 100)}% · {r.matches}g
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default LadderPage;
