import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@components/ui';
import { ROUTES } from '@constants/routes.constants';

import { useVerifyEmailMutation } from '../auth.api';
import { verifyEmailSchema, type VerifyEmailFormValues } from '../auth.schemas';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';

export const VerifyEmailScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const seed = (location.state as { email?: string } | null)?.email ?? '';

  const [verifyEmail, state] = useVerifyEmailMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: seed, code: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: VerifyEmailFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await verifyEmail(values).unwrap();
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the code we sent to your inbox."
      footer={
        <span>
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Sign in instead
          </Link>
        </span>
      }
    >
      <AuthErrorBanner error={submitError} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    leftAdornment={<Mail className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>6-digit code</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    leftAdornment={<KeyRound className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" fullWidth loading={state.isLoading}>
            Verify email
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};
