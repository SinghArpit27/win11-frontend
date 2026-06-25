declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<void> | null = null;

export const loadRazorpayScript = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay requires browser'));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
    document.body.appendChild(script);
  });

  return scriptPromise;
};

export interface OpenRazorpayCheckoutInput {
  keyId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  appName: string;
  description?: string;
}

export const openRazorpayCheckout = async (
  input: OpenRazorpayCheckoutInput,
): Promise<RazorpaySuccessResponse> => {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error('Razorpay SDK unavailable');

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: input.keyId,
      amount: input.amountMinor,
      currency: input.currency,
      name: input.appName,
      description: input.description ?? 'Wallet deposit',
      order_id: input.orderId,
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.on('payment.failed', () => reject(new Error('Payment failed')));
    rzp.open();
  });
};
