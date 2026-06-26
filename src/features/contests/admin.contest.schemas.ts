import { z } from 'zod';

import { ContestType, ContestVisibility } from '@shared/enums';

const majorMoney = z.coerce.number().min(0);
const positiveInt = z.coerce.number().int().min(1);

export const adminTemplateFormSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(120),
    description: z.string().trim().max(500).optional(),
    type: z.nativeEnum(ContestType),
    visibility: z.nativeEnum(ContestVisibility),
    entryFeeMajor: majorMoney,
    prizePoolMajor: majorMoney,
    totalSpots: positiveInt.max(1_000_000),
    maxEntriesPerUser: positiveInt.max(100),
    isGuaranteed: z.boolean(),
    prizeDistributionId: z.string().nullable().optional(),
    isActive: z.boolean(),
  })
  .refine((v) => v.maxEntriesPerUser <= v.totalSpots, {
    message: 'Max entries per user cannot exceed total spots',
    path: ['maxEntriesPerUser'],
  });

export type AdminTemplateFormValues = z.infer<typeof adminTemplateFormSchema>;

export const adminCustomContestFormSchema = z
  .object({
    matchId: z.string().min(1, 'Select a match'),
    name: z.string().trim().min(3).max(120),
    description: z.string().trim().max(500).optional(),
    type: z.nativeEnum(ContestType),
    visibility: z.nativeEnum(ContestVisibility),
    entryFeeMajor: majorMoney,
    prizePoolMajor: majorMoney,
    totalSpots: positiveInt.max(1_000_000),
    maxEntriesPerUser: positiveInt.max(100),
    isGuaranteed: z.boolean(),
    isPractice: z.boolean(),
    prizeDistributionId: z.string().nullable().optional(),
    publishImmediately: z.boolean(),
  })
  .refine((v) => v.maxEntriesPerUser <= v.totalSpots, {
    message: 'Max entries per user cannot exceed total spots',
    path: ['maxEntriesPerUser'],
  });

export type AdminCustomContestFormValues = z.infer<typeof adminCustomContestFormSchema>;
