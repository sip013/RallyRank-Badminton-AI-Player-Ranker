import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import type { Player } from '@/integrations/supabase/types';
import EmptyState from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buildHeadToHeads, formBadgeClass, playerForm } from '@/lib/ladderStats';
import { cn } from '@/lib/utils';

type LadderFormat = 'doubles' | 'singles';
type PairStats = { a: string; b: string; aName: string; bName: string; matches: number; score: number };

const LadderPage: React.FC = () => {
  const { club, season } = useClub();
  const [format, setFormat] = useState<LadderFormat>('doubles');

  const { data: players = [] } = useQuery({
    queryKey: ['players', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', club!.id)
        .is('archived_at', null)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data as Player[];
    },
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches', 'all', club?.id, season?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      let q = supabase
        .from('matches')
        .select(
          'id, created_at, season_id, winner, team1_score, team2_score, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id'
        )
        .eq('club_id', club!.id)
        .order('created_at', { ascending: false })
        .limit(500);
      if (season?.id) q = q.eq('season_id', season.id);
      const { data, error } = await q;
      if (error) throw error;
      // playerForm expects chronological ASC (oldest → newest)
      return [...(data || [])].reverse();
    },
  });

  const { data: pairRatings = [] } = useQuery({
    queryKey: ['pair-ratings', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pair_ratings')
        .select('*')
        .eq('club_id', club!.id)
        .order('rating', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  const nameById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p.name])),
    [players]
  );

  const formById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of players) {
      map[p.id] = playerForm(matches, p.id, 5, format);
    }
    return map;
  }, [players, matches, format]);

  const headToHeads = useMemo(
    () => buildHeadToHeads(matches, nameById, 2).slice(0, 8),
    [matches, nameById]
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

  const partnerships = useMemo(() => {
    return pairRatings
      .filter((p) => p.matches_played >= 2)
      .map((p) => {
        const losses = Math.max(0, p.matches_played - p.wins);
        return {
          id: p.id,
          a: p.player_low_id,
          b: p.player_high_id,
          aName: nameById[p.player_low_id] || '?',
          bName: nameById[p.player_high_id] || '?',
          rating: p.rating,
          wins: p.wins,
          losses,
          matches: p.matches_played,
        };
      });
  }, [pairRatings, nameById]);

  const ladderPlayers = useMemo(() => {
    const list = players.filter((p) => !p.is_guest);
    return [...list].sort((a, b) => {
      if (format === 'doubles') {
        return (b.doubles_rating ?? 0) - (a.doubles_rating ?? 0);
      }
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [players, format]);

  if (ladderPlayers.length === 0) {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-court">
            {season?.name || 'Season'} · Singles & Doubles Elo
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">Ladder</h1>
          <p className="text-muted-foreground">
            Separate ratings for doubles club nights and singles play.
          </p>
        </div>
        <Tabs
          value={format}
          onValueChange={(v) => setFormat(v as LadderFormat)}
          className="w-fit"
        >
          <TabsList>
            <TabsTrigger value="doubles" className="px-4">
              Doubles
            </TabsTrigger>
            <TabsTrigger value="singles" className="px-4">
              Singles
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="surface-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">
                {format === 'doubles' ? 'Doubles' : 'Singles'} rating
              </th>
              <th className="hidden px-4 py-3 sm:table-cell">Record</th>
              <th className="hidden px-4 py-3 md:table-cell">Form</th>
              <th className="hidden px-4 py-3 lg:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ladderPlayers.map((p, i) => {
              const form = formById[p.id] || '';
              const rating = format === 'doubles' ? p.doubles_rating : p.rating;
              const wins = format === 'doubles' ? p.doubles_wins : p.wins;
              const played =
                format === 'doubles' ? p.doubles_matches_played : p.matches_played;
              const streak =
                format === 'doubles' ? p.doubles_streak_count : p.streak_count;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/app/roster/${p.id}`} className="font-medium hover:text-court">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-display text-lg font-bold tabular-nums">
                    {rating}
                  </td>
                  <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                    {wins}–{Math.max(0, played - wins)}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {form ? (
                      <span className="inline-flex gap-0.5">
                        {[...form].map((ch, idx) => (
                          <span
                            key={`${p.id}-${idx}`}
                            className={cn(
                              'inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold',
                              formBadgeClass(ch)
                            )}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 tabular-nums lg:table-cell">
                    {streak ? `${streak}W` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">Partnership ladder</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Pair Elo for doubles partnerships (min 2 matches)
        </p>
        {partnerships.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough partnership data yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {partnerships.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span>
                  <Link to={`/app/roster/${r.a}`} className="font-medium hover:text-court">
                    {r.aName}
                  </Link>
                  <span className="text-muted-foreground"> & </span>
                  <Link to={`/app/roster/${r.b}`} className="font-medium hover:text-court">
                    {r.bName}
                  </Link>
                </span>
                <span className="flex items-baseline gap-3 tabular-nums">
                  <span className="font-display text-base font-bold">{r.rating}</span>
                  <span className="text-muted-foreground">
                    {r.wins}–{r.losses}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-panel p-5">
        <h2 className="font-display text-lg font-bold">Head-to-head</h2>
        <p className="mb-3 text-xs text-muted-foreground">Singles records this season (min 2)</p>
        {headToHeads.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough singles H2H data yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {headToHeads.map((h) => (
              <li key={`${h.a}-${h.b}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>
                  <Link to={`/app/roster/${h.a}`} className="font-medium hover:text-court">
                    {h.aName}
                  </Link>
                  <span className="text-muted-foreground"> vs </span>
                  <Link to={`/app/roster/${h.b}`} className="font-medium hover:text-court">
                    {h.bName}
                  </Link>
                </span>
                <span className="font-display font-bold tabular-nums">
                  {h.aWins}–{h.bWins}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  );
};

export default LadderPage;
