import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import {
  useCompleteMockPaymentMutation,
  useCompleteUpiPaymentMutation,
  useCreatePaymentOrderMutation,
} from '@features/payments/payment.api';
import { UpiAppSelector } from '@features/payments/components/UpiAppSelector';
import { UpiRedirectOverlay } from '@features/payments/components/UpiRedirectOverlay';
import { openUpiDeepLink } from '@features/payments/upi.types';
import { redirectToStripeCheckout } from '@features/payments/stripe.checkout';
import { extractErrorMessage } from '@utils/errors';

import { depositFormSchema, type DepositFormValues } from '../wallet.schemas';
import { formatMoney } from '../wallet.utils';
import type { UpiAppId } from '@features/payments/upi.types';

interface AddCashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

type Step = 'amount' | 'method' | 'upi';

export const AddCashModal = ({ open, onOpenChange, onSuccess }: AddCashModalProps): JSX.Element => {
  const [step, setStep] = useState<Step>('amount');
  const [redirectApp, setRedirectApp] = useState<UpiAppId | null>(null);
  const [simulatingUpi, setSimulatingUpi] = useState(false);

  const [createOrder, orderState] = useCreatePaymentOrderMutation();
  const [completeMock, completeState] = useCompleteMockPaymentMutation();
  const [completeUpi, upiState] = useCompleteUpiPaymentMutation();

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: { amount: 500, description: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!open) {
      form.reset({ amount: 500, description: '' });
      setStep('amount');
      setRedirectApp(null);
      setSimulatingUpi(false);
      orderState.reset();
      completeState.reset();
      upiState.reset();
    }
  }, [open, orderState, completeState, upiState, form]);

  const amountValue = form.watch('amount');
  const amountLabel = formatMoney((Number(amountValue) || 0) * 100, {
    currency: APP_DEFAULT_CURRENCY,
  });
  const loading = orderState.isLoading || completeState.isLoading || upiState.isLoading;
  const error = orderState.error ?? completeState.error ?? upiState.error;

  const finishSuccess = (): void => {
    onSuccess?.();
    onOpenChange(false);
  };

  const onAmountNext = async (): Promise<void> => {
    const valid = await form.trigger('amount');
    if (valid) setStep('method');
  };

  const payWithCard = async (): Promise<void> => {
    const values = form.getValues();
    const orderRes = await createOrder({ amount: values.amount, channel: 'card' });
    if (!('data' in orderRes)) return;

    const order = orderRes.data;

    if (order.provider === 'MANUAL') {
      const completeRes = await completeMock({ paymentId: order.paymentId });
      if ('data' in completeRes) finishSuccess();
      return;
    }

    if (order.checkoutUrl) {
      redirectToStripeCheckout(order.checkoutUrl, order.paymentId);
      return;
    }

    form.setError('amount', { message: 'Card checkout unavailable.' });
  };

  const onUpiAppSelect = async (app: UpiAppId): Promise<void> => {
    const values = form.getValues();
    setRedirectApp(app);

    const orderRes = await createOrder({ amount: values.amount, channel: 'upi', upiApp: app });
    if (!('data' in orderRes)) {
      setRedirectApp(null);
      return;
    }

    const order = orderRes.data;

    if (order.simulateUpi) {
      setSimulatingUpi(true);
      await new Promise((r) => setTimeout(r, 1500));
      const completeRes = await completeUpi({ paymentId: order.paymentId, upiApp: app });
      setSimulatingUpi(false);
      setRedirectApp(null);
      if ('data' in completeRes) finishSuccess();
      return;
    }

    if (order.upiDeepLink) {
      openUpiDeepLink(order.upiDeepLink);
      onOpenChange(false);
      return;
    }

    setRedirectApp(null);
    form.setError('amount', { message: 'UPI redirect unavailable.' });
  };

  return (
    <>
      {redirectApp ? (
        <UpiRedirectOverlay app={redirectApp} amountLabel={amountLabel} simulating={simulatingUpi} />
      ) : null}

      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent aria-label="Add cash">
          <ModalHeader>
            <ModalTitle>Add cash</ModalTitle>
            <ModalDescription>
              {step === 'amount' && 'Enter amount, then choose card or UPI.'}
              {step === 'method' && 'How would you like to pay?'}
              {step === 'upi' && 'Select your UPI app — we open it directly, no billing form.'}
            </ModalDescription>
          </ModalHeader>

          {step === 'amount' ? (
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void onAmountNext();
                }}
                className="space-y-4"
                noValidate
              >
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
                          min={10}
                          step={1}
                          leftAdornment={<Wallet className="h-4 w-4" />}
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

                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      type="button"
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('amount', amount, { shouldValidate: true })}
                    >
                      +{formatMoney(amount * 100, { currency: APP_DEFAULT_CURRENCY })}
                    </Button>
                  ))}
                </div>

                {error ? (
                  <Typography variant="caption" tone="danger" className="block">
                    {extractErrorMessage(error)}
                  </Typography>
                ) : null}

                <ModalFooter className="mt-2">
                  <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!amountValue}>
                    Continue
                  </Button>
                </ModalFooter>
              </form>
            </Form>
          ) : null}

          {step === 'method' ? (
            <div className="space-y-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep('amount')}>
                Change amount ({amountLabel})
              </Button>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void payWithCard()}
                  disabled={loading}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface-elevated p-4 text-left transition hover:border-primary hover:shadow-md"
                >
                  <CreditCard className="h-6 w-6 text-primary" />
                  <Typography variant="label">Debit / Credit card</Typography>
                  <Typography variant="caption" tone="muted">
                    Secure Stripe card checkout
                  </Typography>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('upi')}
                  disabled={loading}
                  className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface-elevated p-4 text-left transition hover:border-primary hover:shadow-md"
                >
                  <Smartphone className="h-6 w-6 text-primary" />
                  <Typography variant="label">UPI</Typography>
                  <Typography variant="caption" tone="muted">
                    Google Pay, PhonePe, Paytm & more
                  </Typography>
                </button>
              </div>

              {error ? (
                <Typography variant="caption" tone="danger">
                  {extractErrorMessage(error)}
                </Typography>
              ) : null}
            </div>
          ) : null}

          {step === 'upi' ? (
            <UpiAppSelector
              amountLabel={amountLabel}
              loading={loading}
              selectedApp={redirectApp}
              onSelect={(app) => void onUpiAppSelect(app)}
              onBack={() => setStep('method')}
            />
          ) : null}
        </ModalContent>
      </Modal>
    </>
  );
};
