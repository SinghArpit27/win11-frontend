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
import { APP_DEFAULT_CURRENCY } from '@constants/app.constants';
import { extractErrorMessage } from '@utils/errors';

import type { WalletSnapshot } from '../wallet.types';
import { useRequestWithdrawalMutation } from '@features/payments/withdrawal.api';
import { withdrawFormSchema, type WithdrawFormValues } from '../wallet.schemas';
import { formatMoney, toMajorUnits } from '../wallet.utils';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet?: WalletSnapshot | null;
  onSuccess?: () => void;
}

/**
 * Withdraw modal. Source-bucket policy is enforced server-side
 * (winning → deposit) so the UI only needs to capture amount + an
 * optional note.
 *
 * A "max withdrawable" hint is rendered from the live wallet snapshot
 * so users don't bother submitting an over-limit request.
 */
export const WithdrawModal = ({
  open,
  onOpenChange,
  wallet,
  onSuccess,
}: WithdrawModalProps): JSX.Element => {
  const [requestWithdrawal, state] = useRequestWithdrawalMutation();
  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: { amount: 500, description: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset({ amount: 500, description: '' });
      state.reset();
    }
  }, [open, state, form]);

  const withdrawable = wallet ? wallet.balances.winning + wallet.balances.deposit : 0;
  const withdrawableMajor = toMajorUnits(withdrawable);

  const onSubmit = async (values: WithdrawFormValues): Promise<void> => {
    if (values.amount > withdrawableMajor) {
      form.setError('amount', { message: 'Amount exceeds withdrawable balance' });
      return;
    }
    const res = await requestWithdrawal({
      amount: values.amount,
      upiId: values.description?.trim() || undefined,
    });
    if ('data' in res) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent aria-label="Withdraw money">
        <ModalHeader>
          <ModalTitle>Withdraw money</ModalTitle>
          <ModalDescription>
            Submit a withdrawal request for admin review. KYC approval is required. Funds are held until processed.
          </ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount
                    <span className="ml-2 text-xs font-normal text-text-muted">
                      Withdrawable: {formatMoney(withdrawable, { currency: APP_DEFAULT_CURRENCY })}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={100}
                      step={1}
                      leftAdornment={<Banknote className="h-4 w-4" />}
                      placeholder="Enter amount"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Withdraw to UPI" {...field} />
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

            <ModalFooter className="mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={state.isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={state.isLoading} disabled={withdrawable === 0}>
                Withdraw
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
};
