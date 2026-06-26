import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
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
import { APP_NAME } from '@constants/app.constants';
import { ROUTES } from '@constants/routes.constants';
import { ADMIN_ROLES } from '@shared/enums';

import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';
import { loginSchema, type LoginFormValues } from '../auth.schemas';
import { useAuth } from '../useAuth';

/**
 * Login screen.
 *
 * Post-login routing:
 *  - if the route guard redirected us here, we read `location.state.from`
 *    and bounce back to that path,
 *  - admin-role users land in `/admin/dashboard` by default,
 *  - everyone else lands in `/home`.
 */
export const LoginScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, flags } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setSubmitError(null);
    try {
      const result = await login(values);
      const fromState = (location.state as { from?: string } | null)?.from;
      const isAdmin = result.user.roles.some((r) => ADMIN_ROLES.includes(r));
      const fallback = isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;
      navigate(fromState ?? fallback, { replace: true });
    } catch (err) {
      setSubmitError(err);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue."
      footer={
        <span className="flex flex-col gap-2">
          <span>
            New to {APP_NAME}?{' '}
            <Link to={ROUTES.SIGNUP} className="text-primary hover:underline">
              Create an account
            </Link>
          </span>
          <Link to={ROUTES.PHONE_AUTH} className="text-primary hover:underline">
            Sign in with mobile OTP
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
                    autoComplete="username"
                    inputMode="email"
                    placeholder="you@example.com"
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-text-muted hover:text-primary"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    leftAdornment={<Lock className="h-4 w-4" />}
                    rightAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-text-muted hover:text-text"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" fullWidth loading={flags.loginPending}>
            Sign in
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default LoginScreen;
