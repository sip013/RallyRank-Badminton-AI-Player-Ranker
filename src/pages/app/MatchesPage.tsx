import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/EmptyState';

const MatchesPage: React.FC = () => {
  const { club, season } = useClub();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', club?.id, season?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      let q = supabase
        .from('matches')
        .select(
          `
          id, created_at, team1_score, team2_score, winner,
          team1_player1:players!team1_player1_id(id, name),
          team1_player2:players!team1_player2_id(id, name),
          team2_player1:players!team2_player1_id(id, name),
          team2_player2:players!team2_player2_id(id, name)
        `
        )
        .eq('club_id', club!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (season?.id) q = q.eq('season_id', season.id);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Matches</h1>
          <p className="text-muted-foreground">
            {season?.name ? `${season.name} history` : 'Club match history'}
          </p>
        </div>
        <Button asChild className="h-11">
          <Link to="/app/matches/new">Log match</Link>
        </Button>
      </div>

      {!isLoading && matches.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="Log a result after your first game to update the Elo ladder."
          actionLabel="Log match"
          actionTo="/app/matches/new"
        />
      ) : (
        <ul className="space-y-2">
          {matches.map((m: any) => {
            const t1 = [m.team1_player1?.name, m.team1_player2?.name].filter(Boolean).join(' / ');
            const t2 = [m.team2_player1?.name, m.team2_player2?.name].filter(Boolean).join(' / ');
            return (
              <li key={m.id}>
                <Link
                  to={`/app/matches/${m.id}`}
                  className="surface-panel flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:border-court/40"
                >
                  <div>
                    <p className="font-medium">
                      {t1} <span className="text-muted-foreground">vs</span> {t2}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-display text-xl font-bold tabular-nums">
                    {m.team1_score}–{m.team2_score}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MatchesPage;
