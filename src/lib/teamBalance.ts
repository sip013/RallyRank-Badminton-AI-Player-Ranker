import type { Player } from '@/integrations/supabase/types';

export function balanceTeams(players: Player[]): { teamA: Player[]; teamB: Player[] } {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  sorted.forEach((p, i) => {
    if (i % 2 === 0) teamA.push(p);
    else teamB.push(p);
  });
  return { teamA, teamB };
}

export function teamRating(players: Player[]) {
  if (!players.length) return 0;
  return Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length);
}

export function winChance(a: number, b: number) {
  const total = a + b;
  if (!total) return 50;
  return Math.round((a / total) * 100);
}
