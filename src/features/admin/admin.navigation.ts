import {
  Activity,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileCheck,
  History,
  Landmark,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@constants/routes.constants';
import { UserRole } from '@shared/enums';

export interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  allow: UserRole[];
}

/**
 * Single source of truth for the admin sidebar.
 *
 * Each item carries the roles allowed to *see* it — the sidebar filters
 * client-side, the backend still enforces server-side. Items added here
 * automatically appear once the corresponding screen is registered in
 * the admin route table.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'users',
    label: 'Users',
    path: ROUTES.ADMIN_USERS,
    icon: Users,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'roles',
    label: 'Roles',
    path: ROUTES.ADMIN_ROLES,
    icon: ShieldCheck,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'wallets',
    label: 'Wallets',
    path: ROUTES.ADMIN_WALLETS,
    icon: Wallet,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'wallet-actions',
    label: 'Wallet actions',
    path: ROUTES.ADMIN_WALLET_ACTIONS,
    icon: History,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'payments',
    label: 'Payments',
    path: ROUTES.ADMIN_PAYMENTS,
    icon: CreditCard,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'withdrawals',
    label: 'Withdrawals',
    path: ROUTES.ADMIN_WITHDRAWALS,
    icon: Landmark,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'kyc',
    label: 'KYC',
    path: ROUTES.ADMIN_KYC,
    icon: FileCheck,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'financial-ops',
    label: 'Settlements & risk',
    path: ROUTES.ADMIN_FINANCIAL_OPS,
    icon: ShieldAlert,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
  {
    id: 'contests',
    label: 'Contests',
    path: ROUTES.ADMIN_CONTESTS,
    icon: Trophy,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'scoring',
    label: 'Scoring',
    path: ROUTES.ADMIN_SCORING,
    icon: Activity,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'leaderboards',
    label: 'Leaderboards',
    path: ROUTES.ADMIN_LEADERBOARDS,
    icon: BarChart3,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    id: 'audit-logs',
    label: 'Audit logs',
    path: ROUTES.ADMIN_AUDIT_LOGS,
    icon: ClipboardList,
    allow: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_AGENT],
  },
];
