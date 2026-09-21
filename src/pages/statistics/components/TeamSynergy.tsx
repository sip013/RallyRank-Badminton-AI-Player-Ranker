import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Award } from 'lucide-react';
import { Player } from '../../players/PlayersPage';

interface Match {
  id: string;
  team1_player1: { id: string; name: string };
  team1_player2: { id: string; name: string } | null;
  team2_player1: { id: string; name: string };
  team2_player2: { id: string; name: string } | null;
  team1_score: number;
  team2_score: number;
  winner: string;
}

interface TeamSynergyProps {
  matches: Match[];
  players?: Player[];
}

const TeamSynergy: React.FC<TeamSynergyProps> = ({ matches, players }) => {
  const teamSynergies = useMemo(() => {
    if (!matches || matches.length === 0) return [];

    // Map to store team synergies
    const synergyMap = new Map<string, {
      player1: { id: string; name: string };
      player2: { id: string; name: string };
      matchesPlayed: number;
      matchesWon: number;
      winRate: number;
      totalScoreDiff: number;
      avgScoreDiff: number;
      synergyScore: number;
    }>();

    // Process all matches
    matches.forEach(match => {
      // Process team 1
      if (match.team1_player1 && match.team1_player2) {
        // Create unique key for this team pair (sort by ID to ensure consistency)
        const pairKey = [match.team1_player1.id, match.team1_player2.id].sort().join('-');
        
        // Get existing team data or create new one
        const existing = synergyMap.get(pairKey) || {
          player1: match.team1_player1.id < match.team1_player2.id 
            ? match.team1_player1 
            : match.team1_player2,
          player2: match.team1_player1.id < match.team1_player2.id 
            ? match.team1_player2 
            : match.team1_player1,
          matchesPlayed: 0,
          matchesWon: 0,
          winRate: 0,
          totalScoreDiff: 0,
          avgScoreDiff: 0,
          synergyScore: 0
        };
        
        // Update stats
        existing.matchesPlayed += 1;
        if (match.winner === 'team1') {
          existing.matchesWon += 1;
        }
        existing.winRate = existing.matchesWon / existing.matchesPlayed;
        
        // Calculate score difference
        const scoreDiff = match.team1_score - match.team2_score;
        existing.totalScoreDiff += scoreDiff;
        existing.avgScoreDiff = existing.totalScoreDiff / existing.matchesPlayed;
        
        // Calculate synergy score (weighted combination of win rate and score difference)
        // More matches = more weight to the score
        const matchWeight = Math.min(existing.matchesPlayed / 10, 1); // Cap at 10 matches
        existing.synergyScore = (existing.winRate * 0.7 + (existing.avgScoreDiff / 10) * 0.3) * matchWeight;
        
        synergyMap.set(pairKey, existing);
      }
      
      // Process team 2
      if (match.team2_player1 && match.team2_player2) {
        // Create unique key for this team pair (sort by ID to ensure consistency)
        const pairKey = [match.team2_player1.id, match.team2_player2.id].sort().join('-');
        
        // Get existing team data or create new one
        const existing = synergyMap.get(pairKey) || {
          player1: match.team2_player1.id < match.team2_player2.id 
            ? match.team2_player1 
            : match.team2_player2,
          player2: match.team2_player1.id < match.team2_player2.id 
            ? match.team2_player2 
            : match.team2_player1,
          matchesPlayed: 0,
          matchesWon: 0,
          winRate: 0,
          totalScoreDiff: 0,
          avgScoreDiff: 0,
          synergyScore: 0
        };
        
        // Update stats
        existing.matchesPlayed += 1;
        if (match.winner === 'team2') {
          existing.matchesWon += 1;
        }
        existing.winRate = existing.matchesWon / existing.matchesPlayed;
        
        // Calculate score difference
        const scoreDiff = match.team2_score - match.team1_score;
        existing.totalScoreDiff += scoreDiff;
        existing.avgScoreDiff = existing.totalScoreDiff / existing.matchesPlayed;
        
        // Calculate synergy score (weighted combination of win rate and score difference)
        // More matches = more weight to the score
        const matchWeight = Math.min(existing.matchesPlayed / 10, 1); // Cap at 10 matches
        existing.synergyScore = (existing.winRate * 0.7 + (existing.avgScoreDiff / 10) * 0.3) * matchWeight;
        
        synergyMap.set(pairKey, existing);
      }
    });

    // Convert to array and sort by synergy score
    return Array.from(synergyMap.values())
      .filter(team => team.matchesPlayed >= 3) // Only consider teams with at least 3 matches
      .sort((a, b) => {
        // Sort by synergy score (descending)
        return b.synergyScore - a.synergyScore;
      })
      .slice(0, 2); // Get top 2 teams
  }, [matches]);

  if (teamSynergies.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Not enough matches to determine team synergies yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          <TableHead>Matches</TableHead>
          <TableHead>Wins</TableHead>
          <TableHead>Win Rate</TableHead>
          <TableHead>Avg Score Diff</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamSynergies.map((team) => (
          <TableRow key={`${team.player1.id}-${team.player2.id}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>
                  {team.player1.name} & {team.player2.name}
                </span>
              </div>
            </TableCell>
            <TableCell>{team.matchesPlayed}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                {team.matchesWon}
                <Award className="h-3 w-3 text-yellow-500" />
              </div>
            </TableCell>
            <TableCell>
              {(team.winRate * 100).toFixed(0)}%
            </TableCell>
            <TableCell>
              {team.avgScoreDiff.toFixed(1)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeamSynergy;
