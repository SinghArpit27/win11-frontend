import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote } from 'lucide-react';
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
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Typography,
} from '@components/ui';
import { adminAdjustFormSchema, type AdminAdjustFormValues } from '@features/wallet/wallet.schemas';
import { LedgerDirection, WalletBucket } from '@shared/enums';
import { extractErrorMessage } from '@utils/errors';

import { useAdminAdjustWalletMutation } from '../admin.api';

interface AdminWalletAdjustModalProps {
  open: boolean;
  userId: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const BUCKETS: Array<{ value: WalletBucket; label: string }> = [
  { value: WalletBucket.DEPOSIT, label: 'Deposit' },
  { value: WalletBucket.WINNING, label: 'Winnings' },
  { value: WalletBucket.BONUS, label: 'Bonus' },
];

/**
 * Admin → adjust user wallet modal.
 *
 * Manual CREDIT / DEBIT against a specific bucket. The LOCKED bucket
 * is intentionally not editable from the UI — the backend rejects it
 * because LOCKED is only ever moved by contest flows.
 */
export const AdminWalletAdjustModal = ({
  open,
  userId,
  onOpenChange,
  onSuccess,
}: AdminWalletAdjustModalProps): JSX.Element => {
  const [adjust, state] = useAdminAdjustWalletMutation();
  const form = useForm<AdminAdjustFormValues>({
    resolver: zodResolver(adminAdjustFormSchema),
    defaultValues: {
      direction: LedgerDirection.CREDIT,
      bucket: WalletBucket.DEPOSIT,
      amount: 100,
      reason: '',
      ticketRef: '',
      notes: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        direction: LedgerDirection.CREDIT,
        bucket: WalletBucket.DEPOSIT,
        amount: 100,
        reason: '',
        ticketRef: '',
        notes: '',
      });
      state.reset();
    }
  }, [open, state, form]);

  const onSubmit = async (values: AdminAdjustFormValues): Promise<void> => {
    if (!userId) return;
    const res = await adjust({
      userId,
      body: {
        direction: values.direction as LedgerDirection,
        bucket: values.bucket as WalletBucket,
        amount: values.amount,
        reason: values.reason,
        ticketRef: values.ticketRef?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      },
    });
    if ('data' in res) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent aria-label="Adjust user wallet" className="md:max-w-lg">
        <ModalHeader>
          <ModalTitle>Adjust wallet balance</ModalTitle>
          <ModalDescription>
            Manual credit or debit. Every adjustment is logged with the actor, reason, and ledger row.
          </ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {(['CREDIT', 'DEBIT'] as const).map((d) => (
                        <Button
                          type="button"
                          key={d}
                          variant={field.value === d ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => field.onChange(d)}
                        >
                          {d}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bucket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {BUCKETS.map((b) => (
                        <Button
                          type="button"
                          key={b.value}
                          variant={field.value === b.value ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => field.onChange(b.value)}
                        >
                          {b.label}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={1}
                      step={1}
                      leftAdornment={<Banknote className="h-4 w-4" />}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      value={Number.isFinite(field.value) ? field.value : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Goodwill credit / refund / mistake fix…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticketRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket reference (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ZD-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {state.isError ? (
              <Typography variant="caption" tone="danger" className="block">
                {extractErrorMessage(state.error)}
              </Typography>
            ) : null}

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={state.isLoading}>
                Cancel
              </Button>
              <Button type="submit" loading={state.isLoading}>
                Apply adjustment
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
