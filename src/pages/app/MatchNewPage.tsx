import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Player } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_SCORE = 30;

const ScoreField: React.FC<{
  value: number;
  setValue: (n: number) => void;
  label: string;
}> = ({ value, setValue, label }) => {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const clamp = (n: number) => Math.min(MAX_SCORE, Math.max(0, n));

  const commit = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      setValue(0);
      setText('0');
      return;
    }
    const next = clamp(parseInt(digits, 10));
    setValue(next);
    setText(String(next));
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={() => setValue(clamp(value - 1))}
          aria-label={`Decrease ${label} score`}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={`${label} score`}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '' || /^\d{0,2}$/.test(raw)) {
              setText(raw);
              if (raw !== '') {
                const n = parseInt(raw, 10);
                if (!Number.isNaN(n) && n <= MAX_SCORE) setValue(n);
              }
            }
          }}
          onBlur={() => commit(text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(text);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={cn(
            'font-display h-14 w-16 rounded-md border border-input bg-background',
            'text-center text-4xl font-bold tabular-nums text-ink',
            'outline-none transition-[border-color,box-shadow] duration-300',
            'focus-visible:border-court focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          onClick={() => setValue(clamp(value + 1))}
          aria-label={`Increase ${label} score`}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const MatchNewPage: React.FC = () => {
  const { club } = useClub();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [t1p1, setT1p1] = useState('');
  const [t1p2, setT1p2] = useState('');
  const [t2p1, setT2p1] = useState('');
  const [t2p2, setT2p2] = useState('');
  const [s1, setS1] = useState(21);
  const [s2, setS2] = useState(0);
  const [doubles, setDoubles] = useState(true);
  const [deltas, setDeltas] = useState<{ name: string; change: number }[] | null>(null);

  const { data: players = [] } = useQuery({
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

  const playerMap = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  const logMutation = useMutation({
    mutationFn: async () => {
      if (!club) throw new Error('No club');
      if (!t1p1 || !t2p1) throw new Error('Select players for both sides');
      if (s1 === s2) throw new Error('Ties are not allowed');

      const { data, error } = await supabase.rpc('log_match', {
        p_club_id: club.id,
        p_team1_player1_id: t1p1,
        p_team1_player2_id: doubles && t1p2 ? t1p2 : null,
        p_team2_player1_id: t2p1,
        p_team2_player2_id: doubles && t2p2 ? t2p2 : null,
        p_team1_score: s1,
        p_team2_score: s2,
        p_played_at: new Date().toISOString(),
      });
      if (error) throw error;
      return data as { match_id: string; events: { player_id: string; rating_change: number }[] };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      const events = (data?.events || []).map((e) => ({
        name: playerMap[e.player_id]?.name || 'Player',
        change: e.rating_change,
      }));
      setDeltas(events);
      toast.success('Match logged — ratings updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const PlayerSelect = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Select player" />
        </SelectTrigger>
        <SelectContent>
          {players.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name} ({p.rating})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (deltas) {
    return (
      <div className="mx-auto max-w-md space-y-6 animate-rating-pop">
        <h1 className="font-display text-3xl font-bold text-ink">Ratings updated</h1>
        <ul className="surface-panel divide-y divide-border">
          {deltas.map((d) => (
            <li key={d.name} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{d.name}</span>
              <span
                className={
                  d.change >= 0
                    ? 'font-display font-bold text-court'
                    : 'font-display font-bold text-destructive'
                }
              >
                {d.change >= 0 ? '+' : ''}
                {d.change}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setDeltas(null)}>
            Log another
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/app/ladder')}>
            View ladder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Log match</h1>
          <p className="text-muted-foreground">Server-side Elo update (K=32).</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setDoubles((d) => !d)}
        >
          {doubles ? 'Doubles' : 'Singles'}
        </Button>
      </div>

      <div className="surface-panel space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <PlayerSelect label="Team A — Player 1" value={t1p1} onChange={setT1p1} />
          {doubles && (
            <PlayerSelect label="Team A — Player 2" value={t1p2} onChange={setT1p2} />
          )}
          <PlayerSelect label="Team B — Player 1" value={t2p1} onChange={setT2p1} />
          {doubles && (
            <PlayerSelect label="Team B — Player 2" value={t2p2} onChange={setT2p2} />
          )}
        </div>

        <div className="flex items-center justify-around py-4">
          <ScoreField value={s1} setValue={setS1} label="Team A" />
          <span className="font-display text-2xl text-muted-foreground">–</span>
          <ScoreField value={s2} setValue={setS2} label="Team B" />
        </div>

        <Button
          className="h-12 w-full text-base"
          disabled={logMutation.isPending}
          onClick={() => logMutation.mutate()}
        >
          {logMutation.isPending ? 'Saving…' : 'Confirm result'}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link to="/app/matches">Cancel</Link>
        </Button>
      </div>
    </div>
  );
};

export default MatchNewPage;
