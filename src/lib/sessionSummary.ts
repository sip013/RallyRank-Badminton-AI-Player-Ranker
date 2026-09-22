export type SessionMover = {
  playerId: string;
  name: string;
  netChange: number;
  matches: number;
  wins: number;
};

export type SessionSummary = {
  startedAt: string;
  attendeeCount: number;
  matchCount: number;
  movers: SessionMover[];
};

type HistoryRow = {
  player_id: string | null;
  rating_change: number;
  is_winner: boolean;
  players?: { name?: string | null } | null;
};

/** Aggregate match_history rows into net rating movers for a session window. */
export function buildSessionSummary(input: {
  startedAt: string;
  attendeeCount: number;
  matchCount: number;
  history: HistoryRow[];
}): SessionSummary {
  const byPlayer = new Map<
    string,
    { name: string; netChange: number; matches: number; wins: number }
  >();

  for (const row of input.history) {
    if (!row.player_id) continue;
    const prev = byPlayer.get(row.player_id) || {
      name: row.players?.name || 'Player',
      netChange: 0,
      matches: 0,
      wins: 0,
    };
    prev.netChange += Number(row.rating_change) || 0;
    prev.matches += 1;
    if (row.is_winner) prev.wins += 1;
    if (row.players?.name) prev.name = row.players.name;
    byPlayer.set(row.player_id, prev);
  }

  const movers = [...byPlayer.entries()]
    .map(([playerId, v]) => ({
      playerId,
      name: v.name,
      netChange: Math.round(v.netChange),
      matches: v.matches,
      wins: v.wins,
    }))
    .sort((a, b) => b.netChange - a.netChange);

  return {
    startedAt: input.startedAt,
    attendeeCount: input.attendeeCount,
    matchCount: input.matchCount,
    movers,
  };
}
