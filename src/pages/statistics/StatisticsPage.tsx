import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { 
  BarChart3, 
  GitCompare, 
  Users, 
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Player } from '../players/PlayersPage';
import PlayerRatingChart from '../dashboard/RatingChart';
import FierceRivalry from './components/FierceRivalry';
import TeamSynergy from './components/TeamSynergy';

// Define the types for match history and matches
interface MatchHistoryEntry {
  id: string;
  date: string;
  rating_after: number;
  is_winner: boolean;
  match_id: string;
  rating_before: number;
  rating_change: number;
  score_difference: number;
  matches?: {
    team1_player1: { id: string; name: string };
    team1_player2: { id: string; name: string } | null;
    team2_player1: { id: string; name: string };
    team2_player2: { id: string; name: string } | null;
  };
}

// Add ChartData interface
interface ChartData {
  name: string;
  [key: string]: string | number | undefined;
}

interface DatabaseMatch {
  id: string;
  team1_player1: { id: string; name: string };
  team1_player2: { id: string; name: string } | null;
  team2_player1: { id: string; name: string };
  team2_player2: { id: string; name: string } | null;
  team1_score: number;
  team2_score: number;
  winner: string;
  created_at: string;
}

const StatisticsPage: React.FC = () => {
  // Fetch players data
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) {
        console.error('Error fetching players:', error);
        toast.error('Failed to load players');
        throw error;
      }
      
      return data as Player[];
    }
  });

  // Fetch match history data for rating trends
  const { data: matchHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['match_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_history')
        .select(`
          id,
          date,
          rating_after,
          is_winner,
          match_id,
          rating_before,
          rating_change,
          score_difference,
          matches!match_id(
            team1_player1:team1_player1_id(id, name),
            team1_player2:team1_player2_id(id, name),
            team2_player1:team2_player1_id(id, name),
            team2_player2:team2_player2_id(id, name)
          )
        `)
        .order('date', { ascending: true }) as { data: MatchHistoryEntry[] | null, error: any };
      
      if (error) {
        console.error('Error fetching match history:', error);
        toast.error('Failed to load match history');
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch matches for rivalries and synergies
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      console.log('Fetching matches data...');
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          team1_player1_id,
          team1_player2_id,
          team2_player1_id,
          team2_player2_id,
          team1_score,
          team2_score,
          winner,
          created_at,
          team1_player1:team1_player1_id(id, name),
          team1_player2:team1_player2_id(id, name),
          team2_player1:team2_player1_id(id, name),
          team2_player2:team2_player2_id(id, name)
        `)
        .order('created_at', { ascending: false }) as { data: DatabaseMatch[] | null, error: any };
      
      if (error) {
        console.error('Error fetching matches:', error);
        toast.error('Failed to load matches');
        throw error;
      }

      // Validate the data structure
      const validatedData = (data || []).map(match => {
        // Log any matches with missing player data
        if (!match.team1_player1 || !match.team2_player1) {
          console.log('Match with missing player data:', match.id);
        }
        return match;
      });

      console.log('Matches fetched:', validatedData.length);
      return validatedData;
    }
  });

  // Process match history data to format required by the chart
  const formatRatingChartData = () => {
    if (!matchHistory || matchHistory.length === 0 || !players) return [];

    // Get players ranked 3-8 by rating
    const remainingTopPlayers = players
      .sort((a, b) => b.rating - a.rating)
      .slice(2, 8)  // Skip top 2 players, take next 6
      .map(p => p.name);

    // Initialize ratings map with starting ratings for these players
    const playerRatings: Record<string, number> = {};
    const groupedData: Record<string, Record<string, number>> = {};

    // Sort match history by date
    const sortedHistory = [...matchHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedHistory.forEach(entry => {
      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString();
      
      if (!groupedData[formattedDate]) {
        groupedData[formattedDate] = { ...playerRatings }; // Copy previous ratings
      }
      
      const match = entry.matches;
      if (match) {
        // Check and update ratings for all players in the match
        const allPlayers = [
          { name: match.team1_player1.name, rating: entry.rating_after },
          match.team1_player2 && { name: match.team1_player2.name, rating: entry.rating_after },
          { name: match.team2_player1.name, rating: entry.rating_after },
          match.team2_player2 && { name: match.team2_player2.name, rating: entry.rating_after }
        ].filter(Boolean);

        // Update ratings for players ranked 3-8 if they were in this match
        allPlayers.forEach(player => {
          if (player && remainingTopPlayers.includes(player.name)) {
            playerRatings[player.name] = player.rating;
            groupedData[formattedDate][player.name] = player.rating;
          }
        });
      }
    });

    // Ensure all dates have values for all players by carrying forward previous ratings
    let lastKnownRatings: Record<string, number> = {};
    const result = Object.entries(groupedData).map(([date, ratings]) => {
      const entry: ChartData = { name: date };
      
      remainingTopPlayers.forEach(playerName => {
        if (ratings[playerName] !== undefined) {
          lastKnownRatings[playerName] = ratings[playerName];
        }
        entry[playerName] = lastKnownRatings[playerName];
      });
      
      return entry;
    });

    return result;
  };

  const isLoading = playersLoading || historyLoading || matchesLoading;
  const hasError = matchesError;

  if (isLoading) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Statistics" 
          description="Player and match statistics"
          icon={<BarChart3 size={32} />}
        />
        <div className="text-center py-8">Loading statistics data...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="page-container">
        <PageHeader 
          title="Statistics" 
          description="Player and match statistics"
          icon={<BarChart3 size={32} />}
        />
        <div className="text-center py-8 text-red-500">
          Error loading statistics data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const ratingChartData = formatRatingChartData();

  return (
    <div className="page-container">
      <PageHeader 
        title="Statistics" 
        description="Player and match statistics"
        icon={<BarChart3 size={32} />}
      />
      
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Player Rating Trends</CardTitle>
            <CardDescription>
              Rating progression over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ratingChartData.length > 0 ? (
              <PlayerRatingChart data={ratingChartData} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No match history data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Fierce Rivalries</CardTitle>
              <CardDescription>
                Players with the closest score differences
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FierceRivalry matches={matches || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Team Synergy</CardTitle>
              <CardDescription>
                Most successful player combinations
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <TeamSynergy matches={matches} players={players} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;
