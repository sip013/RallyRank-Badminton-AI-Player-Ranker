import * as z from 'zod';

export const matchFormSchema = z.object({
  teamAScore: z.coerce.number().min(0).max(30),
  teamBScore: z.coerce.number().min(0).max(30),
  matchDate: z.string().optional(), // Allow selecting past dates
});

export type MatchFormValues = z.infer<typeof matchFormSchema>;
