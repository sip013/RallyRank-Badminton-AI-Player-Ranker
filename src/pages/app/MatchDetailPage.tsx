import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { club, role } = useClub();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: match } = useQuery({
    queryKey: ['match', id],
    enabled: !!id && !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          *,
          team1_player1:players!team1_player1_id(id, name, rating),
          team1_player2:players!team1_player2_id(id, name, rating),
          team2_player1:players!team2_player1_id(id, name, rating),
          team2_player2:players!team2_player2_id(id, name, rating)
        `
        )
        .eq('id', id!)
        .eq('club_id', club!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['match-events', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select('*, players(name)')
        .eq('match_id', id!);
      if (error) throw error;
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm('Delete this match? Rating history rows will remain unless cleaned separately.')) {
        return;
      }
      const { error } = await supabase.from('matches').delete().eq('id', id!).eq('club_id', club!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast.success('Match deleted');
      navigate('/app/matches');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!match) return <p className="text-muted-foreground">Loading…</p>;

  const t1 = [match.team1_player1, match.team1_player2].filter(Boolean);
  const t2 = [match.team2_player1, match.team2_player2].filter(Boolean);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button asChild variant="ghost" className="-ml-2">
        <Link to="/app/matches">← Matches</Link>
      </Button>

      <div className="surface-panel p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {new Date(match.created_at).toLocaleString()}
        </p>
        <p className="mt-4 font-display text-5xl font-bold tabular-nums">
          {match.team1_score}–{match.team2_score}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Team A</p>
            {t1.map((p: any) => (
              <p key={p.id} className="font-medium">
                {p.name}
              </p>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Team B</p>
            {t2.map((p: any) => (
              <p key={p.id} className="font-medium">
                {p.name}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section className="surface-panel p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Rating events</h2>
        <ul className="divide-y divide-border">
          {events.map((e: any) => (
            <li key={e.id} className="flex justify-between py-2 text-sm">
              <span>{e.players?.name || 'Player'}</span>
              <span className="font-mono">
                {e.rating_before} → {e.rating_after} ({e.rating_change >= 0 ? '+' : ''}
                {e.rating_change})
              </span>
            </li>
          ))}
        </ul>
      </section>

      {(role === 'owner' || role === 'admin') && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          Delete match
        </Button>
      )}
    </div>
  );
};

export default MatchDetailPage;
