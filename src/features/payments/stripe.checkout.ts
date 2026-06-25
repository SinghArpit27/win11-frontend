const PENDING_PAYMENT_KEY = 'win11:pending-deposit-payment';

export const savePendingDepositPayment = (paymentId: string): void => {
  sessionStorage.setItem(PENDING_PAYMENT_KEY, paymentId);
};

export const consumePendingDepositPayment = (): string | null => {
  const value = sessionStorage.getItem(PENDING_PAYMENT_KEY);
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  return value;
};

export const redirectToStripeCheckout = (checkoutUrl: string, paymentId: string): void => {
  savePendingDepositPayment(paymentId);
  window.location.assign(checkoutUrl);
};
