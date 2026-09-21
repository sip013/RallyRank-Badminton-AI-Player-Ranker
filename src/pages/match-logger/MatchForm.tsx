import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Player } from '../players/PlayersPage';
import { matchFormSchema, MatchFormValues } from './schemas/matchFormSchema';
import TeamSection from './components/TeamSection';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface MatchFormProps {
  players: Player[];
  onLogMatch: (match: {
    team1_player1: Player;
    team1_player2?: Player;
    team2_player1: Player;
    team2_player2?: Player;
    team1_score: number;
    team2_score: number;
    winner: string;
    matchDate?: string;
  }) => void;
  isLoading?: boolean;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onLogMatch, isLoading = false }) => {
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      teamAScore: 0,
      teamBScore: 0,
      matchDate: format(new Date(), 'yyyy-MM-dd'), // Default to today
    },
  });

  const onSubmit = (values: MatchFormValues) => {
    // Validate team selections
    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      form.setError('root', {
        message: 'Please select players for both teams',
      });
      return;
    }

    // Validate that a team has won
    if (values.teamAScore === values.teamBScore) {
      form.setError('root', {
        message: 'Match cannot end in a tie',
      });
      return;
    }

    const teamAPlayerObjects = players.filter(p => teamAPlayers.includes(p.id));
    const teamBPlayerObjects = players.filter(p => teamBPlayers.includes(p.id));

    const match = {
      team1_player1: teamAPlayerObjects[0],
      team1_player2: teamAPlayerObjects[1] || undefined,
      team2_player1: teamBPlayerObjects[0],
      team2_player2: teamBPlayerObjects[1] || undefined,
      team1_score: values.teamAScore,
      team2_score: values.teamBScore,
      winner: values.teamAScore > values.teamBScore ? 'team1' : 'team2',
      matchDate: values.matchDate
    };

    onLogMatch(match);
    
    // Reset form
    form.reset();
    setTeamAPlayers([]);
    setTeamBPlayers([]);
  };

  const getAvailablePlayers = (currentTeam: 'A' | 'B') => {
    const selectedPlayers = currentTeam === 'A' ? teamBPlayers : teamAPlayers;
    return players.filter(player => !selectedPlayers.includes(player.id));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TeamSection
          team="A"
          form={form}
          scoreName="teamAScore"
          availablePlayers={getAvailablePlayers('A')}
          selectedPlayerIds={teamAPlayers}
          onSelectPlayers={setTeamAPlayers}
        />
        
        <TeamSection
          team="B"
          form={form}
          scoreName="teamBScore"
          availablePlayers={getAvailablePlayers('B')}
          selectedPlayerIds={teamBPlayers}
          onSelectPlayers={setTeamBPlayers}
        />

        <FormField
          control={form.control}
          name="matchDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Match Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    disabled={(date) => date > new Date()} // Disable future dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        
        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processing Match...' : 'Log Match'}
        </Button>
      </form>
    </Form>
  );
};

export default MatchForm;
