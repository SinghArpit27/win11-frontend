import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Lock, Mail } from 'lucide-react';
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

import { useResetPasswordMutation } from '../auth.api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../auth.schemas';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';

export const ResetPasswordScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const seed = (location.state as { identifier?: string } | null)?.identifier ?? '';

  const [resetPassword, state] = useResetPasswordMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { identifier: seed, code: '', newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await resetPassword({
        identifier: values.identifier,
        code: values.code,
        newPassword: values.newPassword,
      }).unwrap();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the code we sent + your new password."
      footer={
        <span>
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <AuthErrorBanner error={submitError} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or phone</FormLabel>
                <FormControl>
                  <Input leftAdornment={<Mail className="h-4 w-4" />} {...field} />
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
                    placeholder="123456"
                    leftAdornment={<KeyRound className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    leftAdornment={<Lock className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    leftAdornment={<Lock className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" fullWidth loading={state.isLoading}>
            Reset password
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
