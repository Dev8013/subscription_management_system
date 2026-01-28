
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
}

export interface Notification {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical';
}

export interface DashboardStats {
  monthlyTotal: number;
  activeCount: number;
  expiringSoonCount: number;
  mostExpensive: string;
}
