import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@components/ui';
import { useListUpcomingMatchesQuery } from '@features/sports/sports.api';
import { ContestType, ContestVisibility } from '@shared/enums';
import { extractErrorMessage } from '@utils/errors';

import {
  useAdminCreateContestMutation,
  useAdminListPrizeDistributionsQuery,
} from '../../contest.api';
import {
  adminCustomContestFormSchema,
  type AdminCustomContestFormValues,
} from '../../admin.contest.schemas';
import { customContestFormToPayload, formatMatchLabel } from '../../admin.contest.utils';

const DEFAULT_VALUES: AdminCustomContestFormValues = {
  matchId: '',
  name: '',
  description: '',
  type: ContestType.REGULAR,
  visibility: ContestVisibility.PUBLIC,
  entryFeeMajor: 10,
  prizePoolMajor: 100,
  totalSpots: 100,
  maxEntriesPerUser: 5,
  isGuaranteed: false,
  isPractice: false,
  prizeDistributionId: null,
  publishImmediately: true,
};

interface AdminCreateContestModalProps {
  open: boolean;
  defaultMatchId?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AdminCreateContestModal = ({
  open,
  defaultMatchId,
  onOpenChange,
  onSuccess,
}: AdminCreateContestModalProps): JSX.Element => {
  const [createContest, createState] = useAdminCreateContestMutation();
  const matchesQuery = useListUpcomingMatchesQuery(undefined, { skip: !open });
  const prizesQuery = useAdminListPrizeDistributionsQuery({ isActive: true, limit: 50 });

  const form = useForm<AdminCustomContestFormValues>({
    resolver: zodResolver(adminCustomContestFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      createState.reset();
      return;
    }
    form.reset({
      ...DEFAULT_VALUES,
      matchId: defaultMatchId ?? '',
    });
  }, [open, defaultMatchId, form, createState]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createContest(customContestFormToPayload(values)).unwrap();
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // surfaced below
    }
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>Create custom contest</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 px-1">
            <FormField
              control={form.control}
              name="matchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    >
                      <option value="">Select match</option>
                      {(matchesQuery.data ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {formatMatchLabel(m)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contest name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sunday Special" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                      >
                        {Object.values(ContestType).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                      >
                        {Object.values(ContestVisibility).map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="entryFeeMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prizePoolMajor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prize pool (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="totalSpots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total spots</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxEntriesPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max / user</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="prizeDistributionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize distribution</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    >
                      <option value="">None</option>
                      {(prizesQuery.data?.items ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('isGuaranteed')} />
                Guaranteed
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('isPractice')} />
                Practice
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register('publishImmediately')} />
                Publish now
              </label>
            </div>
            {createState.error ? (
              <p className="text-sm text-danger">{extractErrorMessage(createState.error)}</p>
            ) : null}
            <ModalFooter className="px-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createState.isLoading}>
                Create contest
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
