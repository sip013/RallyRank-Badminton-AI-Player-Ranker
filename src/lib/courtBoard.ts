export type CourtSlot = {
  teamA: string[];
  teamB: string[];
  status: 'playing' | 'open';
};

export function emptyCourts(count: number): CourtSlot[] {
  return Array.from({ length: Math.max(1, count) }, () => ({
    teamA: [],
    teamB: [],
    status: 'open' as const,
  }));
}

export function playersOnCourts(courts: CourtSlot[]): Set<string> {
  const ids = new Set<string>();
  for (const c of courts) {
    for (const id of [...c.teamA, ...c.teamB]) ids.add(id);
  }
  return ids;
}

export function waitingPlayerIds(attendeeIds: string[], courts: CourtSlot[]): string[] {
  const onCourt = playersOnCourts(courts);
  return attendeeIds.filter((id) => !onCourt.has(id));
}

/** Normalize courts JSON from DB into CourtSlot[]. */
export function parseCourts(raw: unknown, courtCount: number): CourtSlot[] {
  const base = emptyCourts(courtCount);
  if (!Array.isArray(raw)) return base;
  return base.map((slot, i) => {
    const row = raw[i] as Record<string, unknown> | undefined;
    if (!row) return slot;
    const teamA = Array.isArray(row.team_a_ids)
      ? (row.team_a_ids as string[])
      : Array.isArray(row.teamA)
        ? (row.teamA as string[])
        : [];
    const teamB = Array.isArray(row.team_b_ids)
      ? (row.team_b_ids as string[])
      : Array.isArray(row.teamB)
        ? (row.teamB as string[])
        : [];
    const status = row.status === 'playing' ? 'playing' : teamA.length || teamB.length ? 'playing' : 'open';
    return { teamA, teamB, status };
  });
}

export function serializeCourts(courts: CourtSlot[]) {
  return courts.map((c) => ({
    team_a_ids: c.teamA,
    team_b_ids: c.teamB,
    status: c.status,
  }));
}
