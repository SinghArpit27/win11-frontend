import { appConfig } from '@config/index';

import { ContestType } from '@shared/enums';
import { toMinorUnits } from '@features/wallet/wallet.utils';

import type { SportsMatchSummary } from '@features/sports/sports.types';

import type {
  AdminCustomContestFormValues,
  AdminTemplateFormValues,
} from './admin.contest.schemas';
import type { ContestSummary, ContestTemplate } from './contest.types';

export const formatMatchLabel = (match: SportsMatchSummary | undefined): string => {
  if (!match) return 'Unknown match';
  return `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;
};

export const buildMatchMap = (
  matches: SportsMatchSummary[],
): Map<string, SportsMatchSummary> => new Map(matches.map((m) => [m.id, m]));

export const templateToFormValues = (template: ContestTemplate): AdminTemplateFormValues => ({
  name: template.name,
  description: template.description ?? '',
  type: template.type,
  visibility: template.visibility,
  entryFeeMajor: template.entryFee / 100,
  prizePoolMajor: template.prizePoolAmount / 100,
  totalSpots: template.totalSpots,
  maxEntriesPerUser: template.maxEntriesPerUser,
  isGuaranteed: template.isGuaranteed,
  prizeDistributionId: template.prizeDistributionId,
  isActive: template.isActive,
});

export const templateFormToPayload = (values: AdminTemplateFormValues) => ({
  name: values.name,
  description: values.description?.trim() ? values.description.trim() : null,
  type: values.type,
  visibility: values.visibility,
  entryFee: toMinorUnits(values.entryFeeMajor),
  prizePoolAmount: toMinorUnits(values.prizePoolMajor),
  currency: appConfig.defaultCurrency,
  totalSpots: values.totalSpots,
  maxEntriesPerUser: values.maxEntriesPerUser,
  isGuaranteed: values.isGuaranteed,
  prizeDistributionId: values.prizeDistributionId || null,
  isActive: values.isActive,
});

export const customContestFormToPayload = (values: AdminCustomContestFormValues) => ({
  matchId: values.matchId,
  name: values.name,
  description: values.description?.trim() ? values.description.trim() : null,
  type: values.type,
  visibility: values.visibility,
  entryFee: toMinorUnits(values.entryFeeMajor),
  prizePoolAmount: toMinorUnits(values.prizePoolMajor),
  currency: appConfig.defaultCurrency,
  totalSpots: values.totalSpots,
  maxEntriesPerUser: values.maxEntriesPerUser,
  isGuaranteed: values.isGuaranteed,
  isPractice: values.isPractice || values.type === ContestType.PRACTICE,
  prizeDistributionId: values.prizeDistributionId || null,
  publishImmediately: values.publishImmediately,
});

export const groupContestsByTemplate = (
  contests: ContestSummary[],
  matchMap: Map<string, SportsMatchSummary>,
): Map<string, Array<{ matchId: string; label: string; contestId: string; status: string }>> => {
  const out = new Map<
    string,
    Array<{ matchId: string; label: string; contestId: string; status: string }>
  >();

  for (const contest of contests) {
    if (!contest.templateId) continue;
    const label = formatMatchLabel(matchMap.get(contest.matchId));
    const row = {
      matchId: contest.matchId,
      label,
      contestId: contest.id,
      status: contest.status,
    };
    const bucket = out.get(contest.templateId) ?? [];
    bucket.push(row);
    out.set(contest.templateId, bucket);
  }

  return out;
};
