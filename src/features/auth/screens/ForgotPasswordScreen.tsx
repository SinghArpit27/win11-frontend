import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

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

import { useForgotPasswordMutation } from '../auth.api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../auth.schemas';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';

export const ForgotPasswordScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [forgotPassword, state] = useForgotPasswordMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      await forgotPassword(values).unwrap();
      navigate(ROUTES.RESET_PASSWORD, {
        state: { identifier: values.identifier },
      });
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll send a 6-digit reset code to your email or phone."
      footer={
        <span>
          Remembered?{' '}
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
                  <Input
                    placeholder="you@example.com"
                    leftAdornment={<Mail className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" fullWidth loading={state.isLoading}>
            Send reset code
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
