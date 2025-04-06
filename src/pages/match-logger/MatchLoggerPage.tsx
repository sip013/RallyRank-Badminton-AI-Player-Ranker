import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { ClipboardList, Trophy } from 'lucide-react';
import { Player } from '../players/PlayersPage';
import MatchForm from './MatchForm';
import RecentMatches from './RecentMatches';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Match = {
  id: string;
  created_at: string;
  team1_player1: { id: string; name: string };
  team1_player2: { id: string; name: string } | null;
  team2_player1: { id: string; name: string };
  team2_player2: { id: string; name: string } | null;
  team1_score: number;
  team2_score: number;
  winner: string;
  matchDate?: string;
};

const MatchLoggerPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch players from Supabase
  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
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

  // Fetch recent matches
  const { data: recentMatches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      // First get the matches with player data
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id, 
          created_at,
          team1_score, 
          team2_score, 
          winner,
          team1_player1:players!team1_player1_id(id, name),
          team1_player2:players!team1_player2_id(id, name),
          team2_player1:players!team2_player1_id(id, name),
          team2_player2:players!team2_player2_id(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        toast.error('Failed to load recent matches');
        throw matchesError;
      }

      return (matchesData || []) as Match[];
    }
  });

  // Mutation for logging matches
  const logMatchMutation = useMutation({
    mutationFn: async (match: {
      team1_player1: Player;
      team1_player2?: Player;
      team2_player1: Player;
      team2_player2?: Player;
      team1_score: number;
      team2_score: number;
      winner: string;
      matchDate?: string;
    }) => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to log matches');
        throw new Error('Authentication required');
      }
      
      // Insert match into database
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          team1_player1_id: match.team1_player1.id,
          team1_player2_id: match.team1_player2?.id || null,
          team2_player1_id: match.team2_player1.id,
          team2_player2_id: match.team2_player2?.id || null,
          team1_score: match.team1_score,
          team2_score: match.team2_score,
          winner: match.winner,
          user_id: session.user.id,
          created_at: match.matchDate ? new Date(match.matchDate).toISOString() : new Date().toISOString()
        })
        .select()
        .single();
      
      if (matchError) {
        console.error('Error creating match:', matchError);
        throw matchError;
      }

      // Calculate new ratings
      const K_FACTOR = 32; // Standard K-factor used in ELO calculations
      
      // Calculate expected scores
      const calculateExpectedScore = (ratingA: number, ratingB: number) => {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
      };

      // Calculate new rating
      const calculateNewRating = (oldRating: number, expectedScore: number, actualScore: number) => {
        return oldRating + K_FACTOR * (actualScore - expectedScore);
      };

      // Get average rating for each team
      const team1Rating = match.team1_player2 
        ? (match.team1_player1.rating + match.team1_player2.rating) / 2 
        : match.team1_player1.rating;

      const team2Rating = match.team2_player2
        ? (match.team2_player1.rating + match.team2_player2.rating) / 2
        : match.team2_player1.rating;

      // Calculate expected scores
      const team1Expected = calculateExpectedScore(team1Rating, team2Rating);
      const team2Expected = calculateExpectedScore(team2Rating, team1Rating);

      // Actual scores (1 for win, 0 for loss)
      const team1Actual = match.winner === 'team1' ? 1 : 0;
      const team2Actual = match.winner === 'team2' ? 1 : 0;

      // Calculate new ratings
      const team1NewRating = Math.round(calculateNewRating(team1Rating, team1Expected, team1Actual));
      const team2NewRating = Math.round(calculateNewRating(team2Rating, team2Expected, team2Actual));

      // Calculate rating changes for each player
      const team1RatingChange = Math.round(team1NewRating - team1Rating);
      const team2RatingChange = Math.round(team2NewRating - team2Rating);

      // Update player ratings and match statistics
      const updatePromises = [];

      // Update team 1 players
      updatePromises.push(
        supabase
          .from('players')
          .update({
            rating: Math.round(match.team1_player1.rating + team1RatingChange),
            matches_played: match.team1_player1.matches_played + 1,
            wins: match.team1_player1.wins + (match.winner === 'team1' ? 1 : 0),
            streak_count: match.winner === 'team1' 
              ? ((match.team1_player1.streak_count || 0) + 1) 
              : 0
          })
          .eq('id', match.team1_player1.id)
      );

      if (match.team1_player2) {
        updatePromises.push(
          supabase
            .from('players')
            .update({
              rating: Math.round(match.team1_player2.rating + team1RatingChange),
              matches_played: match.team1_player2.matches_played + 1,
              wins: match.team1_player2.wins + (match.winner === 'team1' ? 1 : 0),
              streak_count: match.winner === 'team1' 
                ? ((match.team1_player2.streak_count || 0) + 1) 
                : 0
            })
            .eq('id', match.team1_player2.id)
        );
      }

      // Update team 2 players
      updatePromises.push(
        supabase
          .from('players')
          .update({
            rating: Math.round(match.team2_player1.rating + team2RatingChange),
            matches_played: match.team2_player1.matches_played + 1,
            wins: match.team2_player1.wins + (match.winner === 'team2' ? 1 : 0),
            streak_count: match.winner === 'team2' 
              ? ((match.team2_player1.streak_count || 0) + 1) 
              : 0
          })
          .eq('id', match.team2_player1.id)
      );

      if (match.team2_player2) {
        updatePromises.push(
          supabase
            .from('players')
            .update({
              rating: Math.round(match.team2_player2.rating + team2RatingChange),
              matches_played: match.team2_player2.matches_played + 1,
              wins: match.team2_player2.wins + (match.winner === 'team2' ? 1 : 0),
              streak_count: match.winner === 'team2' 
                ? ((match.team2_player2.streak_count || 0) + 1) 
                : 0
            })
            .eq('id', match.team2_player2.id)
        );
      }

      // Add match history entries for all players
      const matchDate = match.matchDate ? new Date(match.matchDate).toISOString() : new Date().toISOString();
      
      // Update last_played_at for all players involved
      updatePromises.push(
        supabase
          .from('players')
          .update({ last_played_at: matchDate })
          .in('id', [
            match.team1_player1.id,
            ...(match.team1_player2 ? [match.team1_player2.id] : []),
            match.team2_player1.id,
            ...(match.team2_player2 ? [match.team2_player2.id] : [])
          ])
      );

      // Create match history entries
      const historyPromises = [
        // Team 1 players
        supabase
          .from('match_history')
          .insert({
            match_id: newMatch.id,
            rating_before: Math.round(match.team1_player1.rating),
            rating_after: Math.round(match.team1_player1.rating + team1RatingChange),
            rating_change: Math.round(team1RatingChange),
            score_difference: match.team1_score - match.team2_score,
            is_winner: match.winner === 'team1',
            date: matchDate,
            created_at: matchDate
          })
      ];

      if (match.team1_player2) {
        historyPromises.push(
          supabase
            .from('match_history')
            .insert({
              match_id: newMatch.id,
              rating_before: Math.round(match.team1_player2.rating),
              rating_after: Math.round(match.team1_player2.rating + team1RatingChange),
              rating_change: Math.round(team1RatingChange),
              score_difference: match.team1_score - match.team2_score,
              is_winner: match.winner === 'team1',
              date: matchDate,
              created_at: matchDate
            })
        );
      }

      // Team 2 players
      historyPromises.push(
        supabase
          .from('match_history')
          .insert({
            match_id: newMatch.id,
            rating_before: Math.round(match.team2_player1.rating),
            rating_after: Math.round(match.team2_player1.rating + team2RatingChange),
            rating_change: Math.round(team2RatingChange),
            score_difference: match.team2_score - match.team1_score,
            is_winner: match.winner === 'team2',
            date: matchDate,
            created_at: matchDate
          })
      );

      if (match.team2_player2) {
        historyPromises.push(
          supabase
            .from('match_history')
            .insert({
              match_id: newMatch.id,
              rating_before: Math.round(match.team2_player2.rating),
              rating_after: Math.round(match.team2_player2.rating + team2RatingChange),
              rating_change: Math.round(team2RatingChange),
              score_difference: match.team2_score - match.team1_score,
              is_winner: match.winner === 'team2',
              date: matchDate,
              created_at: matchDate
            })
        );
      }

      // Execute all updates
      try {
        const results = await Promise.all([...updatePromises, ...historyPromises]);
        const errors = results.filter(r => r.error).map(r => {
          console.error('Detailed error:', r.error);
          return r.error;
        });
        if (errors.length > 0) {
          console.error('Errors updating data:', errors);
          throw new Error(`Failed to update some data: ${errors.map(e => e.message).join(', ')}`);
        }
      } catch (error) {
        console.error('Detailed error updating data:', error);
        throw error;
      }

      return newMatch;
    },
    onSuccess: () => {
      toast.success('Match logged successfully and ratings updated!', {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match_history'] });
    },
    onError: (error) => {
      console.error('Detailed error logging match:', error);
      toast.error(`Failed to log match: ${error.message}`);
    }
  });

  const handleLogMatch = (match: {
    team1_player1: Player;
    team1_player2?: Player;
    team2_player1: Player;
    team2_player2?: Player;
    team1_score: number;
    team2_score: number;
    winner: string;
    matchDate?: string;
  }) => {
    logMatchMutation.mutate(match);
  };

  const isLoading = playersLoading || matchesLoading;
  const error = playersError || matchesError;

  return (
    <div className="page-container">
      <PageHeader 
        title="Match Logger" 
        description="Record match results and update player ratings"
        icon={<ClipboardList size={32} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="match-card">
            <h2 className="text-xl font-semibold mb-4">Log New Match</h2>
            {isLoading ? (
              <div className="text-center py-8">Loading players...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading data. Please refresh the page.
              </div>
            ) : (
              <MatchForm 
                players={players || []} 
                onLogMatch={handleLogMatch} 
                isLoading={logMatchMutation.isPending}
              />
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="match-card">
            <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
            {matchesLoading ? (
              <div className="text-center py-8">Loading recent matches...</div>
            ) : matchesError ? (
              <div className="text-center text-red-500 py-8">
                Error loading matches. Please refresh the page.
              </div>
            ) : (
              <RecentMatches matches={recentMatches || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLoggerPage;
