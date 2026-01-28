
import React from 'react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const DashboardStats: React.FC<Props> = ({ subscriptions }) => {
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    let monthlyPrice = sub.price;
    if (sub.billingCycle === 'yearly') monthlyPrice /= 12;
    if (sub.billingCycle === 'quarterly') monthlyPrice /= 3;
    if (sub.billingCycle === 'weekly') monthlyPrice *= 4.33;
    return acc + monthlyPrice;
  }, 0);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <p className="text-slate-500 text-sm font-medium">Monthly Spending</p>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-slate-900">${monthlyTotal.toFixed(2)}</span>
          <span className="ml-2 text-slate-400 text-sm">/mo average</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <p className="text-slate-500 text-sm font-medium">Active Subscriptions</p>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-slate-900">{activeCount}</span>
          <span className="ml-2 text-green-500 text-sm font-medium">Healthy</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <p className="text-slate-500 text-sm font-medium">Expiring Soon</p>
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-rose-600">{expiringCount}</span>
          <span className="ml-2 text-rose-400 text-sm font-medium">Needs Attention</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
