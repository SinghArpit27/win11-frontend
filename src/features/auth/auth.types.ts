import { OtpChannel, OtpPurpose, UserRole, UserStatus } from '@shared/enums';

/**
 * Wire types for the auth feature. Mirrors the backend's `PublicUser` +
 * token shape so RTK Query consumers never speak any other vocabulary.
 */

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface AuthSuccessPayload extends AuthTokens {
  user: AuthUser;
  sessionId: string;
}

export interface SignupRequest {
  email?: string;
  phone?: string;
  password: string;
  displayName?: string;
  username?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken?: string;
}

export interface RequestOtpRequest {
  identifier: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest extends RequestOtpRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PhoneSendOtpRequest {
  phone: string;
}

export interface PhoneSendOtpResponse {
  accepted: true;
  expiresAt: string;
  isExistingUser: boolean;
}

export interface PhoneVerifyOtpRequest {
  phone: string;
  code: string;
}

export interface SessionSummary {
  id: string;
  platform: string;
  deviceId: string | null;
  userAgent: string | null;
  ip: string | null;
  ipCountry: string | null;
  issuedAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}
