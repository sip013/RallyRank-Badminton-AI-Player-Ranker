import type { Player } from "@/integrations/supabase/types";
import { describe, expect, it } from "vitest";
import { balanceTeams, teamRating, winChance } from "../teamBalance";

function player(id: string, rating: number, name = id, doubles = rating): Player {
  return {
    id,
    name,
    rating,
    doubles_rating: doubles,
    doubles_matches_played: 0,
    doubles_wins: 0,
    doubles_streak_count: 0,
    matches_played: 0,
    wins: 0,
    age: null,
    created_at: null,
    club_id: null,
    season_id: null,
    last_played_at: null,
    position: null,
    streak_count: null,
    updated_at: null,
    user_id: null,
    win_rate: null,
    is_guest: false,
    archived_at: null,
  };
}

describe("balanceTeams", () => {
  it("splits an even player count by rating (snake by index)", () => {
    const players = [
      player("a", 100),
      player("b", 90),
      player("c", 80),
      player("d", 70),
    ];
    const { teamA, teamB } = balanceTeams(players);
    expect(teamA.map((p) => p.id)).toEqual(["a", "c"]);
    expect(teamB.map((p) => p.id)).toEqual(["b", "d"]);
    expect(teamA).toHaveLength(2);
    expect(teamB).toHaveLength(2);
  });

  it("gives team A one extra player when count is odd", () => {
    const players = [player("a", 100), player("b", 90), player("c", 80)];
    const { teamA, teamB } = balanceTeams(players);
    expect(teamA.map((p) => p.id)).toEqual(["a", "c"]);
    expect(teamB.map((p) => p.id)).toEqual(["b"]);
    expect(teamA).toHaveLength(2);
    expect(teamB).toHaveLength(1);
  });

  it("returns empty teams for no players", () => {
    const { teamA, teamB } = balanceTeams([]);
    expect(teamA).toEqual([]);
    expect(teamB).toEqual([]);
  });
});

describe("teamRating", () => {
  it("returns 0 for an empty roster", () => {
    expect(teamRating([])).toBe(0);
  });

  it("returns the rounded average rating", () => {
    expect(teamRating([player("a", 100), player("b", 101)])).toBe(101);
    expect(teamRating([player("a", 100), player("b", 99)])).toBe(100);
  });

  it("prefers doubles_rating over singles rating", () => {
    expect(teamRating([player("a", 900, "a", 1100), player("b", 900, "b", 1300)])).toBe(1200);
  });
});

describe("winChance", () => {
  it("returns 50 when both ratings sum to zero", () => {
    expect(winChance(0, 0)).toBe(50);
  });

  it("returns rounded percentage for team A", () => {
    expect(winChance(75, 25)).toBe(75);
    expect(winChance(1, 2)).toBe(33);
  });
});
