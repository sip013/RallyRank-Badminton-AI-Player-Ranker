import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/EmptyState';
import type { Player } from '@/integrations/supabase/types';
import { ArrowRight, GitCompare, ClipboardList } from 'lucide-react';

const HomePage: React.FC = () => {
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

  const { data: recentMatches = [] } = useQuery({
    queryKey: ['matches-recent', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          id, created_at, team1_score, team2_score, winner,
          team1_player1:players!team1_player1_id(name),
          team2_player1:players!team2_player1_id(name)
        `
        )
        .eq('club_id', club!.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  const movers = [...players]
    .filter((p) => p.matches_played > 0)
    .sort((a, b) => (b.streak_count || 0) - (a.streak_count || 0))
    .slice(0, 3);

  if (!players.length) {
    return (
      <EmptyState
        title="Add your first players"
        description="Build a roster, then start a session to balance fair teams for tonight."
        actionLabel="Go to roster"
        actionTo="/app/roster"
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="home-hero">
        <div className="home-heading">
          <p className="home-heading__line font-display text-sm font-semibold uppercase tracking-[0.14em] text-court">
            {season?.name || 'Current season'}
          </p>
          <h1 className="home-heading__line font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
            {club?.name}
          </h1>
          <p className="home-heading__line font-display text-base font-medium text-muted-foreground">
            Tonight’s focus — balance, play, log.
          </p>
        </div>
        <div className="home-hero__actions">
          <Button asChild size="lg" className="group/btn home-hero__btn">
            <Link to="/app/session">
              <GitCompare className="btn-icon-play btn-icon-play--session mr-2 h-4 w-4" />
              Start session
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="group/btn home-hero__btn">
            <Link to="/app/matches/new">
              <ClipboardList className="btn-icon-play btn-icon-play--match mr-2 h-4 w-4" />
              Log match
            </Link>
          </Button>
        </div>
      </header>

      <section className="surface-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Ladder snapshot</h2>
          <Link to="/app/ladder" className="flex items-center text-sm font-medium text-court">
            Full ladder <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {players.slice(0, 5).map((p, i) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                <Link to={`/app/roster/${p.id}`} className="font-medium hover:text-court">
                  {p.name}
                </Link>
              </div>
              <span className="font-display font-bold tabular-nums">{p.rating}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="surface-panel p-5">
          <h2 className="font-display text-lg font-bold">Recent results</h2>
          {recentMatches.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No matches yet — log your first result.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentMatches.map((m: any) => (
                <li key={m.id}>
                  <Link
                    to={`/app/matches/${m.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:border-court/40"
                  >
                    <span className="text-sm">
                      {m.team1_player1?.name} vs {m.team2_player1?.name}
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {m.team1_score}–{m.team2_score}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-panel p-5">
          <h2 className="font-display text-lg font-bold">Hot streaks</h2>
          {movers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Streaks appear after wins are logged.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {movers.map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <Link to={`/app/roster/${p.id}`} className="font-medium hover:text-court">
                    {p.name}
                  </Link>
                  <span className="rounded-full bg-court/10 px-2 py-0.5 text-xs font-semibold text-court">
                    {p.streak_count} win streak
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

export default HomePage;
