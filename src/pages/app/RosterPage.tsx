import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClub } from '@/context/ClubContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/ui/EmptyState';
import type { Player } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const RosterPage: React.FC = () => {
  const { club } = useClub();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [open, setOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players', club?.id],
    enabled: !!club?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('club_id', club!.id)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data as Player[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!club) throw new Error('No club');
      if (editPlayer) {
        const { error } = await supabase
          .from('players')
          .update({
            name: name.trim(),
            age: age ? Number(age) : null,
          })
          .eq('id', editPlayer.id)
          .eq('club_id', club.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('players').insert({
          name: name.trim(),
          age: age ? Number(age) : null,
          rating: 1000,
          matches_played: 0,
          wins: 0,
          club_id: club.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', club?.id] });
      toast.success(editPlayer ? 'Player updated' : 'Player added');
      setOpen(false);
      setName('');
      setAge('');
      setEditPlayer(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Remove this player from the roster?')) return;
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id)
        .eq('club_id', club!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players', club?.id] });
      toast.success('Player removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditPlayer(null);
    setName('');
    setAge('');
    setOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditPlayer(p);
    setName(p.name);
    setAge(p.age?.toString() || '');
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Roster</h1>
          <p className="text-muted-foreground">Manage players for {club?.name}.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-11" onClick={openCreate}>
              Add player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editPlayer ? 'Edit player' : 'Add player'}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoading && players.length === 0 ? (
        <EmptyState
          title="Empty roster"
          description="Add players so you can balance sessions and log matches."
          actionLabel="Add player"
          onAction={openCreate}
        />
      ) : (
        <div className="surface-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">W–L</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link to={`/app/roster/${p.id}`} className="font-medium hover:text-court">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">Elo ladder</p>
                  </td>
                  <td className="px-4 py-3 font-display font-bold tabular-nums">{p.rating}</td>
                  <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                    {p.wins}–{Math.max(0, p.matches_played - p.wins)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(p.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RosterPage;
