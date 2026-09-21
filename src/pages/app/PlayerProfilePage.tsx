import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import type { Player } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { club } = useClub();

  const { data: player } = useQuery({
    queryKey: ['player', id],
    enabled: !!id && !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id!)
        .eq('club_id', club!.id)
        .single();
      if (error) throw error;
      return data as Player;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ['player-history', id],
    enabled: !!id && !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select('date, rating_after, rating_change, is_winner')
        .eq('player_id', id!)
        .eq('club_id', club!.id)
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  if (!player) {
    return <p className="text-muted-foreground">Loading player…</p>;
  }

  const chartData = history.map((h, i) => ({
    i: i + 1,
    rating: h.rating_after,
    label: new Date(h.date).toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-2">
        <Link to="/app/roster">← Roster</Link>
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">{player.name}</h1>
          <p className="text-muted-foreground">Elo rating · {player.matches_played} matches</p>
        </div>
        <p className="font-display text-5xl font-bold tabular-nums text-court">{player.rating}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-panel p-4">
          <p className="text-xs uppercase text-muted-foreground">Wins</p>
          <p className="font-display text-2xl font-bold">{player.wins}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-xs uppercase text-muted-foreground">Win rate</p>
          <p className="font-display text-2xl font-bold">
            {player.win_rate != null ? `${Math.round(player.win_rate)}%` : '—'}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-xs uppercase text-muted-foreground">Streak</p>
          <p className="font-display text-2xl font-bold">{player.streak_count || 0}</p>
        </div>
      </div>

      <section className="surface-panel p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Rating history</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rated matches yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 12% 86%)" />
                <XAxis dataKey="i" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => [v, 'Rating']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.label || ''
                  }
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="hsl(152 55% 28%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
};

export default PlayerProfilePage;
