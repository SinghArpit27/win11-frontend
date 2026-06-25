import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { OtpChannel, OtpPurpose } from '@shared/enums';

import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';
import { signupSchema, type SignupFormValues } from '../auth.schemas';
import { useAuth } from '../useAuth';

export const SignupScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const { signup, flags } = useAuth();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await signup({
        email: values.email || undefined,
        phone: values.phone || undefined,
        password: values.password,
        displayName: values.displayName || undefined,
      });
      const identifier = (values.email || values.phone || '').trim();
      const channel = values.email ? OtpChannel.EMAIL : OtpChannel.SMS;
      const purpose = values.email ? OtpPurpose.EMAIL_VERIFY : OtpPurpose.PHONE_VERIFY;
      navigate(ROUTES.OTP_VERIFY, {
        replace: true,
        state: { identifier, channel, purpose },
      });
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start playing in under a minute."
      footer={
        <span>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Sign in
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
                    autoComplete="email"
                    placeholder="you@example.com"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 9999 999 999"
                    leftAdornment={<Phone className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What should we call you?"
                    leftAdornment={<User className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    leftAdornment={<Lock className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use a mix of upper, lower, number and symbol.
                </FormDescription>
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
                    placeholder="Repeat your password"
                    leftAdornment={<Lock className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" fullWidth loading={flags.signupPending}>
            Create account
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};
