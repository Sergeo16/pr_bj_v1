import { z } from 'zod';

export const bureauVoteSchema = z
  .object({
    bureauVoteId: z.number().int().positive(),
    inscrits: z.number().int().min(0),
    votants: z.number().int().min(0),
    bulletinsNuls: z.number().int().min(0),
    voixWadagniTalata: z.number().int().min(0),
    voixHounkpeHounwanou: z.number().int().min(0),
    observations: z.string().max(1000).optional().default(''),
  })
  .refine((data) => data.votants <= data.inscrits, {
    message: "Le nombre de votants doit être inférieur ou égal au nombre d'inscrits",
    path: ['votants'],
  })
  .refine((data) => data.bulletinsNuls <= data.votants, {
    message: 'Le nombre de bulletins nuls doit être inférieur ou égal au nombre de votants',
    path: ['bulletinsNuls'],
  })
  .refine((data) => {
    const suffrages = data.votants - data.bulletinsNuls;
    const totalVoix = data.voixWadagniTalata + data.voixHounkpeHounwanou;
    return suffrages === totalVoix;
  }, {
    message:
      'La somme des voix (Duo candidat 1 + Duo candidat 2) doit égaler Votants − Bulletins nuls (suffrages valablement exprimés).',
    path: ['voixWadagniTalata'],
  });

export const voteSchema = z.object({
  fullName: z.string().min(1).max(200).trim(),
  departementId: z.number().int().positive(),
  communeId: z.number().int().positive(),
  arrondissementId: z.number().int().positive(),
  villageId: z.number().int().positive(),
  centreId: z.number().int().positive(),
  bureauxVote: z.array(bureauVoteSchema).min(1),
});

export type VoteInput = z.infer<typeof voteSchema>;
export type BureauVoteInput = z.infer<typeof bureauVoteSchema>;

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 200);
}

export function sanitizeNumber(input: unknown): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }
  return Math.floor(Math.abs(num));
}
