import React from 'react';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Match {
  id: string;
  created_at: string;
  team1_player1: { id: string; name: string };
  team1_player2: { id: string; name: string } | null;
  team2_player1: { id: string; name: string };
  team2_player2: { id: string; name: string } | null;
  team1_score: number;
  team2_score: number;
  winner: string;
}

interface RecentMatchesProps {
  matches: Match[];
}

const RecentMatches: React.FC<RecentMatchesProps> = ({ matches }) => {
  return (
    <div className="space-y-4">
      {matches.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No matches have been recorded yet.
        </div>
      ) : (
        matches.map((match) => (
          <div 
            key={match.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                {format(new Date(match.created_at), 'MMM d, yyyy')}
              </div>
              <Badge variant={match.winner === 'team1' ? 'default' : 'secondary'}>
                {match.winner === 'team1' ? 'Team 1' : 'Team 2'} Won
              </Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="col-span-2">
                <h3 className="font-medium text-primary">Team 1</h3>
                <div className="mt-1 space-y-1">
                  <div className="text-sm">{match.team1_player1.name}</div>
                  {match.team1_player2 && (
                    <div className="text-sm">{match.team1_player2.name}</div>
                  )}
                </div>
                {match.winner === 'team1' && (
                  <Trophy className="h-5 w-5 text-yellow-500 mt-2" />
                )}
              </div>
              
              <div className="col-span-1 text-center">
                <div className="text-2xl font-bold">
                  {match.team1_score} - {match.team2_score}
                </div>
              </div>
              
              <div className="col-span-2">
                <h3 className="font-medium text-secondary">Team 2</h3>
                <div className="mt-1 space-y-1">
                  <div className="text-sm">{match.team2_player1.name}</div>
                  {match.team2_player2 && (
                    <div className="text-sm">{match.team2_player2.name}</div>
                  )}
                </div>
                {match.winner === 'team2' && (
                  <Trophy className="h-5 w-5 text-yellow-500 mt-2" />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentMatches;
