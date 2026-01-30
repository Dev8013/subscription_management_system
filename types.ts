
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'weekly';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string; // ISO format
  endDate: string;   // ISO format
  category: string;
  status: 'active' | 'expiring' | 'expired';
  icon?: string;
  lastReminderSent?: string; // ISO date string
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  tempEmail: string;
  otp: string;
}

export interface ReminderLog {
  id: string;
  subscriptionId?: string; // Can be null for summary emails
  type: 'single' | 'summary';
  content: string;
  sentAt: string;
  recipientEmail?: string;
  status: 'draft' | 'processed';
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
}

export interface Insight {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  potentialSavings: number;
}

export interface DashboardStats {
  monthlyTotal: number;
  activeCount: number;
  expiringSoonCount: number;
  mostExpensive: string;
}
