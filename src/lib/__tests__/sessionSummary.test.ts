import { describe, expect, it } from "vitest";
import { buildSessionSummary } from "../sessionSummary";

describe("buildSessionSummary", () => {
  it("returns empty movers when history is empty", () => {
    const summary = buildSessionSummary({
      startedAt: "2026-01-01T12:00:00Z",
      attendeeCount: 4,
      matchCount: 0,
      history: [],
    });
    expect(summary.movers).toEqual([]);
    expect(summary.startedAt).toBe("2026-01-01T12:00:00Z");
    expect(summary.attendeeCount).toBe(4);
    expect(summary.matchCount).toBe(0);
  });

  it("sorts movers by netChange descending", () => {
    const summary = buildSessionSummary({
      startedAt: "2026-01-01T12:00:00Z",
      attendeeCount: 3,
      matchCount: 3,
      history: [
        {
          player_id: "p-low",
          rating_change: 5,
          is_winner: true,
          players: { name: "Low" },
        },
        {
          player_id: "p-high",
          rating_change: 20,
          is_winner: true,
          players: { name: "High" },
        },
        {
          player_id: "p-mid",
          rating_change: 10,
          is_winner: false,
          players: { name: "Mid" },
        },
      ],
    });
    expect(summary.movers.map((m) => m.playerId)).toEqual([
      "p-high",
      "p-mid",
      "p-low",
    ]);
    expect(summary.movers[0].netChange).toBe(20);
  });

  it("aggregates multiple rows per player and skips missing player_id", () => {
    const summary = buildSessionSummary({
      startedAt: "2026-01-02T00:00:00Z",
      attendeeCount: 2,
      matchCount: 2,
      history: [
        {
          player_id: "p1",
          rating_change: 8,
          is_winner: true,
          players: { name: "Alice" },
        },
        {
          player_id: "p1",
          rating_change: 2.4,
          is_winner: false,
          players: { name: "Alice Updated" },
        },
        {
          player_id: null,
          rating_change: 100,
          is_winner: true,
        },
      ],
    });
    expect(summary.movers).toHaveLength(1);
    expect(summary.movers[0]).toMatchObject({
      playerId: "p1",
      name: "Alice Updated",
      netChange: 10,
      matches: 2,
      wins: 1,
    });
  });

  it("uses default name when player name is missing", () => {
    const summary = buildSessionSummary({
      startedAt: "2026-01-03T00:00:00Z",
      attendeeCount: 1,
      matchCount: 1,
      history: [
        {
          player_id: "anon",
          rating_change: -3,
          is_winner: false,
          players: null,
        },
      ],
    });
    expect(summary.movers[0].name).toBe("Player");
    expect(summary.movers[0].netChange).toBe(-3);
  });
});
