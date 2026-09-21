import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BrandMark from '@/components/BrandMark';

type PublicLadder = {
  club: { id: string; name: string };
  players: {
    id: string;
    name: string;
    rating: number;
    matches_played: number;
    wins: number;
    win_rate: number | null;
    streak_count: number | null;
  }[];
};

const PublicLadderPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-ladder', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_ladder', {
        p_share_token: token!,
      });
      if (error) throw error;
      return data as PublicLadder;
    },
  });

  return (
    <div className="court-lines min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="group flex items-center gap-2">
          <BrandMark mood="ladder" className="h-8 w-8" />
          <span className="font-display text-lg font-bold">RallyRank</span>
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-16">
        {isLoading && <p className="text-muted-foreground">Loading ladder…</p>}
        {error && (
          <p className="text-destructive">This ladder link is invalid or expired.</p>
        )}
        {data && (
          <>
            <p className="text-sm font-medium uppercase tracking-wide text-court">Public ladder</p>
            <h1 className="font-display text-3xl font-bold text-ink">{data.club.name}</h1>
            <p className="mb-6 text-muted-foreground">Read-only Elo rankings</p>
            <div className="surface-panel overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data.players || []).map((p, i) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-display font-bold tabular-nums">
                        {p.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PublicLadderPage;
